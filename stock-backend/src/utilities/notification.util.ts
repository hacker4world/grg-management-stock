import { Article } from "../entity/Article";
import {
  StockNotification,
  NotificationType,
} from "../entity/StockNotification";
import { stockNotificationRepository } from "../repository/repositories";

/**
 * Check article stock levels and create notifications if needed.
 * Called after any operation that decreases stock (sortie, demande).
 *
 * @param article - The article to check (must have updated stockActuel)
 */
export async function checkAndCreateStockNotification(
  article: Article,
): Promise<StockNotification | null> {
  const { stockActuel, stockMinimum, nom } = article;

  // Determine notification type based on stock level
  let type: NotificationType | null = null;
  let message: string = "";

  if (stockActuel === 0) {
    type = "out_of_stock";
    message = `⚠️ RUPTURE DE STOCK: L'article "${nom}" est épuisé (stock = 0)`;
  } else if (stockActuel < stockMinimum) {
    type = "low_stock";
    message = `⚠️ STOCK BAS: L'article "${nom}" est en dessous du seuil minimum (actuel: ${stockActuel}, minimum: ${stockMinimum})`;
  }

  // No notification needed
  if (!type) {
    return null;
  }

  // Check if a similar unread notification already exists for this article
  // to avoid duplicate notifications
  const existingNotification = await stockNotificationRepository.findOne({
    where: {
      article: { id: article.id },
      type,
      isRead: false,
    },
  });

  if (existingNotification) {
    // Update existing notification with new stock value
    existingNotification.stockActuel = stockActuel;
    existingNotification.message = message;
    await stockNotificationRepository.save(existingNotification);
    console.log(`📢 Notification updated for article: ${nom} (${type})`);
    return existingNotification;
  }

  // Create new notification
  const notification = stockNotificationRepository.create({
    type,
    message,
    article,
    stockActuel,
    stockMinimum,
    isRead: false,
  });

  await stockNotificationRepository.save(notification);
  console.log(`📢 New notification created for article: ${nom} (${type})`);

  return notification;
}

/**
 * Check multiple articles and create notifications for each if needed.
 *
 * @param articles - Array of articles to check
 */
export async function checkAndCreateStockNotifications(
  articles: Article[],
): Promise<StockNotification[]> {
  const notifications: StockNotification[] = [];

  for (const article of articles) {
    const notification = await checkAndCreateStockNotification(article);
    if (notification) {
      notifications.push(notification);
    }
  }

  return notifications;
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndCreateStockNotification = checkAndCreateStockNotification;
exports.checkAndCreateStockNotifications = checkAndCreateStockNotifications;
const repositories_1 = require("../repository/repositories");
/**
 * Check article stock levels and create notifications if needed.
 * Called after any operation that decreases stock (sortie, demande).
 *
 * @param article - The article to check (must have updated stockActuel)
 */
async function checkAndCreateStockNotification(article) {
    const { stockActuel, stockMinimum, nom } = article;
    // Determine notification type based on stock level
    let type = null;
    let message = "";
    if (stockActuel === 0) {
        type = "out_of_stock";
        message = `⚠️ RUPTURE DE STOCK: L'article "${nom}" est épuisé (stock = 0)`;
    }
    else if (stockActuel < stockMinimum) {
        type = "low_stock";
        message = `⚠️ STOCK BAS: L'article "${nom}" est en dessous du seuil minimum (actuel: ${stockActuel}, minimum: ${stockMinimum})`;
    }
    // No notification needed
    if (!type) {
        return null;
    }
    // Check if a similar unread notification already exists for this article
    // to avoid duplicate notifications
    const existingNotification = await repositories_1.stockNotificationRepository.findOne({
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
        await repositories_1.stockNotificationRepository.save(existingNotification);
        console.log(`📢 Notification updated for article: ${nom} (${type})`);
        return existingNotification;
    }
    // Create new notification
    const notification = repositories_1.stockNotificationRepository.create({
        type,
        message,
        article,
        stockActuel,
        stockMinimum,
        isRead: false,
    });
    await repositories_1.stockNotificationRepository.save(notification);
    console.log(`📢 New notification created for article: ${nom} (${type})`);
    return notification;
}
/**
 * Check multiple articles and create notifications for each if needed.
 *
 * @param articles - Array of articles to check
 */
async function checkAndCreateStockNotifications(articles) {
    const notifications = [];
    for (const article of articles) {
        const notification = await checkAndCreateStockNotification(article);
        if (notification) {
            notifications.push(notification);
        }
    }
    return notifications;
}
//# sourceMappingURL=notification.util.js.map
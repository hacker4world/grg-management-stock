import { Request, Response } from "express";
import {
  stockNotificationRepository,
  articlesRepositoy,
} from "../repository/repositories";
import { Between, In } from "typeorm";

export class NotificationsService {
  /**
   * List all notifications with pagination and filters
   * GET /api/notifications/liste
   */
  public async listNotifications(req: Request, res: Response) {
    const q = req.query;
    const page = Number(q.page) || 1;
    const max = Number(process.env.MAX_PER_PAGE) || 20;

    const where: any = {};

    // Filter by type (low_stock, out_of_stock)
    if (q.type) where.type = q.type;

    // Filter by read status
    if (q.isRead === "true") where.isRead = true;
    if (q.isRead === "false") where.isRead = false;

    // Filter by article
    if (q.articleId) where.article = { id: Number(q.articleId) };

    if (q.date) {
      const selectedDate = new Date(q.date as string);
      if (!isNaN(selectedDate.getTime())) {
        const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
        where.createdAt = Between(startOfDay, endOfDay);
      }
    }

    const [notifications, total] =
      await stockNotificationRepository.findAndCount({
        where,
        relations: { article: true },
        order: { createdAt: "DESC" },
        skip: (page - 1) * max,
        take: max,
      });

    const totalPages = Math.ceil(total / max);

    res.json({
      notifications,
      count: notifications.length,
      totalPages,
      lastPage: page >= totalPages,
    });
  }

  /**
   * Get unread notifications count (for badge display)
   * GET /api/notifications/unread-count
   */
  public async getUnreadCount(req: Request, res: Response) {
    const count = await stockNotificationRepository.count({
      where: { isRead: false },
    });

    // Also get breakdown by type
    const lowStockCount = await stockNotificationRepository.count({
      where: { isRead: false, type: "low_stock" },
    });
    const outOfStockCount = await stockNotificationRepository.count({
      where: { isRead: false, type: "out_of_stock" },
    });

    res.json({
      total: count,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    });
  }

  /**
   * Mark notification(s) as read
   * PUT /api/notifications/mark-read
   */
  public async markAsRead(req: Request, res: Response) {
    const { notificationIds } = req.body as { notificationIds: number[] };

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "notificationIds est requis (tableau de IDs)" });
    }

    const result = await stockNotificationRepository.update(
      { id: In(notificationIds) },
      { isRead: true },
    );

    res.json({
      message: `${result.affected} notification(s) marquée(s) comme lue(s)`,
      affected: result.affected,
    });
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/mark-all-read
   */
  public async markAllAsRead(req: Request, res: Response) {
    const result = await stockNotificationRepository.update(
      { isRead: false },
      { isRead: true },
    );

    res.json({
      message: `${result.affected} notification(s) marquée(s) comme lue(s)`,
      affected: result.affected,
    });
  }

  /**
   * Delete a notification
   * DELETE /api/notifications/supprimer
   */
  public async deleteNotification(req: Request, res: Response) {
    const { id } = req.query as { id: string };

    if (!id) {
      return res.status(400).json({ message: "id est requis" });
    }

    const notification = await stockNotificationRepository.findOneBy({
      id: Number(id),
    });
    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    await stockNotificationRepository.remove(notification);
    res.json({ message: "Notification supprimée" });
  }

  /**
   * Delete all read notifications (cleanup)
   * DELETE /api/notifications/cleanup
   */
  public async cleanupReadNotifications(req: Request, res: Response) {
    const result = await stockNotificationRepository.delete({ isRead: true });

    res.json({
      message: `${result.affected} notification(s) lue(s) supprimée(s)`,
      affected: result.affected,
    });
  }

  /**
   * Get notification details by ID
   * GET /api/notifications/:id
   */
  public async getNotificationById(req: Request, res: Response) {
    const { id } = req.params;

    const notification = await stockNotificationRepository.findOne({
      where: { id: Number(id) },
      relations: { article: { depot: true, unite: true, categorie: true } },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification introuvable" });
    }

    res.json({ notification });
  }

  /**
   * Check all articles and generate notifications for those below threshold
   * POST /api/notifications/check-all-stock
   * (Admin utility to run manual stock check)
   */
  public async checkAllStock(req: Request, res: Response) {
    const articles = await articlesRepositoy.find();

    let lowStockCreated = 0;
    let outOfStockCreated = 0;

    for (const article of articles) {
      const { stockActuel, stockMinimum, nom } = article;

      if (stockActuel === 0) {
        // Check if notification already exists
        const exists = await stockNotificationRepository.findOne({
          where: {
            article: { id: article.id },
            type: "out_of_stock",
            isRead: false,
          },
        });
        if (!exists) {
          await stockNotificationRepository.save(
            stockNotificationRepository.create({
              type: "out_of_stock",
              message: `⚠️ RUPTURE DE STOCK: L'article "${nom}" est épuisé (stock = 0)`,
              article,
              stockActuel,
              stockMinimum,
              isRead: false,
            }),
          );
          outOfStockCreated++;
        }
      } else if (stockActuel < stockMinimum) {
        const exists = await stockNotificationRepository.findOne({
          where: {
            article: { id: article.id },
            type: "low_stock",
            isRead: false,
          },
        });
        if (!exists) {
          await stockNotificationRepository.save(
            stockNotificationRepository.create({
              type: "low_stock",
              message: `⚠️ STOCK BAS: L'article "${nom}" est en dessous du seuil minimum (actuel: ${stockActuel}, minimum: ${stockMinimum})`,
              article,
              stockActuel,
              stockMinimum,
              isRead: false,
            }),
          );
          lowStockCreated++;
        }
      }
    }

    res.json({
      message: "Vérification du stock terminée",
      notifications: {
        lowStockCreated,
        outOfStockCreated,
        total: lowStockCreated + outOfStockCreated,
      },
    });
  }
}

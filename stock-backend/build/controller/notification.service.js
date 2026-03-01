"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const repositories_1 = require("../repository/repositories");
const typeorm_1 = require("typeorm");
class NotificationsService {
    /**
     * List all notifications with pagination and filters
     * GET /api/notifications/liste
     */
    async listNotifications(req, res) {
        const q = req.query;
        const page = Number(q.page) || 1;
        const max = Number(process.env.MAX_PER_PAGE) || 20;
        const where = {};
        // Filter by type (low_stock, out_of_stock)
        if (q.type)
            where.type = q.type;
        // Filter by read status
        if (q.isRead === "true")
            where.isRead = true;
        if (q.isRead === "false")
            where.isRead = false;
        // Filter by article
        if (q.articleId)
            where.article = { id: Number(q.articleId) };
        if (q.date) {
            const selectedDate = new Date(q.date);
            if (!isNaN(selectedDate.getTime())) {
                const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
                const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
                where.createdAt = (0, typeorm_1.Between)(startOfDay, endOfDay);
            }
        }
        const [notifications, total] = await repositories_1.stockNotificationRepository.findAndCount({
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
    async getUnreadCount(req, res) {
        const count = await repositories_1.stockNotificationRepository.count({
            where: { isRead: false },
        });
        // Also get breakdown by type
        const lowStockCount = await repositories_1.stockNotificationRepository.count({
            where: { isRead: false, type: "low_stock" },
        });
        const outOfStockCount = await repositories_1.stockNotificationRepository.count({
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
    async markAsRead(req, res) {
        const { notificationIds } = req.body;
        if (!notificationIds ||
            !Array.isArray(notificationIds) ||
            notificationIds.length === 0) {
            return res
                .status(400)
                .json({ message: "notificationIds est requis (tableau de IDs)" });
        }
        const result = await repositories_1.stockNotificationRepository.update({ id: (0, typeorm_1.In)(notificationIds) }, { isRead: true });
        res.json({
            message: `${result.affected} notification(s) marquée(s) comme lue(s)`,
            affected: result.affected,
        });
    }
    /**
     * Mark all notifications as read
     * PUT /api/notifications/mark-all-read
     */
    async markAllAsRead(req, res) {
        const result = await repositories_1.stockNotificationRepository.update({ isRead: false }, { isRead: true });
        res.json({
            message: `${result.affected} notification(s) marquée(s) comme lue(s)`,
            affected: result.affected,
        });
    }
    /**
     * Delete a notification
     * DELETE /api/notifications/supprimer
     */
    async deleteNotification(req, res) {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ message: "id est requis" });
        }
        const notification = await repositories_1.stockNotificationRepository.findOneBy({
            id: Number(id),
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification introuvable" });
        }
        await repositories_1.stockNotificationRepository.remove(notification);
        res.json({ message: "Notification supprimée" });
    }
    /**
     * Delete all read notifications (cleanup)
     * DELETE /api/notifications/cleanup
     */
    async cleanupReadNotifications(req, res) {
        const result = await repositories_1.stockNotificationRepository.delete({ isRead: true });
        res.json({
            message: `${result.affected} notification(s) lue(s) supprimée(s)`,
            affected: result.affected,
        });
    }
    /**
     * Get notification details by ID
     * GET /api/notifications/:id
     */
    async getNotificationById(req, res) {
        const { id } = req.params;
        const notification = await repositories_1.stockNotificationRepository.findOne({
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
    async checkAllStock(req, res) {
        const articles = await repositories_1.articlesRepositoy.find();
        let lowStockCreated = 0;
        let outOfStockCreated = 0;
        for (const article of articles) {
            const { stockActuel, stockMinimum, nom } = article;
            if (stockActuel === 0) {
                // Check if notification already exists
                const exists = await repositories_1.stockNotificationRepository.findOne({
                    where: {
                        article: { id: article.id },
                        type: "out_of_stock",
                        isRead: false,
                    },
                });
                if (!exists) {
                    await repositories_1.stockNotificationRepository.save(repositories_1.stockNotificationRepository.create({
                        type: "out_of_stock",
                        message: `⚠️ RUPTURE DE STOCK: L'article "${nom}" est épuisé (stock = 0)`,
                        article,
                        stockActuel,
                        stockMinimum,
                        isRead: false,
                    }));
                    outOfStockCreated++;
                }
            }
            else if (stockActuel < stockMinimum) {
                const exists = await repositories_1.stockNotificationRepository.findOne({
                    where: {
                        article: { id: article.id },
                        type: "low_stock",
                        isRead: false,
                    },
                });
                if (!exists) {
                    await repositories_1.stockNotificationRepository.save(repositories_1.stockNotificationRepository.create({
                        type: "low_stock",
                        message: `⚠️ STOCK BAS: L'article "${nom}" est en dessous du seuil minimum (actuel: ${stockActuel}, minimum: ${stockMinimum})`,
                        article,
                        stockActuel,
                        stockMinimum,
                        isRead: false,
                    }));
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
exports.NotificationsService = NotificationsService;
//# sourceMappingURL=notification.service.js.map
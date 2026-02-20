import { Router } from "express";
import { NotificationsService } from "../controller/notification.service";
import { authenticate, requireRole } from "../middleware";
import { Role } from "../enums/role.enum";

export const notificationsRouter = Router();
const service = new NotificationsService();

notificationsRouter.get(
  "/liste",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.listNotifications(req, res),
);

notificationsRouter.get(
  "/unread-count",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.getUnreadCount(req, res),
);

notificationsRouter.get(
  "/:id",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.getNotificationById(req, res),
);

notificationsRouter.put(
  "/mark-read",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.markAsRead(req, res),
);

notificationsRouter.put(
  "/mark-all-read",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.markAllAsRead(req, res),
);

notificationsRouter.delete(
  "/supprimer",
  authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2),
  (req, res) => service.deleteNotification(req, res),
);

notificationsRouter.delete("/cleanup", authenticate,
  requireRole(Role.ADMIN, Role.ADMIN1, Role.ADMIN2), (req, res) =>
  service.cleanupReadNotifications(req, res),
);

notificationsRouter.post(
  "/check-all-stock",
  /* requireRole(Role.ADMIN), */
  (req, res) => service.checkAllStock(req, res),
);

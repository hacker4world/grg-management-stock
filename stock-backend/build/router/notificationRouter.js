"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const notification_service_1 = require("../controller/notification.service");
const middleware_1 = require("../middleware");
const role_enum_1 = require("../enums/role.enum");
exports.notificationsRouter = (0, express_1.Router)();
const service = new notification_service_1.NotificationsService();
exports.notificationsRouter.get("/liste", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.listNotifications(req, res));
exports.notificationsRouter.get("/unread-count", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.getUnreadCount(req, res));
exports.notificationsRouter.get("/:id", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.getNotificationById(req, res));
exports.notificationsRouter.put("/mark-read", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.markAsRead(req, res));
exports.notificationsRouter.put("/mark-all-read", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.markAllAsRead(req, res));
exports.notificationsRouter.delete("/supprimer", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.deleteNotification(req, res));
exports.notificationsRouter.delete("/cleanup", middleware_1.authenticate, (0, middleware_1.requireRole)(role_enum_1.Role.ADMIN, role_enum_1.Role.ADMIN1, role_enum_1.Role.ADMIN2), (req, res) => service.cleanupReadNotifications(req, res));
exports.notificationsRouter.post("/check-all-stock", 
/* requireRole(Role.ADMIN), */
(req, res) => service.checkAllStock(req, res));
//# sourceMappingURL=notificationRouter.js.map
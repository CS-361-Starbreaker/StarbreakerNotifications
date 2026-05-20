const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");

router.post("/", (req, res) => {
    const newNotification = notificationService.createNotification(req.body);

    res.json({
        status: "success",
        message: "Notification saved successfully",
        notification: newNotification
    });
});

router.get("/", (req, res) => {
    const filters = {
        userId: req.query.userId,
        status: req.query.status,
        priorityLevel: req.query.priorityLevel
    };

    const notifications = notificationService.getNotifications(filters);

    res.json({
        status: "success",
        filters,
        notifications
    });
});

router.patch("/:notificationId/cancel", (req, res) => {
    const result = notificationService.cancelNotification(req.params.notificationId);

    if (!result.success) {
        return res.status(404).json({
            status: "error",
            message: result.error
        });
    }

    res.json({
        status: "success",
        message: "Notification cancelled successfully",
        result
    });
});

module.exports = router;
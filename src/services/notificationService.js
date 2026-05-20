const scheduler = require("./schedulerService");
const storage = require("../storage/notificationStorage");

function createNotification(data) {
    const notifications = storage.readNotifications();

    const newNotification = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        userId: data.userId,
        assignmentName: data.assignmentName,
        dueDate: data.dueDate,
        notificationTime: data.notificationTime,
        priorityLevel: data.priorityLevel || "normal",
        status: "pending",
        createdAt: new Date().toISOString()
    };

    notifications.push(newNotification);
    storage.saveNotifications(notifications);
    scheduler.scheduleNotification(newNotification);

    return newNotification;
}

function getNotifications(filters) {
    if (!filters.userId) {
        throw new Error("userId is required");
    }

    const notifications = storage.readNotifications();

    return notifications
        .filter(notification => {
            if (String(notification.userId) !== String(filters.userId)) {
                return false;
            }

            if (filters.status && notification.status !== filters.status) {
                return false;
            }

            if (filters.priorityLevel && notification.priorityLevel !== filters.priorityLevel
            ) {
                return false;
            }

            return true;
        })
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function cancelNotification(notificationId) {
    const notification = storage.findNotificationById(notificationId);

    if (!notification) {
        return {
            success: false,
            error: "Notification not found"
        };
    }

    if (notification.status === "sent") {
        return {
            success: false,
            error: "Notification has already been sent"
        };
    }

    if (notification.status === "cancelled") {
        return {
            success: false,
            error: "Notification is already cancelled"
        };
    }

    const cancelledTimer = scheduler.cancelScheduledNotification(notificationId);

    storage.updateNotificationStatus(notificationId, "cancelled");

    return {
        success: true,
        notificationId,
        status: "cancelled",
        timerCancelled: cancelledTimer
    };
}

module.exports = {
    createNotification,
    getNotifications,
    cancelNotification
};
const storage = require("../storage/notificationStorage");
const activeTimers = {};

function calculateReminderDate(dueDate, notificationTime) {
    const due = new Date(dueDate);

    if (notificationTime === "10s") {
        due.setSeconds(due.getSeconds() - 10);
    } else if (notificationTime === "1h") {
        due.setHours(due.getHours() - 1);
    } else if (notificationTime === "24h") {
        due.setDate(due.getDate() - 1);
    } else if (notificationTime === "3d") {
        due.setDate(due.getDate() - 3);
    } else {
        throw new Error(`Invalid notificationTime: ${notificationTime}`);
    }

    return due;
}

function scheduleNotification(notification) {
    const due = new Date(notification.dueDate);

    if (due.getTime() <= Date.now()) {
        console.log(`Due date already passed for: ${notification.assignmentName}`);
        storage.updateNotificationStatus(notification.id, "missed");
        return;
    }

    const reminderDate = calculateReminderDate(
        notification.dueDate,
        notification.notificationTime
    );

    const delay = reminderDate.getTime() - Date.now();

    if (delay <= 0) {
        console.log(`Reminder time already passed for: ${notification.assignmentName}`);
        storage.updateNotificationStatus(notification.id, "missed");
        return;
    }

    const timerId = setTimeout(() => {
        console.log("NOTIFICATION REMINDER:");
        console.log(`Assignment: ${notification.assignmentName}`);

        storage.updateNotificationStatus(notification.id, "sent");

        console.log(`Notification ${notification.id} marked as SENT`);

        delete activeTimers[notification.id];
    }, delay);

    activeTimers[notification.id] = timerId;

    console.log(`Scheduled notification ${notification.id} for ${reminderDate}`);
}

function cancelScheduledNotification(notificationId) {
    if (activeTimers[notificationId]) {
        clearTimeout(activeTimers[notificationId]);
        delete activeTimers[notificationId];
        console.log(`Cancelled timer for notification ${notificationId}`);
        return true;
    }

    return false;
}

module.exports = {
    scheduleNotification,
    cancelScheduledNotification
};
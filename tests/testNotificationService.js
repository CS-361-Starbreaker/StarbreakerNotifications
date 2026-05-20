process.env.NOTIFICATION_FILE_PATH = "./tests/logging/notifications.json";

const notificationService = require("../src/services/notificationService");
const storage = require("../src/storage/notificationStorage");

function getFutureSeconds(secondsFromNow) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + secondsFromNow);
    return date.toISOString();
}

async function runTests() {
    console.log("Starting notification service tests...\n");

    storage.saveNotifications([]);

    notificationService.createNotification({
        userId: 1,
        assignmentName: "Database Project",
        dueDate: getFutureSeconds(20),
        notificationTime: "10s",
        priorityLevel: "high"
    });

    notificationService.createNotification({
        userId: 2,
        assignmentName: "Math Homework",
        dueDate: getFutureSeconds(20),
        notificationTime: "10s",
        priorityLevel: "normal"
    });

    console.log("Test 1 Passed: two notifications created");

    const user1Notifications = notificationService.getNotifications({
        userId: 1
    });

    if (user1Notifications.length !== 1) {
        throw new Error("Test 2 Failed");
    }

    console.log("Test 2 Passed");

    const highPriority = notificationService.getNotifications({
        userId: 1,
        priorityLevel: "high"
    });

    if (highPriority.length !== 1) {
        throw new Error("Test 3 Failed");
    }

    console.log("Test 3 Passed");

    let errorCaught = false;
    try {
        notificationService.getNotifications({});
    } catch {
        errorCaught = true;
    }

    if (!errorCaught) {
        throw new Error("Test 4 Failed");
    }

    console.log("Test 4 Passed");

    console.log("\nWaiting for scheduled notifications to trigger...\n");

    await sleep(12000);

    const allNotifications = storage.readNotifications();

    const allSent = allNotifications.every(n => n.status === "sent");

    if (!allSent) {
        throw new Error("Test 5 Failed: Notifications were not marked as sent");
    }

    console.log("Test 5 Passed: Notifications updated to SENT");

    const notificationToCancel = notificationService.createNotification({
        userId: 3,
        assignmentName: "Cancel Test Assignment",
        dueDate: getFutureSeconds(30),
        notificationTime: "10s",
        priorityLevel: "normal"
    });

    const cancelResult = notificationService.cancelNotification(notificationToCancel.id);

    if (!cancelResult.success || cancelResult.status !== "cancelled") {
        throw new Error("Test 6 Failed: valid notification was not cancelled");
    }

    const cancelledNotification = storage
        .readNotifications()
        .find(n => String(n.id) === String(notificationToCancel.id));

    if (cancelledNotification.status !== "cancelled") {
        throw new Error("Test 6 Failed: notification status was not saved as cancelled");
    }

    console.log("Test 6 Passed: valid notification cancels correctly");

    const invalidCancelResult = notificationService.cancelNotification("INVALID_ID");

    if (invalidCancelResult.success !== false) {
        throw new Error("Test 7 Failed: invalid notification ID should not cancel");
    }

    console.log("Test 7 Passed: invalid notification ID returns error");

    console.log("\nAll tests passed!");
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

runTests();
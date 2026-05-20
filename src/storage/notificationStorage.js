const fs = require("fs");
const path = require("path");

const FILE_PATH = process.env.NOTIFICATION_FILE_PATH
    ? path.resolve(process.env.NOTIFICATION_FILE_PATH)
    : path.join(__dirname, "../..", "logging", "notifications.json");

function ensureStorageExists() {
    const dir = path.dirname(FILE_PATH);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(FILE_PATH)) {
        fs.writeFileSync(FILE_PATH, JSON.stringify([]));
    }
}

function readNotifications() {
    ensureStorageExists();

    const data = fs.readFileSync(FILE_PATH);
    return JSON.parse(data);
}

function saveNotifications(notifications) {
    ensureStorageExists();

    fs.writeFileSync(FILE_PATH, JSON.stringify(notifications, null, 2));
}

function findNotificationById(id) {
    const notifications = readNotifications();
    return notifications.find(n => String(n.id) === String(id));
}

function updateNotificationStatus(id, status) {
    const notifications = readNotifications();

    const updated = notifications.map(n => {
        if (String(n.id) === String(id)) {
            return {
                ...n,
                status,
                ...(status === "sent" && { sentAt: new Date().toISOString() }),
                ...(status === "cancelled" && { cancelledAt: new Date().toISOString() })
            };
        }

        return n;
    });

    saveNotifications(updated);
}

module.exports = {
    readNotifications,
    saveNotifications,
    findNotificationById,
    updateNotificationStatus
};
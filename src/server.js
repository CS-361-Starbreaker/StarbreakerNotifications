const express = require("express");
const cors = require("cors");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
    res.send("Notification Service Running");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
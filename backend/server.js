require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes")
const invoiceRoutes = require("./routes/invoiceRoutes")
const receiptRoutes = require("./routes/receiptRoutes")
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

// Middleware to handle CORS
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

// Connect Database
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/invoices", invoiceRoutes)
app.use("/api/receipts", receiptRoutes)
app.use("/api/subscription", subscriptionRoutes)
app.use("/api/settings", settingsRoutes)

// basic root
app.get('/', (req, res) => res.send('API running'));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// server/momo-proxy.js
// Simple Express proxy server for MoMo API to bypass CORS

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Enable CORS for all origins (dev only)
app.use(cors());
app.use(express.json());

// MoMo API endpoints
const MOMO_CREATE_URL = "https://test-payment.momo.vn/v2/gateway/api/create";
const MOMO_QUERY_URL = "https://test-payment.momo.vn/v2/gateway/api/query";

// Proxy: Create Payment
app.post("/api/momo/create", async (req, res) => {
    try {
        console.log("Proxying create payment request:", req.body);

        const response = await fetch(MOMO_CREATE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        console.log("MoMo Response:", data);
        res.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy: Check Status
app.post("/api/momo/query", async (req, res) => {
    try {
        console.log("Proxying query request:", req.body);

        const response = await fetch(MOMO_QUERY_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        console.log("MoMo Query Response:", data);
        res.json(data);
    } catch (error) {
        console.error("Proxy Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get("/health", (req, res) => {
    res.json({ status: "OK", message: "MoMo Proxy Server is running" });
});

app.listen(PORT, () => {
    console.log(`🚀 MoMo Proxy Server running at http://localhost:${PORT}`);
    console.log(`   - Create Payment: POST http://localhost:${PORT}/api/momo/create`);
    console.log(`   - Query Status:   POST http://localhost:${PORT}/api/momo/query`);
});

const express = require('express');
const https = require('https');
const crypto = require('crypto');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// MoMo Config (Test Environment)
const config = {
    accessKey: 'F8BBA842ECF85',
    secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    partnerCode: 'MOMO',
    redirectUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
    ipnUrl: 'https://webhook.site/b3088a6a-2d17-4f8d-a383-71389a6c600b',
    requestType: 'captureWallet',
    lang: 'vi'
};

app.post('/api/momo/create', (req, res) => {
    console.log("👉 Received Create Payment Request");

    const { orderId, amount, orderInfo } = req.body;
    const requestId = orderId;
    const extraData = "";

    // Signature logic
    const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${config.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${config.redirectUrl}&requestId=${requestId}&requestType=${config.requestType}`;

    const signature = crypto.createHmac('sha256', config.secretKey)
        .update(rawSignature)
        .digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: config.partnerCode,
        partnerName: "Test Store",
        storeId: "MomoTestStore",
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: config.redirectUrl,
        ipnUrl: config.ipnUrl,
        lang: config.lang,
        requestType: config.requestType,
        autoCapture: true,
        extraData: extraData,
        signature: signature
    });

    // Call MoMo API
    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/create',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const request = https.request(options, response => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            console.log("✅ MoMo Response:", JSON.parse(data));
            res.json(JSON.parse(data));
        });
    });

    request.on('error', (e) => {
        console.error(`❌ Request error: ${e.message}`);
        res.status(500).json({ error: e.message });
    });

    request.write(requestBody);
    request.end();
});

app.post('/api/momo/query', (req, res) => {
    const { orderId } = req.body;
    const requestId = orderId;

    const rawSignature = `accessKey=${config.accessKey}&orderId=${orderId}&partnerCode=${config.partnerCode}&requestId=${requestId}`;
    const signature = crypto.createHmac('sha256', config.secretKey).update(rawSignature).digest('hex');

    const requestBody = JSON.stringify({
        partnerCode: config.partnerCode,
        requestId: requestId,
        orderId: orderId,
        signature: signature,
        lang: 'vi'
    });

    const options = {
        hostname: 'test-payment.momo.vn',
        port: 443,
        path: '/v2/gateway/api/query',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(requestBody)
        }
    };

    const request = https.request(options, response => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
            // console.log("🔍 Query Status:", JSON.parse(data));
            res.json(JSON.parse(data));
        });
    });

    request.on('error', (e) => res.status(500).json({ error: e.message }));
    request.write(requestBody);
    request.end();
});

app.listen(PORT, () => {
    console.log(`🚀 Proxy Server running at http://localhost:${PORT}`);
});

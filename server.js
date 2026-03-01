'use strict';

const express = require('express');

const PORT        = process.env.PORT || 3000;
const HOST        = process.env.HOST || '0.0.0.0';
const MAX_BODY_KB  = 1;  

const app = express();

app.use(express.json({ limit: `${MAX_BODY_KB}kb` }));

function isValidPayload(lat, lng, battery) {
    return (
        typeof lat     === 'number' && isFinite(lat) && lat >= -90  && lat <= 90  &&
        typeof lng     === 'number' && isFinite(lng) && lng >= -180 && lng <= 180 &&
        typeof battery === 'number' && Number.isInteger(battery)    &&
        battery >= 0  && battery <= 100
    );
}

app.post('/data', (req, res) => {
    const { lat, lng, battery } = req.body ?? {};

    if (!isValidPayload(lat, lng, battery)) {
        console.warn('[WARN] Invalid payload rejected:', req.body);
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Single template-literal log → one I/O call instead of six
    console.log(
        `\n┌── New Data ──────────────────────────────────
│ Time     : ${new Date().toLocaleTimeString()}
│ Battery  : ${battery}%
│ Lat      : ${lat}
│ Lng      : ${lng}
│ Maps     : https://www.google.com/maps?q=${lat},${lng}
└─────────────────────────────────────────────`
    );

    res.sendStatus(200);
});

app.use((_, res) => res.status(404).json({ error: 'Not found' }));

app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, HOST, () =>
    console.log(`[Server] Listening on http://${HOST}:${PORT}`)
);
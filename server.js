const express = require('express');
const axios = require('axios');
const UserAgent = require('user-agents');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// --- KEAMANAN LEVEL 1: HELMET (Secure Headers) ---
app.use(helmet({
    contentSecurityPolicy: false, // Dimatikan agar bisa load script eksternal jika perlu
}));

// --- KEAMANAN LEVEL 2: ANTI-PAYLOAD (Mencegah pengiriman data besar) ---
app.use(express.json({ limit: '10kb' }));

// --- KEAMANAN LEVEL 3: ANTI-DDOS GLOBAL ---
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 Menit
    max: 50, // Max 50 request per menit per IP
    message: "GoostTeam Security: Terdeteksi aktivitas bot!"
});
app.use(globalLimiter);

// Sajikan file statis (HTML, CSS, JS) dari folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- KEAMANAN LEVEL 4: KHUSUS TOMBOL DOWNLOAD (Anti-Spam) ---
const downloadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Menit
    max: 5, // Cuma boleh 5x download per 15 menit per user
    handler: (req, res) => {
        res.status(429).json({
            status: "error",
            message: "Woi sabar! Jangan nyepam. GoostTeam membatasi 5 download per 15 menit."
        });
    }
});

// --- LOGIKA UTAMA: ENDPOINT DOWNLOAD ---
app.get('/download', downloadLimiter, async (req, res) => {
    const targetUrl = req.query.url;

    if (!targetUrl) {
        return res.status(400).json({ error: "Linknya mana?" });
    }

    try {
        // Generate Identitas Palsu (Fake User-Agent)
        const userAgent = new UserAgent({ deviceCategory: 'mobile' }).toString();

        // Jeda Acak (Stealth Mode)
        const delay = Math.floor(Math.random() * 2000) + 500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Panggil API (Mesin Pengambil Video)
        const response = await axios.get(`https://api.vreden.web.id/api/download/tiktok?url=${encodeURIComponent(targetUrl)}`, {
            headers: {
                'User-Agent': userAgent,
                'Referer': 'https://www.google.com/'
            }
        });

        // Kirim hasil ke Frontend
        res.json(response.data);

    } catch (error) {
        console.error("Error Engine:", error.message);
        res.status(500).json({ error: "Gagal mengambil video. Link mati atau server sibuk." });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`
    ██████╗  ██████╗  ██████╗ ███████╗████████╗███████╗ █████╗ ███╗   ███╗
    ██╔════╝ ██╔═══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗████╗ ████║
    ██║  ███╗██║   ██║██║   ██║███████╗   ██║   █████╗  ███████║██╔████╔██║
    ██║   ██║██║   ██║██║   ██║╚════██║   ██║   ██╔══╝  ██╔══██║██║╚██╔╝██║
    ╚██████╔╝╚██████╔╝╚██████╔╝███████║   ██║   ███████╗██║  ██║██║ ╚═╝ ██║
     ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝
    >> SERVER GOOSTTEAM ONLINE - PORT: ${PORT}
    >> PROTECTION: ACTIVE (Anti-DDoS, Rate-Limit, Stealth)
    `);
});

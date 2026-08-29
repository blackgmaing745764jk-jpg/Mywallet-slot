const { Telegraf } = require('telegraf');
const express = require('express');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE');
const MY_TELEGRAM_USER = 'Klvin_201'; // Admin username

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const DB_FILE = 'database.json';

function loadDB() {
    if (!fs.existsSync(DB_FILE)) {
        const initialData = {
            users: {
                "2067": { balance: 1000, username: "Klvin" }
            },
            deposits: [],
            withdraws: []
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Telegram Bot Handlers
bot.start((ctx) => {
    ctx.reply('⭐ BK77 Game Bot သို့ ကြိုဆိုပါတယ်ခင်ဗျာ။');
});

// Webhook / Express Routes
app.get('/', (req, res) => {
    let db = loadDB();
    let userBalance = db.users["2067"] ? db.users["2067"].balance : 1000;

    res.send(`
        <!DOCTYPE html>
        <html lang="my">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>BK77 - Game Hub</title>
            <style>
                body {
                    margin: 0;
                    background-color: #0b132b;
                    color: #fff;
                    font-family: sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    overflow: hidden;
                }
                .app-container {
                    position: relative;
                    width: 100%;
                    max-width: 480px;
                    height: 100vh;
                    background: #111827;
                    box-shadow: 0 0 20px rgba(0,0,0,0.8);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .header {
                    padding: 15px 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #111827;
                }
                .logo-title {
                    color: #fbbf24;
                    font-weight: bold;
                    font-size: 20px;
                }
                .user-info {
                    color: #9ca3af;
                    font-size: 14px;
                }
                .user-info span {
                    color: #fbbf24;
                    font-weight: bold;
                }
                .main-content {
                    flex: 1;
                    padding: 10px 15px;
                    overflow-y: auto;
                }
                .grid-top {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 10px;
                }
                .btn-cat {
                    background: #f43f5e;
                    color: white;
                    border: none;
                    padding: 15px 10px;
                    border-radius: 12px;
                    font-weight: bold;
                    font-size: 14px;
                    text-align: center;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
                }
                .grid-mid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .btn-cat-yellow {
                    background: #f59e0b;
                    color: #111827;
                }
                .btn-cat-pink {
                    background: #ec4899;
                    color: white;
                }
                .section-title {
                    font-size: 14px;
                    color: #e5e7eb;
                    margin: 15px 0 10px 0;
                    font-weight: bold;
                }
                .grid-games {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .game-box {
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 12px;
                    padding: 15px 10px;
                    text-align: center;
                    cursor: pointer;
                    transition: transform 0.1s;
                }
                .game-box:active {
                    transform: scale(0.95);
                }
                .game-box h4 {
                    margin: 8px 0 2px 0;
                    color: #fbbf24;
                    font-size: 14px;
                }
                .game-box span {
                    font-size: 10px;
                    color: #9ca3af;
                }
                .logout-btn {
                    background: #ef4444;
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    font-weight: bold;
                    font-size: 15px;
                    cursor: pointer;
                    margin-bottom: 10px;
                }
                .support-banner {
                    background: #0ea5e9;
                    color: white;
                    text-align: center;
                    padding: 12px;
                    border-radius: 25px;
                    font-size: 13px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    cursor: pointer;
                    text-decoration: none;
                    display: block;
                }
                .bottom-nav {
                    display: flex;
                    justify-content: space-around;
                    background: #111827;
                    border-top: 1px solid #1f2937;
                    padding: 10px 0;
                }
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: #9ca3af;
                    font-size: 11px;
                    cursor: pointer;
                    background: none;
                    border: none;
                    text-decoration: none;
                }
                .nav-item.active {
                    color: #38bdf8;
                }

                /* Game Screen Overlay */
                .game-screen-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #0b132b;
                    z-index: 100;
                    flex-direction: column;
                    padding: 15px;
                    box-sizing: border-box;
                    overflow-y: auto;
                }
                .game-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .back-lobby-btn {
                    background: #ef4444;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .game-body {
                    flex: 1;
                    background: #111827;
                    border-radius: 12px;
                    border: 1px solid #374151;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 15px;
                    position: relative;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="app-container">
                <!-- Header -->
                <div class="header">
                    <div class="logo-title">⭐ BK77</div>
                    <div class="user-info">UID: <b id="uidText">2067</b> | <span id="userBalance">${userBalance}</span> ကျပ်</div>
                </div>

                <!-- Main Content / Lobby -->
                <div class="main-content" id="lobbyView">
                    <div class="grid-top">
                        <button class="btn-cat" onclick="alert('⚽ ကာသ ဂိမ်း')">⚽ ကာသ</button>
                        <button class="btn-cat" onclick="alert('👩 ကာစီနို ဂိမ်း')">👩 ကာစီနို</button>
                        <button class="btn-cat" onclick="alert('🃏 ဖဲ ဂိမ်း')">🃏 ဖဲ</button>
                    </div>
                    <div class="grid-mid">
                        <button class="btn-cat btn-cat-yellow" onclick="openGame('fish')">🦈 ငါးဖမ်း</button>
                        <button class="btn-cat btn-cat-pink" onclick="alert('✈️ ဂိမ်းများ')">✈️ ဂိမ်းများ</button>
                    </div>

                    <div class="section-title">📌 ဂိမ်းအသေးစားများ</div>
                    
                    <div class="grid-games">
                        <div class="game-box" onclick="openGame('mines')">
                            <span style="font-size: 24px;">💣</span>
                            <h4>MINES</h4>
                            <span>JILI</span>
                        </div>
                        <div class="game-box" onclick="openGame('wingo')">
                            <span style="font-size: 24px;">🎲</span>
                            <h4>Win Go</h4>
                            <span>30s</span>
                        </div>
                        <div class="game-box" onclick="openGame('gocrush')">
                            <span style="font-size: 24px;">✈️</span>
                            <h4>AVIATOR</h4>
                            <span>Crash</span>
                        </div>
                    </div>

                    <button class="logout-btn" onclick="alert('အကောင့်ထွက်ပြီးပါပြီ')">အကောင့်ထွက်မည် (Logout)</button>
                    
                    <a href="https://t.me/${MY_TELEGRAM_USER}" target="_blank" class="support-banner">
                        ✈️ အခက်အခဲရှိပါက ဆက်သွယ်ရန် (@${MY_TELEGRAM_USER})
                    </a>
                </div>

                <!-- Bottom Navigation -->
                <div class="bottom-nav">
                    <button class="nav-item active">
                        <span style="font-size: 18px;">🏠</span>
                        လင်မ
                    </button>
                    <button class="nav-item" onclick="alert('ငွေသွင်းရန် Telegram သို့ ဆက်သွယ်ပါ')">
                        <span style="font-size: 18px;">📥</span>
                        ငွေသွင်း
                    </button>
                    <button class="nav-item" onclick="alert('ငွေထုတ်ရန် Telegram သို့ ဆက်သွယ်ပါ')">
                        <span style="font-size: 18px;">📤</span>
                        ငွေထုတ်
                    </button>
                    <button class="nav-item" onclick="alert('မှတ်တမ်း မရှိသေးပါ။')">
                        <span style="font-size: 18px;">📋</span>
                        မှတ်တမ်း
                    </button>
                </div>
            </div>

            <!-- Game Screen Overlay -->
            <div class="game-screen-overlay" id="gameScreenOverlay">
                <div class="game-header">
                    <button class="back-lobby-btn" onclick="closeGame()">❮ လော်ဘီသို့ ပြန်ရန်</button>
                    <div style="font-weight: bold; color: #fbbf24;" id="activeGameTitle">ဂိမ်း</div>
                </div>
                <div class="game-body" id="activeGameContent">
                    <!-- Dynamic Game Interface -->
                </div>
            </div>

            <script>
                let balance = ${userBalance};

                function updateBalanceUI() {
                    document.getElementById('userBalance').innerText = balance;
                    let gameBalEl = document.getElementById('gameBal');
                    if(gameBalEl) gameBalEl.innerText = balance;
                }

                function closeGame() {
                    document.getElementById('gameScreenOverlay').style.display = 'none';
                    updateBalanceUI();
                }

                function openGame(type) {
                    document.getElementById('gameScreenOverlay').style.display = 'flex';
                    const content = document.getElementById('activeGameContent');
                    const title = document.getElementById('activeGameTitle');
                    content.innerHTML = '';

                    if (type === 'fish') {
                        title.innerText = '🦈 JILI ငါးဖမ်းဂိမ်း';
                        content.innerHTML = \`
                            <div style="font-size: 55px; margin-bottom: 20px; cursor: pointer;" onclick="playFish()">🐟</div>
                            <p style="color: #9ca3af; font-size: 14px;">ငါးကိုနှိပ်၍ ပစ်ခတ်ပါ (ကျည်ဖိုး 10 ကျပ်)</p>
                            <div style="margin-top: 25px; color: #fbbf24; font-weight: bold; font-size: 16px;">လက်ကျန်ငွေ: <span id="gameBal">\${balance}</span> ကျပ်</div>
                        \`;
                    } else if (type === 'mines') {
                        title.innerText = '💣 MINES (JILI)';
                        content.innerHTML = \`
                            <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px; width: 100%; max-width: 320px;">
                                \` + Array(25).fill(0).map(() => \`<button style="background:#1f2937; border:1px solid #374151; aspect-ratio:1; color:white; border-radius:8px; cursor:pointer; font-size:18px;" onclick="clickMine(this)">🪙</button>\`).join('') + \`
                            </div>
                            <p style="color: #9ca3af; font-size: 13px;">ဗုံးမထိအောင် ကျောက်တုံးကို ရွေးပါ (ကြေး 10 ကျပ်)</p>
                            <div style="margin-top: 15px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="gameBal">\${balance}</span> ကျပ်</div>
                        \`;
                    } else if (type === 'wingo') {
                        title.innerText = '🎲 Win Go 30s';
                        content.innerHTML = \`
                            <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-bottom: 15px;" id="wingoResult">အရောင်ခန့်မှန်းရန် ရွေးပါ</div>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <button style="background: #ef4444; color:white; border:none; padding:12px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အနီ')">အနီ (Red)</button>
                                <button style="background: #3b82f6; color:white; border:none; padding:12px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အပြာ')">အပြာ (Green)</button>
                            </div>
                            <p style="color: #9ca3af; font-size: 13px;">လောင်းကြေး: 10 ကျပ်</p>
                            <div style="margin-top: 15px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="gameBal">\${balance}</span> ကျပ်</div>
                        \`;
                    } else if (type === 'gocrush') {
                        title.innerText = '✈️ AVIATOR';
                        content.innerHTML = \`
                            <div style="font-size: 50px; margin-bottom: 10px;" id="aviatorPlane">✈️</div>
                            <div style="font-size: 40px; font-weight: bold; color: #ef4444; margin-bottom: 20px;" id="crushMultiplier">1.00x</div>
                            <button style="background: #10b981; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px; width: 100%; max-width: 250px;" id="crushBtn" onclick="startCrush()">စတင်မည် (Bet 10 Ks)</button>
                            <div style="margin-top: 20px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="gameBal">\${balance}</span> ကျပ်</div>
                        \`;
                    }
                }

                function playFish() {
                    if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 10;
                    if (Math.random() < 0.4) {
                        balance += 25;
                        alert('🎉 ငါးမိပါပြီ! +25 ကျပ် ရရှိသည်');
                    } else {
                        alert('ကျည်လွဲသွားပါပြီ');
                    }
                    updateBalanceUI();
                }

                function clickMine(btn) {
                    if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 10;
                    if (Math.random() < 0.25) {
                        btn.style.background = '#ef4444';
                        btn.innerText = '💣';
                        alert('ဗုံးပေါက်သွားပါပြီ!');
                    } else {
                        btn.style.background = '#10b981';
                        btn.innerText = '💎';
                        balance += 25;
                        alert('💎 ရတနာတွေ့ပါပြီ! +25 ကျပ်');
                    }
                    updateBalanceUI();
                }

                function playWingo(choice) {
                    if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 10;
                    let outcomes = ['အနီ', 'အပြာ'];
                    let res = outcomes[Math.floor(Math.random() * outcomes.length)];
                    document.getElementById('wingoResult').innerText = 'ထွက်လာသောရလဒ်: ' + res;
                    if (res === choice) {
                        balance += 20;
                        alert('🎉 နိုင်ပါပြီ! +20 ကျပ်');
                    } else {
                        alert('ရှုံးပါပြီ၊ ထပ်ကြိုးစားပါ');
                    }
                    updateBalanceUI();
                }

                let crushInterval;
                function startCrush() {
                    if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 10;
                    updateBalanceUI();
                    let mult = 1.00;
                    let btn = document.getElementById('crushBtn');
                    btn.innerText = 'ငွေထုတ်မည် (Cashout)';
                    
                    btn.onclick = function() {
                        clearInterval(crushInterval);
                        let winAmt = Math.floor(10 * mult);
                        balance += winAmt;
                        alert('အောင်မြင်စွာ ထုတ်ယူပြီး: ' + winAmt + ' ကျပ်');
                        btn.innerText = 'စတင်မည် (Bet 10 Ks)';
                        btn.onclick = startCrush;
                        updateBalanceUI();
                    };

                    crushInterval = setInterval(() => {
                        mult += 0.08;
                        let multEl = document.getElementById('crushMultiplier');
                        let planeEl = document.getElementById('aviatorPlane');
                        if(multEl) multEl.innerText = mult.toFixed(2) + 'x';
                        if(planeEl) {
                            let randomTilt = Math.sin(mult * 5) * 10;
                            planeEl.style.transform = \`translateY(-\${(mult - 1) * 20}px) rotate(\${randomTilt}deg)\`;
                        }
                        
                        if (Math.random() < 0.05) {
                            clearInterval(crushInterval);
                            if(planeEl) planeEl.innerText = '💥';
                            alert('✈️ လေယာဉ် ပျံထွက်သွားပါပြီ (Fly Away)!');
                            btn.innerText = 'စတင်မည် (Bet 10 Ks)';
                            btn.onclick = startCrush;
                            updateBalanceUI();
                        }
                    }, 200);
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

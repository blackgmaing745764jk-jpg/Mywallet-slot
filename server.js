const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
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
                    background: #111827;
                    z-index: 100;
                    flex-direction: column;
                    padding: 15px;
                    box-sizing: border-box;
                    overflow-y: auto;
                }
                .game-top-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }
                .back-lobby {
                    color: #38bdf8;
                    background: none;
                    border: none;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                }
                .game-stats-box {
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 10px;
                    padding: 10px 15px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    font-size: 14px;
                }
                .multiplier-row {
                    display: flex;
                    gap: 6px;
                    overflow-x: auto;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                }
                .mult-badge {
                    background: #1f2937;
                    color: #9ca3af;
                    border: 1px solid #374151;
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: bold;
                    white-space: nowrap;
                }
                .mult-badge.active {
                    background: #10b981;
                    color: white;
                    border-color: #10b981;
                }
                .mines-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 8px;
                    margin-bottom: 15px;
                }
                .mine-cell {
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    aspect-ratio: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 20px;
                    cursor: pointer;
                }
                .bet-input-box {
                    background: #1f2937;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: bold;
                    color: white;
                    margin-bottom: 12px;
                }
                .start-btn {
                    background: #10b981;
                    color: white;
                    border: none;
                    width: 100%;
                    padding: 14px;
                    border-radius: 10px;
                    font-weight: bold;
                    font-size: 16px;
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <div class="app-container">
                <!-- Header -->
                <div class="header">
                    <div class="logo-title">⭐ BK77</div>
                    <div class="user-info">UID: <b>2067</b> | <span id="userBalance">1000</span> ကျပ်</div>
                </div>

                <!-- Main Content / Lobby -->
                <div class="main-content" id="lobbyView">
                    <div class="grid-top">
                        <button class="btn-cat" onclick="alert('⚽ ကာသ')">⚽ ကာသ</button>
                        <button class="btn-cat" onclick="alert('👩 ကာစီနို')">👩 ကာစီနို</button>
                        <button class="btn-cat" onclick="alert('🃏 ဖဲ')">🃏 ဖဲ</button>
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
                            <span style="font-size: 24px;">🚀</span>
                            <h4>GO CRUSH</h4>
                            <span>Crash</span>
                        </div>
                    </div>

                    <button class="logout-btn" onclick="alert('အကောင့်ထွက်ပြီးပါပြီ')">အကောင့်ထွက်မည် (Logout)</button>
                    
                    <div class="support-banner" onclick="alert('အကူအညီရယူရန် ဆက်သွယ်နေပါပြီ...')">
                        ✈️ အခက်အခဲရှိပါက ဆက်သွယ်ရန်
                    </div>
                </div>

                <!-- Bottom Navigation -->
                <div class="bottom-nav">
                    <button class="nav-item active">
                        <span style="font-size: 18px;">🏠</span>
                        လင်မ
                    </button>
                    <button class="nav-item" onclick="alert('ငွေသွင်းရန်')">
                        <span style="font-size: 18px;">📥</span>
                        ငွေသွင်း
                    </button>
                    <button class="nav-item" onclick="alert('ငွေထုတ်ရန်')">
                        <span style="font-size: 18px;">📤</span>
                        ငွေထုတ်
                    </button>
                    <button class="nav-item" onclick="alert('မှတ်တမ်း')">
                        <span style="font-size: 18px;">📋</span>
                        မှတ်တမ်း
                    </button>
                </div>
            </div>

            <!-- Game Playing Screen Overlay -->
            <div class="game-screen-overlay" id="gameScreenOverlay">
                <div class="game-top-bar">
                    <button class="back-lobby" onclick="closeGame()">❮ Lobby သို့ ပြန်ရန်</button>
                    <div style="font-weight: bold; color: #fbbf24;" id="gameScreenTitle">MINES</div>
                </div>

                <div id="gameScreenBody">
                    <!-- Dynamic Game Content loaded via JS -->
                </div>
            </div>

            <script>
                let balance = 1000;

                function updateBalanceUI() {
                    document.getElementById('userBalance').innerText = balance;
                    let balEl = document.getElementById('activeBal');
                    if(balEl) balEl.innerText = balance.toLocaleString();
                }

                function closeGame() {
                    document.getElementById('gameScreenOverlay').style.display = 'none';
                    updateBalanceUI();
                }

                function openGame(type) {
                    document.getElementById('gameScreenOverlay').style.display = 'flex';
                    const body = document.getElementById('gameScreenBody');
                    const title = document.getElementById('gameScreenTitle');
                    body.innerHTML = '';

                    if (type === 'mines') {
                        title.innerText = 'MINES (JILI)';
                        body.innerHTML = \`
                            <div class="game-stats-box">
                                <div>💰 လက်ကျန်: <span id="activeBal" style="color:#fbbf24; font-weight:bold;">\${balance.toLocaleString()}</span> ကျပ်</div>
                                <div>💣 ဗုံး: <b>3</b></div>
                            </div>
                            <div class="multiplier-row">
                                <div class="mult-badge active">1.14x</div>
                                <div class="mult-badge">1.32x</div>
                                <div class="mult-badge">1.54x</div>
                                <div class="mult-badge">1.82x</div>
                                <div class="mult-badge">2.18x</div>
                            </div>
                            <div class="mines-grid" id="minesGridContainer">
                                \${generateMineGridCells()}
                            </div>
                            <div id="mineStatusMsg" style="text-align: center; color: #ef4444; font-size: 14px; margin-bottom: 10px; font-weight: bold;"></div>
                            <div class="bet-input-box">500</div>
                            <button class="start-btn" onclick="startMinesGame()">စတင်မည် (Start)</button>
                        \`;
                    } else if (type === 'fish') {
                        title.innerText = '🦈 JILI ငါးဖမ်းဂိမ်း';
                        body.innerHTML = \`
                            <div style="text-align: center; padding: 40px 0;">
                                <div style="font-size: 60px; cursor: pointer; margin-bottom: 20px;" onclick="shootFish()">🐟</div>
                                <p style="color: #9ca3af; font-size: 14px;">ငါးကိုနှိပ်၍ ပစ်ခတ်ပါ (ကျည်ဖိုး 10 ကျပ်)</p>
                                <div style="margin-top: 20px; color: #fbbf24; font-size: 16px; font-weight: bold;">လက်ကျန်ငွေ: <span id="activeBal">\${balance}</span> ကျပ်</div>
                            </div>
                        \`;
                    } else if (type === 'wingo') {
                        title.innerText = '🎲 Win Go 30s';
                        body.innerHTML = \`
                            <div style="text-align: center; padding: 30px 0;">
                                <div style="font-size: 22px; color: #38bdf8; font-weight: bold; margin-bottom: 20px;" id="wingoRes">အရောင်ခန့်မှန်းပါ</div>
                                <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 20px;">
                                    <button style="background:#ef4444; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အနီ')">အနီ (Red)</button>
                                    <button style="background:#3b82f6; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အပြာ')">အပြာ (Green)</button>
                                </div>
                                <div style="color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="activeBal">\${balance}</span> ကျပ်</div>
                            </div>
                        \`;
                    } else if (type === 'gocrush') {
                        title.innerText = '🚀 GO CRUSH';
                        body.innerHTML = \`
                            <div style="text-align: center; padding: 30px 0;">
                                <div style="font-size: 45px; font-weight: bold; color: #ef4444; margin-bottom: 25px;" id="crushMult">1.00x</div>
                                <button style="background:#10b981; color:white; border:none; padding:14px 30px; border-radius:10px; font-weight:bold; font-size:16px; cursor:pointer;" id="crushActionBtn" onclick="startCrushGame()">စတင်မည် (Bet 500 Ks)</button>
                                <div style="margin-top: 25px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="activeBal">\${balance}</span> ကျပ်</div>
                            </div>
                        \`;
                    }
                }

                function generateMineGridCells() {
                    let html = '';
                    for(let i=0; i<25; i++) {
                        html += \`<div class="mine-cell" onclick="clickMineCell(this)">🪙</div>\`;
                    }
                    return html;
                }

                function startMinesGame() {
                    if (balance < 500) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 500;
                    updateBalanceUI();
                    document.getElementById('mineStatusMsg.innerText') = '';
                    // Reset grid icons
                    let cells = document.querySelectorAll('.mine-cell');
                    cells.forEach(c => { c.innerText = '🪙'; c.style.background = '#1f2937'; });
                }

                function clickMineCell(cell) {
                    let isBomb = Math.random() < 0.25;
                    if (isBomb) {
                        cell.innerText = '💣';
                        cell.style.background = '#ef4444';
                        document.getElementById('mineStatusMsg').innerText = '💥 ဗုံးပေါက်သွားပါပြီ! ရှုံးနိမ့်သွားသည်';
                    } else {
                        cell.innerText = '💎';
                        cell.style.background = '#10b981';
                        balance += 100;
                        updateBalanceUI();
                    }
                }

                function shootFish() {
                    if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 10;
                    if (Math.random() < 0.4) {
                        balance += 30;
                        alert('🎉 ငါးမိပါပြီ! +30 ကျပ် ရရှိသည်');
                    } else {
                        alert('ကျည်လွဲသွားပါပြီ');
                    }
                    updateBalanceUI();
                }

                function playWingo(choice) {
                    if (balance < 100) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 100;
                    let outcomes = ['အနီ', 'အပြာ'];
                    let res = outcomes[Math.floor(Math.random() * outcomes.length)];
                    document.getElementById('wingoRes').innerText = 'ထွက်လာသောရလဒ်: ' + res;
                    if (res === choice) {
                        balance += 200;
                        alert('🎉 နိုင်ပါပြီ! +200 ကျပ်');
                    } else {
                        alert('ရှုံးပါပြီ၊ ထပ်ကြိုးစားပါ');
                    }
                    updateBalanceUI();
                }

                let crushTimer;
                function startCrushGame() {
                    if (balance < 500) { alert('ငွေမလုံလောက်ပါ!'); return; }
                    balance -= 500;
                    updateBalanceUI();
                    let mult = 1.00;
                    let btn = document.getElementById('crushActionBtn');
                    btn.innerText = 'ငွေထုတ်မည် (Cashout)';
                    btn.onclick = function() {
                        clearInterval(crushTimer);
                        let win = Math.floor(500 * mult);
                        balance += win;
                        alert('အောင်မြင်စွာ ထုတ်ယူပြီး: ' + win + ' ကျပ်');
                        btn.innerText = 'စတင်မည် (Bet 500 Ks)';
                        btn.onclick = startCrushGame;
                        updateBalanceUI();
                    };

                    crushTimer = setInterval(() => {
                        mult += 0.08;
                        let mEl = document.getElementById('crushMult');
                        if(mEl) mEl.innerText = mult.toFixed(2) + 'x';
                        if (Math.random() < 0.05) {
                            clearInterval(crushTimer);
                            alert('💥 Crash ဖြစ်သွားပါပြီ!');
                            btn.innerText = 'စတင်မည် (Bet 500 Ks)';
                            btn.onclick = startCrushGame;
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

const { Telegraf } = require('telegraf');
const express = require('express');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '7298659110';
const MY_TELEGRAM_USER = 'Klvin_2010';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = './database.json';

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try {
            let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            if(!data.balances) data.balances = { "1006": 50000 };
            if(!data.requests) data.requests = [];
            if(!data.withdraws) data.withdraws = [];
            if(!data.history) data.history = {};
            return data;
        } catch (e) {
            return { balances: { "1006": 50000 }, requests: [], withdraws: [], history: {} };
        }
    }
    return { balances: { "1006": 50000 }, requests: [], withdraws: [], history: {} };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 1. Login Page
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BK77 Login</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 40px 20px; }
            .card { background: #1e293b; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            input, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: none; font-size: 16px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-login { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>BK77 GAMING LOGIN</h2>
            <p>သင့်ရဲ့ Game ID (သို့) နံပါတ်ကို ထည့်ပါ</p>
            <input type="text" id="gameIdInput" placeholder="ဥပမာ - 1006">
            <button class="btn-login" onclick="goToHome()">ဝင်မည်</button>
        </div>
        <script>
            let savedId = localStorage.getItem('gameId');
            if(savedId) {
                window.location.href = '/home?id=' + encodeURIComponent(savedId);
            }
            function goToHome() {
                let id = document.getElementById('gameIdInput').value.trim();
                if(!id) {
                    alert('ကျေးဇူးပြု၍ Game ID ထည့်ပါ။');
                    return;
                }
                localStorage.setItem('gameId', id);
                window.location.href = '/home?id=' + encodeURIComponent(id);
            }
        </script>
    </body>
    </html>
    `);
});

// 2. Dashboard / Home Page
app.get('/home', (req, res) => {
    const gameId = req.query.id || '001';

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BK77 - ID: ${gameId}</title>
        <style>
            body { background-color: #1e3a8a; color: #fff; font-family: sans-serif; margin: 0; padding-bottom: 70px; }
            .top-bar { background: #2563eb; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-weight: bold; font-size: 18px; letter-spacing: 1px; color: #fbbf24; }
            .container { padding: 10px; max-width: 480px; margin: auto; }
            .banner-grid-top { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
            .banner-top { background: linear-gradient(135deg, #f43f5e, #fb7185); border-radius: 8px; padding: 15px 5px; text-align: center; font-size: 14px; font-weight: bold; }
            .banner-grid-sub { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 15px; }
            .banner-sub { background: linear-gradient(135deg, #f59e0b, #fbbf24); border-radius: 8px; padding: 15px; text-align: center; font-weight: bold; color: #1e293b; text-decoration: none; display: block; }
            .banner-sub.pink { background: linear-gradient(135deg, #ec4899, #f472b6); color: white; }
            .section-title { font-size: 16px; margin: 15px 0 10px 0; border-left: 4px solid #38bdf8; padding-left: 8px; }
            .game-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .game-card { background: linear-gradient(180deg, #1e1b4b, #312e81); border-radius: 12px; padding: 10px; text-align: center; border: 1px solid #4338ca; text-decoration: none; color: white; display: block; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
            .game-card .g-name { font-size: 13px; font-weight: bold; color: #fbbf24; margin-top: 5px; }
            .game-card .g-sub { font-size: 10px; color: #94a3b8; }
            .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #0f172a; display: flex; justify-content: space-around; padding: 10px 0; border-top: 1px solid #334155; z-index: 1000; }
            .nav-item { color: #94a3b8; text-decoration: none; text-align: center; font-size: 11px; flex: 1; }
            .nav-item.active { color: #38bdf8; font-weight: bold; }
            .nav-item div { font-size: 18px; margin-bottom: 2px; }
            .logout-btn { background: #ef4444; color: white; border: none; padding: 12px; width: 100%; border-radius: 8px; margin-top: 20px; font-weight: bold; cursor: pointer; font-size: 15px; }
            
            /* Telegram Floating Button CSS */
            .tg-float { position: fixed; bottom: 80px; right: 20px; background: #0ea5e9; color: white; display: flex; align-items: center; padding: 8px 14px; border-radius: 30px; text-decoration: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); z-index: 1001; font-size: 13px; font-weight: bold; gap: 6px; border: 2px solid #38bdf8; }
            .tg-float img, .tg-float span.icon { font-size: 20px; }
        </style>
    </head>
    <body>
        <div class="top-bar">
            <div class="logo">⭐ BK77</div>
            <div>UID: <b id="uidDisplay">${gameId}</b> | <span id="bal" style="color:#fbbf24;">0</span> ကျပ်</div>
        </div>

        <div class="container">
            <div class="banner-grid-top">
                <div class="banner-top">⚽ ကာသ</div>
                <div class="banner-top">👧 ကာစီနို</div>
                <div class="banner-top">🃏 ဖဲ</div>
            </div>
            
            <div class="banner-grid-sub">
                <a href="/fishing?id=${gameId}" class="banner-sub">🦈 ငါးဖမ်း</a>
                <div class="banner-sub pink">✈ ဂိမ်းများ</div>
            </div>

            <div class="section-title">📌 ဂိမ်းအသေးစားများ</div>
            
            <div class="game-grid">
                <a href="/mines?id=${gameId}" class="game-card">
                    <div style="font-size: 30px;">💣</div>
                    <div class="g-name">MINES</div>
                    <div class="g-sub">JILI</div>
                </a>
                <a href="/wingo?id=${gameId}" class="game-card">
                    <div style="font-size: 30px;">🎲</div>
                    <div class="g-name">Win Go</div>
                    <div class="g-sub">30s</div>
                </a>
                <a href="/crash?id=${gameId}" class="game-card">
                    <div style="font-size: 30px;">🚀</div>
                    <div class="g-name">AVIATOR</div>
                    <div class="g-sub">Crash</div>
                </a>
            </div>

            <button class="logout-btn" onclick="logout()">အကောင့်ထွက်မည် (Logout)</button>
        </div>

        <!-- Telegram Support Floating Button -->
        <a href="https://t.me/${MY_TELEGRAM_USER}" target="_blank" class="tg-float">
            <span class="icon">✈️</span>
            <span>အခက်အခဲရှိပါကဆက်သွယ်ရန်</span>
        </a>

        <div class="bottom-nav">
            <a href="/home?id=${gameId}" class="nav-item active"><div>🏠</div>ပင်မမျက်နှာပြင်</a>
            <a href="/deposit?id=${gameId}" class="nav-item"><div>📥</div>ငွေသွင်းရန်</a>
            <a href="/withdraw?id=${gameId}" class="nav-item"><div>📤</div>ငွေထုတ်ရန်</a>
            <a href="/history?id=${gameId}" class="nav-item"><div>📋</div>မှတ်တမ်းများ</a>
        </div>

        <script>
            let gameId = '${gameId}';
            function fetchBalance() {
                fetch('/api/balance?id=' + gameId)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('bal').innerText = data.balance.toLocaleString();
                });
            }
            fetchBalance();
            setInterval(fetchBalance, 3000);

            function logout() {
                localStorage.removeItem('gameId');
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
    `);
});

// 3. Deposit Page
app.get('/deposit', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deposit - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; padding: 15px; }
            .container { max-width: 400px; margin: auto; background: #1e293b; padding: 20px; border-radius: 10px; }
            .back-btn { display: inline-block; background: #3b82f6; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-dep { background: #10b981; color: #fff; cursor: pointer; font-weight: bold; }
            .kpay-box { background: #0f172a; border: 1px dashed #38bdf8; padding: 12px; border-radius: 8px; margin-bottom: 15px; font-size: 14px; text-align: left; }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/home?id=${gameId}" class="back-btn">⬅ ပင်မသို့</a>
            <h2 style="color: #10b981; margin-top: 0;">📥 ငွေသွင်းရန် (KPay)</h2>
            <div class="kpay-box">
                <p style="margin:4px 0;">📌 <b>KPay နံပါတ်:</b> 09678817131</p>
                <p style="margin:4px 0;">📌 <b>အမည်:</b> Myint Myint Than</p>
            </div>
            <input type="number" id="depAmount" placeholder="ငွေသွင်းမည့် ပမာဏ (ကျပ်)">
            <button class="btn-dep" onclick="requestDeposit('${gameId}')">ငွေသွင်းမည်</button>
            <a id="tgLink" style="display:none; background:#0ea5e9; color:white; text-align:center; padding:12px; border-radius:5px; margin-top:10px; text-decoration:none; font-weight:bold;" target="_blank">📲 Telegram သို့ စလစ်ပို့ရန်</a>
        </div>
        <script>
            function requestDeposit(id) {
                let amount = Number(document.getElementById('depAmount').value);
                if(!amount || amount < 3000) {
                    alert('အနည်းဆုံး 3,000 ကျပ်မှစ၍ သွင်းနိုင်ပါသည်။');
                    return;
                }
                fetch('/api/deposit-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount })
                }).then(res => res.json()).then(data => {
                    alert('တောင်းဆိုမှု အောင်မြင်ပါသည်။ Telegram ခလုတ်ကိုနှိပ်၍ စလစ်ပို့ပါ။');
                    let tgBtn = document.getElementById('tgLink');
                    tgBtn.href = data.tgUrl;
                    tgBtn.style.display = 'block';
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 4. Withdraw Page
app.get('/withdraw', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Withdraw - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; padding: 15px; }
            .container { max-width: 400px; margin: auto; background: #1e293b; padding: 20px; border-radius: 10px; }
            .back-btn { display: inline-block; background: #3b82f6; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-with { background: #f59e0b; color: #fff; cursor: pointer; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/home?id=${gameId}" class="back-btn">⬅ ပင်မသို့</a>
            <h2 style="color: #f59e0b; margin-top: 0;">📤 ငွေထုတ်ရန်</h2>
            <input type="number" id="withAmount" placeholder="ထုတ်မည့် ပမာဏ (ကျပ်)">
            <input type="text" id="withAcc" placeholder="KPay ဖုန်းနံပါတ် / အမည်">
            <button class="btn-with" onclick="requestWithdraw('${gameId}')">ငွေထုတ်မည်</button>
        </div>
        <script>
            function requestWithdraw(id) {
                let amount = Number(document.getElementById('withAmount').value);
                let acc = document.getElementById('withAcc').value;
                if(!amount || !acc) {
                    alert('အချက်အလက်များကို အပြည့်အစုံထည့်ပါ။');
                    return;
                }
                fetch('/api/withdraw-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount, account: acc })
                }).then(res => res.json()).then(data => {
                    alert(data.message);
                    if(data.success) window.location.href = '/home?id=' + id;
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 5. Balance API
app.get('/api/balance', (req, res) => {
    let gameId = req.query.id || '001';
    let db = loadDB();
    res.json({ balance: db.balances[gameId] || 0 });
});

// 6. History Page
app.get('/history', (req, res) => {
    const gameId = req.query.id || '001';
    let db = loadDB();
    
    let userBets = (db.history && db.history[gameId]) ? db.history[gameId] : [];
    let userDeps = db.requests.filter(r => r.gameId === gameId);
    let userWiths = db.withdraws.filter(w => w.gameId === gameId);

    let betRows = userBets.map(b => `<tr><td>${b.time}</td><td>${b.game}</td><td>${b.amount} ကျပ်</td><td>${b.result}</td></tr>`).join('');
    let depRows = userDeps.map(d => `<tr><td>ငွေသွင်း</td><td>${d.amount} ကျပ်</td><td><span style="color:${d.status==='Approved'?'green':'orange'}">${d.status}</span></td></tr>`).join('');
    let withRows = userWiths.map(w => `<tr><td>ငွေထုတ်</td><td>${w.amount} ကျပ်</td><td><span style="color:${w.status==='Approved'?'green':'orange'}">${w.status}</span></td></tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <title>History - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; padding: 15px; }
            .container { max-width: 450px; margin: auto; background: #1e293b; padding: 20px; border-radius: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { padding: 8px; border: 1px solid #334155; text-align: center; }
            th { background: #334155; color: #38bdf8; }
            .back-btn { display: inline-block; background: #3b82f6; color: white; padding: 8px 12px; border-radius: 5px; text-decoration: none; margin-bottom: 15px; font-weight: bold; font-size: 14px; }
            h3 { color: #f59e0b; border-bottom: 1px solid #334155; padding-bottom: 5px; margin-top: 25px; }
        </style>
    </head>
    <body>
        <div class="container">
            <a href="/home?id=${gameId}" class="back-btn">⬅ ပင်မသို့</a>
            <h2>📋 ကစားသမိုင်းနှင့် ငွေစာရင်းမှတ်တမ်းများ</h2>
            
            <h3>🎲 လောင်းကစားမှတ်တမ်း</h3>
            <table>
                <tr><th>အချိန်</th><th>ဂိမ်း</th><th>ပမာဏ</th><th>ရလဒ်</th></tr>
                ${betRows || '<tr><td colspan="4">မှတ်တမ်း မရှိသေးပါ။</td></tr>'}
            </table>

            <h3>💳 ငွေသွင်း/ထုတ် မှတ်တမ်း</h3>
            <table>
                <tr><th>အမျိုးအစား</th><th>ပမာဏ</th><th>အခြေအနေ</th></tr>
                ${depRows}
                ${withRows}
                ${(!userDeps.length && !userWiths.length) ? '<tr><td colspan="3">မှတ်တမ်း မရှိသေးပါ။</td></tr>' : ''}
            </table>
        </div>
    </body>
    </html>
    `);
});

// 7. JILI Mines Game Page
app.get('/mines', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>JILI Mines - ID: ${gameId}</title>
        <style>
            body { background-color: #0d1b2a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; margin: 0; }
            .card { background: #1b263b; padding: 15px; border-radius: 12px; max-width: 400px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }
            .top-info { display: flex; justify-content: space-between; align-items: center; background: #111827; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
            
            .mine-selector { display: flex; justify-content: space-between; align-items: center; background: #334155; padding: 8px 12px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
            .mine-selector select { background: #1e293b; color: #fff; border: 1px solid #64748b; padding: 5px 10px; border-radius: 5px; font-size: 14px; font-weight: bold; }

            .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin: 15px 0; }
            .tile { aspect-ratio: 1; background: #415a77; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; border: 1px solid #778da9; }
            .tile.revealed-coin { background: #fbbf24; }
            .tile.revealed-bomb { background: #ef4444; }

            input, button { width: 100%; padding: 12px; border-radius: 6px; border: none; font-size: 15px; font-weight: bold; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; margin-bottom: 8px; }
            .btn-start { background: #10b981; color: #fff; cursor: pointer; }
            .btn-cashout { background: #f59e0b; color: #fff; cursor: pointer; display: none; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <div class="top-info">
                <span>💰 လက်ကျန်: <b id="bal" style="color:#fbbf24;">0</b></span>
            </div>

            <div class="mine-selector">
                <span>💣 ဗုံးအရေအတွက်:</span>
                <select id="mineCountSelect">
                    <option value="3">3 လုံး</option>
                    <option value="4">4 လုံး</option>
                    <option value="5">5 လုံး</option>
                    <option value="6">6 လုံး</option>
                    <option value="7">7 လုံး</option>
                    <option value="8">8 လုံး</option>
                </select>
            </div>

            <div class="grid" id="mineGrid"></div>

            <p id="statusText" style="color: #38bdf8; font-weight: bold; margin: 5px 0;">ငွေလောင်းပြီး စတင်ပါ</p>

            <div id="betSection">
                <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
                <button class="btn-start" onclick="startMinesGame()">စတင်မည် (Start)</button>
            </div>
            <button class="btn-cashout" id="cashoutBtn" onclick="cashOutMines()">ငွေထုတ်မည် (Cash Out)</button>
        </div>

        <script>
            let gameId = '${gameId}';
            let gameActive = false;
            let currentBet = 0;
            let revealedCount = 0;

            function fetchBalance() {
                fetch('/api/balance?id=' + gameId).then(res => res.json()).then(data => {
                    document.getElementById('bal').innerText = data.balance.toLocaleString();
                });
            }
            fetchBalance();

            function renderGrid(interactive = false) {
                let grid = document.getElementById('mineGrid');
                grid.innerHTML = '';
                for(let i=0; i<25; i++) {
                    let div = document.createElement('div');
                    div.className = 'tile';
                    div.innerText = '🪙';
                    if(interactive) {
                        div.onclick = () => clickTile(i);
                    }
                    grid.appendChild(div);
                }
            }
            renderGrid(false);

            function startMinesGame() {
                let amount = Number(document.getElementById('betAmount').value);
                let mines = Number(document.getElementById('mineCountSelect').value);
                if(!amount || amount <= 0) {
                    alert('ငွေပမာဏ မှန်ကန်စွာ ထည့်ပါ။');
                    return;
                }
                fetch('/api/mines-start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: gameId, amount: amount, mines: mines })
                }).then(res => res.json()).then(data => {
                    if(data.success) {
                        gameActive = true;
                        currentBet = amount;
                        revealedCount = 0;
                        document.getElementById('betSection').style.display = 'none';
                        document.getElementById('mineCountSelect').disabled = true;
                        document.getElementById('cashoutBtn').style.display = 'block';
                        document.getElementById('statusText').innerText = '🪙 ရွှေပြားများကို နှိပ်ပါ (ဗုံးရှောင်ပါ)';
                        document.getElementById('statusText').style.color = '#38bdf8';
                        renderGrid(true);
                        fetchBalance();
                    } else {
                        alert(data.message);
                    }
                });
            }

            function clickTile(index) {
                if(!gameActive) return;
                fetch('/api/mines-click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: gameId, tileIndex: index })
                }).then(res => res.json()).then(data => {
                    let tiles = document.getElementsByClassName('tile');
                    if(data.isBomb) {
                        let allBombs = data.allBombs;
                        for(let i=0; i<25; i++) {
                            if(allBombs.includes(i)) {
                                tiles[i].innerText = '💣';
                                tiles[i].classList.add('revealed-bomb');
                            } else {
                                tiles[i].innerText = '🪙';
                                tiles[i].classList.add('revealed-coin');
                            }
                        }
                        document.getElementById('statusText').innerText = '💥 ဗုံးပေါက်သွားပါပြီ! ရှုံးနိမ့်သည်';
                        document.getElementById('statusText').style.color = '#ef4444';
                        endGameUI();
                    } else {
                        tiles[index].innerText = '⭐';
                        tiles[index].classList.add('revealed-coin');
                        revealedCount++;
                        if(data.winAmount) {
                            document.getElementById('statusText').innerText = 'ရရှိမည့်ငွေ: ' + data.winAmount.toLocaleString() + ' ကျပ် (' + data.multiplier + 'x)';
                        }
                    }
                });
            }

            function cashOutMines() {
                fetch('/api/mines-cashout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: gameId })
                }).then(res => res.json()).then(data => {
                    alert(data.message);
                    endGameUI();
                    fetchBalance();
                });
            }

            function endGameUI() {
                gameActive = false;
                document.getElementById('betSection').style.display = 'block';
                document.getElementById('mineCountSelect').disabled = false;
                document.getElementById('cashoutBtn').style.display = 'none';
            }
        </script>
    </body>
    </html>
    `);
});

// 8. Win Go Game Page
app.get('/wingo', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Win Go - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; }
            .card { background: #1e293b; padding: 15px; border-radius: 10px; max-width: 400px; margin: auto; }
            .balance { font-size: 20px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .timer { font-size: 28px; color: #ef4444; font-weight: bold; background: #334155; padding: 10px; border-radius: 5px; margin: 10px 0; }
            input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-bet { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
            .options { display: flex; gap: 8px; margin: 10px 0; }
            .options button { flex: 1; padding: 12px; font-weight: bold; color: white; cursor: pointer; border-radius: 6px; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <h2>🎲 Win Go 30s</h2>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">0</span> ကျပ်</div>
            <div class="timer" id="timer">00:30</div>
            <div class="options">
                <button style="background:#10b981;" onclick="selectBet('Big', this)">အကြီး (Big)</button>
                <button style="background:#f43f5e;" onclick="selectBet('Small', this)">အသေး (Small)</button>
            </div>
            <p>ရွေးချယ်ထားသည်: <b id="chosen" style="color:#f59e0b;">ဘာမှမရွေးရသေးပါ</b></p>
            <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
            <button class="btn-bet" onclick="placeWingoBet('${gameId}')">ငွေလောင်းမည်</button>
        </div>
        <script>
            let gameId = '${gameId}';
            let currentBet = '';
            let timeLeft = 30;

            function fetchBalance() {
                fetch('/api/balance?id=' + gameId).then(res => res.json()).then(data => {
                    document.getElementById('bal').innerText = data.balance;
                });
            }
            fetchBalance();

            function selectBet(type, btn) {
                currentBet = type;
                document.querySelectorAll('.options button').forEach(b => b.style.border = 'none');
                btn.style.border = '3px solid #f59e0b';
                document.getElementById('chosen').innerText = type;
            }

            setInterval(() => {
                timeLeft--;
                if(timeLeft <= 0) { timeLeft = 30; }
                document.getElementById('timer').innerText = '00:' + (timeLeft < 10 ? '0' + timeLeft : timeLeft);
            }, 1000);

            function placeWingoBet(id) {
                let amount = Number(document.getElementById('betAmount').value);
                if(!currentBet || !amount) { alert('အချက်အလက် မပြည့်စုံပါ။'); return; }
                fetch('/api/wingo-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, betType: currentBet, amount: amount })
                }).then(res => res.json()).then(data => {
                    alert(data.message || 'အောင်မြင်ပါသည်။');
                    fetchBalance();
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 9. Crash Game Page
app.get('/crash', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Aviator Crash - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; }
            .multiplier { font-size: 42px; color: #38bdf8; font-weight: bold; background: #334155; padding: 20px; border-radius: 8px; margin: 15px 0; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 5px; border: none; font-size: 16px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-bet { background: #10b981; color: #fff; cursor: pointer; font-weight: bold; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <h2>🚀 အာဗီเอေတာ (Crash)</h2>
            <div class="multiplier" id="mDisplay">1.00x</div>
            <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
            <button class="btn-bet" onclick="playCrash('${gameId}')">စတင်မည်</button>
        </div>
        <script>
            function playCrash(id) {
                let amount = Number(document.getElementById('betAmount').value);
                if(!amount) { alert('ငွေပမာဏထည့်ပါ။'); return; }
                fetch('/api/crash-play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount })
                }).then(res => res.json()).then(data => {
                    alert(data.message);
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 10. Fishing Game Page
app.get('/fishing', (req, res) => {
    const gameId = req.query.id || '001';
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Fishing Game - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; margin: 0; }
            .card { background: #1e293b; padding: 15px; border-radius: 12px; max-width: 420px; margin: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.6); }
            .top-info { display: flex; justify-content: space-between; align-items: center; background: #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
            
            .fish-screen { background: linear-gradient(180deg, #0284c7, #0369a1); height: 280px; border-radius: 8px; position: relative; overflow: hidden; margin-bottom: 15px; border: 2px solid #38bdf8; }
            
            .fish-item { position: absolute; cursor: pointer; font-size: 30px; user-select: none; transition: transform 0.2s; }
            .fish-item:active { transform: scale(1.3); }

            @keyframes swim1 {
                0% { left: -40px; top: 40px; }
                100% { left: 420px; top: 60px; }
            }
            @keyframes swim2 {
                0% { right: -40px; top: 120px; }
                100% { right: 420px; top: 100px; }
            }
            @keyframes swim3 {
                0% { left: -50px; bottom: 30px; }
                100% { left: 420px; bottom: 50px; }
            }

            .f1 { animation: swim1 7s linear infinite; }
            .f2 { animation: swim2 9s linear infinite; transform: scaleX(-1); }
            .f3 { animation: swim3 5s linear infinite; }

            .paytable { background: #0f172a; padding: 8px; border-radius: 6px; font-size: 12px; text-align: left; margin-bottom: 10px; color: #cbd5e1; }
            input, button { width: 100%; padding: 10px; border-radius: 6px; border: none; font-size: 14px; font-weight: bold; box-sizing: border-box; margin-bottom: 8px; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-shoot { background: #f59e0b; color: #fff; cursor: pointer; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; font-size: 13px; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <div class="top-info">
                <span>🦈 <b>JILI ငါးပစ်ဂိမ်း</b></span>
                <span>💰 <b id="bal" style="color:#fbbf24;">0</b></span>
            </div>

            <div class="fish-screen" id="fishScreen">
                <div class="fish-item f1" onclick="shoot('nemo', 2, '🐠 ရွှေငါးလေး (2x)')">🐠</div>
                <div class="fish-item f2" onclick="shoot('shark', 10, '🦈 မိကျောင်း (10x)')">🦈</div>
                <div class="fish-item f3" onclick="shoot('whale', 20, '🐳 ဝေလငါးကြီး (20x)')">🐳</div>
            </div>

            <div class="paytable">
                <b>📌 ငါးအမျိုးအစားနှင့် ဆုကြေးနှုန်းထားများ:</b><br>
                • 🐠 ရွှေငါး = 2x (ကျည် 100 × 2 = ၂၀၀ ကျပ်)<br>
                • 🦈 မိကျောင်း = 10x (ကျည် 100 × 10 = ၁,၀၀၀ ကျပ်)<br>
                • 🐳 ဝေလငါး = 20x (ကျည် 100 × 20 = ၂,၀၀၀ ကျပ်)
            </div>

            <input type="number" id="bulletCost" value="100" placeholder="ကျည်ဖိုး (ဥပမာ - 100 ကျပ်)">
            <p id="statusText" style="color: #38bdf8; font-weight: bold; margin: 5px 0; font-size: 13px;">ရေထဲက ငါးများကို နှိပ်၍ ပစ်ပါ</p>
        </div>

        <script>
            let gameId = '${gameId}';
            function fetchBalance() {
                fetch('/api/balance?id=' + gameId).then(res => res.json()).then(data => {
                    document.getElementById('bal').innerText = data.balance.toLocaleString();
                });
            }
            fetchBalance();

            function shoot(fishType, multiplier, fishName) {
                let cost = Number(document.getElementById('bulletCost').value);
                if(!cost || cost <= 0) {
                    alert('ကျည်ဖိုး မှန်ကန်စွာ ထည့်ပါ။');
                    return;
                }
                
                fetch('/api/fish-shoot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: gameId, cost: cost, multiplier: multiplier, fish: fishName })
                }).then(res => res.json()).then(data => {
                    if(data.success) {
                        document.getElementById('statusText').innerText = data.message;
                        document.getElementById('statusText').style.color = data.win > 0 ? '#10b981' : '#ef4444';
                        fetchBalance();
                    } else {
                        alert(data.message);
                    }
                });
            }
        </script>
    </body>
    </html>
    `);
});

// Mines Game Backend APIs
app.post('/api/mines-start', (req, res) => {
    const { gameId, amount, mines } = req.body;
    let db = loadDB();
    if((db.balances[gameId] || 0) < amount) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }
    db.balances[gameId] -= amount;

    let mineCount = Number(mines) || 3;
    if(mineCount < 3) mineCount = 3;
    if(mineCount > 8) mineCount = 8;

    let bombs = [];
    while(bombs.length < mineCount) {
        let r = Math.floor(Math.random() * 25);
        if(!bombs.includes(r)) bombs.push(r);
    }

    db.activeMines = db.activeMines || {};
    db.activeMines[gameId] = { bet: amount, minesCount: mineCount, bombs: bombs, hits: 0 };
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/mines-click', (req, res) => {
    const { gameId, tileIndex } = req.body;
    let db = loadDB();
    let session = db.activeMines ? db.activeMines[gameId] : null;
    if(!session) return res.json({ success: false, message: 'ဂိမ်းစတင်ခြင်း မရှိသေးပါ။' });

    if(session.bombs.includes(tileIndex)) {
        let allBombs = session.bombs;
        delete db.activeMines[gameId];
        saveDB(db);
        return res.json({ isBomb: true, allBombs: allBombs });
    } else {
        session.hits++;
        let multiplierStep = 1 + (session.minesCount * 0.08);
        let currentMultiplier = Number((Math.pow(multiplierStep, session.hits)).toFixed(2));
        let win = Math.floor(session.bet * currentMultiplier);
        saveDB(db);
        return res.json({ isBomb: false, winAmount: win, multiplier: currentMultiplier });
    }
});

app.post('/api/mines-cashout', (req, res) => {
    const { gameId } = req.body;
    let db = loadDB();
    let session = db.activeMines ? db.activeMines[gameId] : null;
    if(!session) return res.json({ success: false, message: 'ထုတ်ယူရန် မရှိပါ။' });

    let multiplierStep = 1 + (session.minesCount * 0.08);
    let currentMultiplier = Number((Math.pow(multiplierStep, session.hits)).toFixed(2));
    let winAmount = Math.floor(session.bet * currentMultiplier);

    db.balances[gameId] = (db.balances[gameId] || 0) + winAmount;
    
    db.history = db.history || {};
    db.history[gameId] = db.history[gameId] || [];
    db.history[gameId].unshift({
        time: new Date().toLocaleTimeString(),
        game: 'Mines JILI',
        amount: session.bet,
        result: `နိုင် (+${winAmount})`
    });

    delete db.activeMines[gameId];
    saveDB(db);
    res.json({ success: true, message: `ဂုဏ်ယူပါတယ်! ${winAmount.toLocaleString()} ကျပ် ထုတ်ယူပြီးပါပြီ။` });
});

// Fishing Game Backend API
app.post('/api/fish-shoot', (req, res) => {
    const { gameId, cost, multiplier, fish } = req.body;
    let db = loadDB();
    if((db.balances[gameId] || 0) < cost) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }
    db.balances[gameId] -= cost;

    let chance = Math.random();
    let isDead = false;
    
    if(multiplier === 2 && chance > 0.3) isDead = true;
    else if(multiplier === 10 && chance > 0.6) isDead = true;
    else if(multiplier === 20 && chance > 0.8) isDead = true;

    let winAmount = 0;
    if(isDead) {
        winAmount = cost * multiplier;
        db.balances[gameId] += winAmount;
    }

    db.history = db.history || {};
    db.history[gameId] = db.history[gameId] || [];
    db.history[gameId].unshift({
        time: new Date().toLocaleTimeString(),
        game: 'Fishing (' + fish + ')',
        amount: cost,
        result: isDead ? `ငါးသေ (+${winAmount})` : `လွဲချော် (-${cost})`
    });

    saveDB(db);

    if(isDead) {
        res.json({ success: true, win: winAmount, message: `🎯 ${fish} ကို ပစ်ချနိုင်ခဲ့ပါပြီ! ဆုငွေ +${winAmount.toLocaleString()} ကျပ် ရရှိသည်` });
    } else {
        res.json({ success: true, win: 0, message: `💥 ကျည်ထိသော်လည်း ${fish} ထွက်ပြေးသွားပါသည် (-${cost} ကျပ်)` });
    }
});

// General Game / Bet APIs
app.post('/api/wingo-bet', (req, res) => {
    const { gameId, amount, betType } = req.body;
    let db = loadDB();
    if((db.balances[gameId] || 0) < amount) return res.json({ message: 'ငွေမလုံလောက်ပါ။' });
    db.balances[gameId] -= amount;
    let isWin = Math.random() > 0.5;
    let winAmt = isWin ? amount * 2 : 0;
    if(isWin) db.balances[gameId] += winAmt;

    db.history = db.history || {};
    db.history[gameId] = db.history[gameId] || [];
    db.history[gameId].unshift({
        time: new Date().toLocaleTimeString(),
        game: 'Win Go 30s',
        amount: amount,
        result: isWin ? `နိုင် (+${winAmt})` : `ရှုံး (-${amount})`
    });
    saveDB(db);
    res.json({ message: isWin ? 'အနိုင်ရရှိပါပြီ!' : 'ရှုံးနိမ့်သွားပါပြီ။' });
});

app.post('/api/crash-play', (req, res) => {
    const { gameId, amount } = req.body;
    let db = loadDB();
    if((db.balances[gameId] || 0) < amount) return res.json({ message: 'ငွေမလုံလောက်ပါ။' });
    db.balances[gameId] -= amount;
    let mult = parseFloat((Math.random() * 2 + 1).toFixed(2));
    let isWin = Math.random() > 0.4;
    let winAmt = isWin ? Math.floor(amount * mult) : 0;
    if(isWin) db.balances[gameId] += winAmt;

    db.history = db.history || {};
    db.history[gameId] = db.history[gameId] || [];
    db.history[gameId].unshift({
        time: new Date().toLocaleTimeString(),
        game: 'Aviator Crash',
        amount: amount,
        result: isWin ? `နိုင် (${mult}x) [+${winAmt}]` : `ရှုံး (-${amount})`
    });
    saveDB(db);
    res.json({ message: isWin ? `${mult}x ဖြင့် ${winAmt} ကျပ် ရရှိသွားပါပြီ။` : 'ဖူဘောင်းပေါက်၍ ရှုံးနိမ့်သွားသည်။' });
});

// Deposit & Withdraw Request APIs
app.post('/api/deposit-request', (req, res) => {
    const { gameId, amount } = req.body;
    let db = loadDB();
    let reqId = Date.now();
    db.requests.push({ reqId, gameId, amount: Number(amount), status: 'Pending' });
    saveDB(db);
    let tgText = encodeURIComponent(`Game ID (${gameId}) အတွက် ငွေ ${amount} ကျပ် လွှဲထားပါတယ်။`);
    res.json({ success: true, tgUrl: `https://t.me/${MY_TELEGRAM_USER}?text=${tgText}` });
});

app.post('/api/withdraw-request', (req, res) => {
    const { gameId, amount, account } = req.body;
    let db = loadDB();
    let currentBal = db.balances[gameId] || 0;
    if(currentBal < amount) return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    db.balances[gameId] -= Number(amount);
    db.withdraws.push({ reqId: Date.now(), gameId, amount: Number(amount), account, status: 'Pending' });
    saveDB(db);
    res.json({ success: true, message: 'ငွေထုတ်တောင်းဆိုမှု အောင်မြင်ပါသည်။' });
});

// Admin Panel
app.get('/admin', (req, res) => {
    let db = loadDB();
    let reqRows = db.requests.map(item => `<tr><td>${item.gameId}</td><td>${item.amount}</td><td>${item.status}</td><td><button onclick="approveDep('${item.gameId}', ${item.amount}, ${item.reqId})">အတည်ပြု</button></td></tr>`).join('');
    let withRows = db.withdraws.map(item => `<tr><td>${item.gameId}</td><td>${item.amount}</td><td>${item.account}</td><td>${item.status}</td><td><button onclick="approveWith(${item.reqId})">အတည်ပြု</button></td></tr>`).join('');
    
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head><title>Admin Panel</title></head>
    <body style="background:#f1f5f9; font-family:sans-serif; padding:20px;">
        <h2>👑 BK77 Admin Panel - ငွေသွင်း/ထုတ်များ</h2>
        <h3>ငွေသွင်းတောင်းဆိုမှုများ</h3>
        <table border="1" style="width:100%; border-collapse:collapse; background:white;">
            <tr><th>ID</th><th>ပမာဏ</th><th>အခြေအနေ</th><th>လုပ်ဆောင်ချက်</th></tr>
            ${reqRows || '<tr><td colspan="4">မရှိပါ။</td></tr>'}
        </table>
        <h3>ငွေထုတ်တောင်းဆိုမှုများ</h3>
        <table border="1" style="width:100%; border-collapse:collapse; background:white;">
            <tr><th>ID</th><th>ပမာဏ</th><th>အကောင့်</th><th>အခြေအနေ</th><th>လုပ်ဆောင်ချက်</th></tr>
            ${withRows || '<tr><td colspan="5">မရှိပါ။</td></tr>'}
        </table>
        <script>
            function approveDep(gameId, amount, reqId) {
                fetch('/api/approve-dep', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({gameId, amount, reqId}) }).then(() => location.reload());
            }
            function approveWith(reqId) {
                fetch('/api/approve-with', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({reqId}) }).then(() => location.reload());
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/approve-dep', (req, res) => {
    const { gameId, amount, reqId } = req.body;
    let db = loadDB();
    db.balances[gameId] = (db.balances[gameId] || 0) + Number(amount);
    let r = db.requests.find(x => x.reqId === reqId);
    if(r) r.status = 'Approved';
    saveDB(db);
    res.json({ success: true });
});

app.post('/api/approve-with', (req, res) => {
    const { reqId } = req.body;
    let db = loadDB();
    let r = db.withdraws.find(x => x.reqId === reqId);
    if(r) r.status = 'Approved';
    saveDB(db);
    res.json({ success: true });
});

if(bot) { bot.launch().catch(err => console.log(err)); }

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

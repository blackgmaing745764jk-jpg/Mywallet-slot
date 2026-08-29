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
            if(!data.balances) data.balances = { "1006": 5000 };
            if(!data.requests) data.requests = [];
            if(!data.withdraws) data.withdraws = [];
            return data;
        } catch (e) {
            return { balances: { "1006": 5000 }, requests: [], withdraws: [] };
        }
    }
    return { balances: { "1006": 5000 }, requests: [], withdraws: [] };
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
        <title>Game Login</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 40px 20px; }
            .card { background: #1e293b; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            input, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: none; font-size: 16px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-login { background: #10b981; color: #fff; cursor: pointer; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>GAMING LOGIN</h2>
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

// 2. Dashboard / Home Page (Lobby with Both Games)
app.get('/home', (req, res) => {
    const gameId = req.query.id || '001';

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Game Lobby - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 15px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 22px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .game-btn-1 { background: #3b82f6; color: white; padding: 14px; margin: 10px 0; border-radius: 8px; display: block; text-decoration: none; font-size: 18px; font-weight: bold; }
            .game-btn-2 { background: #f43f5e; color: white; padding: 14px; margin: 10px 0; border-radius: 8px; display: block; text-decoration: none; font-size: 18px; font-weight: bold; }
            input, button { width: 100%; padding: 10px; margin: 6px 0; border-radius: 5px; border: none; font-size: 14px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-dep { background: #10b981; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-with { background: #f59e0b; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-tg { background: #0ea5e9; color: #fff; text-decoration: none; display: block; padding: 12px; margin-top: 10px; font-weight: bold; border-radius: 5px; text-align: center; }
            .logout { background: #ef4444; color: white; cursor: pointer; margin-top: 15px; }
            .kpay-box { background: #0f172a; border: 1px dashed #38bdf8; padding: 12px; border-radius: 8px; margin: 10px 0; text-align: left; font-size: 14px; }
            .warning-text { color: #f87171; font-size: 13px; margin-top: 8px; font-weight: bold; text-align: center; }
            .limit-info { font-size: 12px; color: #94a3b8; margin-bottom: 4px; text-align: left; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>🎮 Game Lobby</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">0</span> ကျပ်</div>
            
            <hr style="border:0.5px solid #334155; margin:12px 0;">
            <h3>ရွေးချယ်စရာ ဂိမ်းများ</h3>
            <a href="/wingo?id=${gameId}" class="game-btn-1">🎲 Win Go (30s) ဂိမ်း</a>
            <a href="/crash?id=${gameId}" class="game-btn-2">🚀 မိုးပျံဖူဘောင်း (Crash Game)</a>

            <hr style="border:0.5px solid #334155; margin:12px 0;">
            <h3>ငွေသွင်းရန် (KPay)</h3>
            <div class="kpay-box">
                <p style="margin:4px 0;">📌 <b>KPay အကောင့်နာမည်:</b> Myint Myint Than</p>
                <p style="margin:4px 0;">📌 <b>KPay ဖုန်းနံပါတ်:</b> 09678817131</p>
            </div>
            <div class="limit-info">ငွေသွင်းရန် (အနည်းဆုံး 3,000 - အများဆုံး 10,000,000)</div>
            <input type="number" id="depAmount" placeholder="ငွေသွင်းမည့် ပမာဏ (ကျပ်)">
            <button class="btn-dep" onclick="requestDeposit('${gameId}')">ငွေသွင်းမည်</button>
            
            <div class="warning-text">⚠️ ငွေလွဲမှားမိပါက တာဝန်မယူပါ၊ သေချာစစ်ဆေးပြီးမှ လွှဲပါ။</div>
            
            <a id="tgLink" class="btn-tg" style="display:none;" target="_blank">📲 ငွေလွှဲပြီးပါက စလစ်ပို့ရန် Telegram သို့ သွားရန်</a>

            <hr style="border:0.5px solid #334155; margin:12px 0;">
            <h3>ငွေထုတ်ရန်</h3>
            <div class="limit-info">ငွေထုတ်ရန် (အနည်းဆုံး 5,000 - အများဆုံး 10,000,000)</div>
            <input type="number" id="withAmount" placeholder="ထုတ်မည့် ပမာဏ (ကျပ်)">
            <input type="text" id="withAcc" placeholder="KPay နံပါတ်/အမည်">
            <button class="btn-with" onclick="requestWithdraw('${gameId}')">ငွေထုတ်မည်</button>

            <button class="logout" onclick="logout()">ထွက်မည် (Logout)</button>
        </div>
        <script>
            let gameId = '${gameId}';

            function fetchBalance() {
                fetch('/api/balance?id=' + gameId)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('bal').innerText = data.balance;
                });
            }
            fetchBalance();
            setInterval(fetchBalance, 3000);

            function requestDeposit(id) {
                let amount = Number(document.getElementById('depAmount').value);
                if(!amount || amount < 3000 || amount > 10000000) {
                    alert('ငွေသွင်းပမာဏသည် အနည်းဆုံး 3,000 မှ အများဆုံး 10,000,000 အတွင်းဖြစ်ရပါမည်။');
                    return;
                }
                fetch('/api/deposit-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount })
                })
                .then(res => res.json())
                .then(data => {
                    alert('ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။ အောက်ပါ Telegram ခလုတ်ကို နှိပ်ပြီး စလစ်ပုံ ပို့ပေးပါ။');
                    let tgBtn = document.getElementById('tgLink');
                    tgBtn.href = data.tgUrl;
                    tgBtn.style.display = 'block';
                });
            }

            function requestWithdraw(id) {
                let amount = Number(document.getElementById('withAmount').value);
                let acc = document.getElementById('withAcc').value;
                if(!amount || amount < 5000 || amount > 10000000 || !acc) {
                    alert('ငွေထုတ်ပမာဏသည် အနည်းဆုံး 5,000 မှ အများဆုံး 10,000,000 အတွင်းဖြစ်ရမည် ဖြစ်ပြီး အကောင့်အချက်အလက် လိုအပ်ပါသည်။');
                    return;
                }
                fetch('/api/withdraw-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount, account: acc })
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    if(data.success) {
                        fetchBalance();
                    }
                });
            }

            function logout() {
                localStorage.removeItem('gameId');
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
    `);
});

// 3. Balance API
app.get('/api/balance', (req, res) => {
    let gameId = req.query.id || '001';
    let db = loadDB();
    let balance = db.balances[gameId] || 0;
    res.json({ balance });
});

// 4. Win Go Game Page
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
            .card { background: #1e293b; padding: 15px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 20px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .timer { font-size: 28px; color: #ef4444; font-weight: bold; background: #334155; padding: 10px; border-radius: 5px; margin: 10px 0; }
            input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-bet { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
            .dimmed-btn { opacity: 0.4; pointer-events: none; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
            .options { display: flex; gap: 8px; margin: 10px 0; }
            .options button { flex: 1; padding: 12px; font-weight: bold; color: white; cursor: pointer; border-radius: 6px; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <h2>🎲 Win Go 30s</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">0</span> ကျပ်</div>
            <div class="timer" id="timer">00:30</div>
            <div class="options">
                <button style="background:#10b981;" onclick="selectBet('Big', this)">အကြီး (Big)</button>
                <button style="background:#f43f5e;" onclick="selectBet('Small', this)">အသေး (Small)</button>
            </div>
            <p>ရွေးချယ်ထားသည်: <b id="chosen" style="color:#f59e0b;">ဘာမှမရွေးရသေးပါ</b></p>
            <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
            <button class="btn-bet" id="betBtn" onclick="placeWingoBet('${gameId}')">ငွေလောင်းမည်</button>
        </div>
        <script>
            let gameId = '${gameId}';
            let currentBet = '';
            let timeLeft = 30;
            let canBet = true;
            let hasBet = false;

            function fetchBalance() {
                fetch('/api/balance?id=' + gameId).then(res => res.json()).then(data => {
                    document.getElementById('bal').innerText = data.balance;
                });
            }
            fetchBalance();

            function selectBet(type, btn) {
                if(!canBet || hasBet) return;
                currentBet = type;
                document.querySelectorAll('.options button').forEach(b => b.style.border = 'none');
                btn.style.border = '3px solid #f59e0b';
                document.getElementById('chosen').innerText = type;
            }

            setInterval(() => {
                timeLeft--;
                if(timeLeft <= 5 && timeLeft > 0) {
                    canBet = false;
                }
                if(timeLeft <= 0) {
                    if(hasBet) checkWingoResult();
                    timeLeft = 30;
                    canBet = true;
                    hasBet = false;
                    document.getElementById('betBtn').classList.remove('dimmed-btn');
                    document.getElementById('chosen').innerText = 'ဘာမှမရွေးရသေးပါ';
                    currentBet = '';
                    document.getElementById('betAmount').value = '';
                }
                document.getElementById('timer').innerText = '00:' + (timeLeft < 10 ? '0' + timeLeft : timeLeft);
            }, 1000);

            function placeWingoBet(id) {
                let amount = document.getElementById('betAmount').value;
                if(!canBet || !currentBet || !amount) {
                    alert('အချက်အလက် မပြည့်စုံပါ သို့မဟုတ် အချိန်ကုန်သွားပါပြီ။');
                    return;
                }
                fetch('/api/wingo-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, betType: currentBet, amount: Number(amount) })
                }).then(res => res.json()).then(data => {
                    if(data.success) {
                        hasBet = true;
                        document.getElementById('betBtn').classList.add('dimmed-btn');
                        alert('ငွေလောင်းပြီးပါပြီ။');
                        fetchBalance();
                    } else {
                        alert(data.message);
                    }
                });
            }

            function checkWingoResult() {
                fetch('/api/wingo-result?id=' + gameId).then(res => res.json()).then(data => {
                    alert(data.message);
                    fetchBalance();
                });
            }
        </script>
    </body>
    </html>
    `);
});

app.post('/api/wingo-bet', (req, res) => {
    const { gameId, betType, amount } = req.body;
    let db = loadDB();
    if((db.balances[gameId] || 0) < amount) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }
    db.balances[gameId] -= amount;
    if(!db.activeWingo) db.activeWingo = [];
    db.activeWingo = db.activeWingo.filter(b => b.gameId !== gameId);
    db.activeWingo.push({ gameId, betType, amount });
    saveDB(db);
    res.json({ success: true });
});

app.get('/api/wingo-result', (req, res) => {
    const gameId = req.query.id || '001';
    let db = loadDB();
    if(!db.activeWingo) db.activeWingo = [];
    let bet = db.activeWingo.find(b => b.gameId === gameId);
    if(!bet) return res.json({ message: 'လောင်းကြေး မရှိပါ။' });
    db.activeWingo = db.activeWingo.filter(b => b.gameId !== gameId);

    let result = Math.random() > 0.5 ? 'Big' : 'Small';
    let isWin = bet.betType === result;
    let currentBal = db.balances[gameId] || 0;
    if(isWin) currentBal += (bet.amount * 2);
    db.balances[gameId] = currentBal;
    saveDB(db);

    res.json({ message: isWin ? `ဂုဏ်ယူပါတယ်! ထွက်လာသည်မှာ (${result}) ဖြစ်၍ အနိုင်ရပါပြီ။` : `ကျရှုံးသွားပါပြီ။ ထွက်လာသည်မှာ (${result}) ဖြစ်သည်။`, newBalance: currentBal });
});

// 5. Crash Game Page (မိုးပျံဖူဘောင်း / Crash with Live Payout Amount)
app.get('/crash', (req, res) => {
    const gameId = req.query.id || '001';

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Balloon Crash - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 20px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .multiplier-display { font-size: 42px; color: #38bdf8; font-weight: bold; background: #334155; padding: 20px; border-radius: 8px; margin: 15px 0; }
            .payout-preview { font-size: 18px; color: #10b981; margin: 5px 0; font-weight: bold; min-height: 25px; }
            input, button { width: 100%; padding: 12px; margin: 8px 0; border-radius: 5px; border: none; font-size: 16px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-bet { background: #10b981; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-cashout { background: #f59e0b; color: #fff; cursor: pointer; font-weight: bold; display: none; }
            .crashed { color: #ef4444 !important; }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <h2>🚀 မိုးပျံဖူဘောင်း (Crash)</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">0</span> ကျပ်</div>
            
            <div class="multiplier-display" id="mDisplay">1.00x</div>
            <div class="payout-preview" id="payoutPreview">ရမည့်ငွေ: 0 ကျပ်</div>
            <p id="gameStatus" style="color: #38bdf8; font-weight: bold;">ငွေလောင်းပြီး စတင်ပါ</p>
            
            <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
            <button class="btn-bet" id="betBtn" onclick="placeCrashBet('${gameId}')">ငွေလောင်းမည် (Press)</button>
            <button class="btn-cashout" id="cashoutBtn" onclick="cashOut()">ငွေထုတ်မည် (Cash Out)</button>
        </div>

        <script>
            let gameId = '${gameId}';
            let currentMultiplier = 1.00;
            let gameInterval = null;
            let isPlaying = false;
            let activeBetAmount = 0;
            let crashPoint = 1.00;

            function fetchBalance() {
                fetch('/api/balance?id=' + gameId)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('bal').innerText = data.balance;
                });
            }
            fetchBalance();

            function placeCrashBet(id) {
                let amount = document.getElementById('betAmount').value;
                if(!amount || amount <= 0) {
                    alert('ကျေးဇူးပြု၍ ငွေပမာဏ မှန်ကန်စွာ ထည့်ပါ။');
                    return;
                }

                fetch('/api/crash-bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: Number(amount) })
                })
                .then(res => res.json())
                .then(data => {
                    if(data.success) {
                        activeBetAmount = Number(amount);
                        isPlaying = true;
                        document.getElementById('betBtn').style.display = 'none';
                        document.getElementById('cashoutBtn').style.display = 'block';
                        document.getElementById('betAmount').disabled = true;
                        
                        startFlight(data.crashAt);
                    } else {
                        alert(data.message);
                    }
                });
            }

            function startFlight(targetCrash) {
                crashPoint = targetCrash;
                currentMultiplier = 1.00;
                let mDisplay = document.getElementById('mDisplay');
                mDisplay.classList.remove('crashed');
                document.getElementById('gameStatus').innerText = '🎈 ဖူဘောင်း တက်နေပါပြီ...';
                document.getElementById('gameStatus').style.color = '#10b981';

                gameInterval = setInterval(() => {
                    currentMultiplier += 0.01;
                    mDisplay.innerText = currentMultiplier.toFixed(2) + 'x';
                    
                    let liveWin = Math.floor(activeBetAmount * currentMultiplier);
                    document.getElementById('payoutPreview').innerText = 'ရမည့်ငွေ: ' + liveWin.toLocaleString() + ' ကျပ်';

                    if(currentMultiplier >= crashPoint) {
                        clearInterval(gameInterval);
                        mDisplay.innerText = crashPoint.toFixed(2) + 'x (ပေါက်သွားပါပြီ!)';
                        mDisplay.classList.add('crashed');
                        document.getElementById('gameStatus').innerText = '💥 ဖူဘောင်း ပေါက်သွားပါပြီ! ရှုံးနိမ့်သွားသည်';
                        document.getElementById('gameStatus').style.color = '#ef4444';
                        document.getElementById('payoutPreview').innerText = 'ရမည့်ငွေ: 0 ကျပ်';
                        
                        resetGameUI();
                        if(isPlaying) {
                            isPlaying = false;
                            fetchBalance();
                        }
                    }
                }, 100);
            }

            function cashOut() {
                if(!isPlaying) return;
                clearInterval(gameInterval);
                
                fetch('/api/crash-cashout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: gameId, multiplier: currentMultiplier, amount: activeBetAmount })
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    isPlaying = false;
                    resetGameUI();
                    fetchBalance();
                    document.getElementById('payoutPreview').innerText = 'ရမည့်ငွေ: 0 ကျပ်';
                });
            }

            function resetGameUI() {
                document.getElementById('betBtn').style.display = 'block';
                document.getElementById('cashoutBtn').style.display = 'none';
                document.getElementById('betAmount').disabled = false;
            }
        </script>
    </body>
    </html>
    `);
});

// 6. Crash Bet API
app.post('/api/crash-bet', (req, res) => {
    const { gameId, amount } = req.body;
    let db = loadDB();
    let currentBal = db.balances[gameId] || 0;

    if (currentBal < amount) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }

    currentBal -= amount;
    db.balances[gameId] = currentBal;
    saveDB(db);

    let rand = Math.random();
    let crashAt;
    if (rand < 0.65) {
        crashAt = parseFloat((Math.random() * (1.5 - 1.0) + 1.0).toFixed(2));
    } else if (rand < 0.90) {
        crashAt = parseFloat((Math.random() * (2.2 - 1.51) + 1.51).toFixed(2));
    } else {
        crashAt = parseFloat((Math.random() * (5.0 - 2.21) + 2.21).toFixed(2));
    }

    res.json({ success: true, crashAt, newBalance: currentBal });
});

// 7. Crash Cashout API
app.post('/api/crash-cashout', (req, res) => {
    const { gameId, multiplier, amount } = req.body;
    let db = loadDB();
    let winAmount = Math.floor(amount * multiplier);
    let currentBal = (db.balances[gameId] || 0) + winAmount;

    db.balances[gameId] = currentBal;
    saveDB(db);

    res.json({ success: true, message: `ဂုဏ်ယူပါတယ်! ${multiplier.toFixed(2)}x မှာ အောင်မြင်စွာ ထုတ်နိုင်လို့ ${winAmount} ကျပ် ရရှိသွားပါပြီ။` });
});

// 8. Deposit Request
app.post('/api/deposit-request', (req, res) => {
    const { gameId, amount } = req.body;
    let numAmount = Number(amount);
    if(numAmount < 3000 || numAmount > 10000000) {
        return res.json({ success: false, message: 'ငွေသွင်းပမာဏ မမှန်ကန်ပါ။' });
    }
    let db = loadDB();
    const reqId = Date.now();
    db.requests.push({ reqId, gameId, amount: numAmount, status: 'Pending' });
    saveDB(db);

    if (bot && bot.telegram) {
        const adminMsg = `📥 **ငွေသွင်းတောင်းဆိုမှု အသစ်**\n\n🆔 Game ID: \`${gameId}\`\n💰 ပမာဏ: \`${numAmount} ကျပ်\``;
        bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' }).catch(err => console.log(err));
    }

    let tgText = encodeURIComponent(`မင်္ဂလာပါ Admin, Game ID (${gameId}) အတွက် ငွေ ${numAmount} ကျပ် လွှဲထားပါတယ်ခင်ဗျာ။ (စလစ်တင်ရန်)`);
    res.json({ success: true, tgUrl: `https://t.me/${MY_TELEGRAM_USER}?text=${tgText}` });
});

// 9. Withdraw Request
app.post('/api/withdraw-request', (req, res) => {
    const { gameId, amount, account } = req.body;
    let db = loadDB();
    let currentBal = db.balances[gameId] || 0;
    let withdrawAmt = Number(amount);

    if (withdrawAmt < 5000 || withdrawAmt > 10000000) {
        return res.json({ success: false, message: 'ငွေထုတ်ပမာဏသည် အနည်းဆုံး 5,000 မှ အများဆုံး 10,000,000 အတွင်းဖြစ်ရပါမည်။' });
    }

    if (currentBal < withdrawAmt) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }

    currentBal -= withdrawAmt;
    db.balances[gameId] = currentBal;
    db.withdraws.push({ reqId: Date.now(), gameId, amount: withdrawAmt, account, status: 'Pending' });
    saveDB(db);

    if (bot && bot.telegram) {
        const adminMsg = `📤 **ငွေထုတ်တောင်းဆိုမှု အသစ်**\n\n🆔 Game ID: \`${gameId}\`\n💰 ပမာဏ: \`${withdrawAmt} ကျပ်\`\n💳 အကောင့်: \`${account}\``;
        bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' }).catch(err => console.log(err));
    }

    res.json({ success: true, message: 'ငွေထုတ်တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin စစ်ဆေးပြီး ငွေလွှဲပေးပါမည်။', newBalance: currentBal });
});

// 10. Admin Panel
app.get('/admin', (req, res) => {
    let db = loadDB();
    let reqRows = '';
    let withRows = '';
    
    db.requests.forEach(item => {
        reqRows += `
        <tr>
            <td>${item.gameId}</td>
            <td>${item.amount} ကျပ်</td>
            <td><span style="color:orange; font-weight:bold;">${item.status}</span></td>
            <td>
                ${item.status === 'Pending' ? `<button onclick="approveDep('${item.gameId}', ${item.amount}, ${item.reqId})" style="background:green; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">ငွေဖြည့်ပေးမည်</button>` : '<span style="color:green; font-weight:bold;">ပြီးပြီ</span>'}
            </td>
        </tr>`;
    });

    db.withdraws.forEach(item => {
        withRows += `
        <tr>
            <td>${item.gameId}</td>
            <td>${item.amount} ကျပ်</td>
            <td>${item.account}</td>
            <td><span style="color:orange; font-weight:bold;">${item.status}</span></td>
            <td>
                ${item.status === 'Pending' ? `<button onclick="approveWith(${item.reqId})" style="background:blue; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">ထုတ်ပေးပြီး</button>` : '<span style="color:green; font-weight:bold;">ပြီးပြီ</span>'}
            </td>
        </tr>`;
    });

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <title>Admin Panel</title>
        <style>
            body { font-family: sans-serif; background: #f1f5f9; padding: 20px; }
            table { width: 100%; border-collapse: collapse; background: white; margin-top: 10px; margin-bottom: 30px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            th, td { padding: 12px; border: 1px solid #cbd5e1; text-align: center; }
            th { background: #334155; color: white; }
        </style>
    </head>
    <body>
        <h2>👑 Admin Panel (ငွေသွင်းတောင်းဆိုမှုများ)</h2>
        <table>
            <tr>
                <th>Game ID</th>
                <th>ပမာဏ</th>
                <th>အခြေအနေ</th>
                <th>လုပ်ဆောင်ချက်</th>
            </tr>
            ${reqRows || '<tr><td colspan="4">တောင်းဆိုမှု မရှိသေးပါ။</td></tr>'}
        </table>

        <h2>👑 Admin Panel (ငွေထုတ်တောင်းဆိုမှုများ)</h2>
        <table>
            <tr>
                <th>Game ID</th>
                <th>ပမာဏ</th>
                <th>အကောင့်</th>
                <th>အခြေအနေ</th>
                <th>လုပ်ဆောင်ချက်</th>
            </tr>
            ${withRows || '<tr><td colspan="5">တောင်းဆိုမှု မရှိသေးပါ။</td></tr>'}
        </table>

        <script>
            function approveDep(gameId, amount, reqId) {
                fetch('/api/approve-dep', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId, amount, reqId })
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    location.reload();
                });
            }

            function approveWith(reqId) {
                fetch('/api/approve-with', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reqId })
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    location.reload();
                });
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
    let reqObj = db.requests.find(r => r.reqId === reqId);
    if (reqObj) reqObj.status = 'Approved';
    saveDB(db);
    res.json({ message: `Game ID (${gameId}) သို့ ငွေ ${amount} ကျပ် ဖြည့်ပြီးပါပြီ။` });
});

app.post('/api/approve-with', (req, res) => {
    const { reqId } = req.body;
    let db = loadDB();
    let reqObj = db.withdraws.find(r => r.reqId === reqId);
    if (reqObj) reqObj.status = 'Approved';
    saveDB(db);
    res.json({ message: `ငွေထုတ်တောင်းဆိုမှုကို အတည်ပြုပြီးပါပြီ။` });
});

if (bot) {
    bot.launch().catch(err => console.log(err));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

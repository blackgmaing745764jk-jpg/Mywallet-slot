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
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) {
            return { balances: {}, requests: [], withdraws: [] };
        }
    }
    return { balances: {}, requests: [], withdraws: [] };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// 1. Login Page (Cookie/LocalStorage သုံးပြီး အမြဲဝင်စရာမလိုအောင် လုပ်ထားသည်)
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Win Go Login</title>
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
            // အရင်က ဝင်ထားခဲ့ရင် Home ကို တန်းပို့မည်
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

// 2. Dashboard / Home Page (ဂိမ်းအမျိုးအစားများ ရွေးရန် - နောက်ထပ် ဂိမ်းများ ထပ်ထည့်နိုင်သည်)
app.get('/home', (req, res) => {
    const gameId = req.query.id || '001';
    const db = loadDB();
    const balance = db.balances[gameId] || 0;

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Game Lobby - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 20px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 20px; color: #f59e0b; margin: 15px 0; font-weight: bold; }
            .game-btn { background: #3b82f6; color: white; padding: 15px; margin: 10px 0; border-radius: 8px; display: block; text-decoration: none; font-size: 18px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3); }
            .game-btn:hover { background: #2563eb; }
            .logout { background: #ef4444; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer; margin-top: 20px; width: 100%; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>🎮 Game Lobby</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span>${balance}</span> ကျပ်</div>
            
            <hr style="border:0.5px solid #334155; margin:15px 0;">
            <h3>ရွေးချယ်စရာ ဂိမ်းများ</h3>
            
            <!-- Win Go ဂိမ်းခေါင်းစဉ် (နှိပ်မှသာ ဝင်ရမည်) -->
            <a href="/play?id=${gameId}" class="game-btn">🎲 Win Go (30s)</a>
            
            <!-- နောက်ထပ် ဂိမ်းအသစ်များ ဤနေရာတွင် ထပ်ထည့်နိုင်ပါသည် -->
            <!-- <a href="/another-game?id=${gameId}" class="game-btn">🚀 Game 2</a> -->

            <button class="logout" onclick="logout()">ထွက်မည် (Logout)</button>
        </div>
        <script>
            function logout() {
                localStorage.removeItem('gameId');
                window.location.href = '/';
            }
        </script>
    </body>
    </html>
    `);
});

// 3. Win Go Game Page (စက္ကန့်ကုန်မှ ရလဒ်ထွက်ခြင်း၊ ကြီး/သေး ပါဝင်ခြင်း၊ ငွေသွင်း/ငွေထုတ် ပါဝင်ခြင်း)
app.get('/play', (req, res) => {
    const gameId = req.query.id || '001';
    const db = loadDB();
    const balance = db.balances[gameId] || 0;

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Win Go 30s - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; }
            .card { background: #1e293b; padding: 15px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 20px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .timer { font-size: 28px; color: #ef4444; font-weight: bold; background: #334155; padding: 10px; border-radius: 5px; margin: 10px 0; }
            input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-dep { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-with { background: #f59e0b; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-tg { background: #0ea5e9; color: #fff; text-decoration: none; display: block; padding: 10px; margin-top: 10px; border-radius: 5px; font-weight: bold; }
            .colors { display: flex; gap: 5px; margin: 10px 0; }
            .colors button { flex: 1; padding: 10px; font-weight: bold; color: white; cursor: pointer; }
            .green { background: #10b981; }
            .violet { background: #8b5cf6; }
            .red { background: #ef4444; }
            .big-small { display: flex; gap: 5px; margin: 10px 0; }
            .big-small button { flex: 1; padding: 10px; font-weight: bold; background: #64748b; color: white; cursor: pointer; }
            .nums { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin: 10px 0; }
            .nums button { background: #475569; color: white; padding: 10px; font-weight: bold; cursor: pointer; }
            .selected { border: 2px solid #f59e0b; transform: scale(1.05); }
            .back-link { display: inline-block; margin-bottom: 10px; color: #38bdf8; text-decoration: none; }
        </style>
    </head>
    <body>
        <div class="card">
            <a href="/home?id=${gameId}" class="back-link">⬅ Lobby သို့ ပြန်ရန်</a>
            <h2>Win Go (30 Seconds)</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">${balance}</span> ကျပ်</div>
            
            <div class="timer" id="timer">00:30</div>
            <p id="gameStatus" style="color: #38bdf8; font-weight: bold;">ငွေလောင်းရန် အချိန်ရှိသည်</p>
            
            <div class="colors">
                <button class="green" onclick="selectBet('Green', this)">စိမ်း</button>
                <button class="violet" onclick="selectBet('Violet', this)">ခရမ်း</button>
                <button class="red" onclick="selectBet('Red', this)">နီ</button>
            </div>

            <div class="big-small">
                <button onclick="selectBet('Big', this)">ကြီး (Big)</button>
                <button onclick="selectBet('Small', this)">သေး (Small)</button>
            </div>
            
            <div class="nums">
                <button onclick="selectBet('0', this)">0</button>
                <button onclick="selectBet('1', this)">1</button>
                <button onclick="selectBet('2', this)">2</button>
                <button onclick="selectBet('3', this)">3</button>
                <button onclick="selectBet('4', this)">4</button>
                <button onclick="selectBet('5', this)">5</button>
                <button onclick="selectBet('6', this)">6</button>
                <button onclick="selectBet('7', this)">7</button>
                <button onclick="selectBet('8', this)">8</button>
                <button onclick="selectBet('9', this)">9</button>
            </div>

            <p>ရွေးချယ်ထားသည်: <b id="chosen" style="color:#f59e0b;">ဘာမှမရွေးရသေးပါ</b></p>
            <input type="number" id="betAmount" placeholder="လောင်းမည့် ငွေပမာဏ">
            <button class="btn-dep" onclick="placeBet('${gameId}')" style="background:#10b981;">ငွေလောင်းမည်</button>

            <hr style="border:0.5px solid #334155; margin:15px 0;">
            <h3>ငွေသွင်းရန်</h3>
            <input type="number" id="depAmount" placeholder="ငွေသွင်းမည့် ပမာဏ (ကျပ်)">
            <button class="btn-dep" onclick="requestDeposit('${gameId}')">ငွေသွင်းမည်</button>
            <a id="tgLink" class="btn-tg" style="display:none;" target="_blank">📲 Telegram သို့ စလစ်ပုံပို့ရန်</a>

            <hr style="border:0.5px solid #334155; margin:15px 0;">
            <h3>ငွေထုတ်ရန်</h3>
            <input type="number" id="withAmount" placeholder="ထုတ်မည့် ပမာဏ (ကျပ်)">
            <input type="text" id="withAcc" placeholder="ငွေလက်ခံမည့် KPay နံပါတ်/အမည်">
            <button class="btn-with" onclick="requestWithdraw('${gameId}')">ငွေထုတ်မည်</button>
        </div>

        <script>
            let currentBetType = '';
            let gameId = '${gameId}';
            let timeLeft = 30;
            let canBet = true;

            function selectBet(type, btn) {
                if(!canBet) {
                    alert('ယခု အချိန်မရှိတော့ပါ၊ နောက်တစ်ကြိမ်ကို စောင့်ပါ။');
                    return;
                }
                currentBetType = type;
                document.querySelectorAll('.colors button, .big-small button, .nums button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('chosen').innerText = type;
            }

            // စက္ကန့်တိုင် ဂိမ်းစနစ် (၃၀ စက္ကန့်ပြည့်မှ ရလဒ်ထွက်မည်)
            setInterval(() => {
                timeLeft--;
                if(timeLeft <= 5 && timeLeft > 0) {
                    canBet = false;
                    document.getElementById('gameStatus').innerText = '🔒 ရလဒ် ထွက်တော့မည် (ပိတ်ထားသည်)';
                    document.getElementById('gameStatus').style.color = '#ef4444';
                }
                if(timeLeft <= 0) {
                    timeLeft = 30;
                    canBet = true;
                    document.getElementById('gameStatus').innerText = 'ငွေလောင်းရန် အချိန်ရှိသည်';
                    document.getElementById('gameStatus').style.color = '#38bdf8';
                }
                let sec = timeLeft < 10 ? '0' + timeLeft : timeLeft;
                document.getElementById('timer').innerText = '00:' + sec;
            }, 1000);

            function placeBet(id) {
                let amount = document.getElementById('betAmount').value;
                if(!canBet) {
                    alert('အချိန်ကုန်သွားပါပြီ၊ နောက်တစ်ကြိမ်မှ ထပ်လောင်းပါ။');
                    return;
                }
                if(!currentBetType) {
                    alert('ကျေးဇူးပြု၍ အရောင်၊ ကြီး/သေး သို့မဟုတ် နံပါတ်တစ်ခု ရွေးပါ။');
                    return;
                }
                if(!amount || amount <= 0) {
                    alert('ကျေးဇူးပြု၍ လောင်းမည့်ငွေ ပမာဏ ထည့်ပါ။');
                    return;
                }

                fetch('/api/bet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, betType: currentBetType, amount: Number(amount) })
                })
                .then(res => res.json())
                .then(data => {
                    alert(data.message);
                    if(data.success) {
                        document.getElementById('bal').innerText = data.newBalance;
                    }
                });
            }

            function requestDeposit(id) {
                let amount = document.getElementById('depAmount').value;
                if(!amount || amount <= 0) {
                    alert('ကျေးဇူးပြု၍ ငွေပမာဏ မှန်ကန်စွာ ထည့်ပါ။');
                    return;
                }

                fetch('/api/deposit-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameId: id, amount: amount })
                })
                .then(res => res.json())
                .then(data => {
                    alert('ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။ Telegram သို့ ဆက်သွားပါ။');
                    let tgBtn = document.getElementById('tgLink');
                    tgBtn.href = data.tgUrl;
                    tgBtn.style.display = 'block';
                });
            }

            function requestWithdraw(id) {
                let amount = document.getElementById('withAmount').value;
                let acc = document.getElementById('withAcc').value;
                if(!amount || amount <= 0 || !acc) {
                    alert('ကျေးဇူးပြု၍ ငွေပမာဏနှင့် အကောင့်အချက်အလက် အပြည့်အစုံ ထည့်ပါ။');
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
                        document.getElementById('bal').innerText = data.newBalance;
                    }
                });
            }
        </script>
    </body>
    </html>
    `);
});

// 4. Bet API (ကြီး/သေး၊ အရောင်၊ နံပါတ် မှန်ကန်မှု စစ်ဆေးခြင်း)
app.post('/api/bet', (req, res) => {
    const { gameId, betType, amount } = req.body;
    let db = loadDB();
    let currentBal = db.balances[gameId] || 0;

    if (currentBal < amount) {
        return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });
    }

    currentBal -= amount;

    const winningNum = Math.floor(Math.random() * 10);
    let winningColor = 'Red';
    if ([1, 3, 7, 9].includes(winningNum)) winningColor = 'Green';
    if ([0, 5].includes(winningNum)) winningColor = 'Violet';
    if ([2, 4, 6, 8].includes(winningNum)) winningColor = 'Red';

    let winningSize = winningNum >= 5 ? 'Big' : 'Small';

    let isWin = false;
    let winMultiplier = 2;

    if (betType === winningNum.toString() || betType === winningColor || betType === winningSize) {
        isWin = true;
        if (betType === winningNum.toString()) winMultiplier = 9; // နံပါတ်တည့်လျှင် ၉ ဆ
        currentBal += (amount * winMultiplier);
    }

    db.balances[gameId] = currentBal;
    saveDB(db);

    res.json({
        success: true,
        message: isWin ? `ဂုဏ်ယူပါတယ်! ထွက်လာသည့်အဖြေ (${winningNum} - ${winningColor} - ${winningSize}) ဖြစ်၍ အနိုင်ရရှိသွားပါပြီ။` : `ကျရှုံးသွားပါပြီ။ ထွက်လာသည့်အဖြေမှာ (${winningNum} - ${winningColor} - ${winningSize}) ဖြစ်ပါသည်။`,
        newBalance: currentBal
    });
});

// 5. Deposit Request (သင့် Telegram အကောင့် @Klvin_2010 သို့ တိုက်ရိုက်ရောက်စေရန်)
app.post('/api/deposit-request', (req, res) => {
    const { gameId, amount } = req.body;
    let db = loadDB();
    const reqId = Date.now();
    db.requests.push({ reqId, gameId, amount: Number(amount), status: 'Pending' });
    saveDB(db);

    if (bot && bot.telegram) {
        const adminMsg = `📥 **ငွေသွင်းတောင်းဆိုမှု အသစ်**\n\n🆔 Game ID: \`${gameId}\`\n💰 ပမာဏ: \`${amount} ကျပ်\``;
        bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' }).catch(err => console.log(err));
    }

    let tgText = encodeURIComponent(`မင်္ဂလာပါ Admin, Game ID (${gameId}) အတွက် ငွေ ${amount} ကျပ် လွှဲထားပါတယ်ခင်ဗျာ။ (စလစ်တင်ရန်)`);
    res.json({ tgUrl: `https://t.me/${MY_TELEGRAM_USER}?text=${tgText}` });
});

// 6. Withdraw Request API
app.post('/api/withdraw-request', (req, res) => {
    const { gameId, amount, account } = req.body;
    let db = loadDB();
    let currentBal = db.balances[gameId] || 0;
    let withdrawAmt = Number(amount);

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

// 7. Admin Panel (ငွေသွင်း/ငွေထုတ် စာရင်းများကို ဖြေရှင်းရန်)
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

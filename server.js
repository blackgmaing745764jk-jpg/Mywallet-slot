const { Telegraf } = require('telegraf');
const express = require('express');
const fs = require('fs');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || '7298659110';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = './database.json';

function loadDB() {
    if (fs.existsSync(DB_FILE)) {
        try {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
        } catch (e) {
            return { balances: {}, requests: [] };
        }
    }
    return { balances: {}, requests: [] };
}

function saveDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

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
            <h2>WIN GO LOGIN</h2>
            <p>သင့်ရဲ့ Game ID (သို့) နံပါတ်ကို ထည့်ပါ</p>
            <input type="text" id="gameIdInput" placeholder="ဥပမာ - 1006">
            <button class="btn-login" onclick="goToGame()">ဂိမ်းထဲသို့ ဝင်မည်</button>
        </div>
        <script>
            function goToGame() {
                let id = document.getElementById('gameIdInput').value.trim();
                if(!id) {
                    alert('ကျေးဇူးပြု၍ Game ID ထည့်ပါ။');
                    return;
                }
                window.location.href = '/play?id=' + encodeURIComponent(id);
            }
        </script>
    </body>
    </html>
    `);
});

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
        <title>Win Go Game - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 10px; }
            .card { background: #1e293b; padding: 15px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 20px; color: #f59e0b; margin: 10px 0; font-weight: bold; }
            .timer { font-size: 28px; color: #ef4444; font-weight: bold; background: #334155; padding: 10px; border-radius: 5px; margin: 10px 0; }
            input, button { width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; border: none; font-size: 15px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-dep { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-tg { background: #0ea5e9; color: #fff; text-decoration: none; display: block; padding: 10px; margin-top: 10px; border-radius: 5px; font-weight: bold; }
            .colors { display: flex; gap: 5px; margin: 10px 0; }
            .colors button { flex: 1; padding: 10px; font-weight: bold; color: white; cursor: pointer; }
            .green { background: #10b981; }
            .violet { background: #8b5cf6; }
            .red { background: #ef4444; }
            .nums { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin: 10px 0; }
            .nums button { background: #475569; color: white; padding: 10px; font-weight: bold; cursor: pointer; }
            .selected { border: 2px solid #f59e0b; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>Win Go (30 Seconds)</h2>
            <p>Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: <span id="bal">${balance}</span> ကျပ်</div>
            
            <div class="timer" id="timer">00:30</div>
            
            <div class="colors">
                <button class="green" onclick="selectBet('Green', this)">စိမ်း</button>
                <button class="violet" onclick="selectBet('Violet', this)">ခရမ်း</button>
                <button class="red" onclick="selectBet('Red', this)">နီ</button>
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
            
            <a id="tgLink" class="btn-tg" style="display:none;" target="_blank">📲 Telegram Bot သို့ သွားရန်</a>
        </div>

        <script>
            let currentBetType = '';
            let gameId = '${gameId}';

            function selectBet(type, btn) {
                currentBetType = type;
                document.querySelectorAll('.colors button, .nums button').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                document.getElementById('chosen').innerText = type;
            }

            let timeLeft = 30;
            setInterval(() => {
                timeLeft--;
                if(timeLeft < 0) timeLeft = 30;
                let sec = timeLeft < 10 ? '0' + timeLeft : timeLeft;
                document.getElementById('timer').innerText = '00:' + sec;
            }, 1000);

            function placeBet(id) {
                let amount = document.getElementById('betAmount').value;
                if(!currentBetType) {
                    alert('ကျေးဇူးပြု၍ အရောင် သို့မဟုတ် နံပါတ်တစ်ခု ရွေးပါ။');
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
                    alert('တောင်းဆိုမှု အောင်မြင်ပါသည်။ Telegram သို့ ဆက်သွားပါ။');
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

    let isWin = false;
    let winMultiplier = 2;

    if (betType === winningNum.toString() || betType === winningColor) {
        isWin = true;
        currentBal += (amount * winMultiplier);
    }

    db.balances[gameId] = currentBal;
    saveDB(db);

    res.json({
        success: true,
        message: isWin ? `ဂုဏ်ယူပါတယ်! ထွက်လာသည့်အဖြေ (${winningNum} - ${winningColor}) ဖြစ်၍ ${amount * winMultiplier} ကျပ် နိုင်သွားပါပြီ။` : `ကျရှုံးသွားပါပြီ။ ထွက်လာသည့်အဖြေမှာ (${winningNum} - ${winningColor}) ဖြစ်ပါသည်။`,
        newBalance: currentBal
    });
});

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

    res.json({ tgUrl: `https://t.me/hassbin_bot?start=dep_${gameId}_${amount}` });
});

app.get('/admin', (req, res) => {
    let db = loadDB();
    let rows = '';
    
    db.requests.forEach(item => {
        rows += `
        <tr>
            <td>${item.gameId}</td>
            <td>${item.amount} ကျပ်</td>
            <td><span style="color:orange; font-weight:bold;">${item.status}</span></td>
            <td>
                ${item.status === 'Pending' ? `<button onclick="approve('${item.gameId}', ${item.amount}, ${item.reqId})" style="background:green; color:white; padding:8px 15px; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">ငွေဖြည့်ပေးမည်</button>` : '<span style="color:green; font-weight:bold;">ပြီးပြီ</span>'}
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
            table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            th, td { padding: 12px; border: 1px solid #cbd5e1; text-align: center; }
            th { background: #334155; color: white; }
        </style>
    </head>
    <body>
        <h2>👑 Admin Panel (ငွေသွင်းစာရင်းများ)</h2>
        <table>
            <tr>
                <th>Game ID</th>
                <th>ပမာဏ</th>
                <th>အခြေအနေ</th>
                <th>လုပ်ဆောင်ချက်</th>
            </tr>
            ${rows || '<tr><td colspan="4">တောင်းဆိုမှု မရှိသေးပါ။</td></tr>'}
        </table>
        <script>
            function approve(gameId, amount, reqId) {
                fetch('/api/approve', {
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
        </script>
    </body>
    </html>
    `);
});

app.post('/api/approve', (req, res) => {
    const { gameId, amount, reqId } = req.body;
    let db = loadDB();
    
    db.balances[gameId] = (db.balances[gameId] || 0) + Number(amount);
    
    let reqObj = db.requests.find(r => r.reqId === reqId);
    if (reqObj) {
        reqObj.status = 'Approved';
    }
    
    saveDB(db);
    res.json({ message: `Game ID (${gameId}) သို့ ငွေ ${amount} ကျပ် ဖြည့်ပြီးပါပြီ။` });
});

if (bot) {
    bot.launch().catch(err => console.log(err));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const { Telegraf } = require('telegraf');
const express = require('express');

const bot = new Telegraf('8650589121:AAEm2mBzMJYpNG4FP5H-OH2bHEfkHioOGzs');
const ADMIN_CHAT_ID = '7298659110';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let pendingRequests = [];
let userBalances = {};

// ပင်မစာမျက်နှာ (သို့) /deposit-link ဝင်လျှင် ID ရိုက်ရမည့်နေရာသို့ ပို့ရန်
app.get('/', (req, res) => {
    res.redirect('/deposit-link');
});

app.get('/deposit-link', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - Game ID</title>
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
            <h2>GAME LOGIN</h2>
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

// ဂိမ်းကစားမည့် စာမျက်နှာ (/play)
app.get('/play', (req, res) => {
    const gameId = req.query.id || '001';
    const balance = userBalances[gameId] || 0;

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Win Go Casino - ID: ${gameId}</title>
        <style>
            body { background-color: #0f172a; color: #fff; font-family: sans-serif; text-align: center; padding: 20px; }
            .card { background: #1e293b; padding: 20px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .balance { font-size: 24px; color: #f59e0b; margin: 20px 0; font-weight: bold; }
            input, button { width: 100%; padding: 12px; margin: 10px 0; border-radius: 5px; border: none; font-size: 16px; box-sizing: border-box; }
            input { background: #334155; color: #fff; text-align: center; }
            .btn-dep { background: #3b82f6; color: #fff; cursor: pointer; font-weight: bold; }
            .btn-tg { background: #0ea5e9; color: #fff; text-decoration: none; display: block; padding: 12px; margin-top: 10px; border-radius: 5px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h2>GAME CENTER</h2>
            <p>သင့် Game ID: <b>${gameId}</b></p>
            <div class="balance">လက်ကျန်ငွေ: ${balance} ကျပ်</div>
            
            <h3>ငွေသွင်းရန်</h3>
            <input type="number" id="depAmount" placeholder="ငွေသွင်းမည့် ပမာဏ (ကျပ်)">
            <button class="btn-dep" onclick="requestDeposit('${gameId}')">ငွေသွင်းမည်</button>
            
            <a id="tgLink" class="btn-tg" style="display:none;" target="_blank">📲 Telegram Bot သို့ သွားရန်</a>
        </div>

        <script>
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

app.post('/api/deposit-request', (req, res) => {
    const { gameId, amount } = req.body;
    const reqId = Date.now();
    pendingRequests.push({ reqId, gameId, amount, status: 'Pending' });

    const adminMsg = `📥 **ငွေသွင်းတောင်းဆိုမှု အသစ်**\n\n🆔 Game ID: \`${gameId}\`\n💰 ပမာဏ: \`${amount} ကျပ်\``;
    bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, { parse_mode: 'Markdown' }).catch(err => console.log(err));

    res.json({ tgUrl: `https://t.me/hassbin_bot?start=dep_${gameId}_${amount}` });
});

app.get('/admin', (req, res) => {
    let rows = '';
    pendingRequests.forEach(item => {
        rows += `
        <tr>
            <td>${item.gameId}</td>
            <td>${item.amount} ကျပ်</td>
            <td><span style="color:orange;">${item.status}</span></td>
            <td>
                ${item.status === 'Pending' ? `<button onclick="approve('${item.gameId}', ${item.amount}, ${item.reqId})" style="background:green; color:white; padding:5px 10px; border:none; border-radius:3px; cursor:pointer;">ငွေဖြည့်ပေးမည်</button>` : 'ပြီးပြီ'}
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
            table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; }
            th, td { padding: 12px; border: 1px solid #cbd5e1; text-align: center; }
            th { background: #334155; color: white; }
        </style>
    </head>
    <body>
        <h2>👑 Admin Panel (ငွေသွင်းစာရင်းများ)</h2>
        <table>
            <tr>
                <th>Game ID ကိုယ်တိုင်</th>
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
    userBalances[gameId] = (userBalances[gameId] || 0) + Number(amount);
    let reqObj = pendingRequests.find(r => r.reqId === reqId);
    if (reqObj) reqObj.status = 'Approved';
    res.json({ message: `Game ID (${gameId}) သို့ ငွေ ${amount} ကျပ် ဖြည့်ပြီးပါပြီ။` });
});

bot.launch().catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

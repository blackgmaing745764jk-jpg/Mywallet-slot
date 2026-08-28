const express = require('express');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multi-User Database
let users = {
    "1001": { id: "1001", balance: 0 },
    "1002": { id: "1002", balance: 0 },
    "1003": { id: "1003", balance: 0 }
};
let transactions = [];
let withdrawRequests = [];

// (၁) ပင်မ စာမျက်နှာ - User ID ဖြင့် ဝင်ရောက်ရန်
app.get('/', (req, res) => {
    let userId = req.query.id || "1001";
    if(!users[userId]) {
        users[userId] = { id: userId, balance: 0 };
    }
    let user = users[userId];

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Win Go Casino</title>
        <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; margin: 0; padding: 15px; text-align: center; }
            .header { background: #1e293b; padding: 12px; border-radius: 10px; margin-bottom: 15px; display:flex; justify-content:space-between; align-items:center; }
            .id-badge { background: #334155; padding: 5px 12px; border-radius: 20px; font-size: 14px; color: #f59e0b; font-weight: bold; }
            .balance-card { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 15px; border-radius: 12px; margin-bottom: 20px; font-weight: bold; }
            .game-card { background: #1e293b; border: 2px solid #334155; border-radius: 15px; padding: 20px; text-decoration: none; color: white; display: flex; align-items: center; justify-content: space-between; max-width: 360px; margin: 0 auto; }
            .balls { display: flex; gap: 5px; }
            .ball { width: 25px; height: 25px; border-radius: 50%; display: inline-block; line-height: 25px; font-weight: bold; font-size: 12px; }
            .red { background: #ef4444; } .green { background: #22c55e; } .violet { background: #a855f7; } .yellow { background: #eab308; }
            .play-btn { background: #10b981; color: white; padding: 8px 15px; border-radius: 8px; font-weight: bold; }
            .action-btn { width: 48%; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; color: white; margin-top: 15px; }
            .dep-btn { background: #3b82f6; }
            .wd-btn { background: #ef4444; }
            .modal-box { background: #1e3a8a; padding: 15px; border-radius: 10px; margin: 15px auto; max-width: 360px; display: none; text-align: left; }
            input { padding: 8px; font-size: 15px; width: 90%; margin: 5px 0; border-radius: 5px; border: 1px solid #ccc; }
            .telegram-btn { display: block; background: #0284c7; color: white; padding: 10px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold; text-align: center; }
            .sub-btn { background: #22c55e; color: white; border: none; padding: 8px 15px; border-radius: 5px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h3 style="margin:0; color:#f59e0b;">🎰 GAME CENTER</h3>
            <div class="id-badge">ID: ${user.id}</div>
        </div>

        <div style="max-width:400px; margin:0 auto;">
            <div class="balance-card">
                <span style="font-size:14px; opacity:0.9;">လက်ကျန်ငွေ</span>
                <h2 style="margin:5px 0 0 0;"><span id="userBal">${user.balance}</span> ကျပ်</h2>
            </div>

            <a href="/wingo?id=${user.id}" class="game-card">
                <div style="text-align: left;">
                    <h3 style="margin: 0 0 8px 0; color: #f59e0b;">🎲 Wingo (အကြီး / အသေး)</h3>
                    <div class="balls">
                        <span class="ball red">1</span>
                        <span class="ball green">2</span>
                        <span class="ball violet">3</span>
                        <span class="ball yellow">4</span>
                    </div>
                </div>
                <span class="play-btn">စဆော့မည်</span>
            </a>

            <div style="display:flex; justify-content:space-between; max-width:390px; margin: 0 auto;">
                <button class="action-btn dep-btn" onclick="toggleBox('depositBox')">💳 ငွေသွင်းရန်</button>
                <button class="action-btn wd-btn" onclick="toggleBox('withdrawBox')">🏧 ငွေထုတ်ရန်</button>
            </div>

            <!-- ငွေသွင်းရန် Box -->
            <div id="depositBox" class="modal-box">
                <h3 style="text-align: center; margin-top:0;">KPay ဖြင့် ငွေသွင်းရန်</h3>
                <p>အောက်ပါ KPay အကောင့်သို့ ငွေလွှဲပါ -</p>
                <p>📞 <b>ဖုန်းနံပါတ်:</b> 0967881731</p>
                <p>👤 <b>အမည်:</b> Myint Myint Than</p>
                <hr style="border-color:#334155">
                <p style="font-size: 13px; text-align: center; color:#f59e0b;">⚠️ ငွေလွှဲပြေစာ ပို့သည့်အခါ မိမိ <b>User ID: ${user.id}</b> ကိုပါ တွဲဖက်ပြောပေးပါ။</p>
                <a href="https://t.me/Klvin_2010" target="_blank" class="telegram-btn">📲 Telegram သို့ Slip ပို့ရန်</a>
            </div>

            <!-- ငွေထုတ်ရန် Box -->
            <div id="withdrawBox" class="modal-box" style="background:#1e293b; border:1px solid #ef4444;">
                <h3 style="text-align: center; margin-top:0; color:#ef4444;">KPay ဖြင့် ငွေထုတ်ရန်</h3>
                <form id="wdForm">
                    <input type="hidden" name="userId" value="${user.id}">
                    <label>KPay ဖုန်းနံပါတ်:</label><br>
                    <input type="text" name="kpayNo" placeholder="09xxxxxxxxx" required><br>
                    <label>KPay အကောင့်အမည်:</label><br>
                    <input type="text" name="kpayName" placeholder="အမည်ရိုက်ထည့်ပါ" required><br>
                    <label>ထုတ်ယူမည့် ငွေပမာဏ:</label><br>
                    <input type="number" name="amount" min="1000" placeholder="အနည်းဆုံး ၁၀၀၀ ကျပ်" required><br>
                    <button type="button" class="sub-btn" onclick="submitWithdraw()">ငွေထုတ်ယူမည် တောင်းဆိုရန်</button>
                </form>
            </div>
        </div>

        <script>
            function toggleBox(id) {
                var box = document.getElementById(id);
                box.style.display = (box.style.display === 'block') ? 'none' : 'block';
            }
            function submitWithdraw() {
                let form = document.getElementById('wdForm');
                let formData = new FormData(form);
                let data = Object.fromEntries(formData);
                
                fetch('/withdraw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                })
                .then(r => r.json())
                .then(res => {
                    alert(res.message);
                    if(res.success) {
                        document.getElementById('userBal').innerText = res.balance;
                        toggleBox('withdrawBox');
                    }
                });
            }
        </script>
    </body>
    </html>
    `);
});

// (၂) Wingo Game စာမျက်နှာ
app.get('/wingo', (req, res) => {
    let userId = req.query.id || "1001";
    let user = users[userId] || { id: userId, balance: 0 };

    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Wingo Game</title>
        <style>
            body { font-family: Arial, sans-serif; background: #0f172a; color: #fff; margin: 0; padding: 15px; text-align: center; }
            .box { background: #1e293b; border: 1px solid #334155; padding: 20px; border-radius: 15px; max-width: 370px; margin: 0 auto; }
            .btn { color: #fff; padding: 12px 20px; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 5px; font-weight: bold; width: 42%; }
            .btn-big { background: #ef4444; }
            .btn-small { background: #3b82f6; }
            .back-btn { display: inline-block; background: #475569; color: white; padding: 8px 15px; text-decoration: none; border-radius: 6px; margin-bottom: 15px; font-size: 14px; }
            input { padding: 10px; font-size: 16px; width: 80%; margin: 15px 0; border-radius: 8px; text-align: center; border: 1px solid #475569; background: #0f172a; color: white; }
            .dice-display { font-size: 60px; font-weight: bold; height: 90px; line-height: 90px; background: #0f172a; border-radius: 12px; margin: 15px 0; border: 2px solid #f59e0b; color: #f59e0b; }
            .rolling { animation: shake 0.1s infinite; color: #ef4444; }
            @keyframes shake {
                0% { transform: translate(1px, 1px) rotate(0deg); }
                50% { transform: translate(-1px, -2px) rotate(-1deg); }
                100% { transform: translate(1px, 2px) rotate(1deg); }
            }
        </style>
    </head>
    <body>
        <div style="max-width:370px; margin:0 auto; text-align:left;">
            <a href="/?id=${user.id}" class="back-btn">⬅️ ပင်မစာမျက်နှာသို့</a>
        </div>

        <div class="box">
            <h2 style="color: #f59e0b; margin-top:0;">🎲 Wingo (ID: ${user.id})</h2>
            
            <div id="diceBox" class="dice-display">🎲</div>

            <h3>လက်ကျန်ငွေ: <span id="balance" style="color:#22c55e;">${user.balance}</span> ကျပ်</h3>
            <hr style="border-color:#334155;">
            
            <p>လောင်းကြေးပမာဏ ရိုက်ထည့်ပါ:</p>
            <input type="number" id="betAmount" value="500" min="100">
            
            <div>
                <button id="btnSmall" class="btn btn-small" onclick="play('small')">အသေး (1-3)</button>
                <button id="btnBig" class="btn btn-big" onclick="play('big')">အကြီး (4-6)</button>
            </div>
        </div>

        <script>
            function play(choice) {
                let amount = document.getElementById('betAmount').value;
                let diceBox = document.getElementById('diceBox');
                let btnSmall = document.getElementById('btnSmall');
                let btnBig = document.getElementById('btnBig');

                btnSmall.disabled = true;
                btnBig.disabled = true;

                diceBox.classList.add('rolling');
                let interval = setInterval(() => {
                    diceBox.innerText = Math.floor(Math.random() * 6) + 1;
                }, 80);

                fetch('/play', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: '${user.id}', choice: choice, amount: parseInt(amount) })
                })
                .then(r => r.json())
                .then(data => {
                    setTimeout(() => {
                        clearInterval(interval);
                        diceBox.classList.remove('rolling');
                        
                        btnSmall.disabled = false;
                        btnBig.disabled = false;

                        if(data.error) {
                            alert(data.error);
                            diceBox.innerText = "🎲";
                        } else {
                            diceBox.innerText = data.dice;
                            document.getElementById('balance').innerText = data.balance;
                            setTimeout(() => { alert(data.message); }, 200);
                        }
                    }, 2000);
                });
            }
        </script>
    </body>
    </html>
    `);
});

// (၃) Admin Page (User ID အလိုက် ငွေထည့်ရန်)
app.get('/admin', (req, res) => {
    let userListHTML = Object.values(users).map(u => 
        `<tr style="border-bottom:1px solid #ddd; text-align:center;">
            <td style="padding:8px;"><b>${u.id}</b></td>
            <td style="padding:8px; color:green;"><b>${u.balance}</b> ကျပ်</td>
        </tr>`
    ).join('');

    let wdHTML = withdrawRequests.map((w) => 
        `<div style="border-bottom:1px solid #ccc; padding: 8px 0;">
            <p style="margin:2px 0;">🆔 User ID: <b>${w.userId}</b> | 👤 <b>${w.name}</b> (${w.kpay})</p>
            <p style="margin:2px 0; color:red;">💰 ထုတ်ယူမည့်ပမာဏ: ${w.amount} ကျပ်</p>
            <small>${w.time}</small>
        </div>`
    ).join('');

    let historyHTML = transactions.map(t => 
        `<p style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin:5px 0;">[ID: ${t.userId}] ${t.time} <br> <b>${t.type}</b>: ${t.amount} ကျပ်</p>`
    ).join('');
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Panel</title>
        <style>
            body { font-family: Arial, sans-serif; background: #f4f4f9; padding: 15px; color: #333;}
            .box { border: 1px solid #ccc; padding: 15px; margin: 10px auto; max-width: 400px; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
            input, button { padding: 10px; margin: 5px 0; font-size: 16px; width: 100%; box-sizing: border-box;}
            button { background: #4caf50; color: white; border: none; cursor: pointer; border-radius: 5px;}
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        </style>
    </head>
    <body>
        <h2 style="text-align: center;">🛠 Admin Control Panel</h2>
        
        <div class="box">
            <h3>💳 User ID အလိုက် ငွေထည့်ပေးရန်</h3>
            <form action="/admin/add" method="POST">
                <label>User ID ရိုက်ထည့်ပါ:</label>
                <input type="text" name="userId" placeholder="ဥပမာ - 1001" required>
                <label>ထည့်ပေးမည့် ငွေပမာဏ:</label>
                <input type="number" name="amount" placeholder="ဥပမာ - 1000" required>
                <button type="submit">ငွေထည့်ပေးမည်</button>
            </form>
        </div>

        <div class="box">
            <h3>👥 လက်ရှိ ကစားသူများစာရင်း</h3>
            <table border="1">
                <tr style="background:#eee;">
                    <th>User ID</th>
                    <th>လက်ကျန်ငွေ</th>
                </tr>
                ${userListHTML}
            </table>
        </div>

        <div class="box" style="border-color:#ef4444;">
            <h3 style="color:#ef4444;">📥 ငွေထုတ်ယူရန် တောင်းဆိုချက်များ</h3>
            <div>${wdHTML || "<p>တောင်းဆိုချက် မရှိသေးပါ</p>"}</div>
        </div>

        <div class="box">
            <h3>ငွေသွင်း/ထုတ်/ကစားမှု မှတ်တမ်းများ</h3>
            <div style="max-height: 250px; overflow-y: auto;">
                ${historyHTML || "<p>မှတ်တမ်းမရှိသေးပါ</p>"}
            </div>
        </div>
    </body>
    </html>
    `);
});

app.post('/admin/add', (req, res) => {
    let { userId, amount } = req.body;
    amount = parseInt(amount);

    if(!users[userId]) {
        users[userId] = { id: userId, balance: 0 };
    }

    if(amount > 0) {
        users[userId].balance += amount;
        transactions.unshift({ 
            userId: userId,
            time: new Date().toLocaleTimeString(), 
            type: '✅ Admin မှ ငွေသွင်းပေးမှု', 
            amount: `+${amount}` 
        });
    }
    res.redirect('/admin');
});

// ငွေထုတ် Logic
app.post('/withdraw', (req, res) => {
    let { userId, kpayNo, kpayName, amount } = req.body;
    amount = parseInt(amount);
    let user = users[userId];

    if(!user) return res.json({ success: false, message: 'User ရှာမတွေ့ပါ။' });
    if(!amount || amount < 1000) return res.json({ success: false, message: 'အနည်းဆုံး ၁၀၀၀ ကျပ်မှ စထုတ်နိုင်ပါသည်။' });
    if(user.balance < amount) return res.json({ success: false, message: 'လက်ကျန်ငွေ မလုံလောက်ပါ။' });

    user.balance -= amount;
    withdrawRequests.unshift({
        userId: userId,
        name: kpayName,
        kpay: kpayNo,
        amount: amount,
        time: new Date().toLocaleTimeString()
    });

    transactions.unshift({
        userId: userId,
        time: new Date().toLocaleTimeString(),
        type: `🏧 KPay ငွေထုတ်ယူမှု (${kpayName} - ${kpayNo})`,
        amount: `-${amount}`
    });

    res.json({ success: true, message: 'ငွေထုတ်ယူရန် တောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin မှ စစ်ဆေးပြီး KPay သို့ ငွေလွှဲပေးပါမည်။', balance: user.balance });
});

// Game Play Logic
app.post('/play', (req, res) => {
    let { userId, choice, amount } = req.body;
    let user = users[userId];

    if(!user) return res.json({ error: 'User ရှာမတွေ့ပါ။' });
    if(!amount || amount < 100) return res.json({ error: 'အနည်းဆုံး ၁၀၀ ကျပ် လောင်းရပါမည်။' });
    if(user.balance < amount) return res.json({ error: 'လက်ကျန်ငွေ မလုံလောက်ပါ။ KPay ဖြင့် ငွေသွင်းပါ။' });
    
    user.balance -= amount;
    
    let dice = Math.floor(Math.random() * 6) + 1;
    let result = (dice >= 4) ? 'big' : 'small';
    let resultText = (result === 'big') ? 'အကြီး (Big)' : 'အသေး (Small)';
    
    if(choice === result) {
        let winAmount = amount * 2;
        user.balance += winAmount;
        transactions.unshift({ 
            userId: userId,
            time: new Date().toLocaleTimeString(), 
            type: `🎉 Wingo နိုင်ပါသည် (ဂဏန်း: ${dice} - ${resultText})`, 
            amount: `+${amount}` 
        });
        res.json({ dice: dice, message: `🎲 ထွက်ဂဏန်း: [ ${dice} ] (${resultText})\n🎉 မှန်ပါတယ်! ကျပ် ${winAmount} နိုင်ပါတယ်။`, balance: user.balance });
    } else {
        transactions.unshift({ 
            userId: userId,
            time: new Date().toLocaleTimeString(), 
            type: `❌ Wingo ရှုံးပါသည် (ဂဏန်း: ${dice} - ${resultText})`, 
            amount: `-${amount}` 
        });
        res.json({ dice: dice, message: `🎲 ထွက်ဂဏန်း: [ ${dice} ] (${resultText})\n😢 မှားသွားပါတယ်။ ကျပ် ${amount} ရှုံးပါတယ်။`, balance: user.balance });
    }
});

app.listen(3000, () => console.log('✅ Server Running on port 3000...'));

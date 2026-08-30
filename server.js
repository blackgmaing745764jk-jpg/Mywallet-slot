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

        .modal-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7);
            z-index: 200;
            justify-content: center;
            align-items: center;
        }
        .modal-content {
            background: #1f2937;
            padding: 20px;
            border-radius: 12px;
            width: 85%;
            max-width: 350px;
            border: 1px solid #374151;
        }
        .modal-content h3 { color: #fbbf24; margin-top: 0; }
        .modal-content input {
            width: 100%; padding: 10px; margin: 10px 0;
            background: #111827; border: 1px solid #4b5563; color: white; border-radius: 6px; box-sizing: border-box;
        }
        .modal-btns { display: flex; gap: 10px; margin-top: 10px; }
        .modal-btns button { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }

        .game-screen-overlay {
            display: none;
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
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
        <div class="header">
            <div class="logo-title">⭐ BK77</div>
            <div class="user-info">UID: <b id="uidText">2067</b> | <span id="userBalance">1000</span> ကျပ်</div>
        </div>

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
                    <span style="font-size: 24px;">🚀</span>
                    <h4>GO CRUSH</h4>
                    <span>Crash</span>
                </div>
            </div>

            <button class="logout-btn" onclick="alert('အကောင့်ထွက်ပြီးပါပြီ')">အကောင့်ထွက်မည် (Logout)</button>
            
            <a href="https://t.me/Klvin_201" target="_blank" class="support-banner">
                အကူအညီရှိပါက ဆက်သွယ်ရန်
            </a>
        </div>

        <div class="bottom-nav">
            <button class="nav-item active">
                <span style="font-size: 18px;">🏠</span> ပင်မ
            </button>
            <button class="nav-item" onclick="openModal('depositModal')">
                <span style="font-size: 18px;">📥</span> ငွေသွင်း
            </button>
            <button class="nav-item" onclick="openModal('withdrawModal')">
                <span style="font-size: 18px;">📤</span> ငွေထုတ်
            </button>
            <button class="nav-item" onclick="alert('မှတ်တမ်းများကို Telegram တွင် စစ်ဆေးပါ။')">
                <span style="font-size: 18px;">📋</span> မှတ်တမ်း
            </button>
        </div>
    </div>

    <!-- Deposit Modal (KPay) -->
    <div class="modal-overlay" id="depositModal">
        <div class="modal-content">
            <h3>📥 KPay ဖြင့် ငွေသွင်းရန်</h3>
            <div style="background: #111827; padding: 10px; border-radius: 8px; margin-bottom: 10px; font-size: 13px; border: 1px dashed #fbbf24;">
                <p style="margin: 0; color: #fbbf24; font-weight: bold;">KBZPay Account:</p>
                <p style="margin: 5px 0 0 0; color: #fff;">09-XXXXXXXXX (U Kyaw)</p>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 5px;">အနည်းဆုံး 1,000 Ks - အများဆုံး 5,000,000 Ks</p>
            <input type="number" id="depAmount" placeholder="သွင်းမည့် ပမာဏ (ကျပ်)">
            <input type="text" id="depRef" placeholder="ငွေလွှဲစလစ် (သို့) နောက်ဆုံး ၆ လုံး">
            <div class="modal-btns">
                <button style="background:#374151; color:white;" onclick="closeModal('depositModal')">ပိတ်မည်</button>
                <button style="background:#10b981; color:white;" onclick="submitDeposit()">ငွေသွင်းမည်</button>
            </div>
        </div>
    </div>

    <!-- Withdraw Modal (KPay) -->
    <div class="modal-overlay" id="withdrawModal">
        <div class="modal-content">
            <h3>📤 KPay ဖြင့် ငွေထုတ်ရန်</h3>
            <p style="font-size: 12px; color: #9ca3af; margin-bottom: 5px;">အနည်းဆုံး 3,000 Ks - အများဆုံး 3,000,000 Ks</p>
            <input type="number" id="wdAmount" placeholder="ထုတ်မည့် ပမာဏ (ကျပ်)">
            <input type="text" id="wdAccount" placeholder="KPay ဖုန်းနံပါတ်">
            <input type="text" id="wdName" placeholder="KPay အကောင့်ပိုင်ရှင် အမည်">
            <div class="modal-btns">
                <button style="background:#374151; color:white;" onclick="closeModal('withdrawModal')">ပိတ်မည်</button>
                <button style="background:#f59e0b; color:white;" onclick="submitWithdraw()">ငွေထုတ်မည်</button>
            </div>
        </div>
    </div>

    <div class="game-screen-overlay" id="gameScreenOverlay">
        <div class="game-header">
            <button class="back-lobby-btn" onclick="closeGame()">❮ ပင်မသို့</button>
            <div style="font-weight: bold; color: #fbbf24;" id="activeGameTitle">ဂိမ်း</div>
        </div>
        <div class="game-body" id="activeGameContent"></div>
    </div>

    <script>
        let balance = 1000;
        const uid = '2067';

        function fetchBalance() {
            fetch('/api/user/' + uid)
                .then(res => res.json())
                .then(data => {
                    if(data.balance !== undefined) {
                        balance = data.balance;
                        updateBalanceUI();
                    }
                });
        }
        fetchBalance();

        function updateBalanceUI() {
            document.getElementById('userBalance').innerText = balance;
            let gameBalEl = document.getElementById('gameBal');
            if(gameBalEl) gameBalEl.innerText = balance;
        }

        function openModal(id) { document.getElementById(id).style.display = 'flex'; }
        function closeModal(id) { document.getElementById(id).style.display = 'none'; }

        function submitDeposit() {
            let amt = Number(document.getElementById('depAmount').value);
            let ref = document.getElementById('depRef').value;
            if(!amt || !ref || amt < 1000 || amt > 5000000) { 
                alert('အချက်အလက်အပြည့်အစုံ ဖြည့်ပါ (အနည်းဆုံး 1,000 Ks)'); 
                return; 
            }
            fetch('/api/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid, amount: amt })
            }).then(res => res.json()).then(data => {
                alert(data.message);
                closeModal('depositModal');
                if(data.newBalance !== undefined) {
                    balance = data.newBalance;
                    updateBalanceUI();
                }
            });
        }

        function submitWithdraw() {
            let amt = Number(document.getElementById('wdAmount').value);
            let acc = document.getElementById('wdAccount').value;
            let name = document.getElementById('wdName').value;
            if(!amt || !acc || !name) { alert('အချက်အလက် အပြည့်အစုံ ဖြည့်ပါ'); return; }
            if(amt < 3000 || amt > 3000000) {
                alert('ငွေထုတ်ပမာဏသည် အနည်းဆုံး 3,000 Ks ဖြစ်ရပါမည်။');
                return;
            }
            fetch('/api/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: uid, amount: amt, account: acc })
            }).then(res => res.json()).then(data => {
                alert(data.message);
                closeModal('withdrawModal');
                if(data.newBalance !== undefined) {
                    balance = data.newBalance;
                    updateBalanceUI();
                }
            });
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
                content.innerHTML = `
                    <div style="font-size: 55px; margin-bottom: 20px; cursor: pointer;" onclick="playFish()">🐟</div>
                    <p style="color: #9ca3af; font-size: 14px;">ငါးကိုနှိပ်၍ ပစ်ခတ်ပါ (ကျည်ဖိုး 10 ကျပ်)</p>
                    <div style="margin-top: 25px; color: #fbbf24; font-weight: bold; font-size: 16px;">လက်ကျန်ငွေ: <span id="gameBal">${balance}</span> ကျပ်</div>
                `;
            } else if (type === 'mines') {
                title.innerText = '💣 MINES (JILI)';
                content.innerHTML = `
                    <div style="margin-bottom: 10px; font-size: 13px; color: #9ca3af;">
                        ဗုံးအရေအတွက် ရွေးရန်: 
                        <select id="mineCount" style="background:#111827; color:#fbbf24; border:1px solid #4b5563; padding:4px 8px; border-radius:4px; font-weight:bold;">
                            <option value="3">၃ လုံး (လွယ်)</option>
                            <option value="5" selected>၅ လုံး (သာမန်)</option>
                            <option value="7">၇ လုံး (ခက်)</option>
                            <option value="9">၉ လုံး (အလွန်ခက်)</option>
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 15px; width: 100%; max-width: 320px;" id="mineGrid">
                        ` + Array(25).fill(0).map(() => `<button style="background:#1f2937; border:1px solid #374151; aspect-ratio:1; color:white; border-radius:8px; cursor:pointer; font-size:18px;" onclick="clickMine(this)">🪙</button>`).join('') + `
                    </div>
                    <p style="color: #9ca3af; font-size: 12px;">ဗုံးမထိအောင် ကျောက်တုံးကို ရွေးပါ (ကြေး 10 ကျပ်)</p>
                    <div style="margin-top: 10px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="gameBal">${balance}</span> ကျပ်</div>
                `;
            } else if (type === 'wingo') {
                title.innerText = '🎲 Win Go 30s';
                content.innerHTML = `
                    <div style="font-size: 18px; font-weight: bold; color: #38bdf8; margin-bottom: 15px;" id="wingoStatus">အချိန်စောင့်ဆိုင်းနေသည် (၃၀ စက္ကန့်)</div>
                    <div style="font-size: 32px; font-weight: bold; color: #fbbf24; margin-bottom: 15px;" id="wingoTimer">30</div>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;" id="wingoButtons">
                        <button style="background: #ef4444; color:white; border:none; padding:12px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="placeWingoBet('အနီ')">အနီ (Big/Red)</button>
                        <button style="background: #3b82f6; color:white; border:none; padding:12px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="placeWingoBet('အပြာ')">အပြာ (Small/Green)</button>
                    </div>
                    <p style="color: #9ca3af; font-size: 13px;" id="wingoBetInfo">လောင်းကြေး: 10 ကျပ်</p>
                    <div style="margin-top: 15px; color: #fbbf24; font-weight: bold;">လက်ကျန်ငွေ: <span id="gameBal">${balance}</span> ကျပ်</div>
                `;
                startWingoTimer();
            } else if (type === 'gocrush') {
                title.innerText = '🚀 GO CRUSH';
                content.innerHTML = `
                    <div style="font-size: 50px; margin-bottom: 5px;" id="aviatorPlane">🚀</div>
                    <div style="font-size: 35px; font-weight: bold; color: #ef4444; margin-bottom: 10px;" id="crushMultiplier">1.00x</div>
                    
                    <div style="width: 100%; max-width: 250px; margin-bottom: 8px; text-align: left;">
                        <label style="font-size: 11px; color: #9ca3af;">လောင်းမည့် ငွေပမာဏ (ကျပ်)</label>
                        <input type="number" id="crushBetInput" value="10" style="width: 100%; padding: 8px; margin-top: 3px; background: #111827; border: 1px solid #4b5563; color: white; border-radius: 6px; box-sizing: border-box; text-align: center; font-weight: bold;">
                    </div>

                    <button style="background: #10b981; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px; width: 100%; max-width: 250px; margin-bottom: 8px;" id="crushStartBtn" onclick="startCrush()">စတင်မည်</button>
                    <button style="display: none; background: #f59e0b; color:#111827; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:16px; width: 100%; max-width: 250px; margin-bottom: 8px;" id="crushCashoutBtn" onclick="cashoutCrush()">ငွေထုတ်မည် (Cashout)</button>

                    <div style="margin-top: 10px; color: #fbbf24; font-weight: bold; font-size: 14px;">လက်ကျန်ငွေ: <span id="gameBal">${balance}</span> ကျပ်</div>
                `;
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
            let mineCount = parseInt(document.getElementById('mineCount').value) || 5;
            balance -= 10;
            
            let bombChance = mineCount / 25; 
            if (Math.random() < bombChance) {
                btn.style.background = '#ef4444';
                btn.innerText = '💣';
                alert('ဗုံးပေါက်သွားပါပြီ! ရှုံးသွားပါပြီ။');
            } else {
                btn.style.background = '#10b981';
                btn.innerText = '💎';
                let reward = Math.floor(15 + (mineCount * 3));
                balance += reward;
                alert('💎 ရတနာတွေ့ပါပြီ! +' + reward + ' ကျပ်');
            }
            updateBalanceUI();
        }

        let wingoCountdown = 30;
        let wingoTimerInterval = null;
        let selectedWingoChoice = null;

        function startWingoTimer() {
            wingoCountdown = 30;
            selectedWingoChoice = null;
            let timerEl = document.getElementById('wingoTimer');
            let statusEl = document.getElementById('wingoStatus');
            
            if(statusEl) statusEl.innerText = 'အရောင်ခန့်မှန်းရန် ရွေးချယ်ပါ (အချိန်ရှိသေးသည်)';
            
            if(wingoTimerInterval) clearInterval(wingoTimerInterval);
            
            wingoTimerInterval = setInterval(() => {
                wingoCountdown--;
                if(timerEl) timerEl.innerText = wingoCountdown;
                
                if (wingoCountdown <= 0) {
                    clearInterval(wingoTimerInterval);
                    if(statusEl) statusEl.innerText = 'ရလဒ်ထွက်ပေါ်နေပါပြီ... ခဏစောင့်ပါ';
                    
                    setTimeout(() => {
                        let outcomes = ['အနီ', 'အပြာ'];
                        let res = outcomes[Math.floor(Math.random() * outcomes.length)];
                        if(statusEl) statusEl.innerText = 'ထွက်လာသောရလဒ်: ' + res;
                        
                        if (selectedWingoChoice) {
                            if (res === selectedWingoChoice) {
                                balance += 20;
                                alert('🎉 နိုင်ပါပြီ! +20 ကျပ် ရရှိသည်');
                            } else {
                                alert('ရှုံးပါပြီ၊ ထပ်ကြိုးစားပါ');
                            }
                            updateBalanceUI();
                        } else {
                            alert('အချိန်ကုန်သွားပါပြီ (မလောင်းလိုက်ရပါ)');
                        }
                        
                        setTimeout(startWingoTimer, 3000);
                    }, 1000);
                }
            }, 1000);
        }

        function placeWingoBet(choice) {
            if (wingoCountdown <= 3) { alert('အချိန်ကုန်ခါနီးပါပြီ၊ မလောင်းနိုင်တော့ပါ။'); return; }
            if (balance < 10) { alert('ငွေမလုံလောက်ပါ!'); return; }
            balance -= 10;
            selectedWingoChoice = choice;
            updateBalanceUI();
            alert(choice + ' ကို ၁၀ ကျပ်ဖြင့် လောင်းပြီးပါပြီ။ ရလဒ်ထွက်သည်အထိ စောင့်ပါ။');
        }

        let crushInterval;
        let currentMult = 1.00;
        let activeBetAmt = 10;
        let isCrashing = false;

        function startCrush() {
            activeBetAmt = Number(document.getElementById('crushBetInput').value);
            if (!activeBetAmt || activeBetAmt < 10) { alert('အနည်းဆုံး ၁၀ ကျပ်မှစ၍ လောင်းနိုင်ပါသည်။'); return; }
            if (balance < activeBetAmt) { alert('ငွေမလုံလောက်ပါ!'); return; }
            
            balance -= activeBetAmt;
            updateBalanceUI();
            currentMult = 1.00;
            isCrashing = false;

            document.getElementById('crushStartBtn').style.display = 'none';
            document.getElementById('crushCashoutBtn').style.display = 'block';
            document.getElementById('crushBetInput').disabled = true;

            let speedFactor = 0.02; 

            crushInterval = setInterval(() => {
                currentMult += speedFactor;
                let multEl = document.getElementById('crushMultiplier');
                let planeEl = document.getElementById('aviatorPlane');
                if(multEl) multEl.innerText = currentMult.toFixed(2) + 'x';
                
                if(planeEl) {
                    let randomTilt = Math.sin(currentMult * 4) * 6;
                    planeEl.style.transform = `translateY(-${(currentMult - 1) * 12}px) rotate(${randomTilt}deg)`;
                }
                
                // [အရှုံးများစေရန် ပြင်ဆင်ထားသည့် Random စနစ်]
                // စစချင်းအစောပိုင်း (1.00x - 1.25x) အကွာအဝေးမှာပင်လျှင် Crash ဖြစ်နိုင်ခြေ (အရှုံးများစေရန်) မြင့်မားထားသည်
                let crashProbability = 0.12 + (currentMult > 1.2 ? 0.08 : 0.0);
                if (Math.random() < crashProbability) {
                    clearInterval(crushInterval);
                    isCrashing = true;
                    if(planeEl) planeEl.innerText = '💥';
                    alert('🚀 ပျက်စီးသွားပါပြီ (Crushed)! ရှုံးသွားပါပြီ။');
                    resetCrushUI();
                }
            }, 180);
        }

        function cashoutCrush() {
            if (isCrashing) return;
            clearInterval(crushInterval);
            
            let winAmt = Math.floor(activeBetAmt * currentMult);
            balance += winAmt;
            updateBalanceUI();
            
            alert('🎉 အောင်မြင်စွာ ငွေထုတ်ယူပြီး: ' + winAmt + ' ကျပ် (' + currentMult.toFixed(2) + 'x)');
            resetCrushUI();
        }

        function resetCrushUI() {
            isCrashing = false;
            let planeEl = document.getElementById('aviatorPlane');
            if(planeEl) {
                planeEl.innerText = '🚀';
                planeEl.style.transform = 'none';
            }
            let startBtn = document.getElementById('crushStartBtn');
            let cashoutBtn = document.getElementById('crushCashoutBtn');
            let inputField = document.getElementById('crushBetInput');
            
            if(startBtn) startBtn.style.display = 'block';
            if(cashoutBtn) cashoutBtn.style.display = 'none';
            if(inputField) inputField.disabled = false;
        }
    </script>
</body>
</html>

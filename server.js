const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Database
let usersDB = {}; 
let transactionsDB = []; // Admin viewအတွက် ငွေသွင်း/ငွေထုတ် မှတ်တမ်းများ

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BK777 - Game Hub</title>
        <style>
            * { box-sizing: border-box; }
            body { margin: 0; background-color: #ffffff; color: #1f2937; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
            #loadingScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.5s ease; }
            .loader-logo { font-size: 40px; font-weight: bold; color: #f59e0b; margin-bottom: 20px; letter-spacing: 2px; }
            .spinner { width: 45px; height: 45px; border: 4px solid #f3f3f3; border-top: 4px solid #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            #authScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #ffffff; display: none; justify-content: center; align-items: center; z-index: 8888; }
            .auth-card { background: #ffffff; border: 1px solid #e2e8f0; padding: 25px; border-radius: 16px; width: 90%; max-width: 380px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); text-align: center; }
            .auth-tabs { display: flex; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; }
            .auth-tab { flex: 1; padding: 10px; cursor: pointer; font-weight: bold; color: #64748b; background: none; border: none; font-size: 14px; }
            .auth-tab.active { color: #f59e0b; border-bottom: 2px solid #f59e0b; margin-bottom: -2px; }
            .auth-form input { width: 100%; padding: 12px; margin: 8px 0; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #1e293b; }
            .auth-btn { width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 14px; }

            .app-container { position: relative; width: 100%; max-width: 480px; height: 100vh; background: #ffffff; box-shadow: 0 0 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: #ffffff; border-bottom: 1px solid #e2e8f0; }
            .logo-title { color: #f59e0b; font-weight: bold; font-size: 20px; }
            .user-info { color: #64748b; font-size: 13px; }
            .user-info span { color: #f59e0b; font-weight: bold; }

            .main-content { flex: 1; padding: 15px; overflow-y: auto; background: #ffffff; }
            .games-section-box { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 15px; }
            .section-title { font-size: 15px; color: #1e293b; margin-bottom: 12px; font-weight: bold; display: flex; align-items: center; gap: 6px; }

            .grid-games { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
            .game-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 12px 10px; text-align: center; cursor: pointer; transition: all 0.2s; }
            .game-box:active { transform: scale(0.97); background: #fef3c7; }
            .game-icon { font-size: 26px; margin-bottom: 4px; }
            .game-box h4 { margin: 4px 0 2px 0; color: #d97706; font-size: 13px; font-weight: bold; }
            .game-box span { font-size: 10px; color: #64748b; }

            .bottom-nav { display: flex; justify-content: space-around; background: #ffffff; border-top: 1px solid #e2e8f0; padding: 10px 0; }
            .nav-item { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 11px; cursor: pointer; background: none; border: none; text-decoration: none; }
            .nav-item.active { color: #f59e0b; }

            .modal-overlay, .game-screen-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); z-index: 200; justify-content: center; align-items: center; }
            .game-screen-overlay { background: #ffffff; flex-direction: column; padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 300; }
            .modal-content { background: #ffffff; padding: 20px; border-radius: 16px; width: 90%; max-width: 360px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            .modal-content h3 { color: #1e293b; margin-top: 0; font-size: 16px; }
            .modal-content input, .modal-content select { width: 100%; padding: 10px; margin: 8px 0; background: #f8fafc; border: 1px solid #cbd5e1; color: #1e293b; border-radius: 8px; box-sizing: border-box; font-size: 13px; }
            .modal-btns { display: flex; gap: 10px; margin-top: 10px; }
            .modal-btns button { flex: 1; padding: 10px; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }

            .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; max-width: 480px; }
            .back-lobby-btn { background: #ef4444; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
        </style>
    </head>
    <body>

        <!-- Loading Screen -->
        <div id="loadingScreen">
            <div class="loader-logo">⭐ BK777</div>
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: #64748b; font-size: 13px;">လော့တင်ဆွဲနေပါသည်...</p>
        </div>

        <!-- Auth Screen -->
        <div id="authScreen">
            <div class="auth-card">
                <div class="loader-logo" style="font-size: 28px; margin-bottom: 10px;">⭐ BK777</div>
                <div class="auth-tabs">
                    <button class="auth-tab active" id="tabLoginBtn" onclick="switchAuthTab('login')">အကောင့်ဝင်ရန်</button>
                    <button class="auth-tab" id="tabRegBtn" onclick="switchAuthTab('register')">အကောင့်အသစ်ဖွင့်ရန်</button>
                </div>
                
                <div id="loginForm" class="auth-form">
                    <input type="text" id="loginPhone" placeholder="ဖုန်းနံပါတ် (ဥပမာ - 09xxxxxxxxx)">
                    <input type="password" id="loginPass" placeholder="စကားဝှက်">
                    <button class="auth-btn" onclick="handleLogin()">ဝင်မည်</button>
                </div>

                <div id="registerForm" class="auth-form" style="display: none;">
                    <input type="text" id="regPhone" placeholder="ဖုန်းနံပါတ်">
                    <input type="password" id="regPass" placeholder="စကားဝှက် အသစ်">
                    <button class="auth-btn" style="background:#10b981;" onclick="handleRegister()">အကောင့်ဖွင့်မည်</button>
                </div>
            </div>
        </div>

        <!-- App Container -->
        <div class="app-container">
            <div class="header">
                <div class="logo-title">⭐ BK777</div>
                <div class="user-info">လက်ကျန်: <span id="userBalance">1000</span> Ks | UID: <b id="uidText">-</b></div>
            </div>

            <div class="main-content">
                <!-- VIP Banner -->
                <div class="games-section-box" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-color: #fde68a; cursor: pointer;" onclick="openModal('vipModal')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; color: #d97706; font-size: 15px;">👑 VIP အဆင့်နှင့် ဘောနပ်စ်များ</h4>
                            <p style="margin: 4px 0 0 0; color: #b45309; font-size: 12px;">သင့်အဆင့်: <b>VIP 1</b> | ကြည့်ရန်နှိပ်ပါ</p>
                        </div>
                        <span style="font-size: 22px;">👉</span>
                    </div>
                </div>

                <!-- Games Box (5 Games) -->
                <div class="games-section-box">
                    <div class="section-title">🎮 ဂိမ်းများ</div>
                    <div class="grid-games">
                        <div class="game-box" onclick="openGame('mines')">
                            <div class="game-icon">💣</div>
                            <h4>Mines</h4>
                            <span>ဗုံးရှောင်ဂိမ်း</span>
                        </div>
                        <div class="game-box" onclick="openGame('gocrush')">
                            <div class="game-icon">🚀</div>
                            <h4>Go Crush</h4>
                            <span>ဇတက်ဂိမ်း</span>
                        </div>
                        <div class="game-box" onclick="openGame('wingo')">
                            <div class="game-icon">🎲</div>
                            <h4>Win Go</h4>
                            <span>အရောင်/အချိန်</span>
                        </div>
                        <div class="game-box" onclick="openGame('dice')">
                            <div class="game-icon">🎯</div>
                            <h4>Dice</h4>
                            <span>အန်စာတုံး</span>
                        </div>
                        <div class="game-box" onclick="openGame('plinko')" style="grid-column: span 2;">
                            <div class="game-icon">🔴</div>
                            <h4>Plinko</h4>
                            <span>ဘောလုံးကျ အကွက်ဖောက်ဂိမ်း</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom Nav -->
            <div class="bottom-nav">
                <button class="nav-item active" onclick="switchNav('home')"><span style="font-size: 18px;">🏠</span> ပင်မ</button>
                <button class="nav-item" onclick="openModal('depositModal')"><span style="font-size: 18px;">📥</span> ငွေသွင်း</button>
                <button class="nav-item" onclick="openModal('withdrawModal')"><span style="font-size: 18px;">📤</span> ငွေထုတ်</button>
                <button class="nav-item" onclick="openModal('historyModal')"><span style="font-size: 18px;">📋</span> မှတ်တမ်း</button>
                <button class="nav-item" onclick="openModal('profileModal')"><span style="font-size: 18px;">👤</span> ပရိုဖိုင်</button>
            </div>
        </div>

        <!-- Modals -->
        <div class="modal-overlay" id="vipModal">
            <div class="modal-content">
                <h3>👑 VIP အဆင့်နှင့် ဘောနပ်စ် အစီအစဉ်</h3>
                <p style="font-size: 13px; color: #475569; line-height: 1.6;"><b>VIP 1:</b> နေ့စဉ်ငွေသွင်း ဘောနပ်စ် +5%</p>
                <button style="width:100%; padding:10px; background:#f59e0b; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="closeModal('vipModal')">ပိတ်မည်</button>
            </div>
        </div>

        <div class="modal-overlay" id="depositModal">
            <div class="modal-content">
                <h3>📥 ငွေသွင်းရန် (KBZPay)</h3>
                <p style="font-size: 12px; color: #059669; font-weight: bold;">💡 KBZPay အကောင့်: 09123456789 (နာမည် - BK777)</p>
                <input type="number" id="depAmount" placeholder="သွင်းမည့် ပမာဏ (ကျပ်)" oninput="calculateBonus()">
                <p style="font-size: 12px; color: #d97706; margin: 4px 0;">ရရှိမည့် စုစုပေါင်းငွေ (ဘောနပ်စ် 5% အပါ): <span id="totalDepPreview" style="font-weight:bold;">0</span> Ks</p>
                <input type="text" id="depRef" placeholder="စလစ် (သို့) ငွေလွှဲနံပါတ် နောက်ဆုံး ၆ လုံး">
                <div class="modal-btns">
                    <button style="background:#e2e8f0; color:#1e293b;" onclick="closeModal('depositModal')">ပိတ်မည်</button>
                    <button style="background:#10b981; color:white;" onclick="submitDeposit()">ငွေသွင်းမည်</button>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="withdrawModal">
            <div class="modal-content">
                <h3>📤 ငွေထုတ်ရန်</h3>
                <input type="number" id="wdAmount" placeholder="ထုတ်မည့် ပမာဏ (ကျပ်)">
                <input type="text" id="wdAccount" placeholder="KPay ဖုန်းနံပါတ်">
                <input type="password" id="wdPassword" placeholder="သင့် Login Password">
                <div class="modal-btns">
                    <button style="background:#e2e8f0; color:#1e293b;" onclick="closeModal('withdrawModal')">ပိတ်မည်</button>
                    <button style="background:#f59e0b; color:white;" onclick="submitWithdraw()">ငွေထုတ်မည်</button>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="profileModal">
            <div class="modal-content">
                <h3>👤 ပရိုဖိုင်</h3>
                <p style="font-size: 13px;">UID: <b id="pfUid" style="color:#f59e0b;">-</b></p>
                <p style="font-size: 13px;">ဖုန်းနံပါတ်: <b id="pfPhone">-</b></p>
                <input type="password" id="newPasswordInput" placeholder="စကားဝှက်အသစ်">
                <button style="width:100%; padding:10px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:5px;" onclick="changePassword()">စကားဝှက်ပြောင်းမည်</button>
                <button style="width:100%; padding:8px; background:#e2e8f0; color:#1e293b; border:none; border-radius:8px; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="closeModal('profileModal')">ပိတ်မည်</button>
            </div>
        </div>

        <div class="modal-overlay" id="historyModal">
            <div class="modal-content">
                <h3>📋 မှတ်တမ်းများ</h3>
                <div style="max-height: 180px; overflow-y: auto; font-size: 12px; color: #64748b; margin: 10px 0;" id="historyList">
                    <p>မှတ်တမ်းများ မရှိသေးပါ။</p>
                </div>
                <button style="width:100%; padding:8px; background:#e2e8f0; border:none; border-radius:8px; font-weight:bold;" onclick="closeModal('historyModal')">ပိတ်မည်</button>
            </div>
        </div>

        <!-- Game Screen -->
        <div class="game-screen-overlay" id="gameScreenOverlay">
            <div class="game-header">
                <button class="back-lobby-btn" onclick="closeGame()">❮ ထွက်မည်</button>
                <div style="font-weight: bold; color: #f59e0b;" id="activeGameTitle">ဂိမ်း</div>
                <div style="font-size: 12px; color: #64748b;">လက်ကျန်: <span id="gameBal" style="font-weight:bold; color:#1e293b;">1000</span> Ks</div>
            </div>
            <div id="activeGameContent" style="width: 100%; max-width: 480px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;"></div>
        </div>

        <script>
            let currentUser = null;
            let balance = 1000;
            let historyLogs = [];

            window.addEventListener('load', () => {
                setTimeout(() => {
                    document.getElementById('loadingScreen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('loadingScreen').style.display = 'none';
                        let sessionPhone = localStorage.getItem('bk777_session');
                        if(sessionPhone) {
                            fetch('/api/user?phone=' + sessionPhone)
                            .then(res => res.json())
                            .then(data => {
                                if(data.success) { currentUser = data.user; balance = currentUser.balance; initUserSession(); }
                                else { document.getElementById('authScreen').style.display = 'flex'; }
                            });
                        } else { document.getElementById('authScreen').style.display = 'flex'; }
                    }, 500);
                }, 1000);
            });

            function switchAuthTab(tab) {
                if(tab === 'login') {
                    document.getElementById('tabLoginBtn').classList.add('active');
                    document.getElementById('tabRegBtn').classList.remove('active');
                    document.getElementById('loginForm').style.display = 'block';
                    document.getElementById('registerForm').style.display = 'none';
                } else {
                    document.getElementById('tabRegBtn').classList.add('active');
                    document.getElementById('tabLoginBtn').classList.remove('active');
                    document.getElementById('registerForm').style.display = 'block';
                    document.getElementById('loginForm').style.display = 'none';
                }
            }

            function handleRegister() {
                let phone = document.getElementById('regPhone').value.trim();
                let pass = document.getElementById('regPass').value.trim();
                if(!phone || pass.length < 4) { alert('ဖုန်းနံပါတ် နှင့် စကားဝှက် အနည်းဆုံး ၄ လုံးဖြည့်ပါ။'); return; }
                fetch('/api/register', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone, pass})
                }).then(res => res.json()).then(data => {
                    if(data.success) { alert('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။'); switchAuthTab('login'); }
                    else { alert(data.message); }
                });
            }

            function handleLogin() {
                let phone = document.getElementById('loginPhone').value.trim();
                let pass = document.getElementById('loginPass').value.trim();
                fetch('/api/login', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone, pass})
                }).then(res => res.json()).then(data => {
                    if(data.success) {
                        currentUser = data.user; balance = currentUser.balance;
                        localStorage.setItem('bk777_session', phone);
                        document.getElementById('authScreen').style.display = 'none';
                        initUserSession();
                    } else { alert(data.message); }
                });
            }

            function initUserSession() {
                document.getElementById('uidText').innerText = currentUser.uid;
                document.getElementById('pfUid').innerText = currentUser.uid;
                document.getElementById('pfPhone').innerText = currentUser.phone;
                updateBalanceUI();
            }

            function updateBalanceUI() {
                document.getElementById('userBalance').innerText = balance;
                let gb = document.getElementById('gameBal');
                if(gb) gb.innerText = balance;
                if(currentUser) {
                    fetch('/api/update-balance', {
                        method: 'POST', headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({phone: currentUser.phone, balance})
                    });
                }
            }

            function openModal(id) { document.getElementById(id).style.display = 'flex'; }
            function closeModal(id) { document.getElementById(id).style.display = 'none'; }

            function addHistory(text) {
                historyLogs.unshift(text);
                let list = document.getElementById('historyList');
                if(list) { list.innerHTML = historyLogs.map(item => \`<p style="border-bottom:1px solid #f1f5f9; padding:4px 0;">\${item}</p>\`).join(''); }
            }

            function calculateBonus() {
                let amt = Number(document.getElementById('depAmount').value) || 0;
                document.getElementById('totalDepPreview').innerText = amt + (amt * 0.05);
            }

            function submitDeposit() {
                let amt = Number(document.getElementById('depAmount').value);
                let ref = document.getElementById('depRef').value.trim();
                if(!amt || amt < 3000) { alert('အနည်းဆုံး ငွေသွင်းပမာဏ 3,000 ကျပ် ဖြစ်ရပါမည်။'); return; }
                if(!ref) { alert('စလစ် (သို့) ငွေလွှဲနံပါတ် ထည့်ပါ။'); return; }
                
                fetch('/api/transaction', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone: currentUser.phone, type: 'ငွေသွင်း', amount: amt, ref})
                }).then(res => res.json()).then(data => {
                    alert('ငွေသွင်းတောင်းဆိုမှု အောင်မြင်ပါသည်။ Admin အတည်ပြုရန် စောင့်ဆိုင်းနေပါသည်။');
                    closeModal('depositModal');
                });
            }

            function submitWithdraw() {
                let amt = Number(document.getElementById('wdAmount').value);
                let pass = document.getElementById('wdPassword').value;
                if(!amt || amt < 5000) { alert('အနည်းဆုံး ငွေထုတ်ပမာဏ 5,000 ကျပ် ဖြစ်ရပါမည်။'); return; }
                if(pass !== currentUser.pass) { alert('စကားဝှက် မှားယွင်းနေပါသည်။'); return; }
                if(balance < amt) { alert('လက်ကျန်ငွေ မလုံလောက်ပါ။'); return; }

                balance -= amt;
                updateBalanceUI();
                fetch('/api/transaction', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone: currentUser.phone, type: 'ငွေထုတ်', amount: amt, ref: 'KPay'})
                });
                addHistory(\`ငွေထုတ်တောင်းဆိုမှု: -\${amt} ကျပ်\`);
                alert('ငွေထုတ် တောင်းဆိုမှု တင်ပြီးပါပြီ။');
                closeModal('withdrawModal');
            }

            function changePassword() {
                let newPass = document.getElementById('newPasswordInput').value.trim();
                if(newPass.length < 4) { alert('စကားဝှက် အနည်းဆုံး ၄ လုံး ရှိရပါမည်။'); return; }
                currentUser.pass = newPass;
                fetch('/api/change-password', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone: currentUser.phone, newPass})
                }).then(() => alert('စကားဝှက် ပြောင်းလဲပြီးပါပြီ။'));
                closeModal('profileModal');
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

                if (type === 'mines') {
                    title.innerText = '💣 Mines (ဗုံးရှောင်ဂိမ်း)';
                    content.innerHTML = \`
                        <div style="margin-bottom: 10px; font-size: 13px;">
                            လောင်းကြေး: <input type="number" id="mineBet" value="10" style="width:80px; display:inline-block; padding:4px;"> 
                            ဗုံး: <select id="mineCount" style="width:60px; display:inline-block; padding:4px;"><option value="3">3</option><option value="5" selected>5</option></select>
                        </div>
                        <button style="background:#f59e0b; color:white; border:none; padding:8px 15px; border-radius:6px; font-weight:bold; margin-bottom:10px; cursor:pointer;" onclick="startMinesGame()">ဂိမ်းစတင်မည်</button>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%; max-width: 280px;" id="minesGrid">
                            \__(Array(25).fill(0).map(() => \`<div style="background:#f1f5f9; aspect-ratio:1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">🔒</div>\`).join(''))__
                        </div>
                        <button id="mineCashoutBtn" style="display:none; background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; margin-top:12px; cursor:pointer;" onclick="cashoutMines()">ငွေထုတ်ယူမည် (Cash Out)</button>
                    \`;
                } else if (type === 'gocrush') {
                    title.innerText = '🚀 Go Crush (လေယာဉ်ပျံ)';
                    content.innerHTML = \`
                        <div style="font-size: 45px; margin-bottom: 5px;" id="crushPlane">🚀</div>
                        <div style="font-size: 30px; font-weight: bold; color: #2563eb; margin-bottom: 10px;" id="crushMult">1.00x</div>
                        <input type="number" id="crushBet" value="10" style="max-width: 180px; text-align:center;">
                        <div style="display:flex; gap:10px; margin-top:5px;">
                            <button style="background:#10b981; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" id="crushStartBtn" onclick="startCrush()">စတင်မည်</button>
                            <button style="background:#ef4444; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; display:none;" id="crushCashBtn" onclick="cashoutCrush()">Cash Out</button>
                        </div>
                    \`;
                } else if (type === 'wingo') {
                    title.innerText = '🎲 Win Go (အရောင်/အချိန်)';
                    content.innerHTML = \`
                        <div style="text-align:center; width:100%;">
                            <p style="font-size:14px; font-weight:bold; color:#d97706;">အချိန်ကျန်: <span id="wgTimer">30</span> စက္ကန့်</p>
                            <input type="number" id="wgBet" value="10" style="max-width:180px; margin-bottom:10px; text-align:center;">
                            <div style="display:flex; gap:8px; justify-content:center; margin-bottom:10px;">
                                <button style="background:#ef4444; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အနီ')">အနီ</button>
                                <button style="background:#10b981; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အစိမ်း')">အစိမ်း</button>
                                <button style="background:#3b82f6; color:white; border:none; padding:10px 15px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အပြာ')">အပြာ</button>
                            </div>
                            <p id="wgStatus" style="font-size:13px; color:#64748b;">အရောင်တစ်ခုကို ရွေးချယ်ပြီး လောင်းပါ</p>
                        </div>
                    \`;
                } else if (type === 'dice') {
                    title.innerText = '🎯 Dice (အန်စာတုံး)';
                    content.innerHTML = \`
                        <div style="font-size: 40px; margin: 10px;" id="diceDisplay">🎲 ⚀</div>
                        <input type="number" id="diceBet" value="10" style="max-width:180px; text-align:center; margin-bottom:10px;">
                        <div style="display: flex; gap: 10px;">
                            <button style="background:#ef4444; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDiceGame('Low')">Low (1-3)</button>
                            <button style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDiceGame('High')">High (4-6)</button>
                        </div>
                    \`;
                } else if (type === 'plinko') {
                    title.innerText = '🔴 Plinko ဂိမ်း';
                    content.innerHTML = \`
                        <div style="text-align:center; width:100%;">
                            <div style="font-size:35px; margin-bottom:10px;" id="plinkoBall">🔴</div>
                            <input type="number" id="plinkoBet" value="10" style="max-width:180px; text-align:center; margin-bottom:10px;">
                            <button style="background:#f59e0b; color:white; border:none; padding:12px 25px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playPlinkoGame()">ဘောလုံးကြွေချမည်</button>
                            <p id="plinkoResult" style="margin-top:10px; font-weight:bold; color:#10b981;"></p>
                        </div>
                    \`;
                }
            }

            // Mines Logic with Cash Out
            let minesState = { active: false, bet: 0, mult: 1.0, mineList: [], revealedCount: 0 };
            function startMinesGame() {
                let bet = Number(document.getElementById('mineBet').value);
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let mineCount = parseInt(document.getElementById('mineCount').value);
                minesState = { active: true, bet: bet, mult: 1.0, mineList: [], revealedCount: 0 };
                
                // Random bombs
                while(minesState.mineList.length < mineCount) {
                    let r = Math.floor(Math.random() * 25);
                    if(!minesState.mineList.includes(r)) minesState.mineList.push(r);
                }

                let gridHtml = '';
                for(let i=0; i<25; i++) {
                    gridHtml += \`<div style="background:#f8fafc; border:1px solid #cbd5e1; aspect-ratio:1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;" onclick="clickTile(\${i}, this)">💎</div>\`;
                }
                document.getElementById('minesGrid').innerHTML = gridHtml;
                document.getElementById('mineCashoutBtn').style.display = 'block';
            }

            function clickTile(index, el) {
                if(!minesState.active) return;
                if(el.dataset.clicked) return;
                el.dataset.clicked = 'true';

                if(minesState.mineList.includes(index)) {
                    el.style.backgroundColor = '#ef4444'; el.innerText = '💣';
                    alert('ဗုံးထိသွားပါပြီ! ရှုံးနိမ့်သည်။');
                    minesState.active = false;
                    document.getElementById('mineCashoutBtn').style.display = 'none';
                } else {
                    el.style.backgroundColor = '#10b981'; el.innerText = '💎';
                    minesState.revealedCount++;
                    minesState.mult += 0.3;
                    document.getElementById('mineCashoutBtn').innerText = \`ငွေထုတ်ယူမည် (\${Math.floor(minesState.bet * minesState.mult)} Ks)\`;
                }
            }

            function cashoutMines() {
                if(!minesState.active) return;
                let winAmt = Math.floor(minesState.bet * minesState.mult);
                balance += winAmt; updateBalanceUI();
                alert(\`အောင်မြင်စွာ ငွေထုတ်ယူနိုင်ပါပြီ! +\${winAmt} ကျပ်\`);
                minesState.active = false;
                document.getElementById('mineCashoutBtn').style.display = 'none';
            }

            // Go Crush Logic with Cash Out
            let crushState = { active: false, bet: 0, mult: 1.0, timer: null };
            function startCrush() {
                let bet = Number(document.getElementById('crushBet').value);
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                crushState = { active: true, bet: bet, mult: 1.0, timer: null };
                
                document.getElementById('crushStartBtn').style.display = 'none';
                document.getElementById('crushCashBtn').style.display = 'inline-block';
                let targetCrash = 1.05 + Math.random() * 3.0;

                crushState.timer = setInterval(() => {
                    crushState.mult += 0.04;
                    document.getElementById('crushMult').innerText = crushState.mult.toFixed(2) + 'x';
                    if(crushState.mult >= targetCrash) {
                        clearInterval(crushState.timer);
                        document.getElementById('crushPlane').innerText = '💥';
                        alert('လေယာဉ်ကွဲသွားပါပြီ! ရှုံးနိမ့်သည်။');
                        crushState.active = false;
                        document.getElementById('crushStartBtn').style.display = 'inline-block';
                        document.getElementById('crushCashBtn').style.display = 'none';
                    }
                }, 100);
            }

            function cashoutCrush() {
                if(!crushState.active) return;
                clearInterval(crushState.timer);
                let winAmt = Math.floor(crushState.bet * crushState.mult);
                balance += winAmt; updateBalanceUI();
                alert(\`Cash Out အောင်မြင်သည်! +\${winAmt} ကျပ်\`);
                crushState.active = false;
                document.getElementById('crushStartBtn').style.display = 'inline-block';
                document.getElementById('crushCashBtn').style.display = 'none';
                document.getElementById('crushPlane').innerText = '🚀';
            }

            // Win Go Logic
            function selectWingo(color) {
                let bet = Number(document.getElementById('wgBet').value);
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                document.getElementById('wgStatus').innerText = \'\${color} ကို Losed လိုက်ပါပြီ။ ရလဒ်စောင့်ဆိုင်းနေ... \';
                
                setTimeout(() => {
                    let colors = ['အနီ', 'အစိမ်း', 'အပြာ'];
                    let winColor = colors[Math.floor(Math.random() * colors.length)];
                    if(color === winColor) {
                        let winAmt = bet * 2;
                        balance += winAmt; updateBalanceUI();
                        document.getElementById('wgStatus').innerText = \`🎉 ထွက်လာသောအရောင်: \${winColor} | နိုင်ပါသည်! +\${winAmt} ကျပ်\`;
                    } else {
                        document.getElementById('wgStatus').innerText = \`❌ ထွက်လာသောအရောင်: \${winColor} | ရှုံးနိမ့်သည်။\`;
                    }
                }, 2000);
            }

            // Dice Logic
            function playDiceGame(choice) {
                let bet = Number(document.getElementById('diceBet').value);
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let roll = Math.floor(Math.random() * 6) + 1;
                let outcome = roll <= 3 ? 'Low' : 'High';
                let icons = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                document.getElementById('diceDisplay').innerText = \`🎲 \${icons[roll-1]}\`;
                
                if(choice === outcome) {
                    let winAmt = bet * 2;
                    balance += winAmt; updateBalanceUI;
                    alert(\`ထွက်ဂဏန်း: \${roll} (\${outcome}) - နိုင်ပါသည်! +\${winAmt} ကျပ်\`);
                } else {
                    alert(\`ထွက်ဂဏန်း: \${roll} (\${outcome}) - ရှုံးနိမ့်သည်။\`);
                }
                updateBalanceUI();
            }

            // Plinko Logic
            function playPlinkoGame() {
                let bet = Number(document.getElementById('plinkoBet').value);
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let mults = [0.2, 0.5, 1.2, 2.0, 5.0];
                let chosen = mults[Math.floor(Math.random() * mults.length)];
                let winAmt = Math.floor(bet * chosen);
                balance += winAmt; updateBalanceUI();
                document.getElementById('plinkoResult').innerText = \`မြှောက်ဂဏန်း \${chosen}x ကျရောက်၍ +\${winAmt} ကျပ် ရရှိပါသည်!\`;
            }
        </script>
    </body>
    </html>
    `);
});

// Admin Endpoint
app.get('/admin', (req, res) => {
    let usersHTML = Object.values(usersDB).map(u => \`<tr><td style="border:1px solid #ddd; padding:8px;">\${u.phone}</td><td style="border:1px solid #ddd; padding:8px;">\${u.uid}</td><td style="border:1px solid #ddd; padding:8px;">\${u.balance} ကျပ်</td></tr>\`).join('');
    let txHTML = transactionsDB.map(t => \`<tr><td style="border:1px solid #ddd; padding:8px;">\${t.phone}</td><td style="border:1px solid #ddd; padding:8px;">\${t.type}</td><td style="border:1px solid #ddd; padding:8px;">\${t.amount} ကျပ်</td><td style="border:1px solid #ddd; padding:8px;">\${t.ref}</td></tr>\`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head><title>Admin Panel</title></head>
    <body style="font-family:sans-serif; padding:20px; background:#f4f6f8;">
        <h2>🛠️ BK777 Admin Control Panel</h2>
        <h3> အသုံးပြုသူများ စာရင်း</h3>
        <table style="width:100%; border-collapse:collapse; background:white; margin-bottom:20px;">
            <tr style="background:#f59e0b; color:white;"><th style="padding:8px;">ဖုန်းနံပါတ်</th><th style="padding:8px;">UID</th><th style="padding:8px;">ငွေလက်ကျန်</th></tr>
            \${usersHTML || '<tr><td colspan="3" style="text-align:center; padding:10px;">မရှိသေးပါ။</td></tr>'}
        </table>
        <h3> ငွေသွင်း/ငွေထုတ် တောင်းဆိုမှုများ</h3>
        <table style="width:100%; border-collapse:collapse; background:white;">
            <tr style="background:#2563eb; color:white;"><th style="padding:8px;">ဖုန်း</th><th style="padding:8px;">အမျိုးအစား</th><th style="padding:8px;">ပမာဏ</th><th style="padding:8px;">စလစ်/အချက်အလက်</th></tr>
            \${txHTML || '<tr><td colspan="4" style="text-align:center; padding:10px;">မရှိသေးပါ။</td></tr>'}
        </table>
    </body>
    </html>
    `);
});

// API Routes
app.post('/api/register', (req, res) => {
    let { phone, pass } = req.body;
    if(usersDB[phone]) return res.json({ success: false, message: 'ဖုန်းနံပါတ် ရှိပြီးသားဖြစ်သည်။' });
    let uid = Math.floor(1000 + Math.random() * 9000).toString();
    usersDB[phone] = { phone, pass, uid, balance: 1000 };
    res.json({ success: true });
});

app.post('/api/login', (req, res) => {
    let { phone, pass } = req.body;
    let user = usersDB[phone];
    if(!user || user.pass !== pass) return res.json({ success: false, message: 'အချက်အလက် မှားယွင်းနေပါသည်။' });
    res.json({ success: true, user });
});

app.get('/api/user', (req, res) => {
    let user = usersDB[req.query.phone];
    if(user) res.json({ success: true, user });
    else res.json({ success: false });
});

app.post('/api/update-balance', (req, res) => {
    let { phone, balance } = req.body;
    if(usersDB[phone]) usersDB[phone].balance = balance;
    res.json({ success: true });
});

app.post('/api/change-password', (req, res) => {
    let { phone, newPass } = req.body;
    if(usersDB[phone]) usersDB[phone].pass = newPass;
    res.json({ success: true });
});

app.post('/api/transaction', (req, res) => {
    transactionsDB.push(req.body);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

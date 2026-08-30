const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let usersDB = {}; 
let transactionsDB = [];

app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>BK777 - Premium Gaming</title>
        <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: #090d16; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
            
            #loadingScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #090d16; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 9999; transition: opacity 0.5s ease; }
            .loader-logo { font-size: 42px; font-weight: 900; color: #fbbf24; margin-bottom: 20px; letter-spacing: 2px; text-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
            .spinner { width: 45px; height: 45px; border: 4px solid #1e293b; border-top: 4px solid #fbbf24; border-radius: 50%; animation: spin 0.8s linear infinite; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

            #authScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9, 13, 22, 0.98); display: none; justify-content: center; align-items: center; z-index: 8888; backdrop-filter: blur(10px); }
            .auth-card { background: linear-gradient(145deg, #1e293b, #0f172a); border: 1px solid #334155; padding: 25px; border-radius: 20px; width: 90%; max-width: 380px; box-shadow: 0 20px 40px rgba(0,0,0,0.6); text-align: center; }
            .auth-tabs { display: flex; margin-bottom: 20px; border-bottom: 2px solid #334155; }
            .auth-tab { flex: 1; padding: 12px; cursor: pointer; font-weight: bold; color: #64748b; background: none; border: none; font-size: 14px; transition: 0.3s; }
            .auth-tab.active { color: #fbbf24; border-bottom: 2px solid #fbbf24; margin-bottom: -2px; }
            .auth-form input { width: 100%; padding: 14px; margin: 10px 0; background: #090d16; border: 1px solid #334155; border-radius: 10px; font-size: 14px; color: #fff; outline: none; }
            .auth-form input:focus { border-color: #fbbf24; }
            .auth-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #fbbf24, #d97706); color: #0f172a; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; margin-top: 10px; font-size: 15px; box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3); }

            .app-container { position: relative; width: 100%; max-width: 480px; height: 100vh; background: #090d16; box-shadow: 0 0 30px rgba(0,0,0,0.8); display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #1e293b; }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border-bottom: 1px solid #1e293b; }
            .logo-title { color: #fbbf24; font-weight: 900; font-size: 22px; text-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
            .user-info { color: #94a3b8; font-size: 12px; background: #0f172a; padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; }
            .user-info span { color: #fbbf24; font-weight: bold; }

            .main-content { flex: 1; padding: 15px; overflow-y: auto; background: #090d16; }
            .games-section-box { background: linear-gradient(145deg, #1e293b, #111827); border: 1px solid #334155; border-radius: 20px; padding: 18px; box-shadow: 0 8px 20px rgba(0,0,0,0.3); margin-bottom: 15px; }
            .section-title { font-size: 16px; color: #fff; margin-bottom: 15px; font-weight: bold; display: flex; align-items: center; gap: 8px; }

            .grid-games { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .game-box { background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; transition: all 0.25s ease; position: relative; overflow: hidden; }
            .game-box:hover { border-color: #fbbf24; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(251, 191, 36, 0.15); }
            .game-icon { font-size: 32px; margin-bottom: 6px; }
            .game-box h4 { margin: 6px 0 2px 0; color: #fbbf24; font-size: 14px; font-weight: bold; }
            .game-box span { font-size: 11px; color: #64748b; }

            .bottom-nav { display: flex; justify-content: space-around; background: rgba(30, 41, 59, 0.85); backdrop-filter: blur(10px); border-top: 1px solid #1e293b; padding: 10px 0; }
            .nav-item { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 11px; cursor: pointer; background: none; border: none; text-decoration: none; transition: 0.2s; }
            .nav-item.active, .nav-item:hover { color: #fbbf24; }

            .modal-overlay, .game-screen-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 200; justify-content: center; align-items: center; backdrop-filter: blur(8px); }
            .game-screen-overlay { background: #090d16; flex-direction: column; padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 300; display: none; align-items: center; }
            .modal-content { background: linear-gradient(145deg, #1e293b, #0f172a); padding: 25px; border-radius: 20px; width: 90%; max-width: 380px; border: 1px solid #334155; box-shadow: 0 15px 35px rgba(0,0,0,0.5); }
            .modal-content h3 { color: #fff; margin-top: 0; font-size: 18px; border-bottom: 1px solid #334155; padding-bottom: 10px; }
            .modal-content input, .modal-content select { width: 100%; padding: 12px; margin: 10px 0; background: #090d16; border: 1px solid #334155; color: #fff; border-radius: 10px; box-sizing: border-box; font-size: 13px; outline: none; }
            .modal-btns { display: flex; gap: 10px; margin-top: 15px; }
            .modal-btns button { flex: 1; padding: 12px; border: none; border-radius: 10px; font-weight: bold; cursor: pointer; font-size: 13px; }

            .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; max-width: 480px; background: rgba(30,41,59,0.5); padding: 10px 15px; border-radius: 12px; border: 1px solid #1e293b; flex-shrink: 0; }
            .back-lobby-btn { background: #dc2626; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
            
            .bet-control-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 380px; margin: 10px 0; background: rgba(30, 41, 59, 0.6); padding: 15px; border-radius: 16px; border: 1px solid #334155; }
            .bet-chips { display: flex; gap: 6px; justify-content: center; }
            .chip { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; transition: 0.2s; }
            .chip:active, .chip:hover { background: #fbbf24; color: #0f172a; border-color: #fbbf24; }
        </style>
    </head>
    <body>

        <div id="loadingScreen">
            <div class="loader-logo">⭐ BK777</div>
            <div class="spinner"></div>
            <p style="margin-top: 15px; color: #64748b; font-size: 13px;">လော့တင်ဆွဲနေပါသည်...</p>
        </div>

        <div id="authScreen">
            <div class="auth-card">
                <div class="loader-logo" style="font-size: 28px; margin-bottom: 15px;">⭐ BK777</div>
                <div class="auth-tabs">
                    <button class="auth-tab active" id="tabLoginBtn" onclick="switchAuthTab('login')">အကောင့်ဝင်ရန်</button>
                    <button class="auth-tab" id="tabRegBtn" onclick="switchAuthTab('register')">အကောင့်အသစ်</button>
                </div>
                
                <div id="loginForm" class="auth-form">
                    <input type="text" id="loginPhone" placeholder="ဖုန်းနံပါတ် (ဥပမာ - 09xxxxxxxxx)">
                    <input type="password" id="loginPass" placeholder="စကားဝှက်">
                    <button class="auth-btn" onclick="handleLogin()">ဝင်မည်</button>
                </div>

                <div id="registerForm" class="auth-form" style="display: none;">
                    <input type="text" id="regPhone" placeholder="ဖုန်းနံပါတ်">
                    <input type="password" id="regPass" placeholder="စကားဝှက် အသစ်">
                    <button class="auth-btn" style="background:linear-gradient(135deg, #10b981, #047857); color:white;" onclick="handleRegister()">အကောင့်ဖွင့်မည်</button>
                </div>
            </div>
        </div>

        <div class="app-container">
            <div class="header">
                <div class="logo-title">⭐ BK777</div>
                <div class="user-info">လက်ကျန်: <span id="userBalance">1000</span> Ks</div>
            </div>

            <div class="main-content">
                <div class="games-section-box" style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); border-color: #475569; cursor: pointer;" onclick="openModal('vipModal')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0; color: #fbbf24; font-size: 15px;">👑 VIP အဆင့်နှင့် ဘောနပ်စ်များ</h4>
                            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 12px;">သင့်အဆင့်: <b>VIP 1</b> | အသေးစိတ်ကြည့်ရန်</p>
                        </div>
                        <span style="font-size: 20px; color: #fbbf24;">➔</span>
                    </div>
                </div>

                <div class="games-section-box">
                    <div class="section-title">🎮 လူကြိုက်များသော ဂိမ်းများ</div>
                    <div class="grid-games">
                        <div class="game-box" onclick="openGame('wingo')">
                            <div class="game-icon">📈</div>
                            <h4>Win Go</h4>
                            <span>အရောင်နှင့် နံပါတ်</span>
                        </div>
                        <div class="game-box" onclick="openGame('gocrush')">
                            <div class="game-icon">🚀</div>
                            <h4>Go Crush</h4>
                            <span>လော့ချ်အမြတ်ထုတ်</span>
                        </div>
                        <div class="game-box" onclick="openGame('mines')">
                            <div class="game-icon">💎</div>
                            <h4>Mines</h4>
                            <span>ရတနာရှာ ဗုံးရှောင်</span>
                        </div>
                        <div class="game-box" onclick="openGame('dice')">
                            <div class="game-icon">🎲</div>
                            <h4>Dice</h4>
                            <span>အန်စာတုံး လောင်းကြေး</span>
                        </div>
                        <div class="game-box" onclick="openGame('plinko')" style="grid-column: span 2;">
                            <div class="game-icon">🔴</div>
                            <h4>Plinko</h4>
                            <span>ဘောလုံးကျ အကွက်ဖောက် အမြတ်ထုတ်ဂိမ်း</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom-nav">
                <button class="nav-item active" onclick="switchNav('home')"><span style="font-size: 18px;">🏠</span> ပင်မ</button>
                <button class="nav-item" onclick="openModal('depositModal')"><span style="font-size: 18px;">📥</span> ငွေသွင်း</button>
                <button class="nav-item" onclick="openModal('withdrawModal')"><span style="font-size: 18px;">📤</span> ငွေထုတ်</button>
                <button class="nav-item" onclick="openModal('historyModal')"><span style="font-size: 18px;">📋</span> မှတ်တမ်း</button>
                <button class="nav-item" onclick="openModal('profileModal')"><span style="font-size: 18px;">👤</span> ပရိုဖိုင်</button>
            </div>
        </div>

        <div class="modal-overlay" id="vipModal">
            <div class="modal-content">
                <h3>👑 VIP အဆင့် အစီအစဉ်</h3>
                <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;"><b>VIP 1:</b> နေ့စဉ်ငွေသွင်း ဘောနပ်စ် +5% အလိုအလျောက် ရရှိမည်ဖြစ်ပါသည်။</p>
                <button style="width:100%; padding:12px; background:#fbbf24; color:#0f172a; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:15px;" onclick="closeModal('vipModal')">ပိတ်မည်</button>
            </div>
        </div>

        <div class="modal-overlay" id="depositModal">
            <div class="modal-content">
                <h3>📥 ငွေသွင်းရန် (KBZPay)</h3>
                <p style="font-size: 12px; color: #34d399; font-weight: bold; background: rgba(52,211,153,0.1); padding: 8px; border-radius: 8px;">💡 KBZPay: 09123456789 (နာမည် - BK777)</p>
                <input type="number" id="depAmount" placeholder="သွင်းမည့် ပမာဏ (ကျပ်)" oninput="calculateBonus()">
                <p style="font-size: 12px; color: #fbbf24; margin: 6px 0;">ရရှိမည့် စုစုပေါင်း (ဘောနပ်စ် 5% အပါ): <span id="totalDepPreview" style="font-weight:bold;">0</span> Ks</p>
                <input type="text" id="depRef" placeholder="ငွေလွှဲစလစ်နံပါတ် (နောက်ဆုံး ၆ လုံး)">
                <div class="modal-btns">
                    <button style="background:#334155; color:#f8fafc;" onclick="closeModal('depositModal')">ပိတ်မည်</button>
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
                    <button style="background:#334155; color:#f8fafc;" onclick="closeModal('withdrawModal')">ပိတ်မည်</button>
                    <button style="background:#fbbf24; color:#0f172a;" onclick="submitWithdraw()">ငွေထုတ်မည်</button>
                </div>
            </div>
        </div>

        <div class="modal-overlay" id="profileModal">
            <div class="modal-content">
                <h3>👤 အသုံးပြုသူ ပရိုဖိုင်</h3>
                <p style="font-size: 13px; color:#94a3b8;">ဖုန်းနံပါတ်: <b id="pfPhone" style="color:#fff;">-</b></p>
                <input type="password" id="newPasswordInput" placeholder="စကားဝှက်အသစ် ပြောင်းရန်">
                <button style="width:100%; padding:12px; background:#3b82f6; color:white; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:5px;" onclick="changePassword()">စကားဝှက်ပြောင်းမည်</button>
                <button style="width:100%; padding:10px; background:#334155; color:#f8fafc; border:none; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:10px;" onclick="closeModal('profileModal')">ပိတ်မည်</button>
            </div>
        </div>

        <div class="modal-overlay" id="historyModal">
            <div class="modal-content">
                <h3>📋 ငွေသွင်း/ထုတ် မှတ်တမ်း</h3>
                <div style="max-height: 180px; overflow-y: auto; font-size: 12px; color: #94a3b8; margin: 10px 0;" id="historyList">
                    <p>မှတ်တမ်းများ မရှိသေးပါ။</p>
                </div>
                <button style="width:100%; padding:10px; background:#334155; color:#f8fafc; border:none; border-radius:10px; font-weight:bold;" onclick="closeModal('historyModal')">ပိတ်မည်</button>
            </div>
        </div>

        <div class="game-screen-overlay" id="gameScreenOverlay">
            <div class="game-header">
                <button class="back-lobby-btn" onclick="closeGame()">❮ ထွက်မည်</button>
                <div style="font-weight: bold; color: #fbbf24;" id="activeGameTitle">ဂိမ်း</div>
                <div style="font-size: 12px; color: #94a3b8;">လက်ကျန်: <span id="gameBal" style="font-weight:bold; color:#fff;">1000</span> Ks</div>
            </div>
            <div id="activeGameContent" style="width: 100%; max-width: 480px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-bottom: 30px; overflow-y: auto;"></div>
        </div>

        <script>
            let currentUser = null;
            let balance = 1000;

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
                }, 800);
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

            function calculateBonus() {
                let amt = Number(document.getElementById('depAmount').value) || 0;
                document.getElementById('totalDepPreview').innerText = amt + (amt * 0.05);
            }

            function submitDeposit() {
                let amt = Number(document.getElementById('depAmount').value);
                let ref = document.getElementById('depRef').value.trim();
                if(!amt || amt < 3000) { alert('အနည်းဆုံး ငွေသွင်းပမာဏ 3,000 ကျပ် ဖြစ်ရပါမည်။'); return; }
                if(!ref) { alert('ငွေလွှဲစလစ်နံပါတ် ထည့်ပါ။'); return; }
                
                fetch('/api/transaction', {
                    method: 'POST', headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({phone: currentUser.phone, type: 'ငွေသွင်း', amount: amt, ref})
                }).then(() => {
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
                if(window.wingoTimerInterval) clearInterval(window.wingoTimerInterval);
                if(window.crushTimerInterval) clearInterval(window.crushTimerInterval);
                document.getElementById('gameScreenOverlay').style.display = 'none';
                updateBalanceUI();
            }

            function getBetControlHTML(defaultAmt = 10) {
                return `
                    <div class="bet-control-container">
                        <div style="font-size:12px; color:#94a3b8; display:flex; justify-content:space-between;">
                            <span>လောင်းကြေးပမာဏ (ကျပ်)</span>
                        </div>
                        <input type="number" id="gameBetInput" value="${defaultAmt}" style="width:100%; padding:10px; background:#090d16; border:1px solid #475569; color:#fff; border-radius:8px; text-align:center; font-size:15px; font-weight:bold; outline:none;">
                        <div class="bet-chips">
                            <button class="chip" onclick="setBet(10)">+10</button>
                            <button class="chip" onclick="setBet(50)">+50</button>
                            <button class="chip" onclick="setBet(100)">+100</button>
                            <button class="chip" onclick="setBet(500)">+500</button>
                            <button class="chip" onclick="setBet('max')">Max</button>
                        </div>
                    </div>
                `;
            }

            function setBet(val) {
                let input = document.getElementById('gameBetInput');
                if(!input) return;
                let cur = Number(input.value) || 0;
                if(val === 'max') {
                    input.value = balance;
                } else {
                    input.value = cur + val;
                }
            }

            function openGame(type) {
                if(window.wingoTimerInterval) clearInterval(window.wingoTimerInterval);
                if(window.crushTimerInterval) clearInterval(window.crushTimerInterval);

                document.getElementById('gameScreenOverlay').style.display = 'flex';
                const content = document.getElementById('activeGameContent');
                const title = document.getElementById('activeGameTitle');
                content.innerHTML = '';

                if (type === 'wingo') {
                    title.innerText = '📈 Win Go (Colour Trading)';
                    content.innerHTML = `
                        <div style="text-align:center; width:100%; display:flex; flex-direction:column; align-items:center;">
                            <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; padding:12px 20px; border-radius:14px; margin-bottom:10px; width:100%; max-width:380px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:13px; color:#94a3b8;">ထွက်မည့်အချိန်:</span>
                                <span id="wgTimer" style="font-size:20px; font-weight:bold; color:#fbbf24;">60 စက္ကန့်</span>
                            </div>
                            ${getBetControlHTML(10)}
                            <div style="display:flex; gap:8px; justify-content:center; margin:10px 0; width:100%; max-width:380px;">
                                <button style="flex:1; background:linear-gradient(135deg, #ef4444, #b91c1c); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အနီ')">အနီ (Red)</button>
                                <button style="flex:1; background:linear-gradient(135deg, #10b981, #047857); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အစိမ်း')">အစိမ်း (Green)</button>
                                <button style="flex:1; background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အပြာ')">အပြာ (Violet)</button>
                            </div>
                            <p id="wgStatus" style="font-size:13px; color:#94a3b8; margin-top:10px; text-align:center;">အရောင်ကို ရွေးချယ်ပြီး အချိန်ပြည့်တာနဲ့ ရလဒ်ထွက်ပါမည်။</p>
                        </div>
                    `;
                    startWingoTimer();
                } else if (type === 'gocrush') {
                    title.innerText = '🚀 Go Crush (Rocket)';
                    content.innerHTML = `
                        <div style="font-size: 45px; margin-bottom: 5px;" id="crushPlane">🚀</div>
                        <div style="font-size: 34px; font-weight: 900; color: #38bdf8; margin-bottom: 10px;" id="crushMult">1.00x</div>
                        ${getBetControlHTML(10)}
                        <div style="display:flex; gap:10px; margin-top:10px; width: 100%; max-width: 380px; justify-content: center;">
                            <button style="flex:1; background:linear-gradient(135deg, #10b981, #047857); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" id="crushStartBtn" onclick="startCrush()">လောင်းပြီး စတင်မည်</button>
                            <button style="flex:1; background:linear-gradient(135deg, #ef4444, #b91c1c); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer; display:none;" id="crushCashBtn" onclick="cashoutCrush()">💸 Cash Out (ငွေထုတ်)</button>
                        </div>
                    `;
                } else if (type === 'mines') {
                    title.innerText = '💎 Mines (ဗုံးရှောင်)';
                    content.innerHTML = `
                        ${getBetControlHTML(10)}
                        <div style="margin-bottom: 10px; font-size: 13px; color:#94a3b8; display:flex; align-items:center; gap:10px;">
                            ဗုံးအရေအတွက်: <select id="mineCount" style="width:80px; padding:6px; background:#090d16; color:#fff; border:1px solid #475569; border-radius:6px; outline:none;"><option value="3">3</option><option value="5" selected>5</option><option value="8">8</option></select>
                            <button style="background:#fbbf24; color:#0f172a; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="startMinesGame()">စတင်မည်</button>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; width: 100%; max-width: 320px;" id="minesGrid">
                            ${Array(25).fill(0).map(() => `<div style="background:#1e293b; border:1px solid #334155; aspect-ratio:1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">🔒</div>`).join('')}
                        </div>
                        <button id="mineCashoutBtn" style="display:none; width: 100%; max-width: 320px; background:linear-gradient(135deg, #10b981, #047857); color:white; border:none; padding:12px; border-radius:10px; font-weight:bold; margin-top:12px; cursor:pointer;" onclick="cashoutMines()">ငွေထုတ်ယူမည် (Cash Out)</button>
                    `;
                } else if (type === 'dice') {
                    title.innerText = '🎲 Dice (အန်စာတုံး)';
                    content.innerHTML = `
                        <div style="font-size: 50px; margin: 15px;" id="diceDisplay">🎲 ⚀</div>
                        ${getBetControlHTML(10)}
                        <div style="display: flex; gap: 10px; margin-top:10px; width: 100%; max-width: 380px;">
                            <button style="flex:1; background:linear-gradient(135deg, #ef4444, #b91c1c); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="playDiceGame('Low')">Low (1-3) [2x]</button>
                            <button style="flex:1; background:linear-gradient(135deg, #3b82f6, #1d4ed8); color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="playDiceGame('High')">High (4-6) [2x]</button>
                        </div>
                    `;
                } else if (type === 'plinko') {
                    title.innerText = '🔴 Plinko';
                    content.innerHTML = `
                        <div style="text-align:center; width:100%; display:flex; flex-direction:column; align-items:center;">
                            <div style="font-size:40px; margin-bottom:10px;" id="plinkoBall">🔴</div>
                            ${getBetControlHTML(10)}
                            <button style="background:linear-gradient(135deg, #fbbf24, #d97706); color:#0f172a; border:none; padding:14px 30px; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:12px; width:100%; max-width:380px;" onclick="playPlinkoGame()">ဘောလုံးကြွေချမည်</button>
                            <p id="plinkoResult" style="margin-top:12px; font-weight:bold; color:#34d399;"></p>
                        </div>
                    `;
                }
            }

            window.wingoTimerInterval = null;
            let wingoSec = 60;
            function startWingoTimer() {
                wingoSec = 60;
                window.wingoTimerInterval = setInterval(() => {
                    wingoSec--;
                    let el = document.getElementById('wgTimer');
                    if(el) el.innerText = wingoSec + ' စက္ကန့်';
                    if(wingoSec <= 0) {
                        wingoSec = 60;
                    }
                }, 1000);
            }

            function selectWingo(color) {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                document.getElementById('wgStatus').innerText = `${color} ကို ${bet} ကျပ် လောင်းပြီးပါပြီ။ (${wingoSec} စက္ကန့် စောင့်ပါ)...`;
                
                let targetSec = wingoSec;
                let checkEnd = setInterval(() => {
                    if(wingoSec > targetSec || wingoSec === 0) {
                        clearInterval(checkEnd);
                        let colors = ['အနီ', 'အစိမ်း', 'အပြာ'];
                        let winColor = colors[Math.floor(Math.random() * colors.length)];
                        if(color === winColor) {
                            let winAmt = bet * 2;
                            balance += winAmt; updateBalanceUI();
                            document.getElementById('wgStatus').innerText = `🎉 ထွက်လာသောအရောင်: ${winColor} | နိုင်ပါသည်! +${winAmt} ကျပ်`;
                        } else {
                            document.getElementById('wgStatus').innerText = `❌ ထွက်လာသောအရောင်: ${winColor} | ရှုံးနိမ့်သည်။`;
                        }
                    }
                }, 500);
            }

            let crushState = { active: false, bet: 0, mult: 1.0 };
            window.crushTimerInterval = null;
            function startCrush() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                crushState = { active: true, bet: bet, mult: 1.0 };
                
                document.getElementById('crushStartBtn').style.display = 'none';
                document.getElementById('crushCashBtn').style.display = 'inline-block';
                let targetCrash = 1.08 + Math.random() * 4.0;

                window.crushTimerInterval = setInterval(() => {
                    crushState.mult += 0.05;
                    document.getElementById('crushMult').innerText = crushState.mult.toFixed(2) + 'x';
                    if(crushState.mult >= targetCrash) {
                        clearInterval(window.crushTimerInterval);
                        document.getElementById('crushPlane').innerText = '💥';
                        alert('လေယာဉ်ကွဲသွားပါပြီ (Crushed)! ရှုံးနိမ့်သည်။');
                        crushState.active = false;
                        document.getElementById('crushStartBtn').style.display = 'inline-block';
                        document.getElementById('crushCashBtn').style.display = 'none';
                    }
                }, 100);
            }

            function cashoutCrush() {
                if(!crushState.active) return;
                clearInterval(window.crushTimerInterval);
                let winAmt = Math.floor(crushState.bet * crushState.mult);
                balance += winAmt; updateBalanceUI();
                alert(`Cash Out အောင်မြင်သည်! +${winAmt} ကျပ် ရရှိပါပြီ`);
                crushState.active = false;
                document.getElementById('crushStartBtn').style.display = 'inline-block';
                document.getElementById('crushCashBtn').style.display = 'none';
                document.getElementById('crushPlane').innerText = '🚀';
            }

            let minesState = { active: false, bet: 0, mult: 1.0, mineList: [], revealedCount: 0 };
            function startMinesGame() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let mineCount = parseInt(document.getElementById('mineCount').value);
                minesState = { active: true, bet: bet, mult: 1.0, mineList: [], revealedCount: 0 };
                
                while(minesState.mineList.length < mineCount) {
                    let r = Math.floor(Math.random() * 25);
                    if(!minesState.mineList.includes(r)) minesState.mineList.push(r);
                }

                let gridHtml = '';
                for(let i=0; i<25; i++) {
                    gridHtml += `<div style="background:#1e293b; border:1px solid #334155; aspect-ratio:1; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer;" onclick="clickTile(${i}, this)">💎</div>`;
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
                    minesState.mult += 0.35;
                    document.getElementById('mineCashoutBtn').innerText = `ငွေထုတ်ယူမည် (Cash Out: ${Math.floor(minesState.bet * minesState.mult)} Ks)`;
                }
            }

            function cashoutMines() {
                if(!minesState.active) return;
                let winAmt = Math.floor(minesState.bet * minesState.mult);
                balance += winAmt; updateBalanceUI();
                alert(`အောင်မြင်စွာ ငွေထုတ်ယူနိုင်ပါပြီ! +${winAmt} ကျပ်`);
                minesState.active = false;
                document.getElementById('mineCashoutBtn').style.display = 'none';
            }

            function playDiceGame(choice) {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let roll = Math.floor(Math.random() * 6) + 1;
                let outcome = roll <= 3 ? 'Low' : 'High';
                let icons = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                document.getElementById('diceDisplay').innerText = `🎲 ${icons[roll-1]}`;
                
                if(choice === outcome) {
                    let winAmt = bet * 2;
                    balance += winAmt; 
                    alert(`ထွက်ဂဏန်း: ${roll} (${outcome}) - နိုင်ပါသည်! +${winAmt} ကျပ်`);
                } else {
                    alert(`ထွက်ဂဏန်း: ${roll} (${outcome}) - ရှုံးနိမ့်သည်။`);
                }
                updateBalanceUI();
            }

            function playPlinkoGame() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let mults = [0.2, 0.5, 1.2, 2.0, 4.0];
                let chosen = mults[Math.floor(Math.random() * mults.length)];
                let winAmt = Math.floor(bet * chosen);
                balance += winAmt; updateBalanceUI();
                document.getElementById('plinkoResult').innerText = `ဂဏန်း ${chosen}x ကျရောက်၍ +${winAmt} ကျပ် ရရှိပါသည်!`;
            }
        </script>
    </body>
    </html>
    `);
});

app.get('/admin', (req, res) => {
    let usersHTML = Object.values(usersDB).map(u => `<tr><td style="border:1px solid #ddd; padding:8px;">${u.phone}</td><td style="border:1px solid #ddd; padding:8px;">${u.uid}</td><td style="border:1px solid #ddd; padding:8px;">${u.balance} ကျပ်</td></tr>`).join('');
    let txHTML = transactionsDB.map(t => `<tr><td style="border:1px solid #ddd; padding:8px;">${t.phone}</td><td style="border:1px solid #ddd; padding:8px;">${t.type}</td><td style="border:1px solid #ddd; padding:8px;">${t.amount} ကျပ်</td><td style="border:1px solid #ddd; padding:8px;">${t.ref}</td></tr>`).join('');

    res.send(`
    <!DOCTYPE html>
    <html lang="my">
    <head><title>Admin Panel</title></head>
    <body style="font-family:sans-serif; padding:20px; background:#0f172a; color:#f8fafc;">
        <h2>🛠️ BK777 Admin Control Panel</h2>
        <h3> အသုံးပြုသူများ စာရင်း</h3>
        <table style="width:100%; border-collapse:collapse; background:#1e293b; margin-bottom:20px;">
            <tr style="background:#fbbf24; color:#0f172a;"><th style="padding:8px;">ဖုန်းနံပါတ်</th><th style="padding:8px;">UID</th><th style="padding:8px;">ငွေလက်ကျန်</th></tr>
            ${usersHTML || '<tr><td colspan="3" style="text-align:center; padding:10px;">မရှိသေးပါ။</td></tr>'}
        </table>
        <h3> ငွေသွင်း/ငွေထုတ် တောင်းဆိုမှုများ</h3>
        <table style="width:100%; border-collapse:collapse; background:#1e293b;">
            <tr style="background:#3b82f6; color:white;"><th style="padding:8px;">ဖုန်း</th><th style="padding:8px;">အမျိုးအစား</th><th style="padding:8px;">ပမာဏ</th><th style="padding:8px;">စလစ်/အချက်အလက်</th></tr>
            ${txHTML || '<tr><td colspan="4" style="text-align:center; padding:10px;">မရှိသေးပါ။</td></tr>'}
        </table>
    </body>
    </html>
    `);
});

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

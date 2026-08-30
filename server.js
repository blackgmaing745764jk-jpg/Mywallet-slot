const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multi-User Database & Admin Storage
let db = {
    adminPassword: "20091718",
    users: {
        // Default sample user
        "BK982104": { uid: "BK982104", phone: "09912345678", pin: "1234", balance: 41000, lastLogin: "2026-08-30 13:50" }
    },
    pendingRequests: []
};

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
            body { margin: 0; background: #090d16; color: #f8fafc; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
            .app-container { position: relative; width: 100%; max-width: 480px; height: 100vh; background: #090d16; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #1e293b; }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border-bottom: 1px solid #1e293b; }
            .logo-title { color: #fbbf24; font-weight: 900; font-size: 22px; cursor: pointer; }
            .user-info { color: #94a3b8; font-size: 11px; background: #0f172a; padding: 6px 10px; border-radius: 20px; border: 1px solid #334155; display: flex; flex-direction: column; align-items: flex-end; }
            .user-info span { color: #fbbf24; font-weight: bold; }
            .main-content { flex: 1; padding: 15px; overflow-y: auto; background: #090d16; display: flex; flex-direction: column; gap: 15px; }
            
            .wallet-card { background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #334155; border-radius: 16px; padding: 15px; display: flex; justify-content: space-between; align-items: center; }
            .wallet-btn { background: #fbbf24; color: #0f172a; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }

            .games-section-box { background: linear-gradient(145deg, #1e293b, #111827); border: 1px solid #334155; border-radius: 20px; padding: 18px; }
            .section-title { font-size: 16px; color: #fff; margin-bottom: 15px; font-weight: bold; }
            .grid-games { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .game-box { background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; }
            .game-icon { font-size: 32px; margin-bottom: 6px; }
            .game-box h4 { margin: 6px 0 2px 0; color: #fbbf24; font-size: 14px; }
            .game-box span { font-size: 11px; color: #64748b; }

            .bottom-nav { display: flex; justify-content: space-around; background: rgba(30, 41, 59, 0.85); border-top: 1px solid #1e293b; padding: 10px 0; flex-shrink: 0; }
            .nav-item { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 11px; cursor: pointer; background: none; border: none; }
            .nav-item.active { color: #fbbf24; }

            /* Auth Screen Overlay */
            .auth-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #090d16; z-index: 1000; display: flex; justify-content: center; align-items: center; padding: 20px; }
            .auth-card { background: #1e293b; border: 1px solid #475569; width: 100%; max-width: 380px; border-radius: 20px; padding: 25px; display: flex; flex-direction: column; gap: 15px; }

            .modal-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 400; justify-content: center; align-items: center; padding: 20px; }
            .modal-content { background: #1e293b; border: 1px solid #475569; width: 100%; max-width: 380px; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 10px; max-height: 90vh; overflow-y: auto; }
            .input-group { display: flex; flex-direction: column; gap: 4px; }
            .input-group label { font-size: 11px; color: #94a3b8; }
            .modal-input { width: 100%; padding: 10px; background: #090d16; border: 1px solid #475569; color: #fff; border-radius: 8px; outline: none; font-size: 13px; }
            .kpay-box { background: rgba(15, 23, 42, 0.9); border: 1px dashed #fbbf24; border-radius: 10px; padding: 10px; font-size: 12px; color: #cbd5e1; line-height: 1.5; }

            .game-screen-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #090d16; flex-direction: column; padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 300; align-items: center; }
            .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; max-width: 480px; background: rgba(30,41,59,0.5); padding: 10px 15px; border-radius: 12px; border: 1px solid #1e293b; flex-shrink: 0; }
            .back-lobby-btn { background: #dc2626; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
            .bet-control-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 380px; margin: 10px 0; background: rgba(30, 41, 59, 0.6); padding: 15px; border-radius: 16px; border: 1px solid #334155; flex-shrink: 0; }
            .bet-chips { display: flex; gap: 6px; justify-content: center; }
            .chip { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; }
            
            /* Admin Panel Styles */
            .admin-container { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #0f172a; z-index: 500; padding: 20px; overflow-y: auto; color: #fff; }
            .admin-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            .admin-table th, .admin-table td { border: 1px solid #334155; padding: 6px; text-align: left; }
            .admin-table th { background: #1e293b; color: #fbbf24; }
        </style>
    </head>
    <body>

        <!-- Login / Register Screen -->
        <div class="auth-overlay" id="authOverlay">
            <div class="auth-card">
                <div style="text-align:center; color:#fbbf24; font-size:24px; font-weight:900;">⭐ BK777 Login</div>
                <div class="input-group">
                    <label>ဖုန်းနံပါတ်</label>
                    <input type="text" id="authPhone" class="modal-input" placeholder="09xxxxxxxxx">
                </div>
                <div class="input-group">
                    <label>စကားဝှက် (PIN)</label>
                    <input type="password" id="authPin" class="modal-input" placeholder="ဂဏန်း ၄ လုံးခန့်">
                </div>
                <div style="display:flex; gap:10px; margin-top:10px;">
                    <button style="flex:1; background:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="handleLogin()">ဝင်မည်</button>
                    <button style="flex:1; background:#3b82f6; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="handleRegister()">အကောင့်သစ်ဖွင့်</button>
                </div>
            </div>
        </div>

        <div class="app-container">
            <div class="header">
                <div class="logo-title" onclick="checkAdmin()">⭐ BK777</div>
                <div class="user-info">
                    <div>UID: <span id="userUidDisplay">-</span></div>
                    <div>လက်ကျန်: <span id="userBalance">0</span> Ks</div>
                </div>
            </div>

            <div class="main-content">
                <div class="wallet-card">
                    <div>
                        <div style="font-size: 12px; color: #94a3b8;">အဓိက ပိုက်ဆံအိတ်</div>
                        <div style="font-size: 18px; font-weight: bold; color: #fff;" id="walletBal">0 Ks</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="wallet-btn" onclick="openModal('deposit')">ငွေသွင်း</button>
                        <button class="wallet-btn" style="background:#334155; color:#fff;" onclick="openModal('withdraw')">ငွေထုတ်</button>
                    </div>
                </div>

                <div class="games-section-box">
                    <div class="section-title">🎮 လူကြိုက်များသော ဂိမ်းများ</div>
                    <div class="grid-games">
                        <div class="game-box" onclick="openGame('wingo')">
                            <div class="game-icon">📈</div>
                            <h4>Win Go</h4>
                            <span>အကြီး/အသေး၊ အရောင်၊ ဂဏန်း</span>
                        </div>
                        <div class="game-box" onclick="openGame('gocrush')">
                            <div class="game-icon">🚀</div>
                            <h4>Go Crush</h4>
                            <span>လေယာဉ်ပျံ ကက်ရှ်အောက်</span>
                        </div>
                        <div class="game-box" onclick="openGame('mines')">
                            <div class="game-icon">💎</div>
                            <h4>Mines</h4>
                            <span>ဗုံးရှောင် ရတနာရှာ</span>
                        </div>
                        <div class="game-box" onclick="openGame('dice')">
                            <div class="game-icon">🎲</div>
                            <h4>Dice</h4>
                            <span>အန်စာတုံး</span>
                        </div>
                        <div class="game-box" onclick="openGame('plinko')" style="grid-column: span 2;">
                            <div class="game-icon">🔴</div>
                            <h4>Plinko</h4>
                            <span>ဘောလုံးကျ အမြတ်ထုတ်</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bottom-nav">
                <button class="nav-item active"><span style="font-size: 18px;">🏠</span> ပင်မ</button>
                <button class="nav-item" onclick="logout()"><span style="font-size: 18px;">🚪</span> ထွက်ရန်</button>
            </div>
        </div>

        <!-- Admin Panel -->
        <div class="admin-container" id="adminPanel">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <h2 style="color:#fbbf24; margin:0; font-size: 18px;">⚙️ Admin Control Panel</h2>
                <button onclick="closeAdmin()" style="background:#dc2626; color:#fff; border:none; padding:6px 12px; border-radius:8px; font-weight:bold; cursor:pointer;">ပိတ်မည်</button>
            </div>

            <!-- Change Admin Password -->
            <div style="background:#1e293b; padding:12px; border-radius:12px; margin-bottom:12px;">
                <h3 style="margin-top:0; font-size:13px; color:#f43f5e;">Admin Password ပြောင်းရန်</h3>
                <div style="display:flex; gap:8px;">
                    <input type="text" id="newAdminPass" placeholder="Password အသစ်ထည့်ရန်" class="modal-input" style="flex:1;">
                    <button onclick="changeAdminPassword()" style="background:#f59e0b; color:#fff; border:none; padding:8px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;">ပြောင်းမည်</button>
                </div>
            </div>
            
            <!-- User Control & Management -->
            <div style="background:#1e293b; padding:12px; border-radius:12px; margin-bottom:12px;">
                <h3 style="margin-top:0; font-size:13px; color:#38bdf8;">ကစားသူများ၏ အချက်အလက်နှင့် လက်ကျန်ငွေ ထိန်းချုပ်ရန်</h3>
                <div id="adminUsersList">ဒေတာမရှိပါ</div>
            </div>

            <!-- Pending Requests -->
            <div style="background:#1e293b; padding:12px; border-radius:12px;">
                <h3 style="margin-top:0; font-size:13px; color:#fbbf24;">ငွေသွင်း/ငွေထုတ် တောင်းဆိုချက်များ</h3>
                <div id="adminRequestsList">တောင်းဆိုချက် မရှိသေးပါ</div>
            </div>
        </div>

        <!-- Deposit / Withdraw Modal -->
        <div class="modal-overlay" id="walletModal">
            <div class="modal-content">
                <h3 id="modalTitle" style="margin:0; color:#fbbf24;">ငွေသွင်းရန်</h3>
                <div id="limitInfo" style="font-size: 11px; color: #38bdf8;">ငွေသွင်းရန် အနည်းဆုံး - ၁,၀၀၀ ကျပ် / အများဆုံး - ၁၀,၀၀၀,၀၀၀ ကျပ်</div>
                
                <div id="depositInstructions" class="kpay-box">
                    <b>KBZPay ငွေလွှဲရန် အကောင့်:</b><br>
                    အမည်: <span style="color:#fbbf24;">Myint Myint Than</span><br>
                    ဖုန်းနံပါတ်: <span style="color:#fbbf24;">09678817131</span><br>
                    <span style="color:#f43f5e;">ငွေလွှဲပြီးပါက Telegram (@Klvin_2010) သို့ စလစ် (Slip) ပုံ ပို့ပေးပါ။</span>
                </div>

                <div class="input-group">
                    <label>UID</label>
                    <input type="text" id="modalUid" class="modal-input" readonly>
                </div>
                <div class="input-group">
                    <label>ဖုန်းနံပါတ် (သို့မဟုတ် KPay နံပါတ်)</label>
                    <input type="text" id="modalPhone" class="modal-input" placeholder="ဥပမာ - 09912345678">
                </div>
                <div class="input-group">
                    <label>ပမာဏ (ကျပ်)</label>
                    <input type="number" id="modalAmount" class="modal-input" placeholder="ပမာဏထည့်ပါ">
                </div>

                <div style="display:flex; gap:10px; margin-top:5px;">
                    <button style="flex:1; background:#10b981; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="submitWallet()">အတည်ပြုမည်</button>
                    <button style="flex:1; background:#dc2626; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="closeModal()">ပိတ်မည်</button>
                </div>
            </div>
        </div>

        <!-- Game Screen Overlay -->
        <div class="game-screen-overlay" id="gameScreenOverlay">
            <div class="game-header">
                <button class="back-lobby-btn" onclick="closeGame()">❮ ထွက်မည်</button>
                <div style="font-weight: bold; color: #fbbf24;" id="activeGameTitle">ဂိမ်း</div>
                <div style="font-size: 12px; color: #94a3b8;">လက်ကျန်: <span id="gameBal" style="font-weight:bold; color:#fff;">0</span> Ks</div>
            </div>
            <div id="activeGameContent" style="width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; padding-bottom: 20px;"></div>
        </div>

        <script>
            // Multi-user Database simulation in frontend
            let appData = {
                adminPass: "20091718",
                users: {
                    "BK982104": { uid: "BK982104", phone: "09912345678", pin: "1234", balance: 41000, lastLogin: "2026-08-30 13:50" }
                },
                pendingRequests: []
            };

            let currentUid = null;

            function handleRegister() {
                let phone = document.getElementById('authPhone').value.trim();
                let pin = document.getElementById('authPin').value.trim();
                if(!phone || !pin) { alert('ဖုန်းနံပါတ်နှင့် Password ဖြည့်ပါ။'); return; }

                // Check if phone already registered
                for(let k in appData.users) {
                    if(appData.users[k].phone === phone) {
                        alert('ဤဖုန်းနံပါတ်ဖြင့် အကောင့်ရှိနှင့်ပြီးသား ဖြစ်ပါသည်။ ဝင်မည်ကို နှိပ်ပါ။');
                        return;
                    }
                }

                let newUid = 'BK' + Math.floor(100000 + Math.random() * 900000);
                appData.users[newUid] = {
                    uid: newUid,
                    phone: phone,
                    pin: pin,
                    balance: 1000, // Bonus start balance
                    lastLogin: new Date().toLocaleString()
                };

                currentUid = newUid;
                alert('အကောင့်ဖွင့်ခြင်း အောင်မြင်ပါသည်။ သင့် UID မှာ ' + newUid + ' ဖြစ်ပါသည်။');
                initUserSession();
            }

            function handleLogin() {
                let phone = document.getElementById('authPhone').value.trim();
                let pin = document.getElementById('authPin').value.trim();
                if(!phone || !pin) { alert('ဖုန်းနံပါတ်နှင့် Password ဖြည့်ပါ။'); return; }

                let found = null;
                for(let k in appData.users) {
                    if(appData.users[k].phone === phone && appData.users[k].pin === pin) {
                        found = appData.users[k];
                        break;
                    }
                }

                if(found) {
                    currentUid = found.uid;
                    found.lastLogin = new Date().toLocaleString();
                    alert('အောင်မြင်စွာ ဝင်ရောက်ပြီးပါပြီ (UID: ' + currentUid + ')');
                    initUserSession();
                } else {
                    alert('ဖုန်းနံပါတ် သို့မဟုတ် Password မှားယွင်းနေပါသည်။');
                }
            }

            function initUserSession() {
                document.getElementById('authOverlay').style.display = 'none';
                updateBalanceUI();
            }

            function logout() {
                currentUid = null;
                document.getElementById('authPhone').value = '';
                document.getElementById('authPin').value = '';
                document.getElementById('authOverlay').style.display = 'flex';
            }

            function getCurrUser() {
                return appData.users[currentUid];
            }

            function updateBalanceUI() {
                if(!currentUid) return;
                let u = getCurrUser();
                document.getElementById('userUidDisplay').innerText = u.uid;
                document.getElementById('userBalance').innerText = u.balance;
                document.getElementById('walletBal').innerText = u.balance + ' Ks';
                let gb = document.getElementById('gameBal');
                if(gb) gb.innerText = u.balance;
            }

            function checkAdmin() {
                let code = prompt("Admin Password ထည့်ပါ:");
                if(code === appData.adminPass) {
                    document.getElementById('adminPanel').style.display = 'block';
                    loadAdminData();
                } else if(code !== null) {
                    alert('Password မှားယွင်းနေပါသည်။');
                }
            }
            function closeAdmin() {
                document.getElementById('adminPanel').style.display = 'none';
            }
            
            function changeAdminPassword() {
                let newPass = document.getElementById('newAdminPass').value;
                if(!newPass) { alert('Password အသစ်ထည့်ပါ။'); return; }
                appData.adminPass = newPass;
                alert('Admin Password အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ: ' + newPass);
                document.getElementById('newAdminPass').value = '';
            }

            function adminUpdateUserBal(uid) {
                let amtInput = document.getElementById('admBal_' + uid);
                let amt = Number(amtInput.value);
                if(isNaN(amt)) { alert('ပမာဏ မှန်ကန်စွာ ထည့်ပါ။'); return; }
                appData.users[uid].balance = amt;
                if(currentUid === uid) updateBalanceUI();
                loadAdminData();
                alert('UID: ' + uid + ' ၏ လက်ကျန်ငွေကို ' + amt + ' ကျပ်သို့ ပြောင်းလဲပြီးပါပြီ။');
            }

            function loadAdminData() {
                // Users list table
                let uHtml = '<table class="admin-table"><tr><th>UID</th><th>ဖုန်း</th><th>လက်ကျန်</th><th>Login ချိန်</th><th>ပြင်ရန်</th></tr>';
                for(let k in appData.users) {
                    let usr = appData.users[k];
                    uHtml += `<tr>
                        <td><b>\${usr.uid}</b></td>
                        <td>\${usr.phone}</td>
                        <td><input type="number" id="admBal_\${usr.uid}" value="\${usr.balance}" style="width:70px; background:#090d16; color:#fff; border:1px solid #475569; padding:2px; border-radius:4px;"></td>
                        <td style="font-size:10px; color:#38bdf8;">\${usr.lastLogin}</td>
                        <td><button onclick="adminUpdateUserBal('\${usr.uid}')" style="background:#10b981; color:#fff; border:none; padding:3px 6px; border-radius:4px; font-weight:bold; cursor:pointer;">ပြင်မည်</button></td>
                    </tr>`;
                }
                uHtml += '</table>';
                document.getElementById('adminUsersList').innerHTML = uHtml;

                // Requests list table
                let rHtml = '<table class="admin-table"><tr><th>အမျိုးအစား</th><th>UID</th><th>ပမာဏ</th><th>ဖုန်း/အကောင့်</th></tr>';
                if(appData.pendingRequests.length === 0) {
                    rHtml += '<tr><td colspan="4" style="text-align:center; color:#94a3b8;">တောင်းဆိုချက် မရှိသေးပါ။</td></tr>';
                } else {
                    appData.pendingRequests.forEach(req => {
                        rHtml += `<tr><td>\${req.type}</td><td>\${req.uid}</td><td>\${req.amt} Ks</td><td>\${req.phone}</td></tr>`;
                    });
                }
                rHtml += '</table>';
                document.getElementById('adminRequestsList').innerHTML = rHtml;
            }

            let currentModalType = '';
            function openModal(type) {
                currentModalType = type;
                let titleEl = document.getElementById('modalTitle');
                let limitEl = document.getElementById('limitInfo');
                let kpayBox = document.getElementById('depositInstructions');
                let u = getCurrUser();
                document.getElementById('modalUid').value = u.uid;
                
                if(type === 'deposit') {
                    titleEl.innerText = 'ငွေသွင်းရန် (KBZPay)';
                    limitEl.innerText = 'ငွေသွင်းရန်: အနည်းဆုံး ၁,၀၀၀ ကျပ် / အများဆုံး ၁၀,၀၀၀,၀၀၀ ကျပ်';
                    kpayBox.style.display = 'block';
                } else {
                    titleEl.innerText = 'ငွေထုတ်ယူရန် (KBZPay)';
                    limitEl.innerText = 'ငွေထုတ်ရန်: အနည်းဆုံး ၅,၀၀၀ ကျပ် / အများဆုံး ၅,၀၀၀,၀၀၀ ကျပ်';
                    kpayBox.style.display = 'none';
                }
                document.getElementById('walletModal').style.display = 'flex';
            }
            function closeModal() {
                document.getElementById('walletModal').style.display = 'none';
            }
            function submitWallet() {
                let amt = Number(document.getElementById('modalAmount').value);
                let phone = document.getElementById('modalPhone').value;
                let u = getCurrUser();
                
                if(!phone) { alert('ဖုန်းနံပါတ် (သို့မဟုတ်) KPay နံပါတ် ထည့်ပါ။'); return; }
                if(!amt || amt <= 0) { alert('ပမာဏ မှန်ကန်စွာ ထည့်ပါ။'); return; }

                if(currentModalType === 'deposit') {
                    if(amt < 1000) { alert('အနည်းဆုံး ငွေသွင်းပမာဏမှာ ၁,၀၀၀ ကျပ် ဖြစ်ပါသည်။'); return; }
                    appData.pendingRequests.push({ type: 'ငွေသွင်း', uid: u.uid, amt: amt, phone: phone });
                    alert('ငွေသွင်းတောင်းဆိုမှု တင်ပြီးပါပြီ။ Telegram (@Klvin_2010) သို့ စလစ်ပုံ ပို့ပေးပါ။');
                } else {
                    if(amt < 5000) { alert('အနည်းဆုံး ငွေထုတ်ပမာဏမှာ ၅,၀၀၀ ကျပ် ဖြစ်ပါသည်။'); return; }
                    if(u.balance < amt) { alert('ငွေလက်ကျန် မလုံလောက်ပါ။'); return; }
                    u.balance -= amt;
                    appData.pendingRequests.push({ type: 'ငွေထုတ်', uid: u.uid, amt: amt, phone: phone });
                    alert('ငွေထုတ်ယူရန် တောင်းဆိုပြီးပါပြီ။ လက်ကျန်ငွေမှ နုတ်ယူပြီး ဖြစ်ပါသည်။');
                }

                updateBalanceUI();
                closeModal();
            }

            function closeGame() {
                if(window.wgInterval) clearInterval(window.wgInterval);
                if(window.crushInterval) clearInterval(window.crushInterval);
                document.getElementById('gameScreenOverlay').style.display = 'none';
                updateBalanceUI();
            }

            function getBetControlHTML(defaultAmt = 10) {
                return `
                    <div class="bet-control-container">
                        <div style="font-size:12px; color:#94a3b8;">လောင်းကြေးပမာဏ (ကျပ်)</div>
                        <input type="number" id="gameBetInput" value="\${defaultAmt}" style="width:100%; padding:10px; background:#090d16; border:1px solid #475569; color:#fff; border-radius:8px; text-align:center; font-size:15px; font-weight:bold; outline:none;">
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
                let u = getCurrUser();
                if(val === 'max') input.value = u.balance;
                else input.value = cur + val;
            }

            function openGame(type) {
                if(window.wgInterval) clearInterval(window.wgInterval);
                if(window.crushInterval) clearInterval(window.crushInterval);

                document.getElementById('gameScreenOverlay').style.display = 'flex';
                const content = document.getElementById('activeGameContent');
                const title = document.getElementById('activeGameTitle');
                content.innerHTML = '';

                if (type === 'wingo') {
                    title.innerText = '📈 Win Go';
                    content.innerHTML = `
                        <div style="text-align:center; width:100%; display:flex; flex-direction:column; align-items:center;">
                            <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; padding:10px 20px; border-radius:12px; margin-bottom:10px; width:100%; max-width:380px; display:flex; justify-content:space-between;">
                                <span style="font-size:13px; color:#94a3b8;">အချိန်:</span>
                                <span id="wgTimer" style="font-weight:bold; color:#fbbf24;">60 စက္ကန့်</span>
                            </div>
                            \${getBetControlHTML(10)}
                            
                            <div style="width:100%; max-width:380px; display:flex; flex-direction:column; gap:8px; margin:5px 0;">
                                <div style="display:flex; gap:8px;">
                                    <button id="wgBtnBig" style="flex:1; background:#f59e0b; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အကြီး')">အကြီး</button>
                                    <button id="wgBtnSmall" style="flex:1; background:#3b82f6; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အသေး')">အသေး</button>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button id="wgBtnRed" style="flex:1; background:#ef4444; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အနီ')">အနီ</button>
                                    <button id="wgBtnGreen" style="flex:1; background:#10b981; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အစိမ်း')">အစိမ်း</button>
                                </div>
                                <div style="font-size:12px; color:#94a3b8; margin-top:5px; text-align:left;">ဂဏန်းရွေးရန် (0-9):</div>
                                <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px;">
                                    \${Array(10).fill(0).map((_, i) => `<button id="wgBtnNum\${i}" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer;" onclick="playWingo(\${i})">\${i}</button>`).join('')}
                                </div>
                            </div>
                            <p id="wgStatus" style="font-size:12px; color:#94a3b8; margin-top:10px;">ရွေးချယ်ပြီး လောင်းကြေးထပ်ရန် ခလုတ်ကို နှိပ်ပါ</p>
                        </div>
                    `;
                    startWingoTimer();
                } else if (type === 'gocrush') {
                    title.innerText = '🚀 Go Crush';
                    content.innerHTML = `
                        <div style="font-size:40px; margin-bottom:5px;" id="crushPlane">🚀</div>
                        <div style="font-size:30px; font-weight:bold; color:#38bdf8; margin-bottom:5px;" id="crushMult">1.00x</div>
                        <div style="font-size:14px; font-weight:bold; color:#34d399; margin-bottom:10px; height:20px;" id="crushLiveWin">ရနေသောပမာဏ: 0 Ks</div>
                        \${getBetControlHTML(10)}
                        <div style="display:flex; gap:10px; width:100%; max-width:380px; margin-top:10px;">
                            <button style="flex:1; background:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" id="crushStartBtn" onclick="startCrush()">စတင်မည်</button>
                            <button style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; display:none;" id="crushCashBtn" onclick="cashoutCrush()">💸 Cash Out</button>
                        </div>
                    `;
                } else if (type === 'mines') {
                    title.innerText = '💎 Mines';
                    content.innerHTML = `
                        \${getBetControlHTML(10)}
                        <button style="background:#fbbf24; color:#0f172a; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:10px;" onclick="startMines()">ဗုံးရှောင် စတင်မည်</button>
                        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; width:100%; max-width:300px;" id="minesGrid">
                            \${Array(25).fill(0).map(()=>`<div style="background:#1e293b; aspect-ratio:1; border-radius:6px; display:flex; align-items:center; justify-content:center;">🔒</div>`).join('')}
                        </div>
                        <button id="mineCashBtn" style="display:none; width:100%; max-width:300px; background:#10b981; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; margin-top:10px; cursor:pointer;" onclick="cashoutMines()">Cash Out</button>
                    `;
                } else if (type === 'dice') {
                    title.innerText = '🎲 Dice';
                    content.innerHTML = `
                        <div style="font-size:40px; margin:10px;" id="diceRes">🎲 ⚀</div>
                        \${getBetControlHTML(10)}
                        <div style="display:flex; gap:10px; width:100%; max-width:380px; margin-top:10px;">
                            <button style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDice('Low')">Low (1-3) [2x]</button>
                            <button style="flex:1; background:#3b82f6; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDice('High')">High (4-6) [2x]</button>
                        </div>
                    `;
                } else if (type === 'plinko') {
                    title.innerText = '🔴 Plinko';
                    content.innerHTML = `
                        <div style="font-size:35px; margin-bottom:10px;">🔴</div>
                        \${getBetControlHTML(10)}
                        <button style="background:#fbbf24; color:#0f172a; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; width:100%; max-width:380px; margin-top:10px;" onclick="playPlinko()">ဘောလုံးချမည်</button>
                        <p id="plinkoText" style="margin-top:10px; font-size:13px; color:#34d399; font-weight:bold;"></p>
                    `;
                }
            }

            let sec = 60;
            let wgBetLocked = false;

            function startWingoTimer() {
                sec = 60;
                wgBetLocked = false;
                window.wgInterval = setInterval(() => {
                    sec--;
                    let el = document.getElementById('wgTimer');
                    if(el) el.innerText = sec + ' စက္ကန့်';
                    
                    if(sec <= 5) {
                        wgBetLocked = true;
                        let allBtns = document.querySelectorAll('#activeGameContent button');
                        allBtns.forEach(b => { if(b.id && b.id.startsWith('wgBtn')) b.style.opacity = '0.4'; });
                    }

                    if(sec <= 0) {
                        sec = 60;
                        wgBetLocked = false;
                        let allBtns = document.querySelectorAll('#activeGameContent button');
                        allBtns.forEach(b => { if(b.id && b.id.startsWith('wgBtn')) b.style.opacity = '1'; });
                        document.getElementById('wgStatus').innerText = 'အဝိုင်းသစ် စတင်ပါပြီ။ ရွေးချယ်ပြီး လောင်းပါ။';
                    }
                }, 1000);
            }

            function playWingo(choice) {
                if(wgBetLocked) {
                    alert('အချိန်ကုန်တော့မည်ဖြစ်၍ လောင်းကြေးပိတ်ထားပါသည်။ စောင့်ဆိုင်းပါ။');
                    return;
                }
                let bet = Number(document.getElementById('gameBetInput').value);
                let u = getCurrUser();
                if(!bet || u.balance < bet) { alert('ငွေမလုံလောက်ပါ သို့မဟုတ် လောင်းကြေးမှားနေသည်။'); return; }
                
                u.balance -= bet; updateBalanceUI();
                wgBetLocked = true;
                
                let allBtns = document.querySelectorAll('#activeGameContent button');
                allBtns.forEach(b => { if(b.id && b.id.startsWith('wgBtn')) b.style.opacity = '0.4'; });
                
                document.getElementById('wgStatus').innerText = `ရွေးချယ်ထားသည်: [\${choice}] | အချိန်ကုန်သည်အထိ စောင့်ဆိုင်းနေပါ...`;

                setTimeout(() => {
                    let randNum = Math.floor(Math.random() * 10);
                    let randColor = randNum % 2 === 0 ? 'အနီ' : 'အစိမ်း';
                    let randSize = randNum >= 5 ? 'အကြီး' : 'အသေး';

                    let isWin = false;
                    let multiplier = 2;

                    if(typeof choice === 'number') {
                        if(choice === randNum) { isWin = true; multiplier = 9; }
                    } else if(choice === 'အကြီး' || choice === 'အသေး') {
                        if(choice === randSize) isWin = true;
                    } else if(choice === 'အနီ' || choice === 'အစိမ်း') {
                        if(choice === randColor) isWin = true;
                    }

                    if(isWin) {
                        let winAmt = bet * multiplier;
                        u.balance += winAmt;
                        document.getElementById('wgStatus').innerText = `ထွက်လာသည်: ဂဏန်း(\${randNum}) - အရောင်(\- வண்ண) - (\${randSize}) | နိုင်ပါသည်! +\${winAmt} ကျပ်`;
                    } else {
                        document.getElementById('wgStatus').innerText = `ထွက်လာသည်: ဂဏန်း(\${randNum}) - အရောင်(\${randColor}) - (\${randSize}) | ရှုံးနိမ့်သည်။`;
                    }
                    updateBalanceUI();
                }, 3000);
            }

            let crush = { active: false, bet: 0, mult: 1.0 };
            function startCrush() {
                let bet = Number(document.getElementById('gameBetInput').value);
                let u = getCurrUser();
                if(!bet || u.balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                u.balance -= bet; updateBalanceUI();
                crush = { active: true, bet: bet, mult: 1.0 };
                document.getElementById('crushStartBtn').style.display = 'none';
                document.getElementById('crushCashBtn').style.display = 'inline-block';
                
                let target = 1.2 + Math.random() * 3.0;
                window.crushInterval = setInterval(() => {
                    crush.mult += 0.05;
                    document.getElementById('crushMult').innerText = crush.mult.toFixed(2) + 'x';
                    let liveWin = Math.floor(crush.bet * crush.mult);
                    let liveWinEl = document.getElementById('crushLiveWin');
                    if(liveWinEl) liveWinEl.innerText = `ရနေသောပမာဏ: \${liveWin} Ks`;

                    if(crush.mult >= target) {
                        clearInterval(window.crushInterval);
                        document.getElementById('crushPlane').innerText = '💥';
                        if(liveWinEl) liveWinEl.innerText = `လေယာဉ်ကွဲသွားပါပြီ! ရှုံးနိမ့်သည်`;
                        alert('လေယာဉ်ကွဲသွားပါပြီ!');
                        crush.active = false;
                        document.getElementById('crushStartBtn').style.display = 'inline-block';
                        document.getElementById('crushCashBtn').style.display = 'none';
                    }
                }, 100);
            }
            function cashoutCrush() {
                if(!crush.active) return;
                clearInterval(window.crushInterval);
                let win = Math.floor(crush.bet * crush.mult);
                let u = getCurrUser();
                u.balance += win; updateBalanceUI();
                document.getElementById('crushLiveWin').innerText = `Cash Out အောင်မြင်သည်! +\${win} Ks`;
                alert(`Cash Out အောင်မြင်သည်! +\${win} ကျပ်`);
                crush.active = false;
                document.getElementById('crushStartBtn').style.display = 'inline-block';
                document.getElementById('crushCashBtn').style.display = 'none';
                document.getElementById('crushPlane').innerText = '🚀';
            }

            let mineObj = { active: false, bet: 0, mult: 1.0, mines: [], count: 0 };
            function startMines() {
                let bet = Number(document.getElementById('gameBetInput').value);
                let u = getCurrUser();
                if(!bet || u.balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                u.balance -= bet; updateBalanceUI();
                mineObj = { active: true, bet: bet, mult: 1.0, mines: [2, 7, 14], count: 0 };
                document.getElementById('mineCashBtn').style.display = 'block';
                
                let html = '';
                for(let i=0; i<25; i++) {
                    html += `<div style="background:#1e293b; aspect-ratio:1; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="clickMine(\${i}, this)">💎</div>`;
                }
                document.getElementById('minesGrid').innerHTML = html;
            }
            function clickMine(idx, el) {
                if(!mineObj.active || el.dataset.op) return;
                el.dataset.op = '1';
                if(mineObj.mines.includes(idx)) {
                    el.style.background = '#ef4444'; el.innerText = '💣';
                    alert('ဗုံးထိသွားသည်!');
                    mineObj.active = false;
                    document.getElementById('mineCashBtn').style.display = 'none';
                } else {
                    el.style.background = '#10b981'; el.innerText = '💎';
                    mineObj.count++;
                    mineObj.mult += 0.4;
                    document.getElementById('mineCashBtn').innerText = `Cash Out (\${Math.floor(mineObj.bet * mineObj.mult)} Ks)`;
                }
            }
            function cashoutMines() {
                if(!mineObj.active) return;
                let win = Math.floor(mineObj.bet * mineObj.mult);
                let u = getCurrUser();
                u.balance += win; updateBalanceUI();
                alert(`ငွေထုတ်ယူပြီးပါပြီ! +\${win} ကျပ်`);
                mineObj.active = false;
                document.getElementById('mineCashBtn').style.display = 'none';
            }

            function playDice(choice) {
                let bet = Number(document.getElementById('gameBetInput').value);
                let u = getCurrUser();
                if(!bet || u.balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                u.balance -= bet; updateBalanceUI();
                let r = Math.floor(Math.random() * 6) + 1;
                let res = r <= 3 ? 'Low' : 'High';
                let icons = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                document.getElementById('diceRes').innerText = `🎲 \${icons[r-1]}`;
                if(choice === res) {
                    u.balance += (bet * 2);
                    alert(`ထွက်ဂဏန်း: \${r} (\${res}) - နိုင်ပါသည်! +\${bet*2} ကျပ်`);
                } else {
                    alert(`ထွက်ဂဏန်း: \${r} (\${res}) - ရှုံးနိမ့်သည်။`);
                }
                updateBalanceUI();
            }

            function playPlinko() {
                let bet = Number(document.getElementById('gameBetInput').value);
                let u = getCurrUser();
                if(!bet || u.balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                u.balance -= bet; updateBalanceUI();
                let mults = [0.2, 0.5, 1.5, 3.0];
                let m = mults[Math.floor(Math.random()*mults.length)];
                let win = Math.floor(bet * m);
                u.balance += win; updateBalanceUI();
                document.getElementById('plinkoText').innerText = `ဂဏန်း \${m}x ကျရောက်၍ +\${win} ကျပ် ရရှိပါသည်!`;
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });

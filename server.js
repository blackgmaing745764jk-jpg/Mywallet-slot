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
            body { margin: 0; background: #090d16; color: #f8fafc; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
            .app-container { position: relative; width: 100%; max-width: 480px; height: 100vh; background: #090d16; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #1e293b; }
            .header { padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background: rgba(30, 41, 59, 0.7); border-bottom: 1px solid #1e293b; }
            .logo-title { color: #fbbf24; font-weight: 900; font-size: 22px; }
            .user-info { color: #94a3b8; font-size: 12px; background: #0f172a; padding: 6px 12px; border-radius: 20px; border: 1px solid #334155; }
            .user-info span { color: #fbbf24; font-weight: bold; }
            .main-content { flex: 1; padding: 15px; overflow-y: auto; background: #090d16; }
            .games-section-box { background: linear-gradient(145deg, #1e293b, #111827); border: 1px solid #334155; border-radius: 20px; padding: 18px; margin-bottom: 15px; }
            .section-title { font-size: 16px; color: #fff; margin-bottom: 15px; font-weight: bold; }
            .grid-games { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
            .game-box { background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 14px; padding: 16px 10px; text-align: center; cursor: pointer; }
            .game-icon { font-size: 32px; margin-bottom: 6px; }
            .game-box h4 { margin: 6px 0 2px 0; color: #fbbf24; font-size: 14px; }
            .game-box span { font-size: 11px; color: #64748b; }
            .bottom-nav { display: flex; justify-content: space-around; background: rgba(30, 41, 59, 0.85); border-top: 1px solid #1e293b; padding: 10px 0; flex-shrink: 0; }
            .nav-item { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 11px; cursor: pointer; background: none; border: none; }
            .nav-item.active { color: #fbbf24; }
            .game-screen-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #090d16; flex-direction: column; padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 300; align-items: center; }
            .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; max-width: 480px; background: rgba(30,41,59,0.5); padding: 10px 15px; border-radius: 12px; border: 1px solid #1e293b; flex-shrink: 0; }
            .back-lobby-btn { background: #dc2626; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
            .bet-control-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 380px; margin: 10px 0; background: rgba(30, 41, 59, 0.6); padding: 15px; border-radius: 16px; border: 1px solid #334155; flex-shrink: 0; }
            .bet-chips { display: flex; gap: 6px; justify-content: center; }
            .chip { background: #334155; color: #f8fafc; border: 1px solid #475569; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: bold; cursor: pointer; }
        </style>
    </head>
    <body>
        <div class="app-container">
            <div class="header">
                <div class="logo-title">⭐ BK777</div>
                <div class="user-info">လက်ကျန်: <span id="userBalance">1000</span> Ks</div>
            </div>

            <div class="main-content">
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
            </div>
        </div>

        <div class="game-screen-overlay" id="gameScreenOverlay">
            <div class="game-header">
                <button class="back-lobby-btn" onclick="closeGame()">❮ ထွက်မည်</button>
                <div style="font-weight: bold; color: #fbbf24;" id="activeGameTitle">ဂိမ်း</div>
                <div style="font-size: 12px; color: #94a3b8;">လက်ကျန်: <span id="gameBal" style="font-weight:bold; color:#fff;">1000</span> Ks</div>
            </div>
            <div id="activeGameContent" style="width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center; padding-bottom: 20px;"></div>
        </div>

        <script>
            let balance = 1000;

            function updateBalanceUI() {
                document.getElementById('userBalance').innerText = balance;
                let gb = document.getElementById('gameBal');
                if(gb) gb.innerText = balance;
            }

            function closeGame() {
                if(window.wgInterval) clearInterval(window.wgInterval);
                if(window.crushInterval) clearInterval(window.crushInterval);
                document.getElementById('gameScreenOverlay').style.display = 'none';
                updateBalanceUI();
            }

            function getBetControlHTML(defaultAmt = 10) {
                return \`
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
                \`;
            }

            function setBet(val) {
                let input = document.getElementById('gameBetInput');
                if(!input) return;
                let cur = Number(input.value) || 0;
                if(val === 'max') input.value = balance;
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
                    content.innerHTML = \`
                        <div style="text-align:center; width:100%; display:flex; flex-direction:column; align-items:center;">
                            <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; padding:10px 20px; border-radius:12px; margin-bottom:10px; width:100%; max-width:380px; display:flex; justify-content:space-between;">
                                <span style="font-size:13px; color:#94a3b8;">အချိန်:</span>
                                <span id="wgTimer" style="font-weight:bold; color:#fbbf24;">60 စက္ကန့်</span>
                            </div>
                            \${getBetControlHTML(10)}
                            <div style="display:flex; gap:8px; justify-content:center; margin:10px 0; width:100%; max-width:380px;">
                                <button style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အနီ')">အနီ</button>
                                <button style="flex:1; background:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playWingo('အစိမ်း')">အစိမ်း</button>
                            </div>
                            <p id="wgStatus" style="font-size:12px; color:#94a3b8; margin-top:5px;">အရောင်ရွေးပြီး လောင်းပါ</p>
                        </div>
                    \`;
                    startWingoTimer();
                } else if (type === 'gocrush') {
                    title.innerText = '🚀 Go Crush';
                    content.innerHTML = \`
                        <div style="font-size:40px; margin-bottom:5px;" id="crushPlane">🚀</div>
                        <div style="font-size:30px; font-weight:bold; color:#38bdf8; margin-bottom:10px;" id="crushMult">1.00x</div>
                        \${getBetControlHTML(10)}
                        <div style="display:flex; gap:10px; width:100%; max-width:380px; margin-top:10px;">
                            <button style="flex:1; background:#10b981; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" id="crushStartBtn" onclick="startCrush()">စတင်မည်</button>
                            <button style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; display:none;" id="crushCashBtn" onclick="cashoutCrush()">💸 Cash Out</button>
                        </div>
                    \`;
                } else if (type === 'mines') {
                    title.innerText = '💎 Mines';
                    content.innerHTML = \`
                        \${getBetControlHTML(10)}
                        <button style="background:#fbbf24; color:#0f172a; border:none; padding:10px 20px; border-radius:8px; font-weight:bold; cursor:pointer; margin-bottom:10px;" onclick="startMines()">ဗုံးရှောင် စတင်မည်</button>
                        <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:5px; width:100%; max-width:300px;" id="minesGrid">
                            \للArray(25).fill(0).map(()=>\`<div style="background:#1e293b; aspect-ratio:1; border-radius:6px; display:flex; align-items:center; justify-content:center;">🔒</div>\`).join('')}
                        </div>
                        <button id="mineCashBtn" style="display:none; width:100%; max-width:300px; background:#10b981; color:white; border:none; padding:10px; border-radius:8px; font-weight:bold; margin-top:10px; cursor:pointer;" onclick="cashoutMines()">Cash Out</button>
                    \`;
                } else if (type === 'dice') {
                    title.innerText = '🎲 Dice';
                    content.innerHTML = \`
                        <div style="font-size:40px; margin:10px;" id="diceRes">🎲 ⚀</div>
                        \${getBetControlHTML(10)}
                        <div style="display:flex; gap:10px; width:100%; max-width:380px; margin-top:10px;">
                            <button style="flex:1; background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDice('Low')">Low (1-3) [2x]</button>
                            <button style="flex:1; background:#3b82f6; color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer;" onclick="playDice('High')">High (4-6) [2x]</button>
                        </div>
                    \`;
                } else if (type === 'plinko') {
                    title.innerText = '🔴 Plinko';
                    content.innerHTML = \`
                        <div style="font-size:35px; margin-bottom:10px;">🔴</div>
                        \${getBetControlHTML(10)}
                        <button style="background:#fbbf24; color:#0f172a; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; width:100%; max-width:380px; margin-top:10px;" onclick="playPlinko()">ဘောလုံးချမည်</button>
                        <p id="plinkoText" style="margin-top:10px; font-size:13px; color:#34d399; font-weight:bold;"></p>
                    \`;
                }
            }

            let sec = 60;
            function startWingoTimer() {
                sec = 60;
                window.wgInterval = setInterval(() => {
                    sec--;
                    let el = document.getElementById('wgTimer');
                    if(el) el.innerText = sec + ' စက္ကန့်';
                    if(sec <= 0) sec = 60;
                }, 1000);
            }
            function playWingo(color) {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || balance < bet) { alert('ငွေမလုံလောက်ပါ သို့မဟုတ် လောင်းကြေးမှားနေသည်။'); return; }
                balance -= bet; updateBalanceUI();
                let colors = ['အနီ', 'အစိမ်း'];
                let res = colors[Math.floor(Math.random()*colors.length)];
                if(color === res) {
                    balance += (bet * 2);
                    document.getElementById('wgStatus').innerText = \`ထွက်လာသည်: \+res | နိုင်ပါသည်! +\${bet*2} ကျပ်\`;
                } else {
                    document.getElementById('wgStatus').innerText = \`ထွက်လာသည်: \+res | ရှုံးနိမ့်သည်။\`;
                }
                updateBalanceUI();
            }

            let crush = { active: false, bet: 0, mult: 1.0 };
            function startCrush() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                crush = { active: true, bet: bet, mult: 1.0 };
                document.getElementById('crushStartBtn').style.display = 'none';
                document.getElementById('crushCashBtn').style.display = 'inline-block';
                
                let target = 1.2 + Math.random() * 3.0;
                window.crushInterval = setInterval(() => {
                    crush.mult += 0.05;
                    document.getElementById('crushMult').innerText = crush.mult.toFixed(2) + 'x';
                    if(crush.mult >= target) {
                        clearInterval(window.crushInterval);
                        document.getElementById('crushPlane').innerText = '💥';
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
                balance += win; updateBalanceUI();
                alert(\`Cash Out အောင်မြင်သည်! +\${win} ကျပ်\`);
                crush.active = false;
                document.getElementById('crushStartBtn').style.display = 'inline-block';
                document.getElementById('crushCashBtn').style.display = 'none';
                document.getElementById('crushPlane').innerText = '🚀';
            }

            let mineObj = { active: false, bet: 0, mult: 1.0, mines: [], count: 0 };
            function startMines() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                mineObj = { active: true, bet: bet, mult: 1.0, mines: [2, 7, 14], count: 0 };
                document.getElementById('mineCashBtn').style.display = 'block';
                
                let html = '';
                for(let i=0; i<25; i++) {
                    html += \`<div style="background:#1e293b; aspect-ratio:1; border-radius:6px; display:flex; align-items:center; justify-content:center; cursor:pointer;" onclick="clickMine(\${i}, this)">💎</div>\`;
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
                    document.getElementById('mineCashBtn').innerText = \`Cash Out (\${Math.floor(mineObj.bet * mineObj.mult)} Ks)\`;
                }
            }
            function cashoutMines() {
                if(!mineObj.active) return;
                let win = Math.floor(mineObj.bet * mineObj.mult);
                balance += win; updateBalanceUI();
                alert(\`ငွေထုတ်ယူပြီးပါပြီ! +\${win} ကျပ်\`);
                mineObj.active = false;
                document.getElementById('mineCashBtn').style.display = 'none';
            }

            function playDice(choice) {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let r = Math.floor(Math.random() * 6) + 1;
                let res = r <= 3 ? 'Low' : 'High';
                let icons = ['⚀','⚁','⚂','⚃','⚄','⚅'];
                document.getElementById('diceRes').innerText = \`🎲 \${icons[r-1]}\`;
                if(choice === res) {
                    balance += (bet * 2);
                    alert(\`ထွက်ဂဏန်း: \+r (\+res) - နိုင်ပါသည်! +\${bet*2} ကျပ်\`);
                } else {
                    alert(\`ထွက်ဂဏန်း: \+r (\+res) - ရှုံးနိမ့်သည်။\`);
                }
                updateBalanceUI();
            }

            function playPlinko() {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; updateBalanceUI();
                let mults = [0.2, 0.5, 1.5, 3.0];
                let m = mults[Math.floor(Math.random()*mults.length)];
                let win = Math.floor(bet * m);
                balance += win; updateBalanceUI();
                document.getElementById('plinkoText').innerText = \`ဂဏန်း \+m x ကျရောက်၍ +\${win} ကျပ် ရရှိပါသည်!\`;
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => { console.log(`Server running on port \${PORT}`); });

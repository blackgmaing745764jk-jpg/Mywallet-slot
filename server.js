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
        <title>BK777 - Gaming Platform</title>
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
            .bottom-nav { display: flex; justify-content: space-around; background: rgba(30, 41, 59, 0.85); border-top: 1px solid #1e293b; padding: 10px 0; }
            .nav-item { display: flex; flex-direction: column; align-items: center; color: #64748b; font-size: 11px; cursor: pointer; background: none; border: none; }
            .nav-item.active { color: #fbbf24; }
            .game-screen-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #090d16; flex-direction: column; padding: 15px; box-sizing: border-box; overflow-y: auto; z-index: 300; align-items: center; }
            .game-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; width: 100%; max-width: 480px; background: rgba(30,41,59,0.5); padding: 10px 15px; border-radius: 12px; border: 1px solid #1e293b; }
            .back-lobby-btn { background: #dc2626; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
            .bet-control-container { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 380px; margin: 10px 0; background: rgba(30, 41, 59, 0.6); padding: 15px; border-radius: 16px; border: 1px solid #334155; }
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
            <div id="activeGameContent" style="width: 100%; max-width: 480px; display: flex; flex-direction: column; align-items: center;"></div>
        </div>

        <script>
            let balance = 1000;

            function updateBalanceUI() {
                document.getElementById('userBalance').innerText = balance;
                let gb = document.getElementById('gameBal');
                if(gb) gb.innerText = balance;
            }

            function closeGame() {
                document.getElementById('gameScreenOverlay').style.display = 'none';
                updateBalanceUI();
            }

            function getBetControlHTML(defaultAmt = 10) {
                return \`
                    <div class="bet-control-container">
                        <div style="font-size:12px; color:#94a3b8;">လောင်းကြေးပမာဏ (ကျပ်)</div>
                        <input type="number" id="gameBetInput" value="\${defaultAmt}" style="width:100%; padding:10px; background:#090d16; border:1px solid #475569; color:#fff; border-radius:8px; text-align:center; font-size:15sp; font-weight:bold; outline:none;">
                        <div class="bet-chips">
                            <button class="chip" onclick="setBet(10)">+10</button>
                            <button class="chip" onclick="setBet(50)">+50</button>
                            <button class="chip" onclick="setBet(100)">+100</button>
                        </div>
                    </div>
                \`;
            }

            function setBet(val) {
                let input = document.getElementById('gameBetInput');
                if(!input) return;
                let cur = Number(input.value) || 0;
                input.value = cur + val;
            }

            function openGame(type) {
                document.getElementById('gameScreenOverlay').style.display = 'flex';
                const content = document.getElementById('activeGameContent');
                const title = document.getElementById('activeGameTitle');
                content.innerHTML = '';

                if (type === 'wingo') {
                    title.innerText = '📈 Win Go (Colour Trading)';
                    content.innerHTML = \`
                        <div style="text-align:center; width:100%; display:flex; flex-direction:column; align-items:center;">
                            <div style="background:rgba(30,41,59,0.7); border:1px solid #334155; padding:12px 20px; border-radius:14px; margin-bottom:10px; width:100%; max-width:380px; display:flex; justify-content:space-between; align-items:center;">
                                <span style="font-size:13px; color:#94a3b8;">ထွက်မည့်အချိန်:</span>
                                <span id="wgTimer" style="font-size:20px; font-weight:bold; color:#fbbf24;">60 စက္ကန့်</span>
                            </div>
                            \${getBetControlHTML(10)}
                            <div style="display:flex; gap:8px; justify-content:center; margin:10px 0; width:100%; max-width:380px;">
                                <button style="flex:1; background:#ef4444; color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အနီ')">အနီ</button>
                                <button style="flex:1; background:#10b981; color:white; border:none; padding:14px; border-radius:10px; font-weight:bold; cursor:pointer;" onclick="selectWingo('အစိမ်း')">အစိမ်း</button>
                            </div>
                            <p id="wgStatus" style="font-size:13px; color:#94a3b8; margin-top:10px;">အရောင်ကို ရွေးချယ်ပါ</p>
                        </div>
                    \`;
                }
            }

            function selectWingo(color) {
                let bet = Number(document.getElementById('gameBetInput').value);
                if(!bet || bet <= 0) { alert('လောင်းကြေး ထည့်ပါ။'); return; }
                if(balance < bet) { alert('ငွေမလုံလောက်ပါ။'); return; }
                balance -= bet; 
                updateBalanceUI();
                document.getElementById('wgStatus').innerText = \`\${color} ကို \${bet} ကျပ် လောင်းပြီးပါပြီ။\`;
            }
        </script>
    </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server running on port \${PORT}`);
});

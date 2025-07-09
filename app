<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>10,000 Clickable Objects in 3D Torus - Enhanced Trading System</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #000;
            overflow: hidden;
            font-family: Arial, sans-serif;
        }
        
        // Admin Panel Functions
        function toggleAdminPanel() {
            const panel = document.getElementById('adminPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        
        function adminAuthenticate() {
            const password = document.getElementById('adminPassword').value;
            // In production, this should be properly secured
            if (password === 'admin2024') {
                isAdminAuthenticated = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminContent').style.display = 'block';
                document.getElementById('adminToggleBtn').style.background = '#ff00ff';
            } else {
                alert('Invalid password');
            }
        }
        
        function selectCell() {
            const ring = parseInt(document.getElementById('ringSelect').value);
            const box = parseInt(document.getElementById('boxSelect').value);
            
            if (isNaN(ring) || isNaN(box) || ring < 0 || ring > 99 || box < 0 || box > 99) {
                alert('Please enter valid ring (0-99) and box (0-99) numbers');
                return;
            }
            
            selectedCellId = `${ring}.${box}`;
            updateCellDetails();
            highlightSelectedCell(ring, box);
        }
        
        function updateCellDetails() {
            if (!selectedCellId || !boxData[selectedCellId]) return;
            
            const data = boxData[selectedCellId];
            const details = document.getElementById('cellDetails');
            const pnlClass = data.profitLoss >= 0 ? 'profit' : 'loss';
            
            details.innerHTML = `
                <div class="cell-detail-row"><span>Cell ID:</span><span>${selectedCellId}</span></div>
                <div class="cell-detail-row"><span>Status:</span><span>${data.status}</span></div>
                <div class="cell-detail-row ${pnlClass}"><span>P&L:</span><span>${data.profitLoss.toFixed(2)}</span></div>
                <div class="cell-detail-row"><span>Balance:</span><span>${data.accountBalance.toFixed(2)}</span></div>
                <div class="cell-detail-row"><span>Position:</span><span>${data.currentPosition} shares</span></div>
                <div class="cell-detail-row"><span>Last Action:</span><span>${data.lastAction}</span></div>
                <div class="cell-detail-row"><span>Total Trades:</span><span>${data.totalTrades}</span></div>
                <div class="cell-detail-row"><span>Aggressiveness:</span><span>${(data.tradingProfile.aggressiveness * 100).toFixed(1)}%</span></div>
                <div class="cell-detail-row"><span>Portfolio Value:</span><span>${(data.accountBalance + (data.currentPosition * currentPrice)).toFixed(2)}</span></div>
            `;
        }
        
        function highlightSelectedCell(ring, box) {
            objects.forEach(mesh => {
                if (mesh.userData.ringIndex === ring && mesh.userData.boxIndex === box) {
                    mesh.material.color.setHex(0xffff00);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function togglePnLHeatmap() {
            pnlHeatmapEnabled = !pnlHeatmapEnabled;
            const btn = document.getElementById('pnlHeatmapBtn');
            
            if (pnlHeatmapEnabled) {
                btn.textContent = 'Disable P&L Heatmap';
                btn.classList.add('active');
                updatePnLHeatmap();
            } else {
                btn.textContent = 'Enable P&L Heatmap';
                btn.classList.remove('active');
                // Reset colors
                objects.forEach(mesh => {
                    const ring = mesh.userData.ringIndex;
                    const box = mesh.userData.boxIndex;
                    const boxId = `${ring}.${box}`;
                    const data = boxData[boxId];
                    if (data) {
                        const material = TRADING_MATERIALS[data.lastAction];
                        mesh.material.color.copy(material.color);
                        mesh.material.opacity = material.opacity;
                    }
                });
            }
        }
        
        function updatePnLHeatmap() {
            if (!pnlHeatmapEnabled) return;
            
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data) {
                    const pnl = data.profitLoss;
                    const maxPnL = 200; // Scale for color intensity
                    
                    if (pnl > 0) {
                        const intensity = Math.min(pnl / maxPnL, 1);
                        mesh.material.color.setRGB(0, intensity, 0);
                    } else if (pnl < 0) {
                        const intensity = Math.min(Math.abs(pnl) / maxPnL, 1);
                        mesh.material.color.setRGB(intensity, 0, 0);
                    } else {
                        mesh.material.color.setRGB(0.3, 0.3, 0.3);
                    }
                    mesh.material.opacity = 0.9;
                }
            });
        }
        
        function modifyTraderAggression() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const newAggression = prompt('Enter new aggressiveness (0.0 - 1.0):', '0.5');
            if (newAggression === null) return;
            
            const value = parseFloat(newAggression);
            if (isNaN(value) || value < 0 || value > 1) {
                alert('Please enter a value between 0.0 and 1.0');
                return;
            }
            
            boxData[selectedCellId].tradingProfile.aggressiveness = value;
            updateCellDetails();
        }
        
        function forceTraderAction(action) {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            executeTradeAction(selectedCellId, action);
            updateCellDetails();
            if (pnlHeatmapEnabled) updatePnLHeatmap();
        }
        
        function resetTraderBalance() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const data = boxData[selectedCellId];
            data.accountBalance = 1000.00;
            data.currentPosition = 0;
            data.profitLoss = 0.00;
            data.totalTrades = 0;
            updateCellDetails();
            if (pnlHeatmapEnabled) updatePnLHeatmap();
        }
        
        function setCustomBalance() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const newBalance = prompt('Enter new balance:', '1000');
            if (newBalance === null) return;
            
            const value = parseFloat(newBalance);
            if (isNaN(value) || value < 0) {
                alert('Please enter a valid positive number');
                return;
            }
            
            boxData[selectedCellId].accountBalance = value;
            updateCellDetails();
        }
        
        function highlightProfitable() {
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data && data.profitLoss > 0) {
                    mesh.material.color.setHex(0x00ff00);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function highlightLosses() {
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data && data.profitLoss < 0) {
                    mesh.material.color.setHex(0xff0000);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function exportTraderData() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const data = boxData[selectedCellId];
            const exportData = JSON.stringify(data, null, 2);
            
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trader_${selectedCellId}_data.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function exportAllData() {
            const exportData = {
                timestamp: new Date().toISOString(),
                currentPrice: currentPrice,
                priceHistory: priceHistory,
                traders: boxData
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all_traders_data_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw !important;
            height: 100vh !important;
            display: block;
        }
        
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            z-index: 100;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            display: none;
        }
        
        #stats {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            z-index: 100;
            background: rgba(0,0,0,0.7);
            padding: 10px;
            border-radius: 5px;
            text-align: right;
            display: none;
        }
        
        #title {
            position: absolute;
            top: 20px;
            left: 20px;
            color: white;
            z-index: 100;
            text-align: left;
            font-family: Arial, sans-serif;
        }
        
        #title h1 {
            margin: 0;
            font-size: 1.8em;
            font-weight: bold;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            color: #4a90e2;
        }
        
        #title p {
            margin: 5px 0 0 0;
            font-size: 0.9em;
            color: #ccc;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
        }
        
        #controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 100;
            display: flex;
            gap: 10px;
        }
        
        .control-btn {
            background: rgba(0, 150, 255, 0.8);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .control-btn:hover {
            background: rgba(0, 150, 255, 1);
        }
        
        .control-btn.active {
            background: rgba(255, 107, 107, 0.8);
        }
        
        /* Trading Panel */
        #tradingPanel {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 350px;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #4a90e2;
            border-radius: 10px;
            color: white;
            padding: 20px;
            z-index: 100;
        }
        
        #tradingPanel h3 {
            margin: 0 0 15px 0;
            color: #4a90e2;
            text-align: center;
        }
        
        .price-input-section {
            margin-bottom: 20px;
        }
        
        #priceField {
            width: 70%;
            padding: 8px;
            border: none;
            border-radius: 5px;
            background: #333;
            color: white;
            font-size: 16px;
        }
        
        #submitPriceBtn {
            width: 25%;
            padding: 8px;
            background: #00ff88;
            color: black;
            border: none;
            border-radius: 5px;
            margin-left: 5%;
            cursor: pointer;
            font-weight: bold;
        }
        
        #submitPriceBtn:hover {
            background: #00cc6a;
        }
        
        #submitPriceBtn:disabled {
            background: #666;
            color: #999;
            cursor: not-allowed;
        }
        
        .price-chart {
            height: 150px;
            background: #222;
            border: 1px solid #555;
            border-radius: 5px;
            margin: 10px 0;
            position: relative;
            overflow: hidden;
        }
        
        .chart-line {
            position: absolute;
            bottom: 0;
            width: 2px;
            background: #00ff88;
            transition: all 0.3s ease;
        }
        
        .trading-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            font-size: 0.9em;
        }
        
        .stat-item {
            background: #333;
            padding: 8px;
            border-radius: 3px;
            text-align: center;
        }
        
        .stat-value {
            font-weight: bold;
            color: #4a90e2;
        }
        
        .trading-controls button {
            width: 100%;
            padding: 8px;
            margin: 5px 0;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            background: #4a90e2;
            color: white;
        }
        
        .trading-controls button:hover {
            background: #357abd;
        }
        
        /* Simulation Panel */
        #simulationPanel {
            margin-top: 15px;
            padding: 15px;
            background: rgba(40, 0, 80, 0.3);
            border: 1px solid #8b4ae2;
            border-radius: 5px;
        }
        
        #simulationPanel h4 {
            margin: 0 0 10px 0;
            color: #8b4ae2;
            font-size: 0.95em;
        }
        
        .simulation-controls {
            display: flex;
            gap: 10px;
            align-items: center;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }
        
        .simulation-controls button {
            padding: 6px 12px;
            background: #8b4ae2;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.85em;
        }
        
        .simulation-controls button:hover {
            background: #7a3dd1;
        }
        
        .simulation-controls button:disabled {
            background: #555;
            cursor: not-allowed;
        }
        
        .simulation-controls input[type="file"] {
            display: none;
        }
        
        .simulation-controls label {
            padding: 6px 12px;
            background: #4a90e2;
            color: white;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.85em;
        }
        
        .simulation-controls label:hover {
            background: #357abd;
        }
        
        .date-range-selector {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 5px;
        }
        
        .date-range-selector label {
            color: white;
            font-size: 0.85em;
            margin-right: 10px;
        }
        
        .date-range-selector input[type="date"] {
            padding: 4px 8px;
            background: #333;
            color: white;
            border: 1px solid #666;
            border-radius: 3px;
            margin-right: 15px;
        }
        
        .date-range-selector button {
            padding: 5px 10px;
            background: #00ff88;
            color: black;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 0.85em;
            font-weight: bold;
        }
        
        .date-range-selector button:hover {
            background: #00cc6a;
        }
        
        .simulation-speed {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.85em;
            color: white;
        }
        
        .simulation-speed input[type="range"] {
            width: 100px;
        }
        
        .simulation-status {
            font-size: 0.85em;
            color: #8b4ae2;
            margin-top: 5px;
        }
        
        .data-info {
            font-size: 0.8em;
            color: #999;
            margin-top: 5px;
        }
        
        /* Admin Panel */
        #adminPanel {
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: rgba(20, 0, 40, 0.95);
            border: 2px solid #ff00ff;
            border-radius: 10px;
            padding: 15px;
            color: white;
            font-size: 12px;
            max-width: 400px;
            display: none;
            z-index: 150;
        }
        
        #adminPanel h4 {
            margin: 0 0 10px 0;
            color: #ff00ff;
            text-align: center;
        }
        
        .admin-login {
            text-align: center;
            padding: 20px;
        }
        
        .admin-login input {
            padding: 8px;
            margin: 10px 0;
            width: 200px;
            background: #333;
            border: 1px solid #ff00ff;
            color: white;
            border-radius: 5px;
        }
        
        .admin-login button {
            padding: 8px 20px;
            background: #ff00ff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .admin-content {
            display: none;
        }
        
        .cell-selector {
            margin: 10px 0;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        
        .cell-selector input {
            padding: 5px;
            background: #333;
            border: 1px solid #666;
            color: white;
            border-radius: 3px;
        }
        
        .cell-details {
            background: #1a1a1a;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-family: monospace;
            max-height: 300px;
            overflow-y: auto;
        }
        
        .cell-detail-row {
            display: flex;
            justify-content: space-between;
            padding: 3px 0;
            border-bottom: 1px solid #333;
        }
        
        .cell-detail-row.profit {
            color: #00ff88;
        }
        
        .cell-detail-row.loss {
            color: #ff4444;
        }
        
        .admin-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            margin-top: 10px;
        }
        
        .admin-actions button {
            padding: 5px;
            background: #663399;
            color: white;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
        }
        
        .admin-actions button:hover {
            background: #7d4bb8;
        }
        
        .pnl-heat-toggle {
            margin: 10px 0;
            text-align: center;
        }
        
        .pnl-heat-toggle button {
            padding: 8px 15px;
            background: #ff6600;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }
        
        .pnl-heat-toggle button.active {
            background: #00ff00;
        }
    </style>
</head>
<body>
    <div id="title">
        <h1>Eye of the Market</h1>
        <p>Enhanced Trading System v2.0 - WORKING VERSION - Portfolio by Refik Baris Ozcelik</p>
    </div>
    
    <!-- Trading Panel -->
    <div id="tradingPanel">
        <h3>Trading System</h3>
        
        <div class="price-input-section">
            <div style="margin-bottom: 10px;">
                <label>Current Price: $<span id="currentPrice">100.00</span></label>
            </div>
            <div style="display: flex;">
                <input type="number" id="priceField" placeholder="Enter new price" step="0.01" min="0.01">
                <button id="submitPriceBtn" onclick="submitPrice()">Update</button>
            </div>
        </div>
        
        <div class="price-chart" id="priceChart">
            <!-- Chart lines will be generated here -->
        </div>
        
        <div class="ema-display" style="margin-top: 10px; padding: 10px; background: #1a1a1a; border-radius: 5px;">
            <h4 style="margin: 0 0 10px 0; color: #4a90e2; font-size: 0.9em;">Market EMAs</h4>
            <div style="font-size: 0.85em;">
                <div>Fast EMA (9): <span id="fastEMA" style="color: #00ff88;">--</span></div>
                <div>Medium EMA (21): <span id="mediumEMA" style="color: #ffaa00;">--</span></div>
                <div>Slow EMA (50): <span id="slowEMA" style="color: #ff4444;">--</span></div>
                <div style="margin-top: 5px; font-size: 0.8em; color: #666;">
                    Signal: <span id="marketSignal" style="font-weight: bold;">--</span>
                </div>
            </div>
        </div>
        
        <div class="trading-stats">
            <div class="stat-item">
                <div>Active Traders</div>
                <div class="stat-value" id="activeTraders">10000</div>
            </div>
            <div class="stat-item">
                <div>Last Update</div>
                <div class="stat-value" id="lastUpdate">--</div>
            </div>
            <div class="stat-item">
                <div>Buying</div>
                <div class="stat-value" id="buyingCount">--</div>
            </div>
            <div class="stat-item">
                <div>Selling</div>
                <div class="stat-value" id="sellingCount">--</div>
            </div>
            <div class="stat-item">
                <div>Holding</div>
                <div class="stat-value" id="holdingCount">--</div>
            </div>
            <div class="stat-item">
                <div>Processing</div>
                <div class="stat-value" id="processingStatus">Ready</div>
            </div>
        </div>
        
        <div class="trading-controls">
            <button onclick="resetAllBalances()">Reset All Balances</button>
        </div>
        
        <div id="simulationPanel">
            <h4>📊 Historical Data Simulation</h4>
            <div class="simulation-controls">
                <input type="file" id="csvFileInput" accept=".csv" onchange="loadHistoricalData(event)">
                <label for="csvFileInput">Load CSV</label>
                <button id="loadUSDJPYBtn" onclick="loadUSDJPYData()">Load USD/JPY (5019 days)</button>
                <button id="startSimBtn" onclick="startSimulation()" disabled>Start</button>
                <button id="pauseSimBtn" onclick="pauseSimulation()" disabled>Pause</button>
                <button id="stopSimBtn" onclick="stopSimulation()" disabled>Stop</button>
            </div>
            
            <div class="date-range-selector" id="dateRangeSelector" style="display: none;">
                <label>From:</label>
                <input type="date" id="startDate" value="2022-01-01">
                <label>To:</label>
                <input type="date" id="endDate" value="2025-07-07">
                <button onclick="applyDateRange()">Apply Range</button>
                <button onclick="useFullRange()">Use Full Range</button>
            </div>
            
            <div class="simulation-speed">
                <span>Speed:</span>
                <input type="range" id="simSpeed" min="50" max="2000" value="500" step="50">
                <span id="simSpeedValue">500ms</span>
            </div>
            <div class="simulation-status" id="simStatus">Click "Load USD/JPY" to start</div>
            <div class="data-info" id="dataInfo"></div>
        </div>
    </div>
    
    <div id="info">
        <div>🎯 Working Version: Individual trading decisions active</div>
        <div>Mouse: Rotate | Wheel: Zoom | Click: Highlight</div>
        <div>Enter prices to see unique trader behaviors</div>
        <div>Objects: <span id="objectCount">10,000</span> unique traders</div>
    </div>
    
    <div id="stats">
        <div>Clicked: <span id="clickedCount">0</span></div>
        <div>FPS: <span id="fps">60</span></div>
        <div>Camera: <span id="cameraPos">X: 0, Y: 0, Z: 25</span></div>
    </div>
    
    <div id="controls">
        <button id="fixedViewBtn" class="control-btn" onclick="setFixedView()">Fixed View</button>
        <button id="adminToggleBtn" class="control-btn" onclick="toggleAdminPanel()">Admin Access</button>
    </div>
    
    <!-- Admin Panel -->
    <div id="adminPanel">
        <h4>🔐 Admin Control Panel</h4>
        
        <div class="admin-login" id="adminLogin">
            <input type="password" id="adminPassword" placeholder="Admin Password">
            <button onclick="adminAuthenticate()">Login</button>
        </div>
        
        <div class="admin-content" id="adminContent">
            <div class="cell-selector">
                <input type="number" id="ringSelect" placeholder="Ring (0-99)" min="0" max="99">
                <input type="number" id="boxSelect" placeholder="Box (0-99)" min="0" max="99">
                <button onclick="selectCell()" style="grid-column: span 2; padding: 5px; background: #ff00ff; color: white; border: none; border-radius: 3px; cursor: pointer;">Select Cell</button>
            </div>
            
            <div class="cell-details" id="cellDetails">
                <div style="text-align: center; color: #666;">No cell selected</div>
            </div>
            
            <div class="pnl-heat-toggle">
                <button id="pnlHeatmapBtn" onclick="togglePnLHeatmap()">Enable P&L Heatmap</button>
            </div>
            
            <div class="admin-actions">
                <button onclick="modifyTraderAggression()">Modify Aggression</button>
                <button onclick="forceTraderAction('BUY')">Force Buy</button>
                <button onclick="forceTraderAction('SELL')">Force Sell</button>
                <button onclick="resetTraderBalance()">Reset Balance</button>
                <button onclick="setCustomBalance()">Set Balance</button>
                <button onclick="exportTraderData()">Export Data</button>
                <button onclick="highlightProfitable()">Show Profitable</button>
                <button onclick="highlightLosses()">Show Losses</button>
            </div>
            
            <div style="margin-top: 10px; text-align: center;">
                <button onclick="exportAllData()" style="padding: 5px 10px; background: #00bcd4; color: white; border: none; border-radius: 3px; cursor: pointer;">Export All Trader Data</button>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);
        document.body.appendChild(renderer.domElement);

        // Materials
        const normalMaterial = new THREE.MeshBasicMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 });
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.9 });
        
        // Trading materials
        const TRADING_MATERIALS = {
            BUY: new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 }),
            SELL: new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 }),
            HOLD: new THREE.MeshBasicMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 })
        };
        
        // Geometry
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        
        // Arrays to store objects
        const objects = [];
        const clickedObjects = new Set();
        const ringGroups = [];
        
        // Trading system variables
        let currentPrice = 100.00;
        let priceHistory = [100.00];
        let isProcessingTrades = false;
        let boxData = {};
        let selectedCellId = null;
        let pnlHeatmapEnabled = false;
        let isAdminAuthenticated = false;
        
        // Simulation variables
        let simulationData = [];
        let fullSimulationData = []; // Store all data
        let simulationIndex = 0;
        let simulationTimer = null;
        let isSimulationRunning = false;
        let isSimulationPaused = false;
        
        // Controls
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        let targetRotationX = 0, targetRotationY = 0;
        let rotationX = 0, rotationY = 0;
        let zoom = 25;
        let fixedViewMode = false;
        
        // Triple EMA Calculator Class
        class TripleEMACalculator {
            constructor(fastPeriod = 9, mediumPeriod = 21, slowPeriod = 50) {
                this.fastPeriod = fastPeriod;
                this.mediumPeriod = mediumPeriod;
                this.slowPeriod = slowPeriod;
                
                // Maintain EMA state
                this.fastEMA = null;
                this.mediumEMA = null;
                this.slowEMA = null;
                
                // Track if we have enough data
                this.initialized = false;
                this.priceCount = 0;
            }
            
            // Calculate SMA for initialization
            calculateSMA(prices, period) {
                if (prices.length < period) return null;
                const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
                return sum / period;
            }
            
            // Update EMAs with a new price (maintains state)
            updateWithPrice(newPrice) {
                this.priceCount++;
                
                // For the first price, initialize all EMAs to the price
                if (this.priceCount === 1) {
                    this.fastEMA = newPrice;
                    this.mediumEMA = newPrice;
                    this.slowEMA = newPrice;
                    return;
                }
                
                // Calculate smoothing factors (alpha)
                const fastAlpha = 2 / (this.fastPeriod + 1);
                const mediumAlpha = 2 / (this.mediumPeriod + 1);
                const slowAlpha = 2 / (this.slowPeriod + 1);
                
                // Update EMAs using the standard formula: EMA = (Price * Alpha) + (Previous EMA * (1 - Alpha))
                this.fastEMA = (newPrice * fastAlpha) + (this.fastEMA * (1 - fastAlpha));
                this.mediumEMA = (newPrice * mediumAlpha) + (this.mediumEMA * (1 - mediumAlpha));
                this.slowEMA = (newPrice * slowAlpha) + (this.slowEMA * (1 - slowAlpha));
                
                // Mark as initialized once we have enough data
                // More lenient: initialized after processing at least the fast period
                if (this.priceCount >= this.fastPeriod) {
                    this.initialized = true;
                }
            }
            
            // Initialize from historical prices
            initializeFromHistory(priceHistory) {
                if (priceHistory.length === 0) return;
                
                // Reset state
                this.fastEMA = null;
                this.mediumEMA = null;
                this.slowEMA = null;
                this.priceCount = 0;
                this.initialized = false;
                
                // Process each historical price
                for (let i = 0; i < priceHistory.length; i++) {
                    this.updateWithPrice(priceHistory[i]);
                }
            }
            
            // Get trading signal based on EMA alignment
            getSignal(priceHistory) {
                // Initialize from history if not already done
                if (this.priceCount === 0 && priceHistory.length > 0) {
                    this.initializeFromHistory(priceHistory);
                }
                
                // Need to be initialized before giving signals
                if (!this.initialized) {
                    // More lenient initialization - can start trading once we have enough for our specific slow period
                    if (priceHistory.length < this.slowPeriod) {
                        return 'HOLD';
                    }
                    // Re-initialize with current history
                    this.initializeFromHistory(priceHistory);
                }
                
                // Make sure EMAs are valid numbers
                if (this.fastEMA === null || this.mediumEMA === null || this.slowEMA === null ||
                    isNaN(this.fastEMA) || isNaN(this.mediumEMA) || isNaN(this.slowEMA)) {
                    return 'HOLD';
                }
                
                // Trading logic based on EMA alignment
                // Add small tolerance for numerical precision
                const tolerance = 0.0001;
                
                if (this.fastEMA > this.mediumEMA + tolerance && this.mediumEMA > this.slowEMA + tolerance) {
                    return 'BUY'; // Bullish alignment
                } else if (this.fastEMA < this.mediumEMA - tolerance && this.mediumEMA < this.slowEMA - tolerance) {
                    return 'SELL'; // Bearish alignment
                } else {
                    return 'HOLD'; // Mixed signals
                }
            }
            
            // Get current EMA values
            getEMAValues() {
                return {
                    fast: this.fastEMA,
                    medium: this.mediumEMA,
                    slow: this.slowEMA,
                    initialized: this.initialized
                };
            }
            
            // Legacy method for compatibility
            updateEMAs(priceHistory) {
                if (this.priceCount === 0 && priceHistory.length > 0) {
                    this.initializeFromHistory(priceHistory);
                }
            }
            
            // Legacy method for compatibility
            calculateEMA(prices, period) {
                return this.calculateSMA(prices, period);
            }
        }
        
        // Enhanced BoxTrader class with Triple EMA
        class BoxTrader {
            constructor(boxId, profile) {
                this.boxId = boxId;
                this.profile = profile;
                
                // Create EMA calculator with assigned periods
                if (profile.emaPeriods) {
                    this.emaCalculator = new TripleEMACalculator(
                        profile.emaPeriods.fast,
                        profile.emaPeriods.medium,
                        profile.emaPeriods.slow
                    );
                } else {
                    // Fallback for backward compatibility
                    const speedMultiplier = 1 - (profile.aggressiveness * 0.3);
                    this.emaCalculator = new TripleEMACalculator(
                        Math.round(9 * speedMultiplier),
                        Math.round(21 * speedMultiplier),
                        Math.round(50 * speedMultiplier)
                    );
                }
                
                // Track if this trader has been initialized
                this.isInitialized = false;
            }
            
            makeDecision(currentPrice, priceHistory) {
                const data = boxData[this.boxId];
                if (data.status !== 'Active') return 'HOLD';
                
                // Initialize EMAs from history if not done yet
                if (!this.isInitialized && priceHistory.length > 0) {
                    this.emaCalculator.initializeFromHistory(priceHistory);
                    this.isInitialized = true;
                }
                
                // Get Triple EMA signal
                const signal = this.emaCalculator.getSignal(priceHistory);
                
                // Optional: Add trader personality influence
                // More aggressive traders might act on weaker signals
                if (this.profile.aggressiveness > 0.8 && signal === 'HOLD') {
                    const emas = this.emaCalculator.getEMAValues();
                    
                    // Only try this if EMAs are initialized
                    if (emas.initialized) {
                        // Check for partial bullish alignment
                        if (emas.fast > emas.medium) {
                            // 30% chance to buy on partial signal for aggressive traders
                            if (Math.random() < 0.3) return 'BUY';
                        }
                        
                        // Check for partial bearish alignment
                        if (emas.fast < emas.medium) {
                            // 30% chance to sell on partial signal for aggressive traders
                            if (Math.random() < 0.3) return 'SELL';
                        }
                    }
                }
                
                return signal;
            }
        }
        
        // Initialize traders
        function initializeBoxData() {
            // EMA parameter ranges with proper separation
            const fastEMARange = { min: 5, max: 24 };    // 20 values (5-24)
            const mediumEMARange = { min: 30, max: 54 }; // 25 values (30-54)
            const slowEMARange = { min: 60, max: 79 };   // 20 values (60-79)
            
            // Calculate counts
            const fastCount = fastEMARange.max - fastEMARange.min + 1;     // 20
            const mediumCount = mediumEMARange.max - mediumEMARange.min + 1; // 25
            const slowCount = slowEMARange.max - slowEMARange.min + 1;     // 20
            
            // Debug: Log total combinations
            console.log('=== EMA PARAMETER DISTRIBUTION DEBUG ===');
            console.log(`Fast EMA range: ${fastEMARange.min}-${fastEMARange.max} (${fastCount} values)`);
            console.log(`Medium EMA range: ${mediumEMARange.min}-${mediumEMARange.max} (${mediumCount} values)`);
            console.log(`Slow EMA range: ${slowEMARange.min}-${slowEMARange.max} (${slowCount} values)`);
            console.log(`Total combinations: ${fastCount} × ${mediumCount} × ${slowCount} = ${fastCount * mediumCount * slowCount}`);
            
            let traderIndex = 0;
            let parameterMap = new Map(); // Track parameter distribution
            let ringActivity = new Array(100).fill(0); // Track traders per ring
            
            for (let ring = 0; ring < 100; ring++) {
                for (let box = 0; box < 100; box++) {
                    const boxId = `${ring}.${box}`;
                    
                    // Calculate unique EMA parameters for this trader
                    // Using modulo to systematically assign combinations
                    const slowIndex = Math.floor(traderIndex / (fastCount * mediumCount));
                    const remainderAfterSlow = traderIndex % (fastCount * mediumCount);
                    const mediumIndex = Math.floor(remainderAfterSlow / fastCount);
                    const fastIndex = remainderAfterSlow % fastCount;
                    
                    // Calculate actual EMA periods
                    const fastPeriod = fastEMARange.min + fastIndex;
                    const mediumPeriod = mediumEMARange.min + mediumIndex;
                    const slowPeriod = slowEMARange.min + slowIndex;
                    
                    // Verify parameter validity
                    if (fastPeriod >= mediumPeriod || mediumPeriod >= slowPeriod) {
                        console.error(`INVALID PARAMETERS for trader ${traderIndex}: Fast=${fastPeriod}, Medium=${mediumPeriod}, Slow=${slowPeriod}`);
                    }
                    
                    // Track parameter distribution
                    const paramKey = `${fastPeriod}-${mediumPeriod}-${slowPeriod}`;
                    parameterMap.set(paramKey, (parameterMap.get(paramKey) || 0) + 1);
                    ringActivity[ring]++;
                    
                    // Log first few and last few traders
                    if (traderIndex < 5 || traderIndex > 9995) {
                        console.log(`Trader ${traderIndex} (Ring ${ring}, Box ${box}): Fast=${fastPeriod}, Medium=${mediumPeriod}, Slow=${slowPeriod}`);
                    }
                    
                    // Calculate aggressiveness based on EMA speed
                    const avgPeriod = (fastPeriod + mediumPeriod + slowPeriod) / 3;
                    const minAvg = (5 + 30 + 60) / 3;  // 31.67
                    const maxAvg = (24 + 54 + 79) / 3; // 52.33
                    const aggressiveness = 1 - ((avgPeriod - minAvg) / (maxAvg - minAvg));
                    
                    boxData[boxId] = {
                        id: boxId,
                        status: 'Active',
                        tradingProfile: {
                            aggressiveness: aggressiveness,
                            seed: traderIndex,
                            emaPeriods: {
                                fast: fastPeriod,
                                medium: mediumPeriod,
                                slow: slowPeriod
                            }
                        },
                        accountBalance: 1000.00,
                        initialBalance: 1000.00,
                        currentPosition: 0,
                        lastAction: 'HOLD',
                        totalTrades: 0,
                        profitLoss: 0.00
                    };
                    
                    traderIndex++;
                }
            }
            
            // Debug: Check for duplicate parameters
            console.log(`\n=== PARAMETER DISTRIBUTION CHECK ===`);
            console.log(`Unique parameter combinations: ${parameterMap.size}`);
            const duplicates = Array.from(parameterMap.entries()).filter(([key, count]) => count > 1);
            if (duplicates.length > 0) {
                console.error(`Found ${duplicates.length} duplicate parameter combinations!`);
                duplicates.forEach(([key, count]) => {
                    console.error(`Parameters ${key} assigned to ${count} traders`);
                });
            }
            
            // Debug: Check ring activity
            console.log(`\n=== RING ACTIVITY CHECK ===`);
            const inactiveRings = ringActivity.map((count, index) => ({ ring: index, count }))
                .filter(item => item.count === 0);
            if (inactiveRings.length > 0) {
                console.error(`Found ${inactiveRings.length} rings with no traders!`);
                inactiveRings.forEach(item => {
                    console.error(`Ring ${item.ring}: ${item.count} traders`);
                });
            }
            
            // Sample check: verify some random traders
            console.log(`\n=== SAMPLE VERIFICATION ===`);
            for (let i = 0; i < 10; i++) {
                const randomRing = Math.floor(Math.random() * 100);
                const randomBox = Math.floor(Math.random() * 100);
                const trader = boxData[`${randomRing}.${randomBox}`];
                if (trader) {
                    console.log(`Sample trader ${randomRing}.${randomBox}:`, trader.tradingProfile.emaPeriods);
                }
            }
        }
        
        // Create torus
        function createTorus() {
            const majorRadius = 8;
            const minorRadius = 3;
            const objectsPerRow = 100;
            const objectsPerCircle = 100;
            
            for (let i = 0; i < objectsPerRow; i++) {
                ringGroups[i] = [];
            }
            
            for (let i = 0; i < objectsPerRow; i++) {
                for (let j = 0; j < objectsPerCircle; j++) {
                    const u = (i / objectsPerRow) * Math.PI * 2;
                    const v = (j / objectsPerCircle) * Math.PI * 2;
                    
                    const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
                    const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
                    const z = minorRadius * Math.sin(v);
                    
                    const mesh = new THREE.Mesh(geometry, normalMaterial.clone());
                    mesh.position.set(x, y, z);
                    mesh.userData = { 
                        id: i * objectsPerCircle + j, 
                        clicked: false,
                        ringIndex: i,
                        boxIndex: j
                    };
                    
                    scene.add(mesh);
                    objects.push(mesh);
                    ringGroups[i].push(mesh);
                }
            }
        }
        
        // Mouse controls
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        function onMouseMove(event) {
            if (isMouseDown && !fixedViewMode) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                targetRotationY += deltaX * 0.01;
                targetRotationX += deltaY * 0.01;
                targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, targetRotationX));
                
                mouseX = event.clientX;
                mouseY = event.clientY;
            }
        }

        function onMouseDown(event) {
            isMouseDown = true;
            mouseX = event.clientX;
            mouseY = event.clientY;
        }

        function onMouseUp(event) {
            isMouseDown = false;
        }

        function onMouseClick(event) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(objects);

            if (intersects.length > 0) {
                const clickedObject = intersects[0].object;
                const objectId = clickedObject.userData.id;
                
                if (!clickedObjects.has(objectId)) {
                    clickedObjects.add(objectId);
                    clickedObject.material = highlightMaterial.clone();
                    clickedObject.userData.clicked = true;
                    document.getElementById('clickedCount').textContent = clickedObjects.size;
                }
            }
        }

        function onWheel(event) {
            if (!fixedViewMode) {
                zoom += event.deltaY * 0.01;
                zoom = Math.max(5, Math.min(50, zoom));
            }
        }
        
        // Trading functions
        function submitPrice() {
            const priceField = document.getElementById('priceField');
            const newPrice = parseFloat(priceField.value);
            
            if (!newPrice || newPrice <= 0) {
                alert('Please enter a valid price');
                return;
            }
            
            if (isProcessingTrades) {
                alert('Currently processing trades, please wait...');
                return;
            }
            
            processNewPrice(newPrice);
            priceField.value = '';
        }
        
        function processNewPrice(newPrice) {
            currentPrice = newPrice;
            priceHistory.push(newPrice);
            
            document.getElementById('currentPrice').textContent = newPrice.toFixed(2);
            document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
            updatePriceChart();
            updateMarketEMAs(); // Update EMA display
            
            processAllTradingDecisions();
        }
        
        // Update the main display with market-wide EMAs
        function updateMarketEMAs() {
            const marketEMA = new TripleEMACalculator();
            marketEMA.updateEMAs(priceHistory);
            const emas = marketEMA.getEMAValues();
            const signal = marketEMA.getSignal(priceHistory);
            
            if (document.getElementById('fastEMA')) {
                document.getElementById('fastEMA').textContent = emas.fast ? emas.fast.toFixed(2) : '--';
                document.getElementById('mediumEMA').textContent = emas.medium ? emas.medium.toFixed(2) : '--';
                document.getElementById('slowEMA').textContent = emas.slow ? emas.slow.toFixed(2) : '--';
                
                const signalElement = document.getElementById('marketSignal');
                signalElement.textContent = signal;
                
                // Color code the signal
                switch(signal) {
                    case 'BUY':
                        signalElement.style.color = '#00ff88';
                        break;
                    case 'SELL':
                        signalElement.style.color = '#ff4444';
                        break;
                    default:
                        signalElement.style.color = '#ffaa00';
                }
            }
        }
        
        function processAllTradingDecisions() {
            isProcessingTrades = true;
            document.getElementById('processingStatus').textContent = 'Processing...';
            document.getElementById('submitPriceBtn').disabled = true;
            
            let buyCount = 0, sellCount = 0, holdCount = 0;
            let activeTraderCount = 0;
            let ringActivityMap = new Map(); // Track activity by ring
            
            // Process all traders
            for (let i = 0; i < 10000; i++) {
                const ring = Math.floor(i / 100);
                const box = i % 100;
                const boxId = `${ring}.${box}`;
                
                if (boxData[boxId] && boxData[boxId].status === 'Active') {
                    activeTraderCount++;
                    
                    // Create trader instance
                    const trader = new BoxTrader(boxId, boxData[boxId].tradingProfile);
                    
                    // Get trading decision
                    const action = trader.makeDecision(currentPrice, priceHistory);
                    
                    // Track ring activity
                    if (!ringActivityMap.has(ring)) {
                        ringActivityMap.set(ring, { buy: 0, sell: 0, hold: 0, total: 0 });
                    }
                    const ringStats = ringActivityMap.get(ring);
                    ringStats.total++;
                    
                    // Execute the trade
                    executeTradeAction(boxId, action);
                    
                    // Count actions
                    switch(action) {
                        case 'BUY': 
                            buyCount++; 
                            ringStats.buy++;
                            break;
                        case 'SELL': 
                            sellCount++; 
                            ringStats.sell++;
                            break;
                        case 'HOLD': 
                            holdCount++; 
                            ringStats.hold++;
                            break;
                    }
                }
            }
            
            // Debug: Log trading activity summary
            console.log(`\n=== TRADING ACTIVITY SUMMARY ===`);
            console.log(`Price History Length: ${priceHistory.length}`);
            console.log(`Active Traders: ${activeTraderCount}/10000`);
            console.log(`Actions: BUY=${buyCount}, SELL=${sellCount}, HOLD=${holdCount}`);
            console.log(`Total Actions: ${buyCount + sellCount + holdCount}`);
            
            // Check for inactive rings
            const inactiveRings = [];
            for (let ring = 0; ring < 100; ring++) {
                if (!ringActivityMap.has(ring)) {
                    inactiveRings.push(ring);
                }
            }
            
            if (inactiveRings.length > 0) {
                console.error(`\n!!! PROBLEM: ${inactiveRings.length} rings have NO active traders!`);
                console.error(`Inactive rings: ${inactiveRings.slice(0, 10).join(', ')}...`);
            }
            
            // Sample check: Log activity for first and last 5 rings
            console.log(`\n=== RING ACTIVITY SAMPLE ===`);
            for (let ring = 0; ring < 5; ring++) {
                const stats = ringActivityMap.get(ring);
                if (stats) {
                    console.log(`Ring ${ring}: ${stats.total} traders (B:${stats.buy} S:${stats.sell} H:${stats.hold})`);
                } else {
                    console.log(`Ring ${ring}: NO ACTIVITY!`);
                }
            }
            
            // Check a specific inactive trader
            if (activeTraderCount < 10000) {
                console.log(`\n=== INVESTIGATING INACTIVE TRADERS ===`);
                for (let i = 0; i < 100; i++) {
                    const ring = Math.floor(Math.random() * 100);
                    const box = Math.floor(Math.random() * 100);
                    const boxId = `${ring}.${box}`;
                    const trader = boxData[boxId];
                    
                    if (trader) {
                        const testTrader = new BoxTrader(boxId, trader.tradingProfile);
                        const testSignal = testTrader.emaCalculator.getSignal(priceHistory);
                        const emas = testTrader.emaCalculator.getEMAValues();
                        
                        console.log(`\nTrader ${boxId}:`);
                        console.log(`- EMA Periods: ${trader.tradingProfile.emaPeriods.fast}/${trader.tradingProfile.emaPeriods.medium}/${trader.tradingProfile.emaPeriods.slow}`);
                        console.log(`- EMA Values: Fast=${emas.fast?.toFixed(2)}, Medium=${emas.medium?.toFixed(2)}, Slow=${emas.slow?.toFixed(2)}`);
                        console.log(`- Signal: ${testSignal}`);
                        console.log(`- Status: ${trader.status}`);
                        
                        if (i >= 5) break; // Just check a few
                    }
                }
            }
            
            // Update UI stats
            document.getElementById('buyingCount').textContent = buyCount;
            document.getElementById('sellingCount').textContent = sellCount;
            document.getElementById('holdingCount').textContent = holdCount;
            document.getElementById('activeTraders').textContent = activeTraderCount;
            
            isProcessingTrades = false;
            document.getElementById('processingStatus').textContent = 'Complete';
            document.getElementById('submitPriceBtn').disabled = false;
            
            setTimeout(() => {
                if (!isProcessingTrades) {
                    document.getElementById('processingStatus').textContent = 'Ready';
                }
            }, 2000);
        }
        
        function executeTradeAction(boxId, action) {
            const data = boxData[boxId];
            if (!data) return;
            
            const [ringIndex, boxIndex] = boxId.split('.').map(Number);
            const mesh = ringGroups[ringIndex] && ringGroups[ringIndex][boxIndex];
            
            if (!mesh) return;
            
            data.lastAction = action;
            data.totalTrades++;
            
            // Simple trading logic
            const sharePrice = currentPrice;
            const positionSize = Math.floor(Math.random() * 10) + 1;
            
            switch(action) {
                case 'BUY':
                    if (data.accountBalance >= sharePrice * positionSize) {
                        data.currentPosition += positionSize;
                        data.accountBalance -= sharePrice * positionSize;
                    }
                    break;
                case 'SELL':
                    if (data.currentPosition >= positionSize) {
                        data.currentPosition -= positionSize;
                        data.accountBalance += sharePrice * positionSize;
                    }
                    break;
            }
            
            const portfolioValue = data.accountBalance + (data.currentPosition * currentPrice);
            data.profitLoss = portfolioValue - data.initialBalance;
            
            // Update visual
            const material = TRADING_MATERIALS[action];
            mesh.material.color.copy(material.color);
            mesh.material.opacity = material.opacity;
            mesh.material.transparent = true;
        }
        
        function updatePriceChart() {
            const chartContainer = document.getElementById('priceChart');
            const maxPoints = 50;
            
            if (priceHistory.length > maxPoints) {
                priceHistory = priceHistory.slice(-maxPoints);
            }
            
            chartContainer.innerHTML = '';
            
            if (priceHistory.length < 2) return;
            
            const minPrice = Math.min(...priceHistory);
            const maxPrice = Math.max(...priceHistory);
            const priceRange = maxPrice - minPrice || 1;
            
            const chartWidth = chartContainer.offsetWidth;
            const chartHeight = chartContainer.offsetHeight;
            const pointWidth = chartWidth / (priceHistory.length - 1);
            
            for (let i = 1; i < priceHistory.length; i++) {
                const line = document.createElement('div');
                line.className = 'chart-line';
                
                const prevHeight = ((priceHistory[i-1] - minPrice) / priceRange) * chartHeight;
                const currHeight = ((priceHistory[i] - minPrice) / priceRange) * chartHeight;
                
                line.style.left = (i * pointWidth) + 'px';
                line.style.height = Math.abs(currHeight - prevHeight) + 'px';
                line.style.bottom = Math.min(prevHeight, currHeight) + 'px';
                
                if (priceHistory[i] > priceHistory[i-1]) {
                    line.style.background = '#00ff88';
                } else if (priceHistory[i] < priceHistory[i-1]) {
                    line.style.background = '#ff6b6b';
                } else {
                    line.style.background = '#4a90e2';
                }
                
                chartContainer.appendChild(line);
            }
        }
        
        function resetAllBalances() {
            if (confirm('Reset all account balances to $1000?')) {
                for (let boxId in boxData) {
                    boxData[boxId].accountBalance = 1000.00;
                    boxData[boxId].currentPosition = 0;
                    boxData[boxId].profitLoss = 0.00;
                    boxData[boxId].totalTrades = 0;
                    boxData[boxId].lastAction = 'HOLD';
                }
                
                objects.forEach(mesh => {
                    mesh.material.color.copy(normalMaterial.color);
                    mesh.material.opacity = normalMaterial.opacity;
                });
                
                currentPrice = 100.00;
                priceHistory = [100.00];
                document.getElementById('currentPrice').textContent = '100.00';
                updatePriceChart();
                
                alert('All balances reset successfully');
            }
        }
        
        function setFixedView() {
            fixedViewMode = !fixedViewMode;
            const btn = document.getElementById('fixedViewBtn');
            
            if (fixedViewMode) {
                camera.position.set(-12.0, 0.1, 8.0);
                camera.lookAt(0, 0, 0);
                btn.classList.add('active');
                btn.textContent = 'Exit Fixed View';
            } else {
                btn.classList.remove('active');
                btn.textContent = 'Fixed View';
            }
        }
        
        // Event listeners
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('click', onMouseClick);
        document.addEventListener('wheel', onWheel);
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 't') {
                event.preventDefault();
                document.getElementById('priceField').focus();
            }
            
            if (event.key === 'Enter' && event.target.id === 'priceField') {
                submitPrice();
            }
            
            if (event.ctrlKey && event.key === 'e') {
                event.preventDefault();
                const infoPanel = document.getElementById('info');
                const statsPanel = document.getElementById('stats');
                const isVisible = infoPanel.style.display !== 'none';
                
                infoPanel.style.display = isVisible ? 'none' : 'block';
                statsPanel.style.display = isVisible ? 'none' : 'block';
            }
        });
        
        // Window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        window.addEventListener('resize', onWindowResize);

        // FPS counter
        let lastTime = 0;
        let frameCount = 0;
        
        function updateFPS(currentTime) {
            frameCount++;
            if (currentTime - lastTime >= 1000) {
                document.getElementById('fps').textContent = Math.round(frameCount * 1000 / (currentTime - lastTime));
                frameCount = 0;
                lastTime = currentTime;
            }
        }
        
        function updateCameraPosition() {
            const x = Math.round(camera.position.x * 10) / 10;
            const y = Math.round(camera.position.y * 10) / 10;
            const z = Math.round(camera.position.z * 10) / 10;
            document.getElementById('cameraPos').textContent = `X: ${x}, Y: ${y}, Z: ${z}`;
        }

        // Animation loop
        function animate(currentTime) {
            requestAnimationFrame(animate);
            
            if (!fixedViewMode) {
                rotationX += (targetRotationX - rotationX) * 0.1;
                rotationY += (targetRotationY - rotationY) * 0.1;
                
                const radius = zoom;
                camera.position.x = radius * Math.sin(rotationY) * Math.cos(rotationX);
                camera.position.y = radius * Math.sin(rotationX);
                camera.position.z = radius * Math.cos(rotationY) * Math.cos(rotationX);
                camera.lookAt(0, 0, 0);
                
                scene.rotation.y += 0.006;
            }
            
            updateFPS(currentTime);
            updateCameraPosition();
            
            renderer.render(scene, camera);
        }

        // Initialize
        createTorus();
        initializeBoxData();
        camera.position.set(0, 0, 25);
        animate(0);
        
        // Diagnostic function for debugging
        window.debugTradingSystem = function() {
            console.log('=== TRADING SYSTEM DIAGNOSTIC ===');
            console.log(`Price History Length: ${priceHistory.length}`);
            console.log(`Current Price: ${currentPrice}`);
            console.log(`Price History Sample: [${priceHistory.slice(-5).map(p => p.toFixed(2)).join(', ')}]`);
            
            // Check EMA requirements
            const maxSlowPeriod = 79;
            console.log(`\nMaximum slow period: ${maxSlowPeriod}`);
            console.log(`Have enough data for all EMAs: ${priceHistory.length >= maxSlowPeriod}`);
            
            // Count traders by status
            let activeCount = 0;
            let initializedCount = 0;
            let tradersBySignal = { BUY: 0, SELL: 0, HOLD: 0 };
            let sampleTraders = [];
            
            // Check different EMA period combinations
            let periodCombinations = new Map();
            
            for (let ring = 0; ring < 100; ring++) {
                for (let box = 0; box < 100; box++) {
                    const boxId = `${ring}.${box}`;
                    const traderData = boxData[boxId];
                    
                    if (traderData && traderData.status === 'Active') {
                        activeCount++;
                        
                        // Create trader and check signal
                        const trader = new BoxTrader(boxId, traderData.tradingProfile);
                        trader.emaCalculator.initializeFromHistory(priceHistory);
                        
                        const emas = trader.emaCalculator.getEMAValues();
                        const signal = trader.emaCalculator.getSignal(priceHistory);
                        
                        if (emas.initialized) {
                            initializedCount++;
                        }
                        
                        tradersBySignal[signal]++;
                        
                        // Track period combinations
                        const periodKey = `${traderData.tradingProfile.emaPeriods.fast}-${traderData.tradingProfile.emaPeriods.medium}-${traderData.tradingProfile.emaPeriods.slow}`;
                        periodCombinations.set(periodKey, signal);
                        
                        // Collect diverse sample traders
                        if (sampleTraders.length < 10 && (signal === 'BUY' || signal === 'SELL' || sampleTraders.length < 5)) {
                            sampleTraders.push({
                                id: boxId,
                                periods: traderData.tradingProfile.emaPeriods,
                                emas: emas,
                                signal: signal
                            });
                        }
                    }
                }
            }
            
            console.log(`\nActive Traders: ${activeCount}/10000`);
            console.log(`Initialized Traders: ${initializedCount}/10000`);
            console.log(`Unique Period Combinations: ${periodCombinations.size}`);
            console.log(`Signals: BUY=${tradersBySignal.BUY}, SELL=${tradersBySignal.SELL}, HOLD=${tradersBySignal.HOLD}`);
            
            console.log('\nSample Traders:');
            sampleTraders.forEach(t => {
                console.log(`Trader ${t.id}:`);
                console.log(`  Periods: Fast=${t.periods.fast}, Medium=${t.periods.medium}, Slow=${t.periods.slow}`);
                console.log(`  EMAs: Fast=${t.emas.fast?.toFixed(2)}, Medium=${t.emas.medium?.toFixed(2)}, Slow=${t.emas.slow?.toFixed(2)}`);
                console.log(`  Initialized: ${t.emas.initialized}`);
                console.log(`  Signal: ${t.signal}`);
            });
            
            // Show signal distribution by EMA speed
            console.log('\nSignal Distribution by Average Period:');
            let fastTraders = { total: 0, buy: 0, sell: 0, hold: 0 };
            let slowTraders = { total: 0, buy: 0, sell: 0, hold: 0 };
            
            for (let [periods, signal] of periodCombinations) {
                const [fast, medium, slow] = periods.split('-').map(Number);
                const avgPeriod = (fast + medium + slow) / 3;
                
                if (avgPeriod < 40) {
                    fastTraders.total++;
                    fastTraders[signal.toLowerCase()]++;
                } else {
                    slowTraders.total++;
                    slowTraders[signal.toLowerCase()]++;
                }
            }
            
            console.log(`Fast traders (avg < 40): ${fastTraders.buy} BUY, ${fastTraders.sell} SELL, ${fastTraders.hold} HOLD`);
            console.log(`Slow traders (avg >= 40): ${slowTraders.buy} BUY, ${slowTraders.sell} SELL, ${slowTraders.hold} HOLD`);
            
            return { 
                activeCount, 
                initializedCount,
                priceHistoryLength: priceHistory.length, 
                signals: tradersBySignal,
                uniqueCombinations: periodCombinations.size
            };
        };
        
        // Fix check function
        window.fixTradingSystem = function() {
            console.log('Checking for issues...');
            
            // Make sure all traders are initialized
            let fixedCount = 0;
            for (let ring = 0; ring < 100; ring++) {
                for (let box = 0; box < 100; box++) {
                    const boxId = `${ring}.${box}`;
                    if (!boxData[boxId]) {
                        console.error(`Missing trader data for ${boxId}!`);
                        fixedCount++;
                    }
                }
            }
            
            if (fixedCount > 0) {
                console.log(`Found ${fixedCount} missing traders. Reinitializing...`);
                initializeBoxData();
            }
            
            // Add more prices if needed
            if (priceHistory.length < 80) {
                console.log(`Adding dummy prices to reach 80 (current: ${priceHistory.length})`);
                while (priceHistory.length < 80) {
                    priceHistory.push(100 + (Math.random() - 0.5) * 10);
                }
                updateMarketEMAs();
            }
            
            console.log('Fix complete. Run window.debugTradingSystem() to check status.');
        };
        
        // Admin Panel Functions
        function toggleAdminPanel() {
            const panel = document.getElementById('adminPanel');
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
        
        function adminAuthenticate() {
            const password = document.getElementById('adminPassword').value;
            // In production, this should be properly secured
            if (password === 'admin2024') {
                isAdminAuthenticated = true;
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminContent').style.display = 'block';
                document.getElementById('adminToggleBtn').style.background = '#ff00ff';
            } else {
                alert('Invalid password');
            }
        }
        
        function selectCell() {
            const ring = parseInt(document.getElementById('ringSelect').value);
            const box = parseInt(document.getElementById('boxSelect').value);
            
            if (isNaN(ring) || isNaN(box) || ring < 0 || ring > 99 || box < 0 || box > 99) {
                alert('Please enter valid ring (0-99) and box (0-99) numbers');
                return;
            }
            
            selectedCellId = `${ring}.${box}`;
            updateCellDetails();
            highlightSelectedCell(ring, box);
        }
        
        function updateCellDetails() {
            if (!selectedCellId || !boxData[selectedCellId]) return;
            
            const data = boxData[selectedCellId];
            const details = document.getElementById('cellDetails');
            const pnlClass = data.profitLoss >= 0 ? 'profit' : 'loss';
            
            details.innerHTML = `
                <div class="cell-detail-row"><span>Cell ID:</span><span>${selectedCellId}</span></div>
                <div class="cell-detail-row"><span>Status:</span><span>${data.status}</span></div>
                <div class="cell-detail-row ${pnlClass}"><span>P&L:</span><span>${data.profitLoss.toFixed(2)}</span></div>
                <div class="cell-detail-row"><span>Balance:</span><span>${data.accountBalance.toFixed(2)}</span></div>
                <div class="cell-detail-row"><span>Position:</span><span>${data.currentPosition} shares</span></div>
                <div class="cell-detail-row"><span>Last Action:</span><span>${data.lastAction}</span></div>
                <div class="cell-detail-row"><span>Total Trades:</span><span>${data.totalTrades}</span></div>
                <div class="cell-detail-row"><span>Aggressiveness:</span><span>${(data.tradingProfile.aggressiveness * 100).toFixed(1)}%</span></div>
                <div class="cell-detail-row"><span>Portfolio Value:</span><span>${(data.accountBalance + (data.currentPosition * currentPrice)).toFixed(2)}</span></div>
            `;
        }
        
        function highlightSelectedCell(ring, box) {
            objects.forEach(mesh => {
                if (mesh.userData.ringIndex === ring && mesh.userData.boxIndex === box) {
                    mesh.material.color.setHex(0xffff00);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function togglePnLHeatmap() {
            pnlHeatmapEnabled = !pnlHeatmapEnabled;
            const btn = document.getElementById('pnlHeatmapBtn');
            
            if (pnlHeatmapEnabled) {
                btn.textContent = 'Disable P&L Heatmap';
                btn.classList.add('active');
                updatePnLHeatmap();
            } else {
                btn.textContent = 'Enable P&L Heatmap';
                btn.classList.remove('active');
                // Reset colors
                objects.forEach(mesh => {
                    const ring = mesh.userData.ringIndex;
                    const box = mesh.userData.boxIndex;
                    const boxId = `${ring}.${box}`;
                    const data = boxData[boxId];
                    if (data) {
                        const material = TRADING_MATERIALS[data.lastAction];
                        mesh.material.color.copy(material.color);
                        mesh.material.opacity = material.opacity;
                    }
                });
            }
        }
        
        function updatePnLHeatmap() {
            if (!pnlHeatmapEnabled) return;
            
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data) {
                    const pnl = data.profitLoss;
                    const maxPnL = 200; // Scale for color intensity
                    
                    if (pnl > 0) {
                        const intensity = Math.min(pnl / maxPnL, 1);
                        mesh.material.color.setRGB(0, intensity, 0);
                    } else if (pnl < 0) {
                        const intensity = Math.min(Math.abs(pnl) / maxPnL, 1);
                        mesh.material.color.setRGB(intensity, 0, 0);
                    } else {
                        mesh.material.color.setRGB(0.3, 0.3, 0.3);
                    }
                    mesh.material.opacity = 0.9;
                }
            });
        }
        
        function modifyTraderAggression() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const newAggression = prompt('Enter new aggressiveness (0.0 - 1.0):', '0.5');
            if (newAggression === null) return;
            
            const value = parseFloat(newAggression);
            if (isNaN(value) || value < 0 || value > 1) {
                alert('Please enter a value between 0.0 and 1.0');
                return;
            }
            
            boxData[selectedCellId].tradingProfile.aggressiveness = value;
            updateCellDetails();
        }
        
        function forceTraderAction(action) {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            executeTradeAction(selectedCellId, action);
            updateCellDetails();
            if (pnlHeatmapEnabled) updatePnLHeatmap();
        }
        
        function resetTraderBalance() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const data = boxData[selectedCellId];
            data.accountBalance = 1000.00;
            data.currentPosition = 0;
            data.profitLoss = 0.00;
            data.totalTrades = 0;
            updateCellDetails();
            if (pnlHeatmapEnabled) updatePnLHeatmap();
        }
        
        function setCustomBalance() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const newBalance = prompt('Enter new balance:', '1000');
            if (newBalance === null) return;
            
            const value = parseFloat(newBalance);
            if (isNaN(value) || value < 0) {
                alert('Please enter a valid positive number');
                return;
            }
            
            boxData[selectedCellId].accountBalance = value;
            updateCellDetails();
        }
        
        function highlightProfitable() {
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data && data.profitLoss > 0) {
                    mesh.material.color.setHex(0x00ff00);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function highlightLosses() {
            objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = boxData[boxId];
                
                if (data && data.profitLoss < 0) {
                    mesh.material.color.setHex(0xff0000);
                    mesh.material.opacity = 1;
                }
            });
        }
        
        function exportTraderData() {
            if (!selectedCellId) {
                alert('Please select a cell first');
                return;
            }
            
            const data = boxData[selectedCellId];
            const exportData = JSON.stringify(data, null, 2);
            
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `trader_${selectedCellId}_data.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        function exportAllData() {
            const exportData = {
                timestamp: new Date().toISOString(),
                currentPrice: currentPrice,
                priceHistory: priceHistory,
                traders: boxData
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `all_traders_data_${new Date().getTime()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        
        // Update the processAllTradingDecisions to also update heatmap
        const originalProcessAllTradingDecisions = processAllTradingDecisions;
        processAllTradingDecisions = function() {
            originalProcessAllTradingDecisions();
            if (pnlHeatmapEnabled) {
                setTimeout(updatePnLHeatmap, 100);
            }
        };
        
        // Simulation Functions
        async function loadHistoricalData(event) {
            const file = event ? event.target.files[0] : null;
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const csvContent = e.target.result;
                    
                    // Check if this looks like the USDJPY_D1.csv format (no headers, date format)
                    const firstLine = csvContent.split('\n')[0];
                    if (firstLine.includes('00:00') && firstLine.split(',').length >= 5) {
                        // This is likely the USDJPY_D1.csv format
                        parseUSDJPYData(csvContent);
                    } else {
                        // Try standard CSV with headers
                        parseHistoricalData(csvContent);
                    }
                };
                reader.readAsText(file);
            }
        }
        
        async function loadUSDJPYData() {
            try {
                document.getElementById('simStatus').textContent = 'Please use "Load CSV" to upload USDJPY_D1.csv file';
                
                // Since window.fs is not available, guide user to upload the file
                alert('Please click "Load CSV" and select the USDJPY_D1.csv file with 5,019 days of data');
                
                // Simulate a click on the file input
                document.getElementById('csvFileInput').click();
            } catch (error) {
                document.getElementById('simStatus').textContent = 'Please use Load CSV button';
                console.error('Error:', error);
            }
        }
        
        function parseUSDJPYData(csvContent) {
            const lines = csvContent.trim().split('\n');
            fullSimulationData = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(',');
                if (parts.length >= 5) {
                    // Extract: date/time, open, high, low, close
                    const dateTime = parts[0];
                    const open = parseFloat(parts[1]);
                    const high = parseFloat(parts[2]);
                    const low = parseFloat(parts[3]);
                    const close = parseFloat(parts[4]);
                    
                    if (!isNaN(close)) {
                        fullSimulationData.push({
                            date: dateTime.split(' ')[0], // Extract just the date
                            dateTime: dateTime,
                            open: open,
                            high: high,
                            low: low,
                            close: close,
                            price: close // Use close price for simulation
                        });
                    }
                }
            }
            
            if (fullSimulationData.length > 0) {
                // Show date range selector
                document.getElementById('dateRangeSelector').style.display = 'block';
                
                // Set date range inputs
                const firstDate = fullSimulationData[0].date;
                const lastDate = fullSimulationData[fullSimulationData.length - 1].date;
                document.getElementById('startDate').min = firstDate;
                document.getElementById('startDate').max = lastDate;
                document.getElementById('endDate').min = firstDate;
                document.getElementById('endDate').max = lastDate;
                document.getElementById('endDate').value = lastDate;
                
                // Default to last 3 years of data
                const threeYearsAgo = new Date(lastDate);
                threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
                document.getElementById('startDate').value = threeYearsAgo.toISOString().split('T')[0];
                
                document.getElementById('simStatus').textContent = `Loaded ${fullSimulationData.length} days (${firstDate} to ${lastDate})`;
                document.getElementById('dataInfo').textContent = `Full dataset: ${fullSimulationData.length} trading days`;
                
                // Apply default date range
                applyDateRange();
            } else {
                document.getElementById('simStatus').textContent = 'No valid data found';
            }
        }
        
        function applyDateRange() {
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            
            simulationData = fullSimulationData.filter(item => {
                return item.date >= startDate && item.date <= endDate;
            });
            
            if (simulationData.length > 0) {
                document.getElementById('simStatus').textContent = 
                    `Selected ${simulationData.length} days (${startDate} to ${endDate})`;
                document.getElementById('startSimBtn').disabled = false;
                simulationIndex = 0;
                
                // Show price range for selected period
                const prices = simulationData.map(d => d.close);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                document.getElementById('dataInfo').textContent = 
                    `Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} JPY`;
            } else {
                document.getElementById('simStatus').textContent = 'No data in selected range';
                document.getElementById('startSimBtn').disabled = true;
            }
        }
        
        function useFullRange() {
            if (fullSimulationData.length > 0) {
                document.getElementById('startDate').value = fullSimulationData[0].date;
                document.getElementById('endDate').value = fullSimulationData[fullSimulationData.length - 1].date;
                applyDateRange();
            }
        }
        
        function parseHistoricalData(csvContent) {
            // Original parsing function for other CSV formats
            const lines = csvContent.trim().split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            
            simulationData = [];
            
            for (let i = 1; i < lines.length; i++) {
                const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                if (!matches) continue;
                
                const values = matches.map(v => v.replace(/"/g, '').trim());
                
                const priceIndex = headers.findIndex(h => h.toLowerCase().includes('price'));
                const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
                
                if (priceIndex >= 0 && priceIndex < values.length) {
                    const price = parseFloat(values[priceIndex]);
                    if (!isNaN(price)) {
                        simulationData.push({
                            date: dateIndex >= 0 ? values[dateIndex] : `Day ${i}`,
                            price: price
                        });
                    }
                }
            }
            
            simulationData.reverse();
            
            if (simulationData.length > 0) {
                document.getElementById('simStatus').textContent = `Loaded ${simulationData.length} price points`;
                document.getElementById('startSimBtn').disabled = false;
                simulationIndex = 0;
            } else {
                document.getElementById('simStatus').textContent = 'No valid price data found';
            }
        }
        
        function startSimulation() {
            if (simulationData.length === 0) return;
            
            if (isSimulationPaused) {
                // Resume from pause
                isSimulationPaused = false;
                isSimulationRunning = true;
                updateSimulationButtons();
                runSimulationStep();
                return;
            }
            
            // Reset if starting fresh
            if (simulationIndex === 0) {
                resetAllBalances(true); // Silent reset
                priceHistory = []; // Clear price history
            }
            
            isSimulationRunning = true;
            isSimulationPaused = false;
            updateSimulationButtons();
            runSimulationStep();
        }
        
        function pauseSimulation() {
            isSimulationPaused = true;
            isSimulationRunning = false;
            clearTimeout(simulationTimer);
            updateSimulationButtons();
            document.getElementById('simStatus').textContent = `Paused at ${simulationIndex}/${simulationData.length}`;
        }
        
        function stopSimulation() {
            isSimulationRunning = false;
            isSimulationPaused = false;
            clearTimeout(simulationTimer);
            simulationIndex = 0;
            updateSimulationButtons();
            document.getElementById('simStatus').textContent = `Stopped. Ready to restart.`;
        }
        
        function runSimulationStep() {
            if (!isSimulationRunning || simulationIndex >= simulationData.length) {
                if (simulationIndex >= simulationData.length) {
                    stopSimulation();
                    document.getElementById('simStatus').textContent = `Simulation complete! Processed ${simulationData.length} prices`;
                }
                return;
            }
            
            const dataPoint = simulationData[simulationIndex];
            processNewPrice(dataPoint.price);
            
            document.getElementById('simStatus').textContent = 
                `Processing: ${dataPoint.date} - ${dataPoint.price.toFixed(2)} (${simulationIndex + 1}/${simulationData.length})`;
            
            simulationIndex++;
            
            const speed = parseInt(document.getElementById('simSpeed').value);
            simulationTimer = setTimeout(runSimulationStep, speed);
        }
        
        function updateSimulationButtons() {
            const startBtn = document.getElementById('startSimBtn');
            const pauseBtn = document.getElementById('pauseSimBtn');
            const stopBtn = document.getElementById('stopSimBtn');
            
            if (isSimulationRunning) {
                startBtn.disabled = true;
                pauseBtn.disabled = false;
                stopBtn.disabled = false;
            } else if (isSimulationPaused) {
                startBtn.disabled = false;
                startBtn.textContent = 'Resume';
                pauseBtn.disabled = true;
                stopBtn.disabled = false;
            } else {
                startBtn.disabled = simulationData.length === 0;
                startBtn.textContent = 'Start';
                pauseBtn.disabled = true;
                stopBtn.disabled = true;
            }
        }
        
        // Speed control
        document.getElementById('simSpeed').addEventListener('input', function(e) {
            document.getElementById('simSpeedValue').textContent = e.target.value + 'ms';
        });
        
        // Modified reset function to accept silent parameter
        const originalResetAllBalances = resetAllBalances;
        resetAllBalances = function(silent = false) {
            if (silent || confirm('Reset all account balances to $1000?')) {
                for (let boxId in boxData) {
                    boxData[boxId].accountBalance = 1000.00;
                    boxData[boxId].currentPosition = 0;
                    boxData[boxId].profitLoss = 0.00;
                    boxData[boxId].totalTrades = 0;
                    boxData[boxId].lastAction = 'HOLD';
                }
                
                objects.forEach(mesh => {
                    mesh.material.color.copy(normalMaterial.color);
                    mesh.material.opacity = normalMaterial.opacity;
                });
                
                currentPrice = 100.00;
                priceHistory = [100.00];
                document.getElementById('currentPrice').textContent = '100.00';
                updatePriceChart();
                
                if (!silent) {
                    alert('All balances reset successfully');
                }
            }
        };
    </script>
</body>
</html>

// Trading System Module
class TradingSystem {
    constructor() {
        this.currentPrice = 100.00;
        this.priceHistory = [100.00];
        this.isProcessingTrades = false;
        this.boxData = {};
        this.selectedCellId = null;
        this.pnlHeatmapEnabled = false;
        this.isAdminAuthenticated = false;

        // Strategy selection: 'EMA' or 'RSI'
        this.activeStrategy = 'EMA'; // Default to EMA

        // Performance tracking for strategy analysis
        this.performanceTracker = new PerformanceTracker();

        // Persistent trader instances to maintain indicator state
        this.traders = {};

        // Market-level calculators for display
        this.marketEMACalculator = null;
        this.marketEMALastIndex = -1;
        this.marketRSICalculator = null;
        this.marketRSILastIndex = -1;

        // Trading materials
        this.TRADING_MATERIALS = {
            BUY: new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 }),
            SELL: new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 }),
            HOLD: new THREE.MeshBasicMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 })
        };
    }
    
    // Initialize traders based on active strategy
    initializeBoxData() {
        // Set performance tracker strategy type
        this.performanceTracker.setStrategyType(this.activeStrategy);

        if (this.activeStrategy === 'RSI') {
            this.initializeRSITraders();
        } else {
            this.initializeEMATraders();
        }
    }

    // Initialize traders with EMA strategy
    initializeEMATraders() {
        // EMA parameter ranges with proper separation
        const fastEMARange = { min: 5, max: 24 };
        const mediumEMARange = { min: 30, max: 54 };
        const slowEMARange = { min: 60, max: 79 };

        const fastCount = fastEMARange.max - fastEMARange.min + 1;
        const mediumCount = mediumEMARange.max - mediumEMARange.min + 1;
        const slowCount = slowEMARange.max - slowEMARange.min + 1;

        let traderIndex = 0;

        for (let ring = 0; ring < 100; ring++) {
            for (let box = 0; box < 100; box++) {
                const boxId = `${ring}.${box}`;

                // Calculate unique EMA parameters for this trader
                const slowIndex = Math.floor(traderIndex / (fastCount * mediumCount));
                const remainderAfterSlow = traderIndex % (fastCount * mediumCount);
                const mediumIndex = Math.floor(remainderAfterSlow / fastCount);
                const fastIndex = remainderAfterSlow % fastCount;

                // Calculate actual EMA periods
                const fastPeriod = fastEMARange.min + fastIndex;
                const mediumPeriod = mediumEMARange.min + mediumIndex;
                const slowPeriod = slowEMARange.min + slowIndex;

                // Pure EMA strategy - no personality traits
                this.boxData[boxId] = {
                    id: boxId,
                    status: 'Active',
                    tradingProfile: {
                        strategyType: 'EMA',
                        traderId: traderIndex,
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

        // Initialize persistent trader instances
        this.initializeTraders();
    }

    // Initialize traders with RSI strategy
    initializeRSITraders() {
        // RSI parameter ranges for exactly 10,000 unique combinations
        const periodRange = { min: 7, max: 22 };        // 16 values (7-22 inclusive)
        const oversoldRange = { min: 10, max: 34 };     // 25 values (10-34 inclusive)
        const overboughtRange = { min: 66, max: 90 };   // 25 values (66-90 inclusive)
        // Total: 16 × 25 × 25 = 10,000 unique combinations

        let traderIndex = 0;

        for (let ring = 0; ring < 100; ring++) {
            for (let box = 0; box < 100; box++) {
                const boxId = `${ring}.${box}`;

                // Calculate unique RSI parameters
                const periodIndex = Math.floor(traderIndex / (25 * 25));
                const remainderAfterPeriod = traderIndex % (25 * 25);
                const oversoldIndex = Math.floor(remainderAfterPeriod / 25);
                const overboughtIndex = remainderAfterPeriod % 25;

                const rsiPeriod = 7 + periodIndex;
                const oversoldThreshold = 10 + oversoldIndex;
                const overboughtThreshold = 66 + overboughtIndex;

                this.boxData[boxId] = {
                    id: boxId,
                    status: 'Active',
                    tradingProfile: {
                        strategyType: 'RSI',
                        traderId: traderIndex,
                        rsiParams: {
                            period: rsiPeriod,
                            oversold: oversoldThreshold,
                            overbought: overboughtThreshold
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

        // Initialize persistent trader instances
        this.initializeTraders();
    }
    
    // Create persistent trader instances to maintain EMA state
    initializeTraders() {
        for (let boxId in this.boxData) {
            if (this.boxData[boxId].status === 'Active') {
                this.traders[boxId] = new BoxTrader(boxId, this.boxData[boxId].tradingProfile, this.boxData);
            }
        }
    }
    
    processNewPrice(newPrice) {
        const startTime = performance.now();

        this.currentPrice = newPrice;
        this.priceHistory.push(newPrice);

        const t1 = performance.now();
        document.getElementById('currentPrice').textContent = newPrice.toFixed(2);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();

        const t2 = performance.now();
        this.updatePriceChart();

        const t3 = performance.now();
        this.updateMarketEMAs();

        const t4 = performance.now();
        this.processAllTradingDecisions();

        const endTime = performance.now();

        // Debug logging for first 10 prices
        if (this.priceHistory.length <= 10) {
            console.log(`📊 Price ${this.priceHistory.length} Performance Breakdown:`);
            console.log(`  - DOM updates: ${(t2-t1).toFixed(2)}ms`);
            console.log(`  - Chart update: ${(t3-t2).toFixed(2)}ms`);
            console.log(`  - Market indicators: ${(t4-t3).toFixed(2)}ms`);
            console.log(`  - Trading decisions: ${(endTime-t4).toFixed(2)}ms`);
            console.log(`  - TOTAL: ${(endTime-startTime).toFixed(2)}ms`);
        }

        // Warning for slow processing
        const totalTime = endTime - startTime;
        if (totalTime > 100 && this.priceHistory.length % 100 === 0) {
            console.warn(`⚠️ Slow processing at price ${this.priceHistory.length}: ${totalTime.toFixed(2)}ms`);
        }
    }
    
    updateMarketEMAs() {
        if (this.activeStrategy === 'RSI') {
            this.updateMarketRSI();
        } else {
            this.updateMarketEMADisplay();
        }
    }

    updateMarketEMADisplay() {
        // Create or reuse market EMA calculator
        if (!this.marketEMACalculator) {
            this.marketEMACalculator = new TripleEMACalculator(); // Standard 9/21/50 for market display

            // Initialize with all history
            if (this.priceHistory.length > 0) {
                this.marketEMACalculator.updateEMAs(this.priceHistory);
                this.marketEMALastIndex = this.priceHistory.length - 1;
            }
        }
        // Update incrementally with new prices only
        else if (this.marketEMALastIndex < this.priceHistory.length - 1) {
            for (let i = this.marketEMALastIndex + 1; i < this.priceHistory.length; i++) {
                this.marketEMACalculator.updateWithPrice(this.priceHistory[i]);
            }
            this.marketEMALastIndex = this.priceHistory.length - 1;
        }

        const emas = this.marketEMACalculator.getEMAValues();
        const signal = this.marketEMACalculator.getSignal(this.priceHistory);

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

    updateMarketRSI() {
        // Create or reuse market RSI calculator
        if (!this.marketRSICalculator) {
            this.marketRSICalculator = new RSICalculator(14, 30, 70); // Standard RSI for market display

            // Initialize with all history
            if (this.priceHistory.length >= this.marketRSICalculator.period + 1) {
                this.marketRSICalculator.initializeFromHistory(this.priceHistory);
                this.marketRSILastIndex = this.priceHistory.length - 1;
            }
        }
        // Update incrementally with new prices only
        else if (this.marketRSILastIndex < this.priceHistory.length - 1) {
            for (let i = this.marketRSILastIndex + 1; i < this.priceHistory.length; i++) {
                this.marketRSICalculator.updateWithPrice(this.priceHistory[i]);
            }
            this.marketRSILastIndex = this.priceHistory.length - 1;
        }

        const rsiData = this.marketRSICalculator.getRSIValues();
        const signal = this.marketRSICalculator.getSignal();

        if (document.getElementById('fastEMA')) {
            // Reuse the display elements for RSI
            document.getElementById('fastEMA').textContent = rsiData.rsi ? rsiData.rsi.toFixed(2) : '--';
            document.getElementById('mediumEMA').textContent = `OS: ${rsiData.oversold}`;
            document.getElementById('slowEMA').textContent = `OB: ${rsiData.overbought}`;

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
    
    processAllTradingDecisions() {
        this.isProcessingTrades = true;
        document.getElementById('processingStatus').textContent = 'Processing...';
        document.getElementById('submitPriceBtn').disabled = true;

        let buyCount = 0, sellCount = 0, holdCount = 0;
        let activeTraderCount = 0;
        let recreatedCount = 0;

        // Deep debugging for first few prices
        const debugFirstPrices = this.priceHistory.length <= 3;
        let decisionStartTime, decisionTotalTime = 0;

        // Early skip for RSI - traders can't trade until they have enough data to initialize
        // Minimum RSI period is 7, so need at least 8 prices (period + 1)
        const minRSIPeriod = 7;
        const skipRSIProcessing = this.activeStrategy === 'RSI' && this.priceHistory.length < (minRSIPeriod + 1);

        if (skipRSIProcessing) {
            if (debugFirstPrices) {
                console.log(`  ⏭️ Skipping trader processing - need at least ${minRSIPeriod + 1} prices for RSI (have ${this.priceHistory.length})`);
            }
            this.isProcessingTrades = false;
            document.getElementById('processingStatus').textContent = 'Waiting for data...';
            document.getElementById('submitPriceBtn').disabled = false;
            return;
        }

        // Process all traders
        for (let i = 0; i < 10000; i++) {
            const ring = Math.floor(i / 100);
            const box = i % 100;
            const boxId = `${ring}.${box}`;

            if (this.boxData[boxId] && this.boxData[boxId].status === 'Active') {
                activeTraderCount++;

                // Use persistent trader instance
                const trader = this.traders[boxId];
                if (!trader) {
                    // Fallback: create trader if missing
                    this.traders[boxId] = new BoxTrader(boxId, this.boxData[boxId].tradingProfile, this.boxData);
                    recreatedCount++;
                }

                // Get trading decision with timing for first trader on first few prices
                if (debugFirstPrices && i === 0) {
                    decisionStartTime = performance.now();
                }

                const action = this.traders[boxId].makeDecision(this.currentPrice, this.priceHistory);

                if (debugFirstPrices && i === 0) {
                    decisionTotalTime = performance.now() - decisionStartTime;
                }
                
                // Execute the trade
                this.executeTradeAction(boxId, action);
                
                // Count actions
                switch(action) {
                    case 'BUY': buyCount++; break;
                    case 'SELL': sellCount++; break;
                    case 'HOLD': holdCount++; break;
                }
            }
        }
        
        // Debug: Log trading activity for troubleshooting
        if (this.priceHistory.length > 80 && (buyCount > 0 || sellCount > 0)) {
            console.log(`Price ${this.priceHistory.length}: BUY=${buyCount}, SELL=${sellCount}, HOLD=${holdCount}`);
        }
        
        // Update UI stats
        document.getElementById('buyingCount').textContent = buyCount;
        document.getElementById('sellingCount').textContent = sellCount;
        document.getElementById('holdingCount').textContent = holdCount;
        document.getElementById('activeTraders').textContent = activeTraderCount;

        // Debug: detailed timing for first few prices
        if (debugFirstPrices) {
            console.log(`  🔍 Single trader decision time: ${decisionTotalTime.toFixed(2)}ms`);
            console.log(`  🔍 Estimated 10,000 traders: ${(decisionTotalTime * 10000).toFixed(2)}ms`);
        }

        // Debug: warn if traders were recreated
        if (recreatedCount > 0 && this.priceHistory.length <= 10) {
            console.warn(`⚠️ ${recreatedCount} traders were recreated (should be 0 after initialization)`);
        }

        this.isProcessingTrades = false;
        document.getElementById('processingStatus').textContent = 'Complete';
        document.getElementById('submitPriceBtn').disabled = false;

        setTimeout(() => {
            if (!this.isProcessingTrades) {
                document.getElementById('processingStatus').textContent = 'Ready';
            }
        }, 2000);
    }
    
    executeTradeAction(boxId, action) {
        const data = this.boxData[boxId];
        if (!data) return;
        
        const [ringIndex, boxIndex] = boxId.split('.').map(Number);
        const mesh = window.app.scene.ringGroups[ringIndex] && window.app.scene.ringGroups[ringIndex][boxIndex];
        
        if (!mesh) return;
        
        data.lastAction = action;
        
        // Standardized trading logic - all traders use identical position sizing
        const sharePrice = this.currentPrice;
        
        // More generous position sizing to ensure trades happen
        const maxBuyValue = data.accountBalance * 0.2; // 20% of balance for more activity
        const maxBuyShares = Math.max(1, Math.floor(maxBuyValue / sharePrice)); // At least 1 share if affordable
        const maxSellShares = Math.max(1, Math.floor(data.currentPosition * 0.2)); // 20% of position or at least 1
        
        // Debug first trader more frequently to see what's happening
        if (boxId === '0.0' && Math.random() < 0.02) {
            console.log(`Trader 0.0 ${action}: Balance=${data.accountBalance.toFixed(2)}, Position=${data.currentPosition}, Price=${sharePrice.toFixed(2)}`);
            console.log(`  MaxBuy=${maxBuyShares}, MaxSell=${maxSellShares}, Can afford buy: ${data.accountBalance >= sharePrice * maxBuyShares}`);
        }
        
        let tradeExecuted = false;
        
        switch(action) {
            case 'BUY':
                if (maxBuyShares > 0 && data.accountBalance >= sharePrice * maxBuyShares) {
                    data.currentPosition += maxBuyShares;
                    data.accountBalance -= sharePrice * maxBuyShares;
                    tradeExecuted = true;
                }
                break;
            case 'SELL':
                if (maxSellShares > 0 && data.currentPosition >= maxSellShares) {
                    data.currentPosition -= maxSellShares;
                    data.accountBalance += sharePrice * maxSellShares;
                    tradeExecuted = true;
                }
                break;
        }
        
        // Only increment trade count when actual trades happen
        if (tradeExecuted) {
            data.totalTrades++;
            
            // Debug trade execution
            if (boxId === '0.0' && Math.random() < 0.02) {
                console.log(`  → Trade EXECUTED: New Balance=${data.accountBalance.toFixed(2)}, New Position=${data.currentPosition}, Total Trades=${data.totalTrades}`);
            }
        } else if (boxId === '0.0' && Math.random() < 0.01) {
            console.log(`  → Trade NOT executed (${action}): insufficient funds or position`);
        }
        
        const portfolioValue = data.accountBalance + (data.currentPosition * this.currentPrice);
        data.profitLoss = portfolioValue - data.initialBalance;

        // Track performance for strategy analysis
        const config = this.activeStrategy === 'RSI'
            ? data.tradingProfile.rsiParams
            : data.tradingProfile.emaPeriods;

        this.performanceTracker.trackTrader(
            data.tradingProfile.traderId,
            config,
            data.profitLoss,
            data.totalTrades,
            portfolioValue
        );
        
        // Update visual
        const material = this.TRADING_MATERIALS[action];
        mesh.material.color.copy(material.color);
        mesh.material.opacity = material.opacity;
        mesh.material.transparent = true;
    }
    
    updatePriceChart() {
        const chartContainer = document.getElementById('priceChart');
        const maxPoints = 50; // Only for chart display, not for price history
        
        // Create a separate array for chart display only
        let chartPrices = this.priceHistory;
        if (this.priceHistory.length > maxPoints) {
            chartPrices = this.priceHistory.slice(-maxPoints);
        }
        
        chartContainer.innerHTML = '';
        
        if (chartPrices.length < 2) return;
        
        const minPrice = Math.min(...chartPrices);
        const maxPrice = Math.max(...chartPrices);
        const priceRange = maxPrice - minPrice || 1;
        
        const chartWidth = chartContainer.offsetWidth;
        const chartHeight = chartContainer.offsetHeight;
        const pointWidth = chartWidth / (chartPrices.length - 1);
        
        for (let i = 1; i < chartPrices.length; i++) {
            const line = document.createElement('div');
            line.className = 'chart-line';
            
            const prevHeight = ((chartPrices[i-1] - minPrice) / priceRange) * chartHeight;
            const currHeight = ((chartPrices[i] - minPrice) / priceRange) * chartHeight;
            
            line.style.left = (i * pointWidth) + 'px';
            line.style.height = Math.abs(currHeight - prevHeight) + 'px';
            line.style.bottom = Math.min(prevHeight, currHeight) + 'px';
            
            if (chartPrices[i] > chartPrices[i-1]) {
                line.style.background = '#00ff88';
            } else if (chartPrices[i] < chartPrices[i-1]) {
                line.style.background = '#ff6b6b';
            } else {
                line.style.background = '#4a90e2';
            }
            
            chartContainer.appendChild(line);
        }
    }
    
    resetAllBalances(silent = false) {
        if (silent || confirm('Reset all account balances to $1000?')) {
            for (let boxId in this.boxData) {
                this.boxData[boxId].accountBalance = 1000.00;
                this.boxData[boxId].currentPosition = 0;
                this.boxData[boxId].profitLoss = 0.00;
                this.boxData[boxId].totalTrades = 0;
                this.boxData[boxId].lastAction = 'HOLD';
            }
            
            window.app.scene.objects.forEach(mesh => {
                mesh.material.color.copy(window.app.scene.normalMaterial.color);
                mesh.material.opacity = window.app.scene.normalMaterial.opacity;
            });
            
            this.currentPrice = 100.00;
            this.priceHistory = [100.00];
            document.getElementById('currentPrice').textContent = '100.00';
            this.updatePriceChart();
            
            if (!silent) {
                alert('All balances reset successfully');
            }
            
            // Clear performance tracking data and traders on reset
            this.performanceTracker.clearData();
            this.traders = {};

            // Clear market calculators
            this.marketEMACalculator = null;
            this.marketEMALastIndex = -1;
            this.marketRSICalculator = null;
            this.marketRSILastIndex = -1;

            this.initializeTraders();
        }
    }
    
    // Performance analysis methods
    getPerformanceAnalysis() {
        return this.performanceTracker.getPerformanceSummary();
    }
    
    getTopEMAConfigurations(limit = 10) {
        return this.performanceTracker.getTopConfigurations(limit);
    }
    
    getWorstEMAConfigurations(limit = 10) {
        return this.performanceTracker.getWorstConfigurations(limit);
    }
    
    getTopTraders(limit = 10) {
        return this.performanceTracker.getTopTraders(limit);
    }
    
    logPerformanceAnalysis() {
        this.performanceTracker.logPerformanceAnalysis();
    }
    
    exportPerformanceData() {
        this.performanceTracker.exportPerformanceData();
    }

    // Switch between strategies
    switchStrategy(newStrategy) {
        if (newStrategy !== 'EMA' && newStrategy !== 'RSI') {
            console.error('Invalid strategy. Must be "EMA" or "RSI"');
            return;
        }

        if (this.activeStrategy === newStrategy) {
            console.log(`Already using ${newStrategy} strategy`);
            return;
        }

        console.log(`🔄 Switching from ${this.activeStrategy} to ${newStrategy}...`);

        this.activeStrategy = newStrategy;

        // Update performance tracker strategy type
        this.performanceTracker.setStrategyType(newStrategy);

        // CRITICAL: Recreate boxData with new strategy parameters
        this.boxData = {};
        this.traders = {};

        // Clear price history and reset
        this.currentPrice = 100.00;
        this.priceHistory = [100.00];

        // Clear market calculators
        this.marketEMACalculator = null;
        this.marketEMALastIndex = -1;
        this.marketRSICalculator = null;
        this.marketRSILastIndex = -1;

        // Reinitialize everything with new strategy
        this.initializeBoxData();

        // Clear performance data
        this.performanceTracker.clearData();

        // Update UI labels
        this.updateStrategyLabels(newStrategy);

        console.log(`✅ Switched to ${newStrategy} strategy. All ${Object.keys(this.traders).length} traders created with ${newStrategy} parameters.`);
    }

    updateStrategyLabels(strategy) {
        const indicatorTitle = document.getElementById('indicatorTitle');
        const indicator1Label = document.getElementById('indicator1Label');
        const indicator2Label = document.getElementById('indicator2Label');
        const indicator3Label = document.getElementById('indicator3Label');

        if (!indicatorTitle || !indicator1Label || !indicator2Label || !indicator3Label) {
            return; // Elements not found in DOM
        }

        if (strategy === 'RSI') {
            indicatorTitle.textContent = 'Market RSI';
            indicator1Label.textContent = 'RSI (14)';
            indicator2Label.textContent = 'Oversold';
            indicator3Label.textContent = 'Overbought';
        } else {
            indicatorTitle.textContent = 'Market EMAs';
            indicator1Label.textContent = 'Fast EMA (9)';
            indicator2Label.textContent = 'Medium EMA (21)';
            indicator3Label.textContent = 'Slow EMA (50)';
        }
    }
}
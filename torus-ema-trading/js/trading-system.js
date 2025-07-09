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
        
        // Performance tracking for EMA strategy analysis
        this.performanceTracker = new PerformanceTracker();
        
        // Persistent trader instances to maintain EMA state
        this.traders = {};
        
        // Trading materials
        this.TRADING_MATERIALS = {
            BUY: new THREE.MeshBasicMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 }),
            SELL: new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 }),
            HOLD: new THREE.MeshBasicMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 })
        };
    }
    
    // Initialize traders
    initializeBoxData() {
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
    
    // Create persistent trader instances to maintain EMA state
    initializeTraders() {
        for (let boxId in this.boxData) {
            if (this.boxData[boxId].status === 'Active') {
                this.traders[boxId] = new BoxTrader(boxId, this.boxData[boxId].tradingProfile, this.boxData);
            }
        }
    }
    
    processNewPrice(newPrice) {
        this.currentPrice = newPrice;
        this.priceHistory.push(newPrice);
        
        document.getElementById('currentPrice').textContent = newPrice.toFixed(2);
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString();
        this.updatePriceChart();
        this.updateMarketEMAs();
        
        this.processAllTradingDecisions();
    }
    
    updateMarketEMAs() {
        const marketEMA = new TripleEMACalculator();
        marketEMA.updateEMAs(this.priceHistory);
        const emas = marketEMA.getEMAValues();
        const signal = marketEMA.getSignal(this.priceHistory);
        
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
    
    processAllTradingDecisions() {
        this.isProcessingTrades = true;
        document.getElementById('processingStatus').textContent = 'Processing...';
        document.getElementById('submitPriceBtn').disabled = true;
        
        let buyCount = 0, sellCount = 0, holdCount = 0;
        let activeTraderCount = 0;
        
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
                }
                
                // Get trading decision
                const action = this.traders[boxId].makeDecision(this.currentPrice, this.priceHistory);
                
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
        data.totalTrades++;
        
        // Standardized trading logic - all traders use identical position sizing
        const sharePrice = this.currentPrice;
        
        // Fixed position sizing: 10% of account balance or available shares
        const maxBuyValue = data.accountBalance * 0.1; // 10% of balance
        const maxBuyShares = Math.floor(maxBuyValue / sharePrice);
        const maxSellShares = Math.min(data.currentPosition, Math.floor(data.currentPosition * 0.1)) || data.currentPosition;
        
        switch(action) {
            case 'BUY':
                if (maxBuyShares > 0 && data.accountBalance >= sharePrice * maxBuyShares) {
                    data.currentPosition += maxBuyShares;
                    data.accountBalance -= sharePrice * maxBuyShares;
                }
                break;
            case 'SELL':
                if (maxSellShares > 0) {
                    data.currentPosition -= maxSellShares;
                    data.accountBalance += sharePrice * maxSellShares;
                }
                break;
        }
        
        const portfolioValue = data.accountBalance + (data.currentPosition * this.currentPrice);
        data.profitLoss = portfolioValue - data.initialBalance;
        
        // Track performance for EMA analysis
        this.performanceTracker.trackTrader(
            data.tradingProfile.traderId,
            data.tradingProfile.emaPeriods,
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
        const maxPoints = 50;
        
        if (this.priceHistory.length > maxPoints) {
            this.priceHistory = this.priceHistory.slice(-maxPoints);
        }
        
        chartContainer.innerHTML = '';
        
        if (this.priceHistory.length < 2) return;
        
        const minPrice = Math.min(...this.priceHistory);
        const maxPrice = Math.max(...this.priceHistory);
        const priceRange = maxPrice - minPrice || 1;
        
        const chartWidth = chartContainer.offsetWidth;
        const chartHeight = chartContainer.offsetHeight;
        const pointWidth = chartWidth / (this.priceHistory.length - 1);
        
        for (let i = 1; i < this.priceHistory.length; i++) {
            const line = document.createElement('div');
            line.className = 'chart-line';
            
            const prevHeight = ((this.priceHistory[i-1] - minPrice) / priceRange) * chartHeight;
            const currHeight = ((this.priceHistory[i] - minPrice) / priceRange) * chartHeight;
            
            line.style.left = (i * pointWidth) + 'px';
            line.style.height = Math.abs(currHeight - prevHeight) + 'px';
            line.style.bottom = Math.min(prevHeight, currHeight) + 'px';
            
            if (this.priceHistory[i] > this.priceHistory[i-1]) {
                line.style.background = '#00ff88';
            } else if (this.priceHistory[i] < this.priceHistory[i-1]) {
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
}
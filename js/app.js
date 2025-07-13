// Main Application Entry Point
class App {
    constructor() {
        this.scene = null;
        this.trading = null;
        this.admin = null;
        this.simulation = null;
        
        this.init();
    }
    
    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }
    
    initializeApp() {
        // Initialize scene manager
        this.scene = new SceneManager();
        
        // Initialize trading system
        this.trading = new TradingSystem();
        this.trading.initializeBoxData();
        
        // Initialize admin panel
        this.admin = new AdminPanel(this.trading);
        
        // Initialize simulation system
        this.simulation = new SimulationSystem(this.trading);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Make globally accessible
        window.app = this;
        
        console.log('Eye of the Market - Trading System Initialized');
    }
    
    setupEventListeners() {
        // Price input
        document.getElementById('priceField').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitPrice();
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 't') {
                event.preventDefault();
                document.getElementById('priceField').focus();
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
    }
    
    submitPrice() {
        const priceField = document.getElementById('priceField');
        const newPrice = parseFloat(priceField.value);
        
        if (!newPrice || newPrice <= 0) {
            alert('Please enter a valid price');
            return;
        }
        
        if (this.trading.isProcessingTrades) {
            alert('Currently processing trades, please wait...');
            return;
        }
        
        this.trading.processNewPrice(newPrice);
        priceField.value = '';
    }
    
    // Global functions for HTML event handlers
    setFixedView() {
        this.scene.setFixedView();
    }
    
    resetAllBalances() {
        this.trading.resetAllBalances();
    }
    
    // Admin panel functions
    toggleAdminPanel() {
        this.admin.toggle();
    }
    
    adminAuthenticate() {
        this.admin.authenticate();
    }
    
    selectCell() {
        this.admin.selectCell();
    }
    
    togglePnLHeatmap() {
        this.admin.togglePnLHeatmap();
    }
    
    modifyTraderAggression() {
        this.admin.modifyTraderAggression();
    }
    
    forceTraderAction(action) {
        this.admin.forceTraderAction(action);
    }
    
    resetTraderBalance() {
        this.admin.resetTraderBalance();
    }
    
    setCustomBalance() {
        this.admin.setCustomBalance();
    }
    
    highlightProfitable() {
        this.admin.highlightProfitable();
    }
    
    highlightLosses() {
        this.admin.highlightLosses();
    }
    
    exportTraderData() {
        this.admin.exportTraderData();
    }
    
    exportAllData() {
        this.admin.exportAllData();
    }
    
    // Simulation functions
    loadHistoricalData(event) {
        this.simulation.loadHistoricalData(event);
    }
    
    loadUSDJPYData() {
        this.simulation.loadUSDJPYData();
    }
    
    applyDateRange() {
        this.simulation.applyDateRange();
    }
    
    useFullRange() {
        this.simulation.useFullRange();
    }
    
    startSimulation() {
        this.simulation.startSimulation();
    }
    
    pauseSimulation() {
        this.simulation.pauseSimulation();
    }
    
    stopSimulation() {
        this.simulation.stopSimulation();
    }
    
    // Performance analysis functions
    logPerformanceAnalysis() {
        this.trading.logPerformanceAnalysis();
    }
    
    exportPerformanceData() {
        this.trading.exportPerformanceData();
    }
    
    // Statistics panel functions
    toggleStatisticsPanel() {
        const panel = document.getElementById('statisticsPanel');
        const button = document.getElementById('statisticsToggleBtn');
        
        if (panel.style.display === 'none' || panel.style.display === '') {
            panel.style.display = 'flex';
            button.classList.add('active');
            this.refreshStatistics();
        } else {
            panel.style.display = 'none';
            button.classList.remove('active');
        }
    }
    
    showStatsTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.stats-tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Remove active class from all tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab content
        document.getElementById(`stats-${tabName}`).classList.add('active');
        
        // Add active class to clicked button
        event.target.classList.add('active');
        
        // Load data for the selected tab
        this.loadStatsData(tabName);
    }
    
    loadStatsData(tabName) {
        const listElement = document.getElementById(`${tabName === 'all-time' ? 'allTime' : tabName}List`);
        listElement.innerHTML = '<div class="stats-loading">Loading...</div>';
        
        setTimeout(() => {
            let leaderboard = [];
            
            switch(tabName) {
                case 'all-time':
                    leaderboard = this.trading.performanceTracker.getAllTimeLeaderboard(30);
                    break;
                case 'yearly':
                    leaderboard = this.trading.performanceTracker.getLastYearLeaderboard(30);
                    break;
                case 'quarterly':
                    leaderboard = this.trading.performanceTracker.getLastQuarterLeaderboard(30);
                    break;
                case 'monthly':
                    leaderboard = this.trading.performanceTracker.getLastMonthLeaderboard(30);
                    break;
                case 'weekly':
                    leaderboard = this.trading.performanceTracker.getLastWeekLeaderboard(30);
                    break;
            }
            
            this.renderLeaderboard(leaderboard, listElement);
        }, 100);
    }
    
    renderLeaderboard(leaderboard, container) {
        if (leaderboard.length === 0) {
            container.innerHTML = '<div class="stats-loading">No performance data available yet.<br>Start trading to see results!</div>';
            return;
        }
        
        const html = leaderboard.map(entry => {
            const returnClass = parseFloat(entry.returnPercent) >= 0 ? 'positive' : 'negative';
            const rankClass = entry.rank <= 3 ? `rank-${entry.rank}` : '';
            
            return `
                <div class="stats-item ${rankClass}">
                    <div class="stats-rank">${entry.rank}</div>
                    <div class="stats-ema">EMA(${entry.fast},${entry.medium},${entry.slow})</div>
                    <div>
                        <div class="stats-return ${returnClass}">${entry.returnPercent}</div>
                        <div class="stats-details">${entry.totalTrades} trades</div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
    }
    
    refreshStatistics() {
        // Get current active tab
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            const tabName = activeTab.textContent.toLowerCase().replace(' ', '-').replace('last ', '').replace(' days', '');
            let finalTabName = tabName;
            
            // Map tab text to internal names
            if (tabName === '365') finalTabName = 'yearly';
            if (tabName === '90') finalTabName = 'quarterly';
            if (tabName === '30') finalTabName = 'monthly';
            if (tabName === '7') finalTabName = 'weekly';
            if (tabName === 'all-time') finalTabName = 'all-time';
            
            this.loadStatsData(finalTabName);
        }
    }
    
    getTopEMAConfigurations(limit = 10) {
        return this.trading.getTopEMAConfigurations(limit);
    }
    
    getPerformanceAnalysis() {
        return this.trading.getPerformanceAnalysis();
    }
    
    // Diagnostic function to check trader status
    checkTraderStatus() {
        const priceHistoryLength = this.trading.priceHistory.length;
        let initializedCount = 0;
        let readyToTrade = 0;
        
        console.log(`\n=== TRADER STATUS DIAGNOSTIC ===`);
        console.log(`Price History Length: ${priceHistoryLength}`);
        
        // Check first 10 traders as sample
        for (let i = 0; i < 10; i++) {
            const ring = Math.floor(i / 100);
            const box = i % 100;
            const boxId = `${ring}.${box}`;
            const trader = this.trading.traders[boxId];
            
            if (trader) {
                const emas = trader.emaCalculator.getEMAValues();
                const signal = trader.emaCalculator.getSignal(this.trading.priceHistory);
                
                if (trader.isInitialized) initializedCount++;
                if (signal !== 'HOLD') readyToTrade++;
                
                console.log(`Trader ${boxId}: EMA(${trader.emaCalculator.fastPeriod},${trader.emaCalculator.mediumPeriod},${trader.emaCalculator.slowPeriod})`);
                console.log(`  Initialized: ${trader.isInitialized}, Signal: ${signal}`);
                console.log(`  EMAs: Fast=${emas.fast?.toFixed(2)}, Medium=${emas.medium?.toFixed(2)}, Slow=${emas.slow?.toFixed(2)}`);
            }
        }
        
        console.log(`\nSummary: ${initializedCount}/10 initialized, ${readyToTrade}/10 ready to trade`);
        return { priceHistoryLength, initializedCount, readyToTrade };
    }
    
    // Test function to add dummy prices and test trading
    testTrading(numPrices = 100) {
        console.log(`\n=== TESTING TRADING WITH ${numPrices} PRICES ===`);
        console.log(`Current price history length: ${this.trading.priceHistory.length}`);
        
        // Add dummy prices with some variation
        const startPrice = 100;
        for (let i = 0; i < numPrices; i++) {
            const price = startPrice + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 2;
            this.trading.processNewPrice(price);
        }
        
        console.log(`After adding ${numPrices} prices, history length: ${this.trading.priceHistory.length}`);
        
        // Check status immediately (no timeout needed)
        this.checkTraderStatus();
        
        // Also check a few trader account balances
        console.log('\n=== TRADER ACCOUNT STATUS ===');
        for (let i = 0; i < 5; i++) {
            const boxId = `0.${i}`;
            const trader = this.trading.boxData[boxId];
            if (trader) {
                const portfolioValue = trader.accountBalance + (trader.currentPosition * this.trading.currentPrice);
                console.log(`Trader ${boxId}: Balance=${trader.accountBalance.toFixed(2)}, Position=${trader.currentPosition}, Trades=${trader.totalTrades}, P&L=${trader.profitLoss.toFixed(2)}, Portfolio=${portfolioValue.toFixed(2)}`);
            }
        }
        
        // Check performance tracker data
        console.log('\n=== PERFORMANCE TRACKER STATUS ===');
        const summary = this.trading.performanceTracker.getPerformanceSummary();
        console.log(`Active Traders: ${summary.activeTraders}/${summary.totalTraders}`);
        console.log(`Average Return: ${summary.avgReturn}`);
        
        // Check if any traders have non-zero trades
        let tradersWithTrades = 0;
        let tradersWithNonZeroBalance = 0;
        let tradersWithPosition = 0;
        
        for (let boxId in this.trading.boxData) {
            const trader = this.trading.boxData[boxId];
            if (trader.totalTrades > 0) {
                tradersWithTrades++;
            }
            if (trader.accountBalance !== 1000.00) {
                tradersWithNonZeroBalance++;
            }
            if (trader.currentPosition > 0) {
                tradersWithPosition++;
            }
        }
        
        console.log(`Traders with trades: ${tradersWithTrades}/10000`);
        console.log(`Traders with changed balance: ${tradersWithNonZeroBalance}/10000`);
        console.log(`Traders with positions: ${tradersWithPosition}/10000`);
        
        // Check performance tracker data structure
        console.log(`Performance tracker has ${this.trading.performanceTracker.traderPerformance.size} tracked traders`);
        
        // Sample a few traders from performance tracker
        let sampleCount = 0;
        for (let [traderId, perf] of this.trading.performanceTracker.traderPerformance.entries()) {
            if (sampleCount < 3) {
                console.log(`Sample trader ${traderId}: Return=${perf.returnPercent.toFixed(2)}%, Trades=${perf.totalTrades}, Portfolio=${perf.portfolioValue.toFixed(2)}`);
                sampleCount++;
            }
        }
    }
}

// Global function wrappers for HTML event handlers
function submitPrice() { window.app.submitPrice(); }
function setFixedView() { window.app.setFixedView(); }
function resetAllBalances() { window.app.resetAllBalances(); }
function toggleAdminPanel() { window.app.toggleAdminPanel(); }
function adminAuthenticate() { window.app.adminAuthenticate(); }
function selectCell() { window.app.selectCell(); }
function togglePnLHeatmap() { window.app.togglePnLHeatmap(); }
function modifyTraderAggression() { window.app.modifyTraderAggression(); }
function forceTraderAction(action) { window.app.forceTraderAction(action); }
function resetTraderBalance() { window.app.resetTraderBalance(); }
function setCustomBalance() { window.app.setCustomBalance(); }
function highlightProfitable() { window.app.highlightProfitable(); }
function highlightLosses() { window.app.highlightLosses(); }
function exportTraderData() { window.app.exportTraderData(); }
function exportAllData() { window.app.exportAllData(); }
function loadHistoricalData(event) { window.app.loadHistoricalData(event); }
function loadUSDJPYData() { window.app.loadUSDJPYData(); }
function applyDateRange() { window.app.applyDateRange(); }
function useFullRange() { window.app.useFullRange(); }
function startSimulation() { window.app.startSimulation(); }
function pauseSimulation() { window.app.pauseSimulation(); }
function stopSimulation() { window.app.stopSimulation(); }

// Performance analysis functions
function logPerformanceAnalysis() { window.app.logPerformanceAnalysis(); }
function exportPerformanceData() { window.app.exportPerformanceData(); }
function getTopEMAConfigurations(limit) { return window.app.getTopEMAConfigurations(limit); }
function getPerformanceAnalysis() { return window.app.getPerformanceAnalysis(); }
function checkTraderStatus() { return window.app.checkTraderStatus(); }
function testTrading(numPrices) { return window.app.testTrading(numPrices); }

// Statistics panel functions
function toggleStatisticsPanel() { window.app.toggleStatisticsPanel(); }
function showStatsTab(tabName) { window.app.showStatsTab(tabName); }
function refreshStatistics() { window.app.refreshStatistics(); }

// Initialize the application
new App();
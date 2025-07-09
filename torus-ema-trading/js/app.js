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

// Initialize the application
new App();
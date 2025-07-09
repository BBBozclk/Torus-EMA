// Performance Tracker for EMA Strategy Analysis
class PerformanceTracker {
    constructor() {
        this.traderPerformance = new Map();
        this.emaConfigPerformance = new Map();
        this.updateInterval = null;
    }
    
    // Track performance for a specific trader
    trackTrader(traderId, emaConfig, profitLoss, totalTrades, portfolioValue) {
        const key = `${emaConfig.fast}-${emaConfig.medium}-${emaConfig.slow}`;
        
        // Update individual trader performance
        this.traderPerformance.set(traderId, {
            emaConfig: emaConfig,
            profitLoss: profitLoss,
            totalTrades: totalTrades,
            portfolioValue: portfolioValue,
            returnPercent: ((portfolioValue - 1000) / 1000) * 100,
            timestamp: Date.now()
        });
        
        // Update EMA configuration aggregate performance
        if (!this.emaConfigPerformance.has(key)) {
            this.emaConfigPerformance.set(key, {
                config: emaConfig,
                traders: [],
                totalReturn: 0,
                avgReturn: 0,
                bestReturn: -Infinity,
                worstReturn: Infinity,
                totalTrades: 0,
                tradingTraders: 0
            });
        }
        
        const configStats = this.emaConfigPerformance.get(key);
        configStats.traders.push({
            traderId: traderId,
            return: ((portfolioValue - 1000) / 1000) * 100,
            trades: totalTrades
        });
        
        // Calculate aggregate statistics
        const returns = configStats.traders.map(t => t.return);
        configStats.totalReturn = returns.reduce((sum, ret) => sum + ret, 0);
        configStats.avgReturn = configStats.totalReturn / configStats.traders.length;
        configStats.bestReturn = Math.max(...returns);
        configStats.worstReturn = Math.min(...returns);
        configStats.totalTrades = configStats.traders.reduce((sum, t) => sum + t.trades, 0);
        configStats.tradingTraders = configStats.traders.filter(t => t.trades > 0).length;
    }
    
    // Get top performing EMA configurations
    getTopConfigurations(limit = 10) {
        const configs = Array.from(this.emaConfigPerformance.values())
            .filter(config => config.tradingTraders > 0) // Only configs with active traders
            .sort((a, b) => b.avgReturn - a.avgReturn)
            .slice(0, limit);
            
        return configs.map(config => ({
            fast: config.config.fast,
            medium: config.config.medium,
            slow: config.config.slow,
            avgReturn: config.avgReturn.toFixed(2) + '%',
            bestReturn: config.bestReturn.toFixed(2) + '%',
            worstReturn: config.worstReturn.toFixed(2) + '%',
            totalTrades: config.totalTrades,
            activeTraders: config.tradingTraders,
            totalTraders: config.traders.length
        }));
    }
    
    // Get worst performing EMA configurations
    getWorstConfigurations(limit = 10) {
        const configs = Array.from(this.emaConfigPerformance.values())
            .filter(config => config.tradingTraders > 0)
            .sort((a, b) => a.avgReturn - b.avgReturn)
            .slice(0, limit);
            
        return configs.map(config => ({
            fast: config.config.fast,
            medium: config.config.medium,
            slow: config.config.slow,
            avgReturn: config.avgReturn.toFixed(2) + '%',
            bestReturn: config.bestReturn.toFixed(2) + '%',
            worstReturn: config.worstReturn.toFixed(2) + '%',
            totalTrades: config.totalTrades,
            activeTraders: config.tradingTraders,
            totalTraders: config.traders.length
        }));
    }
    
    // Get individual trader rankings
    getTopTraders(limit = 10) {
        return Array.from(this.traderPerformance.values())
            .filter(trader => trader.totalTrades > 0)
            .sort((a, b) => b.returnPercent - a.returnPercent)
            .slice(0, limit)
            .map(trader => ({
                traderId: trader.emaConfig.fast + '-' + trader.emaConfig.medium + '-' + trader.emaConfig.slow,
                fast: trader.emaConfig.fast,
                medium: trader.emaConfig.medium,
                slow: trader.emaConfig.slow,
                return: trader.returnPercent.toFixed(2) + '%',
                profitLoss: trader.profitLoss.toFixed(2),
                trades: trader.totalTrades,
                portfolioValue: trader.portfolioValue.toFixed(2)
            }));
    }
    
    // Get performance statistics summary
    getPerformanceSummary() {
        const allReturns = Array.from(this.traderPerformance.values())
            .filter(trader => trader.totalTrades > 0)
            .map(trader => trader.returnPercent);
            
        if (allReturns.length === 0) {
            return {
                totalTraders: 0,
                activeTraders: 0,
                avgReturn: 0,
                bestReturn: 0,
                worstReturn: 0,
                totalConfigs: 0,
                activeConfigs: 0
            };
        }
        
        const totalConfigs = this.emaConfigPerformance.size;
        const activeConfigs = Array.from(this.emaConfigPerformance.values())
            .filter(config => config.tradingTraders > 0).length;
            
        return {
            totalTraders: this.traderPerformance.size,
            activeTraders: allReturns.length,
            avgReturn: (allReturns.reduce((sum, ret) => sum + ret, 0) / allReturns.length).toFixed(2) + '%',
            bestReturn: Math.max(...allReturns).toFixed(2) + '%',
            worstReturn: Math.min(...allReturns).toFixed(2) + '%',
            totalConfigs: totalConfigs,
            activeConfigs: activeConfigs
        };
    }
    
    // Export performance data
    exportPerformanceData() {
        const data = {
            timestamp: new Date().toISOString(),
            summary: this.getPerformanceSummary(),
            topConfigurations: this.getTopConfigurations(50),
            worstConfigurations: this.getWorstConfigurations(50),
            topTraders: this.getTopTraders(100),
            allConfigPerformance: Array.from(this.emaConfigPerformance.entries()).map(([key, config]) => ({
                emaKey: key,
                fast: config.config.fast,
                medium: config.config.medium,
                slow: config.config.slow,
                avgReturn: config.avgReturn,
                totalTraders: config.traders.length,
                activeTraders: config.tradingTraders,
                totalTrades: config.totalTrades
            }))
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ema_performance_analysis_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Log performance analysis to console
    logPerformanceAnalysis() {
        console.log('=== EMA STRATEGY PERFORMANCE ANALYSIS ===');
        
        const summary = this.getPerformanceSummary();
        console.log('\n📊 SUMMARY:');
        console.log(`Total Traders: ${summary.totalTraders}`);
        console.log(`Active Traders: ${summary.activeTraders}`);
        console.log(`Average Return: ${summary.avgReturn}`);
        console.log(`Best Return: ${summary.bestReturn}`);
        console.log(`Worst Return: ${summary.worstReturn}`);
        console.log(`Total EMA Configs: ${summary.totalConfigs}`);
        console.log(`Active EMA Configs: ${summary.activeConfigs}`);
        
        console.log('\n🏆 TOP 5 EMA CONFIGURATIONS:');
        this.getTopConfigurations(5).forEach((config, index) => {
            console.log(`${index + 1}. Fast=${config.fast}, Medium=${config.medium}, Slow=${config.slow}`);
            console.log(`   Avg Return: ${config.avgReturn}, Best: ${config.bestReturn}, Active Traders: ${config.activeTraders}`);
        });
        
        console.log('\n📉 WORST 5 EMA CONFIGURATIONS:');
        this.getWorstConfigurations(5).forEach((config, index) => {
            console.log(`${index + 1}. Fast=${config.fast}, Medium=${config.medium}, Slow=${config.slow}`);
            console.log(`   Avg Return: ${config.avgReturn}, Worst: ${config.worstReturn}, Active Traders: ${config.activeTraders}`);
        });
        
        console.log('\n⭐ TOP 5 INDIVIDUAL TRADERS:');
        this.getTopTraders(5).forEach((trader, index) => {
            console.log(`${index + 1}. EMA(${trader.fast},${trader.medium},${trader.slow}): ${trader.return} return, ${trader.trades} trades`);
        });
    }
    
    // Clear all performance data
    clearData() {
        this.traderPerformance.clear();
        this.emaConfigPerformance.clear();
    }
}
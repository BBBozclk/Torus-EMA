// Performance Tracker for Strategy Analysis (EMA & RSI)
class PerformanceTracker {
    constructor() {
        this.traderPerformance = new Map();
        this.configPerformance = new Map(); // Renamed from emaConfigPerformance
        this.performanceHistory = []; // New: timestamped performance history
        this.updateInterval = null;
        this.strategyType = 'EMA'; // Track current strategy type
    }

    // Set strategy type
    setStrategyType(strategyType) {
        this.strategyType = strategyType;
    }

    // Generate config key based on strategy type
    getConfigKey(config) {
        if (!config) return 'unknown';

        // Check if it's RSI config (has period, oversold, overbought)
        if (config.period !== undefined && config.oversold !== undefined && config.overbought !== undefined) {
            return `${config.period}-${config.oversold}-${config.overbought}`;
        }
        // EMA config (has fast, medium, slow)
        else if (config.fast !== undefined && config.medium !== undefined && config.slow !== undefined) {
            return `${config.fast}-${config.medium}-${config.slow}`;
        }

        return 'unknown';
    }

    // Track performance for a specific trader
    trackTrader(traderId, config, profitLoss, totalTrades, portfolioValue) {
        const key = this.getConfigKey(config);
        const now = Date.now();
        const returnPercent = ((portfolioValue - 1000) / 1000) * 100;
        
        // Update individual trader performance
        this.traderPerformance.set(traderId, {
            config: config,
            profitLoss: profitLoss,
            totalTrades: totalTrades,
            portfolioValue: portfolioValue,
            returnPercent: returnPercent,
            timestamp: now
        });

        // Add to performance history for time-based analysis
        this.performanceHistory.push({
            timestamp: now,
            traderId: traderId,
            config: config,
            profitLoss: profitLoss,
            totalTrades: totalTrades,
            portfolioValue: portfolioValue,
            returnPercent: returnPercent
        });

        // Update configuration aggregate performance
        if (!this.configPerformance.has(key)) {
            this.configPerformance.set(key, {
                config: config,
                traders: [],
                totalReturn: 0,
                avgReturn: 0,
                bestReturn: -Infinity,
                worstReturn: Infinity,
                totalTrades: 0,
                tradingTraders: 0
            });
        }

        const configStats = this.configPerformance.get(key);
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
    
    // Get top performing configurations (EMA or RSI)
    getTopConfigurations(limit = 10) {
        const configs = Array.from(this.configPerformance.values())
            .filter(config => config.tradingTraders > 0) // Only configs with active traders
            .sort((a, b) => b.avgReturn - a.avgReturn)
            .slice(0, limit);

        return configs.map(config => {
            const result = {
                avgReturn: config.avgReturn.toFixed(2) + '%',
                bestReturn: config.bestReturn.toFixed(2) + '%',
                worstReturn: config.worstReturn.toFixed(2) + '%',
                totalTrades: config.totalTrades,
                activeTraders: config.tradingTraders,
                totalTraders: config.traders.length
            };

            // Add config-specific properties
            if (config.config.fast !== undefined) {
                // EMA config
                result.fast = config.config.fast;
                result.medium = config.config.medium;
                result.slow = config.config.slow;
            } else if (config.config.period !== undefined) {
                // RSI config
                result.period = config.config.period;
                result.oversold = config.config.oversold;
                result.overbought = config.config.overbought;
            }

            return result;
        });
    }
    
    // Get worst performing configurations (EMA or RSI)
    getWorstConfigurations(limit = 10) {
        const configs = Array.from(this.configPerformance.values())
            .filter(config => config.tradingTraders > 0)
            .sort((a, b) => a.avgReturn - b.avgReturn)
            .slice(0, limit);

        return configs.map(config => {
            const result = {
                avgReturn: config.avgReturn.toFixed(2) + '%',
                bestReturn: config.bestReturn.toFixed(2) + '%',
                worstReturn: config.worstReturn.toFixed(2) + '%',
                totalTrades: config.totalTrades,
                activeTraders: config.tradingTraders,
                totalTraders: config.traders.length
            };

            // Add config-specific properties
            if (config.config.fast !== undefined) {
                // EMA config
                result.fast = config.config.fast;
                result.medium = config.config.medium;
                result.slow = config.config.slow;
            } else if (config.config.period !== undefined) {
                // RSI config
                result.period = config.config.period;
                result.oversold = config.config.oversold;
                result.overbought = config.config.overbought;
            }

            return result;
        });
    }
    
    // Get individual trader rankings
    getTopTraders(limit = 10) {
        return Array.from(this.traderPerformance.values())
            .filter(trader => trader.totalTrades > 0)
            .sort((a, b) => b.returnPercent - a.returnPercent)
            .slice(0, limit)
            .map(trader => {
                const result = {
                    return: trader.returnPercent.toFixed(2) + '%',
                    profitLoss: trader.profitLoss.toFixed(2),
                    trades: trader.totalTrades,
                    portfolioValue: trader.portfolioValue.toFixed(2)
                };

                // Add config-specific properties
                if (trader.config.fast !== undefined) {
                    // EMA config
                    result.traderId = trader.config.fast + '-' + trader.config.medium + '-' + trader.config.slow;
                    result.fast = trader.config.fast;
                    result.medium = trader.config.medium;
                    result.slow = trader.config.slow;
                } else if (trader.config.period !== undefined) {
                    // RSI config
                    result.traderId = trader.config.period + '-' + trader.config.oversold + '-' + trader.config.overbought;
                    result.period = trader.config.period;
                    result.oversold = trader.config.oversold;
                    result.overbought = trader.config.overbought;
                }

                return result;
            });
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
        
        const totalConfigs = this.configPerformance.size;
        const activeConfigs = Array.from(this.configPerformance.values())
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
            strategyType: this.strategyType,
            summary: this.getPerformanceSummary(),
            topConfigurations: this.getTopConfigurations(50),
            worstConfigurations: this.getWorstConfigurations(50),
            topTraders: this.getTopTraders(100),
            allConfigPerformance: Array.from(this.configPerformance.entries()).map(([key, config]) => {
                const result = {
                    configKey: key,
                    avgReturn: config.avgReturn,
                    totalTraders: config.traders.length,
                    activeTraders: config.tradingTraders,
                    totalTrades: config.totalTrades
                };

                // Add config-specific properties
                if (config.config.fast !== undefined) {
                    result.fast = config.config.fast;
                    result.medium = config.config.medium;
                    result.slow = config.config.slow;
                } else if (config.config.period !== undefined) {
                    result.period = config.config.period;
                    result.oversold = config.config.oversold;
                    result.overbought = config.config.overbought;
                }

                return result;
            })
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const strategyName = this.strategyType.toLowerCase();
        a.download = `${strategyName}_performance_analysis_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Log performance analysis to console
    logPerformanceAnalysis() {
        console.log(`=== ${this.strategyType} STRATEGY PERFORMANCE ANALYSIS ===`);

        const summary = this.getPerformanceSummary();
        console.log('\n📊 SUMMARY:');
        console.log(`Total Traders: ${summary.totalTraders}`);
        console.log(`Active Traders: ${summary.activeTraders}`);
        console.log(`Average Return: ${summary.avgReturn}`);
        console.log(`Best Return: ${summary.bestReturn}`);
        console.log(`Worst Return: ${summary.worstReturn}`);
        console.log(`Total Configs: ${summary.totalConfigs}`);
        console.log(`Active Configs: ${summary.activeConfigs}`);

        console.log(`\n🏆 TOP 5 ${this.strategyType} CONFIGURATIONS:`);
        this.getTopConfigurations(5).forEach((config, index) => {
            if (config.fast !== undefined) {
                // EMA
                console.log(`${index + 1}. EMA(${config.fast}, ${config.medium}, ${config.slow})`);
            } else if (config.period !== undefined) {
                // RSI
                console.log(`${index + 1}. RSI(Period=${config.period}, OS=${config.oversold}, OB=${config.overbought})`);
            }
            console.log(`   Avg Return: ${config.avgReturn}, Best: ${config.bestReturn}, Active Traders: ${config.activeTraders}`);
        });

        console.log(`\n📉 WORST 5 ${this.strategyType} CONFIGURATIONS:`);
        this.getWorstConfigurations(5).forEach((config, index) => {
            if (config.fast !== undefined) {
                // EMA
                console.log(`${index + 1}. EMA(${config.fast}, ${config.medium}, ${config.slow})`);
            } else if (config.period !== undefined) {
                // RSI
                console.log(`${index + 1}. RSI(Period=${config.period}, OS=${config.oversold}, OB=${config.overbought})`);
            }
            console.log(`   Avg Return: ${config.avgReturn}, Worst: ${config.worstReturn}, Active Traders: ${config.activeTraders}`);
        });

        console.log('\n⭐ TOP 5 INDIVIDUAL TRADERS:');
        this.getTopTraders(5).forEach((trader, index) => {
            if (trader.fast !== undefined) {
                // EMA
                console.log(`${index + 1}. EMA(${trader.fast},${trader.medium},${trader.slow}): ${trader.return} return, ${trader.trades} trades`);
            } else if (trader.period !== undefined) {
                // RSI
                console.log(`${index + 1}. RSI(${trader.period},${trader.oversold},${trader.overbought}): ${trader.return} return, ${trader.trades} trades`);
            }
        });
    }
    
    // Clear all performance data
    clearData() {
        this.traderPerformance.clear();
        this.configPerformance.clear();
        this.performanceHistory = [];
    }
    
    // Get performance data for a specific time period
    getPerformanceForPeriod(days) {
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        return this.performanceHistory.filter(entry => entry.timestamp >= cutoffTime);
    }
    
    // Get leaderboard for specific time period
    getLeaderboardForPeriod(days, limit = 30) {
        const periodData = this.getPerformanceForPeriod(days);

        // Group by configuration and get latest performance for each
        const configMap = new Map();

        periodData.forEach(entry => {
            const key = this.getConfigKey(entry.config);
            if (!configMap.has(key) || entry.timestamp > configMap.get(key).timestamp) {
                configMap.set(key, entry);
            }
        });

        // Convert to array and sort by return percentage
        return Array.from(configMap.values())
            .filter(entry => entry.totalTrades > 0)
            .sort((a, b) => b.returnPercent - a.returnPercent)
            .slice(0, limit)
            .map((entry, index) => {
                const result = {
                    rank: index + 1,
                    returnPercent: entry.returnPercent.toFixed(2) + '%',
                    profitLoss: entry.profitLoss.toFixed(2),
                    totalTrades: entry.totalTrades,
                    portfolioValue: entry.portfolioValue.toFixed(2)
                };

                // Add config-specific properties
                if (entry.config.fast !== undefined) {
                    result.fast = entry.config.fast;
                    result.medium = entry.config.medium;
                    result.slow = entry.config.slow;
                } else if (entry.config.period !== undefined) {
                    result.period = entry.config.period;
                    result.oversold = entry.config.oversold;
                    result.overbought = entry.config.overbought;
                }

                return result;
            });
    }
    
    // Time-based leaderboard functions
    getAllTimeLeaderboard(limit = 30) {
        return Array.from(this.traderPerformance.values())
            .filter(trader => trader.totalTrades > 0)
            .sort((a, b) => b.returnPercent - a.returnPercent)
            .slice(0, limit)
            .map((trader, index) => {
                const result = {
                    rank: index + 1,
                    returnPercent: trader.returnPercent.toFixed(2) + '%',
                    profitLoss: trader.profitLoss.toFixed(2),
                    totalTrades: trader.totalTrades,
                    portfolioValue: trader.portfolioValue.toFixed(2)
                };

                // Add config-specific properties
                if (trader.config.fast !== undefined) {
                    result.fast = trader.config.fast;
                    result.medium = trader.config.medium;
                    result.slow = trader.config.slow;
                } else if (trader.config.period !== undefined) {
                    result.period = trader.config.period;
                    result.oversold = trader.config.oversold;
                    result.overbought = trader.config.overbought;
                }

                return result;
            });
    }
    
    getLastWeekLeaderboard(limit = 30) {
        return this.getLeaderboardForPeriod(7, limit);
    }
    
    getLastMonthLeaderboard(limit = 30) {
        return this.getLeaderboardForPeriod(30, limit);
    }
    
    getLastQuarterLeaderboard(limit = 30) {
        return this.getLeaderboardForPeriod(90, limit);
    }
    
    getLastYearLeaderboard(limit = 30) {
        return this.getLeaderboardForPeriod(365, limit);
    }
}
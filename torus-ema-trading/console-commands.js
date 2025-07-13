// CONSOLE COMMANDS FOR PERFORMANCE TRACKING
// Copy and paste these commands into your browser console at http://localhost:8000/

// =============================================================================
// STEP 1: RESET AND RUN SIMULATION
// =============================================================================

// Reset everything and run simulation with enough data
console.log("=== RESETTING AND RUNNING SIMULATION ===");
app.resetAllBalances();

// Add 150 prices to ensure EMA initialization and trading
for (let i = 0; i < 150; i++) {
    const price = 100 + Math.sin(i * 0.15) * 8 + Math.cos(i * 0.1) * 3 + (Math.random() - 0.5) * 1.5;
    app.trading.processNewPrice(price);
}

console.log("✓ Added 150 prices for simulation");

// =============================================================================
// STEP 2: CHECK BASIC PERFORMANCE
// =============================================================================

// Check overall performance summary
console.log("\n=== PERFORMANCE SUMMARY ===");
const summary = app.getPerformanceAnalysis();
console.log(summary);

// =============================================================================
// STEP 3: GET TOP PERFORMING EMA COMBINATIONS
// =============================================================================

// Top 10 EMA configurations
console.log("\n=== TOP 10 EMA CONFIGURATIONS ===");
const topConfigs = app.getTopEMAConfigurations(10);
topConfigs.forEach((config, i) => {
    console.log(`${i+1}. EMA(${config.fast}, ${config.medium}, ${config.slow})`);
    console.log(`   Average Return: ${config.avgReturn}`);
    console.log(`   Best Return: ${config.bestReturn}`);
    console.log(`   Active Traders: ${config.activeTraders}/${config.totalTraders}`);
    console.log(`   Total Trades: ${config.totalTrades}`);
    console.log("");
});

// =============================================================================
// STEP 4: GET DETAILED ANALYSIS
// =============================================================================

// Full performance analysis with detailed output
console.log("\n=== DETAILED PERFORMANCE ANALYSIS ===");
app.logPerformanceAnalysis();

// =============================================================================
// STEP 5: INDIVIDUAL TRADER PERFORMANCE
// =============================================================================

// Top individual traders
console.log("\n=== TOP INDIVIDUAL TRADERS ===");
const topTraders = app.trading.getTopTraders(10);
topTraders.forEach((trader, i) => {
    console.log(`${i+1}. Trader ${trader.traderId}`);
    console.log(`   EMA(${trader.fast}, ${trader.medium}, ${trader.slow})`);
    console.log(`   Return: ${trader.return}`);
    console.log(`   Profit/Loss: $${trader.profitLoss}`);
    console.log(`   Trades: ${trader.trades}`);
    console.log(`   Portfolio Value: $${trader.portfolioValue}`);
    console.log("");
});

// =============================================================================
// STEP 6: QUICK STATUS CHECK
// =============================================================================

// Quick check of trading activity
console.log("\n=== QUICK STATUS CHECK ===");
let tradersWithTrades = 0;
let totalTrades = 0;
let totalProfit = 0;
let totalLoss = 0;

for (let boxId in app.trading.boxData) {
    const trader = app.trading.boxData[boxId];
    if (trader.totalTrades > 0) {
        tradersWithTrades++;
        totalTrades += trader.totalTrades;
        if (trader.profitLoss > 0) totalProfit += trader.profitLoss;
        if (trader.profitLoss < 0) totalLoss += trader.profitLoss;
    }
}

console.log(`Traders with actual trades: ${tradersWithTrades}/10000`);
console.log(`Total trades executed: ${totalTrades}`);
console.log(`Total profits: $${totalProfit.toFixed(2)}`);
console.log(`Total losses: $${totalLoss.toFixed(2)}`);
console.log(`Net P&L: $${(totalProfit + totalLoss).toFixed(2)}`);

console.log("\n=== COMMANDS COMPLETE ===");
console.log("For continuous monitoring, you can run:");
console.log("- app.logPerformanceAnalysis() // Full analysis");
console.log("- app.getTopEMAConfigurations(5) // Top 5 configs");
console.log("- app.exportPerformanceData() // Download data as JSON");
// QUICK PERFORMANCE CHECK - COPY AND PASTE THIS INTO CONSOLE
// This is a shortened version for quick results

// Reset and run simulation
app.resetAllBalances();
for (let i = 0; i < 100; i++) {
    const price = 100 + Math.sin(i * 0.15) * 8 + (Math.random() - 0.5) * 2;
    app.trading.processNewPrice(price);
}

// Wait 1 second then show results
setTimeout(() => {
    console.log("\n🔥 TOP 5 BEST EMA COMBINATIONS 🔥");
    console.log("=====================================");
    
    const topConfigs = app.getTopEMAConfigurations(5);
    topConfigs.forEach((config, i) => {
        console.log(`${i+1}. EMA(${config.fast}, ${config.medium}, ${config.slow}) → ${config.avgReturn} return`);
    });
    
    console.log("\n📊 PERFORMANCE SUMMARY");
    console.log("======================");
    const summary = app.getPerformanceAnalysis();
    console.log(`Active Traders: ${summary.activeTraders}/${summary.totalTraders}`);
    console.log(`Average Return: ${summary.avgReturn}`);
    console.log(`Best Return: ${summary.bestReturn}`);
    console.log(`Worst Return: ${summary.worstReturn}`);
    
    console.log("\n⭐ TOP 3 INDIVIDUAL TRADERS");
    console.log("============================");
    const topTraders = app.trading.getTopTraders(3);
    topTraders.forEach((trader, i) => {
        console.log(`${i+1}. EMA(${trader.fast},${trader.medium},${trader.slow}) → ${trader.return} (${trader.trades} trades)`);
    });
    
}, 1000);
// Validation script to test the actual trading system
// Copy and paste this into the browser console at http://localhost:8000/

console.log("=== VALIDATING PERFORMANCE TRACKING FIXES ===");

// Wait for app to load
if (typeof window.app === 'undefined') {
    console.log("ERROR: App not loaded yet. Please wait for page to load completely.");
} else {
    console.log("✓ App loaded successfully");
    
    // Reset everything to start fresh
    console.log("\n1. Resetting all balances...");
    window.app.resetAllBalances();
    
    // Add enough prices to ensure EMA initialization
    console.log("\n2. Adding 100 prices to initialize EMAs and trigger trades...");
    const basePrice = 100;
    
    for (let i = 0; i < 100; i++) {
        // Create a price pattern that should trigger both BUY and SELL signals
        const price = basePrice + Math.sin(i * 0.2) * 10 + (Math.random() - 0.5) * 2;
        window.app.trading.processNewPrice(price);
    }
    
    // Wait a moment for all trades to process
    setTimeout(() => {
        console.log("\n3. Checking trader status after 100 prices...");
        
        // Check actual trader balances and positions
        let tradersWithTrades = 0;
        let tradersWithChangedBalance = 0;
        let tradersWithPosition = 0;
        let totalTrades = 0;
        
        for (let boxId in window.app.trading.boxData) {
            const trader = window.app.trading.boxData[boxId];
            if (trader.totalTrades > 0) {
                tradersWithTrades++;
                totalTrades += trader.totalTrades;
            }
            if (trader.accountBalance !== 1000.00) {
                tradersWithChangedBalance++;
            }
            if (trader.currentPosition > 0) {
                tradersWithPosition++;
            }
        }
        
        console.log(`Traders with actual trades: ${tradersWithTrades}/10000`);
        console.log(`Traders with changed balance: ${tradersWithChangedBalance}/10000`);
        console.log(`Traders with positions: ${tradersWithPosition}/10000`);
        console.log(`Total trades executed: ${totalTrades}`);
        
        // Check performance tracker
        console.log("\n4. Checking performance tracker...");
        const summary = window.app.getPerformanceAnalysis();
        console.log("Performance Summary:", summary);
        
        if (summary.activeTraders > 0) {
            console.log("✓ SUCCESS: Performance tracker shows active traders!");
            
            // Show top configurations
            console.log("\n5. Top EMA configurations:");
            const topConfigs = window.app.getTopEMAConfigurations(5);
            topConfigs.forEach((config, i) => {
                console.log(`${i+1}. EMA(${config.fast},${config.medium},${config.slow}): ${config.avgReturn} avg return, ${config.activeTraders} active traders`);
            });
            
            // Test individual trader performance
            const topTraders = window.app.trading.getTopTraders(5);
            console.log("\n6. Top individual traders:");
            topTraders.forEach((trader, i) => {
                console.log(`${i+1}. ${trader.traderId}: ${trader.return} return, ${trader.trades} trades`);
            });
            
        } else {
            console.log("⚠ WARNING: No active traders found in performance tracker");
            console.log("This might indicate trades aren't being executed properly");
        }
        
        // Sample a few specific traders
        console.log("\n7. Sample trader details:");
        for (let i = 0; i < 3; i++) {
            const boxId = `0.${i}`;
            const trader = window.app.trading.boxData[boxId];
            if (trader) {
                const portfolioValue = trader.accountBalance + (trader.currentPosition * window.app.trading.currentPrice);
                const returnPercent = ((portfolioValue - 1000) / 1000) * 100;
                console.log(`Trader ${boxId}: Balance=${trader.accountBalance.toFixed(2)}, Position=${trader.currentPosition}, Trades=${trader.totalTrades}, Return=${returnPercent.toFixed(2)}%`);
            }
        }
        
        console.log("\n=== VALIDATION COMPLETE ===");
        
        if (summary.activeTraders > 0) {
            console.log("🎉 SUCCESS: Performance tracking is now working correctly!");
            console.log("The 0.00% returns issue has been resolved.");
        } else {
            console.log("❌ ISSUE: Still no active traders. May need further investigation.");
        }
        
    }, 2000); // Wait 2 seconds for processing
}
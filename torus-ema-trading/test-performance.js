// Quick diagnostic test for performance tracking
// Run this in the browser console after loading the page

console.log("=== PERFORMANCE TRACKING DIAGNOSTIC ===");

// Check if app is loaded
if (typeof window.app === 'undefined') {
    console.log("ERROR: App not loaded yet. Wait for page to load completely.");
} else {
    console.log("✓ App loaded successfully");
    
    // Reset everything to start fresh
    console.log("\n1. Resetting all balances...");
    window.app.resetAllBalances();
    
    // Add some test prices
    console.log("\n2. Adding test prices...");
    const prices = [100, 101, 102, 103, 104, 105, 104, 103, 102, 101, 100, 99, 98, 97, 96, 95, 96, 97, 98, 99, 100];
    
    for (let i = 0; i < prices.length; i++) {
        window.app.trading.processNewPrice(prices[i]);
    }
    
    // Now add enough prices to initialize EMAs
    console.log("\n3. Adding enough prices to initialize EMAs...");
    for (let i = 0; i < 80; i++) {
        const price = 100 + Math.sin(i * 0.1) * 5 + (Math.random() - 0.5) * 2;
        window.app.trading.processNewPrice(price);
    }
    
    // Check status
    console.log("\n4. Checking trader status...");
    const status = window.app.checkTraderStatus();
    
    // Check performance
    console.log("\n5. Checking performance...");
    const perf = window.app.getPerformanceAnalysis();
    console.log("Performance Summary:", perf);
    
    // Check top configurations
    console.log("\n6. Top EMA configurations:");
    const topConfigs = window.app.getTopEMAConfigurations(5);
    topConfigs.forEach((config, i) => {
        console.log(`${i+1}. EMA(${config.fast},${config.medium},${config.slow}): ${config.avgReturn} avg return, ${config.activeTraders} active traders`);
    });
    
    console.log("\n=== DIAGNOSTIC COMPLETE ===");
}
// Enhanced BoxTrader class with Triple EMA
class BoxTrader {
    constructor(boxId, profile, boxData) {
        this.boxId = boxId;
        this.profile = profile;
        this.boxData = boxData;
        
        // Create EMA calculator with assigned periods
        if (profile.emaPeriods) {
            this.emaCalculator = new TripleEMACalculator(
                profile.emaPeriods.fast,
                profile.emaPeriods.medium,
                profile.emaPeriods.slow
            );
        } else {
            // Default fallback (should not happen with proper initialization)
            this.emaCalculator = new TripleEMACalculator(9, 21, 50);
        }
        
        // Track if this trader has been initialized
        this.isInitialized = false;
    }
    
    makeDecision(currentPrice, priceHistory) {
        const data = this.boxData[this.boxId];
        if (data.status !== 'Active') return 'HOLD';
        
        // Initialize EMAs from history if not done yet
        if (!this.isInitialized && priceHistory.length >= this.emaCalculator.slowPeriod) {
            this.emaCalculator.initializeFromHistory(priceHistory);
            this.isInitialized = true;
            
            // Debug: Log first successful initialization
            if (this.boxId === '0.0') {
                console.log(`Trader ${this.boxId} initialized with ${priceHistory.length} prices, slow EMA needs ${this.emaCalculator.slowPeriod}`);
            }
        }
        
        // Get Triple EMA signal
        const signal = this.emaCalculator.getSignal(priceHistory);
        
        // Pure EMA strategy - no personality influences
        // All traders follow identical logic based solely on EMA alignment
        
        return signal;
    }
}
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
            // Fallback for backward compatibility
            const speedMultiplier = 1 - (profile.aggressiveness * 0.3);
            this.emaCalculator = new TripleEMACalculator(
                Math.round(9 * speedMultiplier),
                Math.round(21 * speedMultiplier),
                Math.round(50 * speedMultiplier)
            );
        }
        
        // Track if this trader has been initialized
        this.isInitialized = false;
    }
    
    makeDecision(currentPrice, priceHistory) {
        const data = this.boxData[this.boxId];
        if (data.status !== 'Active') return 'HOLD';
        
        // Initialize EMAs from history if not done yet
        if (!this.isInitialized && priceHistory.length > 0) {
            this.emaCalculator.initializeFromHistory(priceHistory);
            this.isInitialized = true;
        }
        
        // Get Triple EMA signal
        const signal = this.emaCalculator.getSignal(priceHistory);
        
        // Optional: Add trader personality influence
        if (this.profile.aggressiveness > 0.8 && signal === 'HOLD') {
            const emas = this.emaCalculator.getEMAValues();
            
            // Only try this if EMAs are initialized
            if (emas.initialized) {
                // Check for partial bullish alignment
                if (emas.fast > emas.medium) {
                    if (Math.random() < 0.3) return 'BUY';
                }
                
                // Check for partial bearish alignment
                if (emas.fast < emas.medium) {
                    if (Math.random() < 0.3) return 'SELL';
                }
            }
        }
        
        return signal;
    }
}
// Triple EMA Calculator Class
class TripleEMACalculator {
    constructor(fastPeriod = 9, mediumPeriod = 21, slowPeriod = 50) {
        this.fastPeriod = fastPeriod;
        this.mediumPeriod = mediumPeriod;
        this.slowPeriod = slowPeriod;
        
        // Maintain EMA state
        this.fastEMA = null;
        this.mediumEMA = null;
        this.slowEMA = null;
        
        // Track if we have enough data
        this.initialized = false;
        this.priceCount = 0;
    }
    
    // Calculate SMA for initialization
    calculateSMA(prices, period) {
        if (prices.length < period) return null;
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }
    
    // Update EMAs with a new price (maintains state)
    updateWithPrice(newPrice) {
        this.priceCount++;
        
        // For the first price, initialize all EMAs to the price
        if (this.priceCount === 1) {
            this.fastEMA = newPrice;
            this.mediumEMA = newPrice;
            this.slowEMA = newPrice;
            return;
        }
        
        // Calculate smoothing factors (alpha)
        const fastAlpha = 2 / (this.fastPeriod + 1);
        const mediumAlpha = 2 / (this.mediumPeriod + 1);
        const slowAlpha = 2 / (this.slowPeriod + 1);
        
        // Update EMAs using the standard formula: EMA = (Price * Alpha) + (Previous EMA * (1 - Alpha))
        this.fastEMA = (newPrice * fastAlpha) + (this.fastEMA * (1 - fastAlpha));
        this.mediumEMA = (newPrice * mediumAlpha) + (this.mediumEMA * (1 - mediumAlpha));
        this.slowEMA = (newPrice * slowAlpha) + (this.slowEMA * (1 - slowAlpha));
        
        // Mark as initialized only when we have enough data for the slowest EMA
        // This ensures all EMAs have sufficient data before trading begins
        if (this.priceCount >= this.slowPeriod) {
            this.initialized = true;
        }
    }
    
    // Initialize from historical prices
    initializeFromHistory(priceHistory) {
        if (priceHistory.length === 0) return;
        
        // Reset state
        this.fastEMA = null;
        this.mediumEMA = null;
        this.slowEMA = null;
        this.priceCount = 0;
        this.initialized = false;
        
        // Process each historical price
        for (let i = 0; i < priceHistory.length; i++) {
            this.updateWithPrice(priceHistory[i]);
        }
    }
    
    // Get trading signal based on EMA alignment
    getSignal(priceHistory) {
        // Initialize from history if not already done
        if (this.priceCount === 0 && priceHistory.length > 0) {
            this.initializeFromHistory(priceHistory);
        }
        
        // Strict requirement: must have enough data for slowest EMA
        if (!this.initialized || priceHistory.length < this.slowPeriod) {
            return 'HOLD';
        }
        
        // Make sure EMAs are valid numbers
        if (this.fastEMA === null || this.mediumEMA === null || this.slowEMA === null ||
            isNaN(this.fastEMA) || isNaN(this.mediumEMA) || isNaN(this.slowEMA)) {
            return 'HOLD';
        }
        
        // Trading logic based on EMA alignment
        const tolerance = 0.0001;
        
        if (this.fastEMA > this.mediumEMA + tolerance && this.mediumEMA > this.slowEMA + tolerance) {
            return 'BUY'; // Bullish alignment
        } else if (this.fastEMA < this.mediumEMA - tolerance && this.mediumEMA < this.slowEMA - tolerance) {
            return 'SELL'; // Bearish alignment
        } else {
            return 'HOLD'; // Mixed signals
        }
    }
    
    // Get current EMA values
    getEMAValues() {
        return {
            fast: this.fastEMA,
            medium: this.mediumEMA,
            slow: this.slowEMA,
            initialized: this.initialized
        };
    }
    
    // Legacy method for compatibility
    updateEMAs(priceHistory) {
        if (this.priceCount === 0 && priceHistory.length > 0) {
            this.initializeFromHistory(priceHistory);
        }
    }
}
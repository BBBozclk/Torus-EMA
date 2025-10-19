// RSI Calculator Class with Wilder's Smoothing Method
class RSICalculator {
    constructor(period = 14, oversoldThreshold = 30, overboughtThreshold = 70) {
        this.period = period;
        this.oversoldThreshold = oversoldThreshold;
        this.overboughtThreshold = overboughtThreshold;

        // Maintain RSI state (NO price history stored - only state variables)
        this.previousPrice = null;
        this.avgGain = null;
        this.avgLoss = null;
        this.currentRSI = null;
        this.previousRSI = null;

        // Initialization tracking
        this.priceCount = 0;
        this.initialized = false;

        // Temporary storage for initial period only
        this.initGains = [];
        this.initLosses = [];
    }

    // Calculate initial SMA for gains and losses
    calculateInitialAverages(prices) {
        if (prices.length < this.period + 1) return null;

        let gains = [];
        let losses = [];

        // Calculate price changes for the first 'period' values
        for (let i = 1; i <= this.period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains.push(change);
                losses.push(0);
            } else {
                gains.push(0);
                losses.push(Math.abs(change));
            }
        }

        // Calculate simple averages for initialization
        const avgGain = gains.reduce((a, b) => a + b, 0) / this.period;
        const avgLoss = losses.reduce((a, b) => a + b, 0) / this.period;

        return { avgGain, avgLoss };
    }

    // Update RSI with a new price (maintains state using Wilder's smoothing)
    updateWithPrice(newPrice) {
        this.priceCount++;

        // For the very first price, just store it
        if (this.priceCount === 1) {
            this.previousPrice = newPrice;
            return;
        }

        // Calculate price change
        const change = newPrice - this.previousPrice;
        const currentGain = change > 0 ? change : 0;
        const currentLoss = change < 0 ? Math.abs(change) : 0;

        // During initialization period, collect gains and losses
        if (!this.initialized) {
            this.initGains.push(currentGain);
            this.initLosses.push(currentLoss);

            // Once we have enough data, calculate initial averages
            if (this.initGains.length === this.period) {
                this.avgGain = this.initGains.reduce((a, b) => a + b, 0) / this.period;
                this.avgLoss = this.initLosses.reduce((a, b) => a + b, 0) / this.period;
                this.initialized = true;

                // Clear temporary arrays to free memory
                this.initGains = [];
                this.initLosses = [];

                // Calculate initial RSI
                this.calculateRSI();
            }
        }
        // After initialization, use Wilder's smoothing
        else {
            // Apply Wilder's smoothing method
            // New Average = ((Previous Average * (period - 1)) + Current Value) / period
            this.avgGain = ((this.avgGain * (this.period - 1)) + currentGain) / this.period;
            this.avgLoss = ((this.avgLoss * (this.period - 1)) + currentLoss) / this.period;

            // Calculate RSI
            this.calculateRSI();
        }

        this.previousPrice = newPrice;
    }

    // Calculate RSI from current average gain and loss
    calculateRSI() {
        this.previousRSI = this.currentRSI;

        // Avoid division by zero
        if (this.avgLoss === 0) {
            this.currentRSI = 100;
            return;
        }

        const RS = this.avgGain / this.avgLoss;
        this.currentRSI = 100 - (100 / (1 + RS));
    }

    // Initialize from historical prices (ONE TIME ONLY)
    initializeFromHistory(priceHistory) {
        if (priceHistory.length === 0) return;

        // Reset state
        this.previousPrice = null;
        this.avgGain = null;
        this.avgLoss = null;
        this.currentRSI = null;
        this.previousRSI = null;
        this.priceCount = 0;
        this.initialized = false;
        this.initGains = [];
        this.initLosses = [];

        // Process each historical price efficiently
        for (let i = 0; i < priceHistory.length; i++) {
            this.updateWithPrice(priceHistory[i]);
        }
    }

    // Get trading signal based on RSI thresholds and crossovers
    getSignal() {
        // Check if we have enough data
        if (!this.initialized || this.currentRSI === null) {
            return 'HOLD';
        }

        // RSI threshold crossover strategy
        // BUY: RSI crosses above oversold threshold (was below, now above)
        // SELL: RSI crosses below overbought threshold (was above, now below)

        const rsi = this.currentRSI;
        const prevRSI = this.previousRSI;

        // If we don't have previous RSI yet, use current levels
        if (prevRSI === null) {
            if (rsi < this.oversoldThreshold) {
                return 'BUY';  // Oversold condition
            } else if (rsi > this.overboughtThreshold) {
                return 'SELL'; // Overbought condition
            } else {
                return 'HOLD';
            }
        }

        // Detect threshold crossovers
        if (prevRSI <= this.oversoldThreshold && rsi > this.oversoldThreshold) {
            return 'BUY';  // Crossed above oversold threshold
        } else if (prevRSI >= this.overboughtThreshold && rsi < this.overboughtThreshold) {
            return 'SELL'; // Crossed below overbought threshold
        } else if (rsi < this.oversoldThreshold) {
            return 'BUY';  // Still oversold
        } else if (rsi > this.overboughtThreshold) {
            return 'SELL'; // Still overbought
        } else {
            return 'HOLD'; // Neutral zone
        }
    }

    // Get current RSI value and parameters
    getRSIValues() {
        return {
            rsi: this.currentRSI,
            period: this.period,
            oversold: this.oversoldThreshold,
            overbought: this.overboughtThreshold,
            avgGain: this.avgGain,
            avgLoss: this.avgLoss,
            initialized: this.initialized
        };
    }
}

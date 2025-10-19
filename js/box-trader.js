// Enhanced BoxTrader class with Triple EMA and RSI support
class BoxTrader {
    constructor(boxId, profile, boxData) {
        this.boxId = boxId;
        this.profile = profile;
        this.boxData = boxData;

        // Determine strategy type
        this.strategyType = profile.strategyType || 'EMA';

        // Create appropriate calculator based on strategy
        if (this.strategyType === 'RSI') {
            this.rsiCalculator = new RSICalculator(
                profile.rsiParams.period,
                profile.rsiParams.oversold,
                profile.rsiParams.overbought
            );
        } else {
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
        }

        // Track if this trader has been initialized
        this.isInitialized = false;
        this.lastProcessedIndex = -1;
    }

    makeDecision(currentPrice, priceHistory) {
        const data = this.boxData[this.boxId];
        if (data.status !== 'Active') return 'HOLD';

        if (this.strategyType === 'RSI') {
            return this.makeRSIDecision(currentPrice, priceHistory);
        } else {
            return this.makeEMADecision(currentPrice, priceHistory);
        }
    }

    makeRSIDecision(currentPrice, priceHistory) {
        // Debug timing for first trader on first 3 prices
        const debug = this.boxId === '0.0' && priceHistory.length <= 3;
        let t0, t1, t2, t3;

        if (debug) t0 = performance.now();

        // Initialize with full history ONCE
        if (!this.isInitialized && priceHistory.length >= this.rsiCalculator.period + 1) {
            if (debug) console.log(`  🔧 Trader ${this.boxId} initializing with ${priceHistory.length} prices, period=${this.rsiCalculator.period}`);
            this.rsiCalculator.initializeFromHistory(priceHistory);
            this.isInitialized = true;
            this.lastProcessedIndex = priceHistory.length - 1;
            if (debug) console.log(`  🔧 Initialization complete`);
        }
        // Update incrementally with NEW prices only
        else if (this.isInitialized && this.lastProcessedIndex < priceHistory.length - 1) {
            if (debug) t1 = performance.now();
            for (let i = this.lastProcessedIndex + 1; i < priceHistory.length; i++) {
                this.rsiCalculator.updateWithPrice(priceHistory[i]);
            }
            this.lastProcessedIndex = priceHistory.length - 1;
            if (debug) {
                t2 = performance.now();
                console.log(`  🔧 Incremental update took ${(t2-t1).toFixed(2)}ms`);
            }
        }

        if (debug) t3 = performance.now();
        const signal = this.rsiCalculator.getSignal();

        if (debug) {
            const signalTime = performance.now() - t3;
            const totalTime = performance.now() - t0;
            console.log(`  🔧 getSignal() took ${signalTime.toFixed(2)}ms`);
            console.log(`  🔧 Total makeRSIDecision: ${totalTime.toFixed(2)}ms (initialized=${this.isInitialized})`);
        }

        return signal;
    }

    makeEMADecision(currentPrice, priceHistory) {
        // Initialize EMAs from history if not done yet
        if (!this.isInitialized && priceHistory.length >= this.emaCalculator.slowPeriod) {
            this.emaCalculator.initializeFromHistory(priceHistory);
            this.isInitialized = true;
        }

        // Get Triple EMA signal
        const signal = this.emaCalculator.getSignal(priceHistory);

        return signal;
    }
}
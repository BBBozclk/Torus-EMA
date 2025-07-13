// Historical Data Simulation Module
class SimulationSystem {
    constructor(tradingSystem) {
        this.tradingSystem = tradingSystem;
        this.simulationData = [];
        this.fullSimulationData = [];
        this.simulationIndex = 0;
        this.simulationTimer = null;
        this.isSimulationRunning = false;
        this.isSimulationPaused = false;
        // REVERTED: Removed over-engineered CSV parser dependency
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        document.getElementById('simSpeed').addEventListener('input', (e) => {
            document.getElementById('simSpeedValue').textContent = e.target.value + 'ms';
        });
    }
    
    async loadHistoricalData(event) {
        const file = event ? event.target.files[0] : null;
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const csvContent = e.target.result;
                
                // REVERTED: Use original working logic - check format and route accordingly
                const firstLine = csvContent.split('\n')[0];
                if (firstLine.includes('00:00') && firstLine.split(',').length >= 5) {
                    this.parseUSDJPYData(csvContent);
                } else {
                    this.parseHistoricalData(csvContent);
                }
            };
            reader.readAsText(file);
        }
    }
    
    async loadUSDJPYData() {
        try {
            document.getElementById('simStatus').textContent = 'Please use "Load CSV" to upload USDJPY_D1.csv file';
            alert('Please click "Load CSV" and select the USDJPY_D1.csv file with 5,019 days of data');
            document.getElementById('csvFileInput').click();
        } catch (error) {
            document.getElementById('simStatus').textContent = 'Please use Load CSV button';
            console.error('Error:', error);
        }
    }
    
    // REMOVED: Over-engineered parsing method - reverted to original working approach
    
    parseUSDJPYData(csvContent) {
        const lines = csvContent.trim().split('\n');
        this.fullSimulationData = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const parts = line.split(',');
            if (parts.length >= 5) {
                const dateTime = parts[0];
                const open = parseFloat(parts[1]);
                const high = parseFloat(parts[2]);
                const low = parseFloat(parts[3]);
                const close = parseFloat(parts[4]);
                
                if (!isNaN(close)) {
                    this.fullSimulationData.push({
                        date: dateTime.split(' ')[0],
                        dateTime: dateTime,
                        open: open,
                        high: high,
                        low: low,
                        close: close,
                        price: close
                    });
                }
            }
        }
        
        if (this.fullSimulationData.length > 0) {
            document.getElementById('dateRangeSelector').style.display = 'block';
            
            const firstDate = this.fullSimulationData[0].date;
            const lastDate = this.fullSimulationData[this.fullSimulationData.length - 1].date;
            document.getElementById('startDate').min = firstDate;
            document.getElementById('startDate').max = lastDate;
            document.getElementById('endDate').min = firstDate;
            document.getElementById('endDate').max = lastDate;
            document.getElementById('endDate').value = lastDate;
            
            // Default to last 3 years of data
            const threeYearsAgo = new Date(lastDate);
            threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
            document.getElementById('startDate').value = threeYearsAgo.toISOString().split('T')[0];
            
            document.getElementById('simStatus').textContent = `Loaded ${this.fullSimulationData.length} days (${firstDate} to ${lastDate})`;
            document.getElementById('dataInfo').textContent = `Full dataset: ${this.fullSimulationData.length} trading days`;
            
            this.applyDateRange();
        } else {
            document.getElementById('simStatus').textContent = 'No valid data found';
        }
    }
    
    applyDateRange() {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        this.simulationData = this.fullSimulationData.filter(item => {
            return item.date >= startDate && item.date <= endDate;
        });
        
        if (this.simulationData.length > 0) {
            document.getElementById('simStatus').textContent = 
                `Selected ${this.simulationData.length} days (${startDate} to ${endDate})`;
            document.getElementById('startSimBtn').disabled = false;
            this.simulationIndex = 0;
            
            const prices = this.simulationData.map(d => d.close);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            document.getElementById('dataInfo').textContent = 
                `Price range: ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} JPY`;
        } else {
            document.getElementById('simStatus').textContent = 'No data in selected range';
            document.getElementById('startSimBtn').disabled = true;
        }
    }
    
    useFullRange() {
        if (this.fullSimulationData.length > 0) {
            document.getElementById('startDate').value = this.fullSimulationData[0].date;
            document.getElementById('endDate').value = this.fullSimulationData[this.fullSimulationData.length - 1].date;
            this.applyDateRange();
        }
    }
    
    parseHistoricalData(csvContent) {
        const lines = csvContent.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        this.simulationData = [];
        
        for (let i = 1; i < lines.length; i++) {
            const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
            if (!matches) continue;
            
            const values = matches.map(v => v.replace(/"/g, '').trim());
            
            const priceIndex = headers.findIndex(h => h.toLowerCase().includes('price'));
            const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
            
            if (priceIndex >= 0 && priceIndex < values.length) {
                const price = parseFloat(values[priceIndex]);
                if (!isNaN(price)) {
                    this.simulationData.push({
                        date: dateIndex >= 0 ? values[dateIndex] : `Day ${i}`,
                        price: price
                    });
                }
            }
        }
        
        this.simulationData.reverse();
        
        if (this.simulationData.length > 0) {
            document.getElementById('simStatus').textContent = `Loaded ${this.simulationData.length} price points`;
            document.getElementById('startSimBtn').disabled = false;
            this.simulationIndex = 0;
        } else {
            document.getElementById('simStatus').textContent = 'No valid price data found';
        }
    }
    
    startSimulation() {
        if (this.simulationData.length === 0) return;
        
        if (this.isSimulationPaused) {
            this.isSimulationPaused = false;
            this.isSimulationRunning = true;
            this.updateSimulationButtons();
            this.runSimulationStep();
            return;
        }
        
        // Reset if starting fresh
        if (this.simulationIndex === 0) {
            this.tradingSystem.resetAllBalances(true);
            this.tradingSystem.priceHistory = [];
        }
        
        this.isSimulationRunning = true;
        this.isSimulationPaused = false;
        this.updateSimulationButtons();
        this.runSimulationStep();
    }
    
    pauseSimulation() {
        this.isSimulationPaused = true;
        this.isSimulationRunning = false;
        clearTimeout(this.simulationTimer);
        this.updateSimulationButtons();
        document.getElementById('simStatus').textContent = `Paused at ${this.simulationIndex}/${this.simulationData.length}`;
    }
    
    stopSimulation() {
        this.isSimulationRunning = false;
        this.isSimulationPaused = false;
        clearTimeout(this.simulationTimer);
        this.simulationIndex = 0;
        this.updateSimulationButtons();
        document.getElementById('simStatus').textContent = `Stopped. Ready to restart.`;
    }
    
    runSimulationStep() {
        if (!this.isSimulationRunning || this.simulationIndex >= this.simulationData.length) {
            if (this.simulationIndex >= this.simulationData.length) {
                this.stopSimulation();
                document.getElementById('simStatus').textContent = `Simulation complete! Processed ${this.simulationData.length} prices`;
            }
            return;
        }
        
        const dataPoint = this.simulationData[this.simulationIndex];
        this.tradingSystem.processNewPrice(dataPoint.price);
        
        document.getElementById('simStatus').textContent = 
            `Processing: ${dataPoint.date} - ${dataPoint.price.toFixed(2)} (${this.simulationIndex + 1}/${this.simulationData.length})`;
        
        this.simulationIndex++;
        
        const speed = parseInt(document.getElementById('simSpeed').value);
        this.simulationTimer = setTimeout(() => this.runSimulationStep(), speed);
    }
    
    updateSimulationButtons() {
        const startBtn = document.getElementById('startSimBtn');
        const pauseBtn = document.getElementById('pauseSimBtn');
        const stopBtn = document.getElementById('stopSimBtn');
        
        if (this.isSimulationRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        } else if (this.isSimulationPaused) {
            startBtn.disabled = false;
            startBtn.textContent = 'Resume';
            pauseBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            startBtn.disabled = this.simulationData.length === 0;
            startBtn.textContent = 'Start';
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        }
    }
}
// Admin Panel Functions
class AdminPanel {
    constructor(tradingSystem) {
        this.tradingSystem = tradingSystem;
        this.isAuthenticated = false;
        this.selectedCellId = null;
        this.pnlHeatmapEnabled = false;
    }
    
    toggle() {
        const panel = document.getElementById('adminPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    
    authenticate() {
        const password = document.getElementById('adminPassword').value;
        if (password === 'admin2024') {
            this.isAuthenticated = true;
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminContent').style.display = 'block';
            document.getElementById('adminToggleBtn').style.background = '#ff00ff';
        } else {
            alert('Invalid password');
        }
    }
    
    selectCell() {
        const ring = parseInt(document.getElementById('ringSelect').value);
        const box = parseInt(document.getElementById('boxSelect').value);
        
        if (isNaN(ring) || isNaN(box) || ring < 0 || ring > 99 || box < 0 || box > 99) {
            alert('Please enter valid ring (0-99) and box (0-99) numbers');
            return;
        }
        
        this.selectedCellId = `${ring}.${box}`;
        this.updateCellDetails();
        this.highlightSelectedCell(ring, box);
    }
    
    updateCellDetails() {
        if (!this.selectedCellId || !this.tradingSystem.boxData[this.selectedCellId]) return;
        
        const data = this.tradingSystem.boxData[this.selectedCellId];
        const details = document.getElementById('cellDetails');
        const pnlClass = data.profitLoss >= 0 ? 'profit' : 'loss';
        
        details.innerHTML = `
            <div class="cell-detail-row"><span>Cell ID:</span><span>${this.selectedCellId}</span></div>
            <div class="cell-detail-row"><span>Status:</span><span>${data.status}</span></div>
            <div class="cell-detail-row ${pnlClass}"><span>P&L:</span><span>${data.profitLoss.toFixed(2)}</span></div>
            <div class="cell-detail-row"><span>Balance:</span><span>${data.accountBalance.toFixed(2)}</span></div>
            <div class="cell-detail-row"><span>Position:</span><span>${data.currentPosition} shares</span></div>
            <div class="cell-detail-row"><span>Last Action:</span><span>${data.lastAction}</span></div>
            <div class="cell-detail-row"><span>Total Trades:</span><span>${data.totalTrades}</span></div>
            <div class="cell-detail-row"><span>Aggressiveness:</span><span>${(data.tradingProfile.aggressiveness * 100).toFixed(1)}%</span></div>
            <div class="cell-detail-row"><span>Portfolio Value:</span><span>${(data.accountBalance + (data.currentPosition * this.tradingSystem.currentPrice)).toFixed(2)}</span></div>
        `;
    }
    
    highlightSelectedCell(ring, box) {
        window.app.scene.objects.forEach(mesh => {
            if (mesh.userData.ringIndex === ring && mesh.userData.boxIndex === box) {
                mesh.material.color.setHex(0xffff00);
                mesh.material.opacity = 1;
            }
        });
    }
    
    togglePnLHeatmap() {
        this.pnlHeatmapEnabled = !this.pnlHeatmapEnabled;
        const btn = document.getElementById('pnlHeatmapBtn');
        
        if (this.pnlHeatmapEnabled) {
            btn.textContent = 'Disable P&L Heatmap';
            btn.classList.add('active');
            this.updatePnLHeatmap();
        } else {
            btn.textContent = 'Enable P&L Heatmap';
            btn.classList.remove('active');
            // Reset colors
            window.app.scene.objects.forEach(mesh => {
                const ring = mesh.userData.ringIndex;
                const box = mesh.userData.boxIndex;
                const boxId = `${ring}.${box}`;
                const data = this.tradingSystem.boxData[boxId];
                if (data) {
                    const material = this.tradingSystem.TRADING_MATERIALS[data.lastAction];
                    mesh.material.color.copy(material.color);
                    mesh.material.opacity = material.opacity;
                }
            });
        }
    }
    
    updatePnLHeatmap() {
        if (!this.pnlHeatmapEnabled) return;
        
        window.app.scene.objects.forEach(mesh => {
            const ring = mesh.userData.ringIndex;
            const box = mesh.userData.boxIndex;
            const boxId = `${ring}.${box}`;
            const data = this.tradingSystem.boxData[boxId];
            
            if (data) {
                const pnl = data.profitLoss;
                const maxPnL = 200; // Scale for color intensity
                
                if (pnl > 0) {
                    const intensity = Math.min(pnl / maxPnL, 1);
                    mesh.material.color.setRGB(0, intensity, 0);
                } else if (pnl < 0) {
                    const intensity = Math.min(Math.abs(pnl) / maxPnL, 1);
                    mesh.material.color.setRGB(intensity, 0, 0);
                } else {
                    mesh.material.color.setRGB(0.3, 0.3, 0.3);
                }
                mesh.material.opacity = 0.9;
            }
        });
    }
    
    modifyTraderAggression() {
        if (!this.selectedCellId) {
            alert('Please select a cell first');
            return;
        }
        
        const newAggression = prompt('Enter new aggressiveness (0.0 - 1.0):', '0.5');
        if (newAggression === null) return;
        
        const value = parseFloat(newAggression);
        if (isNaN(value) || value < 0 || value > 1) {
            alert('Please enter a value between 0.0 and 1.0');
            return;
        }
        
        this.tradingSystem.boxData[this.selectedCellId].tradingProfile.aggressiveness = value;
        this.updateCellDetails();
    }
    
    forceTraderAction(action) {
        if (!this.selectedCellId) {
            alert('Please select a cell first');
            return;
        }
        
        this.tradingSystem.executeTradeAction(this.selectedCellId, action);
        this.updateCellDetails();
        if (this.pnlHeatmapEnabled) this.updatePnLHeatmap();
    }
    
    resetTraderBalance() {
        if (!this.selectedCellId) {
            alert('Please select a cell first');
            return;
        }
        
        const data = this.tradingSystem.boxData[this.selectedCellId];
        data.accountBalance = 1000.00;
        data.currentPosition = 0;
        data.profitLoss = 0.00;
        data.totalTrades = 0;
        this.updateCellDetails();
        if (this.pnlHeatmapEnabled) this.updatePnLHeatmap();
    }
    
    setCustomBalance() {
        if (!this.selectedCellId) {
            alert('Please select a cell first');
            return;
        }
        
        const newBalance = prompt('Enter new balance:', '1000');
        if (newBalance === null) return;
        
        const value = parseFloat(newBalance);
        if (isNaN(value) || value < 0) {
            alert('Please enter a valid positive number');
            return;
        }
        
        this.tradingSystem.boxData[this.selectedCellId].accountBalance = value;
        this.updateCellDetails();
    }
    
    highlightProfitable() {
        window.app.scene.objects.forEach(mesh => {
            const ring = mesh.userData.ringIndex;
            const box = mesh.userData.boxIndex;
            const boxId = `${ring}.${box}`;
            const data = this.tradingSystem.boxData[boxId];
            
            if (data && data.profitLoss > 0) {
                mesh.material.color.setHex(0x00ff00);
                mesh.material.opacity = 1;
            }
        });
    }
    
    highlightLosses() {
        window.app.scene.objects.forEach(mesh => {
            const ring = mesh.userData.ringIndex;
            const box = mesh.userData.boxIndex;
            const boxId = `${ring}.${box}`;
            const data = this.tradingSystem.boxData[boxId];
            
            if (data && data.profitLoss < 0) {
                mesh.material.color.setHex(0xff0000);
                mesh.material.opacity = 1;
            }
        });
    }
    
    exportTraderData() {
        if (!this.selectedCellId) {
            alert('Please select a cell first');
            return;
        }
        
        const data = this.tradingSystem.boxData[this.selectedCellId];
        const exportData = JSON.stringify(data, null, 2);
        
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trader_${this.selectedCellId}_data.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    exportAllData() {
        const exportData = {
            timestamp: new Date().toISOString(),
            currentPrice: this.tradingSystem.currentPrice,
            priceHistory: this.tradingSystem.priceHistory,
            traders: this.tradingSystem.boxData
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `all_traders_data_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}
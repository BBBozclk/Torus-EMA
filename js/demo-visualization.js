// Demo Visualization for Professional Presentation
class DemoVisualization {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.options = {
            rings: options.rings || 20,
            boxesPerRing: options.boxesPerRing || 20,
            animated: options.animated !== false,
            colorChange: options.colorChange !== false,
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a202c);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.offsetWidth / this.canvas.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 25);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        this.scene.add(directionalLight);
        
        // Create torus
        this.createTorus();
        
        // Animation
        this.animationId = null;
        this.lastColorChange = 0;
        this.colorChangeInterval = 2000; // Change colors every 2 seconds
        
        if (this.options.animated) {
            this.animate();
        } else {
            this.render();
        }
        
        // Handle resize
        this.handleResize();
    }
    
    createTorus() {
        this.objects = [];
        this.materials = {
            BUY: new THREE.MeshLambertMaterial({ color: 0x00ff88, transparent: true, opacity: 0.9 }),
            SELL: new THREE.MeshLambertMaterial({ color: 0xff4444, transparent: true, opacity: 0.9 }),
            HOLD: new THREE.MeshLambertMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 }),
            NORMAL: new THREE.MeshLambertMaterial({ color: 0x64748b, transparent: true, opacity: 0.7 })
        };
        
        const geometry = new THREE.SphereGeometry(0.3, 8, 6);
        
        // Create simplified torus structure
        for (let ring = 0; ring < this.options.rings; ring++) {
            for (let box = 0; box < this.options.boxesPerRing; box++) {
                const mesh = new THREE.Mesh(geometry, this.materials.NORMAL.clone());
                
                // Position on torus
                const ringAngle = (ring / this.options.rings) * Math.PI * 2;
                const boxAngle = (box / this.options.boxesPerRing) * Math.PI * 2;
                
                const majorRadius = 8;
                const minorRadius = 3;
                
                const x = (majorRadius + minorRadius * Math.cos(boxAngle)) * Math.cos(ringAngle);
                const y = (majorRadius + minorRadius * Math.cos(boxAngle)) * Math.sin(ringAngle);
                const z = minorRadius * Math.sin(boxAngle);
                
                mesh.position.set(x, y, z);
                
                // Store metadata
                mesh.userData = {
                    ring: ring,
                    box: box,
                    lastAction: 'HOLD'
                };
                
                this.scene.add(mesh);
                this.objects.push(mesh);
            }
        }
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        const time = Date.now();
        
        // Rotate the entire torus
        if (this.objects.length > 0) {
            this.objects.forEach(obj => {
                obj.parent = this.scene;
            });
            this.scene.rotation.y += 0.005;
            this.scene.rotation.x += 0.002;
        }
        
        // Change colors randomly to simulate trading
        if (this.options.colorChange && time - this.lastColorChange > this.colorChangeInterval) {
            this.updateColors();
            this.lastColorChange = time;
        }
        
        this.render();
    }
    
    updateColors() {
        const actions = ['BUY', 'SELL', 'HOLD'];
        const numToUpdate = Math.floor(this.objects.length * 0.1); // Update 10% of objects
        
        for (let i = 0; i < numToUpdate; i++) {
            const randomIndex = Math.floor(Math.random() * this.objects.length);
            const obj = this.objects[randomIndex];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            
            obj.material.color.copy(this.materials[randomAction].color);
            obj.material.opacity = this.materials[randomAction].opacity;
            obj.userData.lastAction = randomAction;
        }
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            if (!this.canvas) return;
            
            const width = this.canvas.offsetWidth;
            const height = this.canvas.offsetHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
            this.render();
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up Three.js resources
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up geometries and materials
        this.objects.forEach(obj => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
        
        this.objects = [];
    }
}

// Demo Trading Simulation
class DemoTradingSimulation {
    constructor() {
        this.isRunning = false;
        this.traders = [];
        this.priceHistory = [];
        this.currentPrice = 100;
        this.stats = {
            buying: 0,
            selling: 0,
            holding: 0
        };
        
        this.initializeTraders();
    }
    
    initializeTraders() {
        // Create simplified traders for demo
        for (let i = 0; i < 100; i++) {
            this.traders.push({
                id: i,
                fastEMA: 9 + Math.floor(Math.random() * 16), // 9-24
                mediumEMA: 30 + Math.floor(Math.random() * 25), // 30-54
                slowEMA: 60 + Math.floor(Math.random() * 20), // 60-79
                lastAction: 'HOLD',
                performance: 0
            });
        }
    }
    
    updatePrice() {
        // Simulate price movement
        const change = (Math.random() - 0.5) * 2; // -1 to +1
        this.currentPrice += change;
        this.currentPrice = Math.max(90, Math.min(110, this.currentPrice)); // Keep in range
        
        this.priceHistory.push(this.currentPrice);
        if (this.priceHistory.length > 100) {
            this.priceHistory.shift();
        }
        
        this.updateTraders();
    }
    
    updateTraders() {
        this.stats = { buying: 0, selling: 0, holding: 0 };
        
        this.traders.forEach(trader => {
            // Simplified EMA calculation for demo
            if (this.priceHistory.length >= trader.slowEMA) {
                const signal = this.generateSignal(trader);
                trader.lastAction = signal;
                
                this.stats[signal.toLowerCase() + 'ing']++;
            } else {
                trader.lastAction = 'HOLD';
                this.stats.holding++;
            }
        });
    }
    
    generateSignal(trader) {
        // Simplified signal generation for demo
        const recentPrices = this.priceHistory.slice(-10);
        const avgRecent = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const currentPrice = this.priceHistory[this.priceHistory.length - 1];
        
        if (currentPrice > avgRecent * 1.02) {
            return 'BUY';
        } else if (currentPrice < avgRecent * 0.98) {
            return 'SELL';
        } else {
            return 'HOLD';
        }
    }
    
    start() {
        this.isRunning = true;
        this.run();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    run() {
        if (!this.isRunning) return;
        
        this.updatePrice();
        
        setTimeout(() => this.run(), 1000); // Update every second
    }
}

// Initialize demos when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize demo visualizations
    const demoCanvas = document.getElementById('demo-canvas');
    const solutionCanvas = document.getElementById('solution-canvas');
    
    if (demoCanvas) {
        const demoViz = new DemoVisualization('demo-canvas', {
            rings: 15,
            boxesPerRing: 15,
            animated: true,
            colorChange: true
        });
        
        // Store reference for cleanup
        window.demoViz = demoViz;
    }
    
    if (solutionCanvas) {
        const solutionViz = new DemoVisualization('solution-canvas', {
            rings: 20,
            boxesPerRing: 20,
            animated: true,
            colorChange: false
        });
        
        // Store reference for cleanup
        window.solutionViz = solutionViz;
    }
    
    // Initialize trading simulation
    window.demoSimulation = new DemoTradingSimulation();
    window.demoSimulation.start();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        if (window.demoViz) window.demoViz.destroy();
        if (window.solutionViz) window.solutionViz.destroy();
        if (window.demoSimulation) window.demoSimulation.stop();
    });
});

// Demo interaction functions
function showLiveDemo() {
    if (confirm('This will open the live trading system. Continue?')) {
        window.open('http://localhost:8000/', '_blank');
    }
}

// Print functionality
function printDemo() {
    window.print();
}

// Export to PDF functionality (requires print dialog)
function exportToPDF() {
    const originalTitle = document.title;
    document.title = 'Eye_of_the_Market_Professional_Demo';
    
    setTimeout(() => {
        window.print();
        document.title = originalTitle;
    }, 100);
}

// Add print button to page
document.addEventListener('DOMContentLoaded', function() {
    // Add floating print button
    const printButton = document.createElement('button');
    printButton.innerHTML = '🖨️ Print/PDF';
    printButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: #4299e1;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    printButton.onclick = exportToPDF;
    
    document.body.appendChild(printButton);
    
    // Hide print button when printing
    const printStyle = document.createElement('style');
    printStyle.textContent = `
        @media print {
            button {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(printStyle);
});
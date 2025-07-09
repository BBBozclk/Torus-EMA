// Scene Manager for 3D Torus Visualization
class SceneManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.objects = [];
        this.clickedObjects = new Set();
        this.ringGroups = [];
        
        // Materials
        this.normalMaterial = new THREE.MeshBasicMaterial({ color: 0x4a90e2, transparent: true, opacity: 0.8 });
        this.highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b, transparent: true, opacity: 0.9 });
        
        // Controls
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.zoom = 25;
        this.fixedViewMode = false;
        
        // Mouse controls
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }
    
    init() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
        document.body.appendChild(this.renderer.domElement);
        
        // Create torus
        this.createTorus();
        
        // Set camera position
        this.camera.position.set(0, 0, 25);
        
        // Add event listeners
        this.addEventListeners();
        
        // Start animation loop
        this.animate();
    }
    
    createTorus() {
        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const majorRadius = 8;
        const minorRadius = 3;
        const objectsPerRow = 100;
        const objectsPerCircle = 100;
        
        for (let i = 0; i < objectsPerRow; i++) {
            this.ringGroups[i] = [];
        }
        
        for (let i = 0; i < objectsPerRow; i++) {
            for (let j = 0; j < objectsPerCircle; j++) {
                const u = (i / objectsPerRow) * Math.PI * 2;
                const v = (j / objectsPerCircle) * Math.PI * 2;
                
                const x = (majorRadius + minorRadius * Math.cos(v)) * Math.cos(u);
                const y = (majorRadius + minorRadius * Math.cos(v)) * Math.sin(u);
                const z = minorRadius * Math.sin(v);
                
                const mesh = new THREE.Mesh(geometry, this.normalMaterial.clone());
                mesh.position.set(x, y, z);
                mesh.userData = { 
                    id: i * objectsPerCircle + j, 
                    clicked: false,
                    ringIndex: i,
                    boxIndex: j
                };
                
                this.scene.add(mesh);
                this.objects.push(mesh);
                this.ringGroups[i].push(mesh);
            }
        }
    }
    
    addEventListeners() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));
        document.addEventListener('mouseup', (e) => this.onMouseUp(e));
        document.addEventListener('click', (e) => this.onMouseClick(e));
        document.addEventListener('wheel', (e) => this.onWheel(e));
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onMouseMove(event) {
        if (this.isMouseDown && !this.fixedViewMode) {
            const deltaX = event.clientX - this.mouseX;
            const deltaY = event.clientY - this.mouseY;
            
            this.targetRotationY += deltaX * 0.01;
            this.targetRotationX += deltaY * 0.01;
            this.targetRotationX = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.targetRotationX));
            
            this.mouseX = event.clientX;
            this.mouseY = event.clientY;
        }
    }
    
    onMouseDown(event) {
        this.isMouseDown = true;
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;
    }
    
    onMouseUp(event) {
        this.isMouseDown = false;
    }
    
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.objects);
        
        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const objectId = clickedObject.userData.id;
            
            if (!this.clickedObjects.has(objectId)) {
                this.clickedObjects.add(objectId);
                clickedObject.material = this.highlightMaterial.clone();
                clickedObject.userData.clicked = true;
                document.getElementById('clickedCount').textContent = this.clickedObjects.size;
            }
        }
    }
    
    onWheel(event) {
        if (!this.fixedViewMode) {
            this.zoom += event.deltaY * 0.01;
            this.zoom = Math.max(5, Math.min(50, this.zoom));
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setFixedView() {
        this.fixedViewMode = !this.fixedViewMode;
        const btn = document.getElementById('fixedViewBtn');
        
        if (this.fixedViewMode) {
            this.camera.position.set(-12.0, 0.1, 8.0);
            this.camera.lookAt(0, 0, 0);
            btn.classList.add('active');
            btn.textContent = 'Exit Fixed View';
        } else {
            btn.classList.remove('active');
            btn.textContent = 'Fixed View';
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (!this.fixedViewMode) {
            this.rotationX += (this.targetRotationX - this.rotationX) * 0.1;
            this.rotationY += (this.targetRotationY - this.rotationY) * 0.1;
            
            const radius = this.zoom;
            this.camera.position.x = radius * Math.sin(this.rotationY) * Math.cos(this.rotationX);
            this.camera.position.y = radius * Math.sin(this.rotationX);
            this.camera.position.z = radius * Math.cos(this.rotationY) * Math.cos(this.rotationX);
            this.camera.lookAt(0, 0, 0);
            
            this.scene.rotation.y += 0.006;
        }
        
        this.updateFPS();
        this.updateCameraPosition();
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateFPS() {
        if (!this.lastTime) this.lastTime = 0;
        if (!this.frameCount) this.frameCount = 0;
        
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            document.getElementById('fps').textContent = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }
    
    updateCameraPosition() {
        const x = Math.round(this.camera.position.x * 10) / 10;
        const y = Math.round(this.camera.position.y * 10) / 10;
        const z = Math.round(this.camera.position.z * 10) / 10;
        document.getElementById('cameraPos').textContent = `X: ${x}, Y: ${y}, Z: ${z}`;
    }
}
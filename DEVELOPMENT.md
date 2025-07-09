# Development Workflow - Eye of the Market

## 🔄 **Safe Development Strategy**

### **Current Setup**
- **Live Production**: `main` branch → https://bbbozclk.github.io/Torus-EMA/torus-ema-trading/
- **Development**: `development` branch → Local testing
- **Features**: Feature branches → Specific improvements

## 🛠️ **Development Workflow**

### **1. Start Development**
```bash
# Switch to development branch
git checkout development

# Start local server
cd torus-ema-trading
python3 -m http.server 8000
# Access: http://localhost:8000
```

### **2. Make Changes**
```bash
# Edit files in torus-ema-trading/
# Test locally at http://localhost:8000
# Commit changes to development branch

git add .
git commit -m "Add new feature: description"
```

### **3. Test Thoroughly**
- ✅ Test all trading functions
- ✅ Verify 3D visualization works
- ✅ Check admin panel functionality
- ✅ Test CSV data loading
- ✅ Ensure no console errors

### **4. Deploy to Production**
```bash
# When ready, merge to main
git checkout main
git merge development
git push origin main

# GitHub Pages will auto-update in 1-2 minutes
```

## 🔧 **Branch Management**

### **Main Branch** (Production)
- Always stable and working
- Only merge tested code
- Auto-deploys to GitHub Pages

### **Development Branch** (Testing)
- Active development work
- Test new features here
- Can break temporarily

### **Feature Branches** (Specific Features)
```bash
# Create feature branch
git checkout development
git checkout -b feature/new-indicators

# Work on feature
# When done, merge back to development
git checkout development
git merge feature/new-indicators
git branch -d feature/new-indicators
```

## 🚨 **Safety Rules**

1. **Never work directly on main** - Always use development branch
2. **Test locally first** - Use http://localhost:8000 
3. **Commit frequently** - Small, focused commits
4. **Backup before big changes** - Create feature branches
5. **Test production** - Check live site after merging

## 📁 **File Structure**
```
torus-ema-trading/
├── index.html              # Main entry point
├── css/styles.css          # All styling
├── js/
│   ├── app.js              # Main application logic
│   ├── scene-manager.js    # 3D visualization
│   ├── ema-calculator.js   # EMA calculations
│   ├── box-trader.js       # Individual trader AI
│   ├── trading-system.js   # Core trading engine
│   ├── admin-panel.js      # Admin interface
│   └── simulation.js       # Historical data
├── package.json            # Development dependencies
└── README.md              # User documentation
```

## 🎯 **Common Development Tasks**

### **Add New Trading Indicator**
1. Edit `js/ema-calculator.js` or create new file
2. Update `js/trading-system.js` to use indicator
3. Modify `js/box-trader.js` for trader decisions
4. Test with various price inputs

### **Improve UI/UX**
1. Edit `css/styles.css` for styling
2. Modify `index.html` for structure
3. Update `js/app.js` for interactions
4. Test responsive design

### **Add New Features**
1. Create feature branch
2. Add new JS module in `js/` folder
3. Link in `index.html`
4. Update `js/app.js` integration

## 🔄 **Quick Commands**

```bash
# Start development
git checkout development
cd torus-ema-trading && python3 -m http.server 8000

# Save progress
git add . && git commit -m "Description of changes"

# Deploy to production
git checkout main && git merge development && git push origin main

# Check which branch you're on
git branch

# See what changed
git status
git diff
```

## 🌐 **URLs**

- **Local Development**: http://localhost:8000
- **Production Site**: https://bbbozclk.github.io/Torus-EMA/torus-ema-trading/
- **Repository**: https://github.com/BBBozclk/Torus-EMA

## 🆘 **Emergency Recovery**

If something breaks on production:
```bash
# Quickly revert to last working version
git checkout main
git reset --hard HEAD~1  # Go back one commit
git push origin main --force
```

This workflow ensures your live site stays stable while allowing safe experimentation!
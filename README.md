# Eye of the Market - Enhanced Trading System

A 3D interactive trading simulation with 10,000 unique traders using Triple EMA strategies.

## Features

- **3D Torus Visualization**: Interactive 3D environment with 10,000 trading agents
- **Triple EMA Strategy**: Each trader uses unique Fast/Medium/Slow EMA parameters
- **Real-time Trading**: Live price updates trigger individual trading decisions
- **Admin Panel**: Control individual traders, view metrics, and export data
- **Historical Simulation**: Load CSV data for backtesting scenarios
- **P&L Heatmap**: Visual representation of trader performance

## Quick Start

### Local Development

1. **Simple HTTP Server** (Recommended):
   ```bash
   cd torus-ema-trading
   python3 -m http.server 8000
   ```
   Then open: http://localhost:8000

2. **Using Node.js** (Alternative):
   ```bash
   npx http-server -p 8000
   ```

3. **Using PHP** (Alternative):
   ```bash
   php -S localhost:8000
   ```

### GitHub Pages Deployment

1. **Fork/Clone** this repository
2. **Enable GitHub Pages** in repository settings
3. **Set source** to main branch / root folder
4. **Access** via: `https://username.github.io/repository-name`

## File Structure

```
torus-ema-trading/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application entry point
│   ├── scene-manager.js # 3D scene and rendering
│   ├── ema-calculator.js # EMA calculation logic
│   ├── box-trader.js   # Individual trader behavior
│   ├── trading-system.js # Trading system management
│   ├── admin-panel.js  # Admin controls
│   └── simulation.js   # Historical data simulation
└── README.md
```

## Usage

### Basic Trading
1. Enter a price in the input field
2. Click "Update" or press Enter
3. Watch traders make individual decisions
4. Colors indicate actions: Green=Buy, Red=Sell, Blue=Hold

### Admin Panel
- Password: `admin2024`
- Select specific traders by ring/box coordinates
- Modify trader aggressiveness (0.0-1.0)
- Force trading actions
- Export trader data

### Historical Simulation
1. Click "Load CSV" to upload historical data
2. Select date range for backtesting
3. Adjust simulation speed
4. Click "Start" to begin automatic price updates

## Technical Details

### EMA Parameters
- **Fast EMA**: 5-24 periods
- **Medium EMA**: 30-54 periods  
- **Slow EMA**: 60-79 periods
- **Total Combinations**: 10,000 unique parameter sets

### Trading Logic
- **BUY**: Fast > Medium > Slow (bullish alignment)
- **SELL**: Fast < Medium < Slow (bearish alignment)
- **HOLD**: Mixed signals or insufficient data

### Performance
- **Traders**: 10,000 individual agents
- **Real-time**: Updates within 2-3 seconds
- **3D Rendering**: 60 FPS target with WebGL

## Keyboard Shortcuts

- **Ctrl+T**: Focus price input field
- **Ctrl+E**: Toggle info panels
- **Enter**: Submit price (when input focused)

## Browser Requirements

- Modern browser with WebGL support
- Chrome/Firefox/Safari/Edge (latest versions)
- Minimum 4GB RAM recommended for smooth performance

## Troubleshooting

### Common Issues

1. **White Screen**: Check browser console for JavaScript errors
2. **Slow Performance**: Reduce browser window size or close other tabs
3. **GitHub Pages 404**: Ensure `index.html` is in root folder
4. **CSV Loading**: Use CSV format with Date, Price columns

### Performance Tips

- Use Chrome for best WebGL performance
- Close unnecessary browser tabs
- Use fixed view mode for better performance
- Limit price history to 50 points automatically

## Development

### Adding New Features

1. **New Trader Logic**: Modify `box-trader.js`
2. **UI Components**: Update `index.html` and `styles.css`
3. **Market Indicators**: Extend `ema-calculator.js`
4. **Data Export**: Enhance `admin-panel.js`

### Testing

Test locally before deployment:
```bash
cd torus-ema-trading
python3 -m http.server 8000
# Open http://localhost:8000
```

## License

This project is for educational and demonstration purposes.

## Author

Refik Baris Ozcelik - Enhanced Trading System v2.0
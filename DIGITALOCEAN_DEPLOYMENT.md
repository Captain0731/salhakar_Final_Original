# DigitalOcean App Platform Deployment Guide

## Error Fixed: JavaScript Heap Out of Memory

### Problem
The app was crashing with "FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory" because:
1. Node.js default heap size (512MB) was too small for the React build
2. The app was trying to run the development server (`react-scripts start`) in production

### Solution Applied

1. **Increased Node.js Memory Limit**
   - Updated build command: `NODE_OPTIONS=--max-old-space-size=4096`
   - This increases heap memory to 4GB during build

2. **Updated package.json Scripts**
   - `build`: Uses increased memory for building
   - `build:prod`: Production build with CI=false (skips tests)
   - `serve`: Serves the built static files

3. **Created Configuration Files**
   - `Procfile`: Tells DigitalOcean to serve static files, not run dev server
   - `.nvmrc`: Specifies Node.js version
   - `public/static.json`: DigitalOcean static site configuration

## DigitalOcean App Platform Configuration

### Build Settings:
- **Build Command**: `NODE_OPTIONS=--max-old-space-size=4096 CI=false npm run build`
- **Install Command**: `npm install`
- **Output Directory**: `build`

### Run Command (if needed):
- **Run Command**: `npm run serve` (only if not using static site mode)

### Environment Variables:
Add these in DigitalOcean dashboard:
- `NODE_ENV=production`
- `NODE_OPTIONS=--max-old-space-size=4096` (optional, already in build command)

### Important Notes:
1. **Do NOT use `npm start` in production** - it runs the dev server
2. Always build first, then serve the static files
3. DigitalOcean should detect this is a static site and serve from `build/` folder
4. If using App Platform (not static site), ensure the run command uses `serve` or configure it as a static site

## Verification

After deployment, check:
- ✅ Build completes without memory errors
- ✅ App serves static files from `build/` directory
- ✅ All routes work (SPA routing via `_redirects` file)
- ✅ No dev server warnings in logs


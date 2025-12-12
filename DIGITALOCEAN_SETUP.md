# DigitalOcean App Platform - Quick Setup Guide

## ✅ What Was Fixed

### Error: "JavaScript heap out of memory"
**Root Cause:** Node.js default memory (512MB) was too small for React build process.

**Solution Applied:**
1. ✅ Increased Node.js heap memory to 4GB in build commands
2. ✅ Added `serve` package to serve static files in production
3. ✅ Created `Procfile` for proper production deployment
4. ✅ Updated `static.json` with build configuration
5. ✅ Created `.nvmrc` for Node.js version specification

## 📋 DigitalOcean App Platform Configuration

### Step 1: App Settings
1. Go to your DigitalOcean App Platform dashboard
2. Select your app → **Settings** → **App-Level Settings**

### Step 2: Build & Deploy Settings

**Build Command:**
```
NODE_OPTIONS=--max-old-space-size=4096 CI=false npm run build
```

**Install Command:**
```
npm install
```

**Output Directory:**
```
build
```

### Step 3: Run Command (IMPORTANT!)

**Option A: Static Site Mode (Recommended)**
- Set **Type**: `Static Site`
- DigitalOcean will automatically serve from `build/` folder
- No run command needed

**Option B: Web Service Mode**
- Set **Type**: `Web Service`
- **Run Command**: `npm run serve`
- This uses the `serve` package to serve static files

### Step 4: Environment Variables (Optional but Recommended)

Add these in **Settings** → **App-Level Environment Variables**:

```
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
```

### Step 5: Resource Settings

**Minimum Recommended:**
- **Build Instance**: 1GB RAM (or higher if build still fails)
- **App Instance**: 512MB RAM (for static site, can be lower)

## 🔍 Verification Checklist

After deployment, verify:
- [ ] Build completes without "heap out of memory" error
- [ ] Build logs show: "Compiled successfully"
- [ ] App is accessible via URL
- [ ] All routes work (SPA routing)
- [ ] No dev server warnings in logs

## ⚠️ Important Notes

1. **DO NOT use `npm start` in production** - it runs the development server
2. **Always build first** - The build command creates optimized production files
3. **Static Site vs Web Service:**
   - Static Site: Cheaper, simpler, auto-serves from build/
   - Web Service: More control, can add server-side logic later

## 🐛 If Build Still Fails

If you still get memory errors:
1. Increase build instance RAM to 2GB or higher
2. Check build logs for specific errors
3. Try reducing dependencies or optimizing bundle size
4. Contact DigitalOcean support to increase memory limits

## 📞 Support

If issues persist:
- Check DigitalOcean App Platform logs
- Verify all configuration matches this guide
- Ensure `package.json` has the updated build scripts


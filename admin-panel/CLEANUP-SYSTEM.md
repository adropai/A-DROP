# 🧹 File Cleanup System

This system prevents auto-generation of unwanted files in the project.

## 🚀 Quick Commands

```bash
# Run manual cleanup
npm run cleanup

# Start development with cleanup
npm run dev:clean

# Build with cleanup
npm run build:clean

# Start file watcher (runs in background)
npm run watch:cleanup

# PowerShell cleanup (Windows)
.\scripts\cleanup.ps1
```

## 📋 Protected File Patterns

The system automatically removes:

### Backup Files
- `*-backup.*`
- `*-new.*`  
- `*-old.*`
- `*-temp.*`
- `*-copy.*`
- `*.backup`
- `*.bak`

### Test Files
- `*.test.*`
- `*.spec.*`
- `**/__tests__/`

### Specific Forbidden Files
- `app/api/cashier/route*.ts`
- `app/api/kitchen/stats/route.ts`
- `components/cashier/CashierOrderCard.tsx`
- `components/cashier/PendingOrderCard.tsx`
- And more...

## 🛡️ Protection Methods

1. **`.gitignore`** - Prevents Git tracking
2. **`.gitattributes`** - File handling rules
3. **Pre-commit Hook** - Blocks commits with forbidden files
4. **Cleanup Scripts** - Manual and automatic removal
5. **File Watcher** - Real-time monitoring

## 🔧 How It Works

1. **Manual Cleanup**: Run `npm run cleanup` anytime
2. **Automatic Cleanup**: Use `npm run watch:cleanup` during development
3. **Git Protection**: Pre-commit hook prevents commits of unwanted files
4. **Pattern Matching**: Automatically detects and removes files by pattern

## 📝 Adding New Forbidden Files

Edit `scripts/cleanup-auto-generated.js` and add to:
- `forbiddenFiles` array for specific files
- `forbiddenPatterns` array for patterns

## 🚨 Emergency Cleanup

If files keep appearing, run:
```bash
npm run cleanup
git add .
git commit -m "Clean auto-generated files"
```

## 🔍 Monitoring

The system logs all actions:
- ✅ Green: Successfully removed
- ❌ Red: Failed to remove
- 🗑️ Auto-removed by watcher

---
*This system ensures your project stays clean and organized! 🎉*

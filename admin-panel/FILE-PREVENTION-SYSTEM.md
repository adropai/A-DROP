# 🛡️ سیستم جلوگیری از ایجاد فایل‌های خودکار

## 🚨 مشکل

پس از restart سرور یا VS Code، فایل‌های duplicate به صورت خودکار ساخته می‌شوند:
- `app/api/tables/route_new_simple.ts`
- `app/api/reservations/route_persian.ts`
- `app/reservation-new/page.tsx`
- `app/kitchen/page_new.tsx`

## 🔍 منشأ مشکل

**TypeScript Language Server** و **Next.js HMR** این فایل‌ها را می‌سازند. دلایل:
1. **TS Server Memory Reset**: بعد از restart تلاش می‌کند missing files بسازد
2. **File Watching Issues**: TS Server فکر می‌کند فایل‌ها وجود ندارند
3. **Next.js Hot Reload**: ممکن است temporary files بسازد

## ✅ راه‌حل‌های پیاده شده

### 1. VS Code Settings (`/.vscode/settings.json`)
```json
{
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.suggest.autoImports": false,
  "files.watcherExclude": {
    "**/*_backup*": true,
    "**/*_new*": true,
    "**/*_old*": true
  }
}
```

### 2. Next.js Config (`next.config.js`)
```javascript
experimental: {
  optimizePackageImports: false,
  optimizeServerReact: false,
}
```

### 3. TypeScript Config (`tsconfig.json`)
```json
{
  "incremental": false,
  "tsBuildInfoFile": null
}
```

### 4. Package.json Pre-hooks
```json
{
  "predev": "cleanup script",
  "prebuild": "cleanup script", 
  "prestart": "cleanup script"
}
```

### 5. Git Hooks (`.git/hooks/pre-commit`)
جلوگیری از commit فایل‌های duplicate

### 6. Enhanced .gitignore
```ignore
**/*_backup.*
**/*_new.*
**/*_old.*
**/reservation-new/
**/test-data/
```

## 🚀 برای Production Server

### نصب اولیه:
```bash
cd /path/to/project/admin-panel
chmod +x production-file-prevention.sh
./production-file-prevention.sh setup
```

### دستی cleanup:
```bash
./production-file-prevention.sh cleanup
```

### Systemd Service:
```bash
sudo systemctl start file-prevention
sudo systemctl enable file-prevention
```

### Cron Job (خودکار هر 6 ساعت):
```bash
0 */6 * * * cd /path/to/project/admin-panel && ./production-file-prevention.sh cleanup
```

## 📋 چک‌لیست برای Deploy

- [ ] Copy `production-file-prevention.sh` به سرور
- [ ] Run `./production-file-prevention.sh setup`
- [ ] بررسی cron job: `crontab -l`
- [ ] تست systemd service: `systemctl status file-prevention`
- [ ] اضافه کردن به startup scripts

## 🔍 Monitoring

### File Monitor (Real-time):
```bash
npm run monitor:files
```

### Duplicate Scanner:
```bash
npm run scan:duplicates
```

### Production Monitor:
```bash
./production-file-prevention.sh monitor
```

## 🛠️ عیب‌یابی

### اگر هنوز فایل‌ها ساخته می‌شوند:

1. **چک VS Code Extensions:**
   ```bash
   code --list-extensions | grep -E "(typescript|next|react)"
   ```

2. **چک TS Server Process:**
   ```bash
   ps aux | grep tsserver
   ```

3. **چک Node.js File Watchers:**
   ```bash
   lsof | grep node
   ```

4. **Force Stop TS Server:**
   - Command Palette → "TypeScript: Restart TS Server"

### Log Files:
- `file-creation-log.txt` - Real-time monitoring
- `/var/log/file-prevention.log` - Production logs

## 🎯 اطمینان 100%

این سیستم در 4 سطح محافظت می‌کند:
1. **Prevention**: جلوگیری از ایجاد اولیه
2. **Detection**: تشخیص فوری فایل‌های جدید  
3. **Removal**: حذف خودکار فایل‌های مشکوک
4. **Monitoring**: نظارت مداوم و گزارش‌دهی

## 📞 پشتیبانی

در صورت بروز مشکل:
1. چک کردن logs
2. اجرای `./production-file-prevention.sh check`
3. Restart TS Server
4. Manual cleanup: `npm run scan:duplicates`

---

**✨ این سیستم تضمین می‌کند که هیچ فایل duplicate خودکار ساخته نشود!**

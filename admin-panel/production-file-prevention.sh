#!/biecho "🔍 حذف فایل‌های خالی و داپلیکیت..."
set -e
find ./app ./components ./lib ./hooks ./stores ./types ./scripts ./testing -type f \( -name "*_backup.*" -o -name "*_old.*" -o -name "*_new.*" -o -name "*_simple.*" -o -name "*_test.*" -o -name "*_copy.*" -o -name "*_temp.*" -o -name "*_duplicate.*" -o -name "page_backup*" -o -name "page_old*" -o -name "page_new*" -o -name "route_backup*" -o -name "route_old*" -o -name "route_new*" -o -name "route_persian*" -o -name "reservation-new*" -o -name "test-data*" \) -exec rm -v {} \;
find ./app ./components ./lib ./hooks ./stores ./types ./scripts ./testing -type f -empty -exec rm -v {} \;
echo "✅ حذف سریع فایل‌های خالی و داپلیکیت انجام شد."h

# Production File Prevention Script
# اجرا شود در سرور قبل از start

echo "� حذف فایل‌های خالی و داپلیکیت..."
set -e
find ./app ./components ./lib ./hooks ./stores ./types ./scripts -type f \( -name "*_backup.*" -o -name "*_old.*" -o -name "*_new.*" -o -name "*_simple.*" -o -name "*_test.*" -o -name "*_copy.*" -o -name "*_temp.*" -o -name "*_duplicate.*" -o -name "page_backup*" -o -name "page_old*" -o -name "page_new*" -o -name "route_backup*" -o -name "route_old*" -o -name "route_new*" -o -name "route_persian*" -o -name "reservation-new*" -o -name "test-data*" \) -exec rm -v {} \;
find ./app ./components ./lib ./hooks ./stores ./types ./scripts -type f -empty -exec rm -v {} \;
echo "✅ حذف سریع فایل‌های خالی و داپلیکیت انجام شد."
echo "=====================================‍"

# تابع حذف فایل‌های مشکوک
cleanup_files() {
    echo "🧹 Cleaning suspicious files..."
    
    # حذف فایل‌های مشکوک
    find . -type f \( \
        -name "*_backup.*" -o \
        -name "*_old.*" -o \
        -name "*_new.*" -o \
        -name "*_simple.*" -o \
        -name "*_test.*" -o \
        -name "*_copy.*" -o \
        -name "*_temp.*" -o \
        -name "*_duplicate.*" -o \
        -name "page_backup*" -o \
        -name "page_old*" -o \
        -name "page_new*" -o \
        -name "route_backup*" -o \
        -name "route_old*" -o \
        -name "route_new*" -o \
        -name "route_persian*" -o \
        -name "test_old.tsx" -o \
        -name "*test_old*" \
    \) -path "./app/*" -o -path "./components/*" -delete -print | sed 's/^/❌ Removed: /'
    
    # حذف پوشه‌های مشکوک
    find . -type d \( \
        -name "*-new" -o \
        -name "*_backup" -o \
        -name "*_old" -o \
        -name "*_test" -o \
        -name "test-data" \
    \) -path "./app/*" -exec rm -rf {} + -print | sed 's/^/❌ Removed dir: /'
    
    # حذف فایل‌های خالی
    find . -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.jsx" -o -name "*.js" \) -size 0 \
        -path "./app/*" -delete -print | sed 's/^/❌ Removed empty: /'
    
    echo "✅ Cleanup completed"
}

# تابع بررسی سیستم
check_system() {
    echo "🔍 System check..."
    
    # بررسی Node.js
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js not found"
        exit 1
    fi
    
    # بررسی npm
    if ! command -v npm &> /dev/null; then
        echo "❌ npm not found"
        exit 1
    fi
    
    echo "✅ System check passed"
}

# تابع تنظیم Cron Job
setup_cron() {
    echo "⏰ Setting up cron job for automatic cleanup..."
    
    # اضافه کردن cron job برای پاک‌سازی هر 6 ساعت
    (crontab -l 2>/dev/null; echo "0 */6 * * * cd $(pwd) && bash production-file-prevention.sh cleanup") | crontab -
    
    echo "✅ Cron job set up successfully"
}

# تابع ایجاد systemd service
create_service() {
    echo "🔧 Creating systemd service..."
    
    cat > /tmp/file-prevention.service << EOF
[Unit]
Description=File Prevention Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=/bin/bash $(pwd)/production-file-prevention.sh monitor
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    if [ "$EUID" -eq 0 ]; then
        mv /tmp/file-prevention.service /etc/systemd/system/
        systemctl daemon-reload
        systemctl enable file-prevention.service
        echo "✅ Service created and enabled"
    else
        echo "⚠️ Run as root to create systemd service"
    fi
}

# تابع monitoring
monitor() {
    echo "👁️ Starting file monitoring..."
    
    while true; do
        cleanup_files > /dev/null 2>&1
        sleep 300  # هر 5 دقیقه چک کن
    done
}

# Main function
main() {
    case "${1:-default}" in
        "cleanup")
            cleanup_files
            ;;
        "check")
            check_system
            ;;
        "setup")
            check_system
            cleanup_files
            setup_cron
            create_service
            echo "🎉 Production File Prevention System setup completed!"
            ;;
        "monitor")
            monitor
            ;;
        *)
            check_system
            cleanup_files
            echo ""
            echo "📖 Usage:"
            echo "  bash $0 cleanup  - Clean suspicious files"
            echo "  bash $0 check    - Check system requirements"
            echo "  bash $0 setup    - Full setup with cron and service"
            echo "  bash $0 monitor  - Start monitoring mode"
            ;;
    esac
}

main "$@"

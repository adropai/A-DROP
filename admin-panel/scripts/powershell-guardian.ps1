# PowerShell File Guardian
# محافظت دائمی از پروژه A-DROP

$PROJECT_DIRS = @(
    "E:\project\A-DROP",
    "E:\project\A-DROP\admin-panel"
)

$FORBIDDEN_PATTERNS = @(
    "*-REPORT.md",
    "*-STATUS.md",
    "*-DOCUMENTATION.md", 
    "*-FIXES-REPORT.md",
    "BUG-FIXES-REPORT.md",
    "COMPLETION-REPORT.md",
    "DATABASE-FIXES-REPORT.md",
    "FINAL-COMPLETION-STATUS.md",
    "SYSTEM-DOCUMENTATION.md",
    "SYSTEM-STATUS-REPORT.md",
    "CUSTOMERS-ERROR-FIX-REPORT.md",
    "ORDER-FORM-IMPROVEMENT-REPORT.md",
    "SEARCH-FIX-REPORT.md",
    "SECURITY-AND-PERMISSIONS-REPORT.md",
    "test-*.js",
    "test-*.ts",
    "test-*.jsx",
    "test-*.tsx",
    "test-*.html",
    "create-test*.*",
    "*-backup.*",
    "*-new.*",
    "*-old.*",
    "*-temp.*"
)

function Remove-ForbiddenFiles {
    $totalRemoved = 0
    
    foreach ($dir in $PROJECT_DIRS) {
        if (Test-Path $dir) {
            Write-Host "Scanning: $dir" -ForegroundColor Cyan
            
            foreach ($pattern in $FORBIDDEN_PATTERNS) {
                $files = Get-ChildItem -Path $dir -Filter $pattern -File -ErrorAction SilentlyContinue
                
                foreach ($file in $files) {
                    try {
                        Remove-Item $file.FullName -Force
                        Write-Host "DESTROYED: $($file.FullName)" -ForegroundColor Red
                        $totalRemoved++
                    } catch {
                        Write-Host "Failed to destroy: $($file.FullName)" -ForegroundColor Yellow
                    }
                }
            }
            
            # حذف فایل‌های خالی MD
            $emptyMdFiles = Get-ChildItem -Path $dir -Filter "*.md" -File | Where-Object { $_.Length -eq 0 }
            foreach ($file in $emptyMdFiles) {
                try {
                    Remove-Item $file.FullName -Force
                    Write-Host "DESTROYED EMPTY: $($file.FullName)" -ForegroundColor Red
                    $totalRemoved++
                } catch {
                    Write-Host "Failed to destroy empty: $($file.FullName)" -ForegroundColor Yellow
                }
            }
        }
    }
    
    return $totalRemoved
}

function Start-FileGuardian {
    Write-Host "PowerShell File Guardian Activated!" -ForegroundColor Green
    Write-Host "Protecting A-DROP project from unwanted files..." -ForegroundColor Green
    Write-Host ""
    
    # اجرای اولیه
    $removed = Remove-ForbiddenFiles
    Write-Host "Initial cleanup completed! Removed $removed files." -ForegroundColor Green
    Write-Host ""
    Write-Host "Starting continuous monitoring (every 3 seconds)..." -ForegroundColor Yellow
    Write-Host "Press Ctrl+C to stop"
    Write-Host ""
    
    # نظارت مداوم
    try {
        while ($true) {
            Start-Sleep -Seconds 3
            $removed = Remove-ForbiddenFiles
            
            if ($removed -gt 0) {
                Write-Host "Auto-removed $removed unwanted files at $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Magenta
            }
        }
    } catch {
        Write-Host ""
        Write-Host "PowerShell File Guardian stopped" -ForegroundColor Red
    }
}

# شروع محافظ
Start-FileGuardian

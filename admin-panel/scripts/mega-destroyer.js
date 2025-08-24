const fs = require('fs');
const path = require('path');

// پوشه‌های اصلی پروژه
const PROJECT_DIRS = [
  'E:\\project\\A-DROP',
  'E:\\project\\A-DROP\\admin-panel'
];

// فایل‌های ممنوع
const FORBIDDEN_FILES = [
  // MD Reports (empty)
  'BUG-FIXES-REPORT.md',
  'COMPLETION-REPORT.md', 
  'DATABASE-FIXES-REPORT.md',
  'FINAL-COMPLETION-STATUS.md',
  'SYSTEM-DOCUMENTATION.md',
  'SYSTEM-STATUS-REPORT.md',
  'CUSTOMERS-ERROR-FIX-REPORT.md',
  'ORDER-FORM-IMPROVEMENT-REPORT.md',
  'SEARCH-FIX-REPORT.md',
  'SECURITY-AND-PERMISSIONS-REPORT.md',
  
  // Test files
  'test-api.js',
  'test-apis.js', 
  'test-component.js',
  'test-order-form.html',
  'test-orders.js',
  'test-prisma.js',
  'test-props.js',
  'test-security.js',
  'create-test-order.js'
];

// الگوهای ممنوع
const FORBIDDEN_PATTERNS = [
  /.*-REPORT\.md$/,
  /.*-STATUS\.md$/,
  /.*-DOCUMENTATION\.md$/,
  /.*-FIXES-REPORT\.md$/,
  /^test-.*\.(js|ts|jsx|tsx|html|css|json)$/,
  /^create-test.*\.(js|ts|jsx|tsx|html|css|json)$/,
  /.*-backup\.(js|ts|jsx|tsx)$/,
  /.*-new\.(js|ts|jsx|tsx)$/,
  /.*-old\.(js|ts|jsx|tsx)$/,
  /.*-temp\.(js|ts|jsx|tsx)$/
];

function megaDestroyer() {
  let totalRemoved = 0;
  
  console.log('🔥 MEGA DESTROYER ACTIVATED!');
  console.log('💀 Scanning ALL project directories...\n');
  
  PROJECT_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`🔍 Scanning: ${dir}`);
      const removed = cleanDirectory(dir);
      totalRemoved += removed;
    } else {
      console.log(`⚠️ Directory not found: ${dir}`);
    }
  });
  
  console.log(`\n🎉 MEGA DESTROYER completed! Removed ${totalRemoved} files total.`);
  
  // شروع نظارت مداوم
  startContinuousWatch();
}

function cleanDirectory(dirPath) {
  let removedCount = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isFile()) {
        const shouldRemove = shouldDelete(item, itemPath);
        
        if (shouldRemove) {
          try {
            fs.unlinkSync(itemPath);
            console.log(`💥 DESTROYED: ${itemPath}`);
            removedCount++;
          } catch (error) {
            console.log(`❌ Failed to destroy: ${itemPath}`);
          }
        }
      } else if (stat.isDirectory() && !item.includes('node_modules')) {
        removedCount += cleanDirectory(itemPath);
      }
    });
  } catch (error) {
    console.log(`Error scanning ${dirPath}: ${error.message}`);
  }
  
  return removedCount;
}

function shouldDelete(fileName, filePath) {
  // چک کردن فایل‌های مشخص
  if (FORBIDDEN_FILES.includes(fileName)) {
    return true;
  }
  
  // چک کردن الگوها
  if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(fileName))) {
    return true;
  }
  
  // چک کردن فایل‌های خالی MD
  if (fileName.endsWith('.md')) {
    try {
      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        return true;
      }
    } catch (error) {
      // Ignore error
    }
  }
  
  return false;
}

function startContinuousWatch() {
  console.log('\n🛡️ Starting continuous protection...');
  
  function watchCycle() {
    PROJECT_DIRS.forEach(dir => {
      if (fs.existsSync(dir)) {
        const removed = cleanDirectory(dir);
        if (removed > 0) {
          console.log(`🗑️ Auto-removed ${removed} files from ${dir}`);
        }
      }
    });
    
    setTimeout(watchCycle, 2000); // هر 2 ثانیه چک کن
  }
  
  watchCycle();
}

// شروع نابودگر قدرتمند
megaDestroyer();

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n🛑 MEGA DESTROYER stopped');
  process.exit(0);
});

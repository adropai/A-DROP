#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// فایل‌های ممنوع (بیشتر از قبل)
const forbiddenFiles = [
  // Test files
  'create-test-order.js',
  'test-api.js',
  'test-apis.js',
  'test-component.js',
  'test-order-form.html',
  'test-orders.js',
  'test-prisma.js',
  'test-props.js',
  'test-security.js',
  
  // Backup files
  'components/cashier/CashierPage-backup.tsx',
  'components/customers/CreateCustomerForm-new.tsx',
  'hooks/useSecurity-new.ts',
  
  // Route files
  'app/api/cashier/route.ts',
  'app/api/cashier/route-new.ts',
  'app/api/cashier/daily-report/route.ts',
  'app/api/cashier/registers/route.ts',
  'app/api/cashier/transactions/route.ts',
  'app/api/kitchen/stats/route.ts',
  'app/api/ai-training/datasets-db/route-new.ts',
  'app/api/ai-training/models-db/route-new.ts',
  
  // Components
  'components/cashier/CashierOrderCard.tsx',
  'components/cashier/PendingOrderCard.tsx',
  'components/kitchen/KitchenStatsCards.tsx',
  'components/kitchen/KitchenTicketCard.tsx'
];

// الگوهای ممنوع (با regex قدرتمندتر)
const forbiddenPatterns = [
  /.*-backup\..*$/,
  /.*-new\..*$/,
  /.*-old\..*$/,
  /.*-temp\..*$/,
  /.*-copy\..*$/,
  /.*\.backup$/,
  /.*\.bak$/,
  /.*\.test\..*$/,
  /.*\.spec\..*$/,
  /test-.*\..*$/,
  /.*-test\..*$/,
  /route-new\.ts$/,
  /route-backup\.ts$/,
  /route-old\.ts$/
];

// پوشه‌هایی که باید چک شوند
const checkDirs = [
  'app',
  'components',
  'hooks',
  'lib',
  'scripts',
  'stores',
  'types'
];

function aggressiveCleanup() {
  let removedCount = 0;
  
  console.log('🚀 Starting aggressive cleanup...\n');
  
  // حذف فایل‌های مشخص
  forbiddenFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`✅ Removed: ${file}`);
        removedCount++;
      } catch (error) {
        console.log(`❌ Failed to remove: ${file} - ${error.message}`);
      }
    }
  });
  
  // حذف بر اساس الگو در پوشه‌های مشخص
  function cleanDirectory(dir) {
    const fullDirPath = path.join(process.cwd(), dir);
    
    if (!fs.existsSync(fullDirPath)) return;
    
    function scanRecursively(currentPath, relativePath = '') {
      const items = fs.readdirSync(currentPath);
      
      items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const relativeItemPath = path.join(relativePath, item).replace(/\\/g, '/');
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          scanRecursively(itemPath, relativeItemPath);
        } else {
          // چک کردن الگوهای ممنوع
          const shouldRemove = forbiddenPatterns.some(pattern => pattern.test(item));
          
          if (shouldRemove) {
            try {
              fs.unlinkSync(itemPath);
              console.log(`✅ Removed pattern match: ${relativeItemPath}`);
              removedCount++;
            } catch (error) {
              console.log(`❌ Failed to remove: ${relativeItemPath} - ${error.message}`);
            }
          }
        }
      });
    }
    
    scanRecursively(fullDirPath, dir);
  }
  
  // پاکسازی پوشه‌ها
  checkDirs.forEach(cleanDirectory);
  
  // حذف فایل‌های خالی
  function removeEmptyFiles() {
    checkDirs.forEach(dir => {
      const fullDirPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullDirPath)) return;
      
      function scanForEmpty(currentPath, relativePath = '') {
        const items = fs.readdirSync(currentPath);
        
        items.forEach(item => {
          const itemPath = path.join(currentPath, item);
          const relativeItemPath = path.join(relativePath, item).replace(/\\/g, '/');
          const stat = fs.statSync(itemPath);
          
          if (stat.isDirectory()) {
            scanForEmpty(itemPath, relativeItemPath);
          } else if (stat.size === 0 && item.endsWith('.ts')) {
            try {
              fs.unlinkSync(itemPath);
              console.log(`✅ Removed empty file: ${relativeItemPath}`);
              removedCount++;
            } catch (error) {
              console.log(`❌ Failed to remove empty: ${relativeItemPath}`);
            }
          }
        });
      }
      
      scanForEmpty(fullDirPath, dir);
    });
  }
  
  removeEmptyFiles();
  
  console.log(`\n🎉 Aggressive cleanup completed! Removed ${removedCount} files.`);
}

// اجرای فوری
aggressiveCleanup();

module.exports = aggressiveCleanup;

#!/usr/bin/env node

/**
 * Script to prevent auto-generation of unnecessary files
 * Run this after each development session
 */

const fs = require('fs');
const path = require('path');

// Files that should not exist
const forbiddenFiles = [
  'app/api/ai-training/models-db/route-new.ts',
  'app/api/cashier/route.ts',
  'app/api/cashier/route-new.ts',
  'app/api/cashier/daily-report/route.ts',
  'app/api/cashier/registers/route.ts',
  'app/api/cashier/transactions/route.ts',
  'app/api/kitchen/stats/route.ts',
  'app/api/inventory/categories/[id]/route.ts',
  'components/cashier/CashierOrderCard.tsx',
  'components/cashier/CashierPage-backup.tsx',
  'components/cashier/PendingOrderCard.tsx',
  'components/kitchen/KitchenStatsCards.tsx',
  'components/kitchen/KitchenTicketCard.tsx',
  'components/customers/CreateCustomerForm-new.tsx',
  'components/common/PersianDatePicker/index.tsx'
];

// Patterns to check
const forbiddenPatterns = [
  /.*-backup\.(ts|tsx|js|jsx)$/,
  /.*-new\.(ts|tsx|js|jsx)$/,
  /.*-old\.(ts|tsx|js|jsx)$/,
  /.*-temp\.(ts|tsx|js|jsx)$/,
  /.*-copy\.(ts|tsx|js|jsx)$/,
  /.*\.test\.(ts|tsx|js|jsx)$/,
  /.*\.spec\.(ts|tsx|js|jsx)$/
];

function cleanupFiles() {
  let cleanedCount = 0;

  // Check specific forbidden files
  forbiddenFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`✅ Removed: ${filePath}`);
        cleanedCount++;
      } catch (error) {
        console.log(`❌ Failed to remove: ${filePath}`);
      }
    }
  });

  // Check for forbidden patterns recursively
  function checkDirectory(dir) {
    if (dir.includes('node_modules')) return;
    
    try {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          checkDirectory(fullPath);
        } else {
          // Check if file matches forbidden patterns
          forbiddenPatterns.forEach(pattern => {
            if (pattern.test(file)) {
              try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Removed pattern match: ${fullPath}`);
                cleanedCount++;
              } catch (error) {
                console.log(`❌ Failed to remove: ${fullPath}`);
              }
            }
          });
          
          // Check for empty files
          if (stat.size === 0 && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
            // Don't remove if it's a legitimate empty file (like index.ts exports)
            const content = fs.readFileSync(fullPath, 'utf8').trim();
            if (content === '') {
              try {
                fs.unlinkSync(fullPath);
                console.log(`✅ Removed empty file: ${fullPath}`);
                cleanedCount++;
              } catch (error) {
                console.log(`❌ Failed to remove empty file: ${fullPath}`);
              }
            }
          }
        }
      });
    } catch (error) {
      // Ignore permission errors
    }
  }

  checkDirectory('./app');
  checkDirectory('./components');
  checkDirectory('./hooks');
  checkDirectory('./lib');

  console.log(`\n🎉 Cleanup completed! Removed ${cleanedCount} files.`);
}

// Run cleanup
cleanupFiles();

module.exports = { cleanupFiles };

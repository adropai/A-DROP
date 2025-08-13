#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const suspiciousPatterns = [
  /_backup\./, /_old\./, /_new\./, /_simple\./, /_test\./, /_copy\./, /_temp\./, /_duplicate\./,
  /page_backup/, /page_old/, /page_new/, /route_backup/, /route_old/, /route_new/, /route_persian/, /reservation-new/, /test-data/
];

function scanAndDelete(dir) {
  if (!fs.existsSync(dir)) return;
  
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanAndDelete(fullPath);
    } else {
      const isEmpty = stat.size === 0;
      const isSuspicious = suspiciousPatterns.some(p => p.test(file));
      
      if (isEmpty || isSuspicious) {
        console.log('🗑️ حذف فایل:', fullPath);
        fs.unlinkSync(fullPath);
      }
    }
  });
}

console.log('🔍 شروع مانیتورینگ و حذف فایل‌های خالی و داپلیکیت...');
const rootDirs = ['./app', './components', './lib', './hooks', './stores', './types', './scripts'];
rootDirs.forEach(scanAndDelete);
console.log('✅ حذف سریع فایل‌های خالی و داپلیکیت انجام شد.');

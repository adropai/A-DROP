#!/usr/bin/env node

/**
 * 🧹 Project Cleanup Tool - پیدا کردن و پاکسازی فایل‌های تکراری و خالی
 * 
 * این ابزار 4 نوع بررسی انجام می‌دهد:
 * 1. پیدا کردن فایل‌های خالی
 * 2. شناسایی فایل‌های تکراری
 * 3. پیدا کردن پوشه‌های خالی
 * 4. شناسایی فایل‌های backup/temp/old
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// رنگ‌ها برای terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// پترن‌های مشکوک
const suspiciousPatterns = [
  /_backup\./, /_old\./, /_new\./, /_simple\./, /_test\./, /_copy\./, /_temp\./, /_duplicate\./,
  /-backup\./, /-old\./, /-new\./, /-simple\./, /-test\./, /-copy\./, /-temp\./, /-duplicate\./,
  /page_backup/, /page_old/, /page_new/, /route_backup/, /route_old/, /route_new/, 
  /route_persian/, /reservation-new/, /test-data/, /-fast\.js$/, /-slow\.js$/
];

// پوشه‌هایی که باید نادیده گرفته شوند
const ignoreDirs = ['node_modules', '.git', '.next', 'dist', 'build', 'coverage', '.vercel'];

// نتایج
const results = {
  emptyFiles: [],
  duplicateFiles: new Map(),
  emptyDirs: [],
  suspiciousFiles: [],
  fileHashes: new Map()
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  log(`\n${colors.bold}${'='.repeat(60)}${colors.reset}`);
  log(`${colors.bold}${colors.cyan}  ${title}${colors.reset}`);
  log(`${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

// 1️⃣ پیدا کردن فایل‌های خالی
function findEmptyFiles(dir) {
  if (!fs.existsSync(dir) || ignoreDirs.some(ignore => dir.includes(ignore))) return;
  
  try {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findEmptyFiles(fullPath);
      } else if (stat.isFile()) {
        if (stat.size === 0) {
          results.emptyFiles.push(fullPath);
        }
      }
    });
  } catch (error) {
    // نادیده گیری خطاهای permission
  }
}

// 2️⃣ محاسبه hash فایل برای پیدا کردن duplicates
function calculateFileHash(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (error) {
    return null;
  }
}

// 3️⃣ پیدا کردن فایل‌های تکراری
function findDuplicateFiles(dir) {
  if (!fs.existsSync(dir) || ignoreDirs.some(ignore => dir.includes(ignore))) return;
  
  try {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findDuplicateFiles(fullPath);
      } else if (stat.isFile() && stat.size > 0) {
        const hash = calculateFileHash(fullPath);
        if (hash) {
          if (results.fileHashes.has(hash)) {
            const existingFile = results.fileHashes.get(hash);
            if (!results.duplicateFiles.has(hash)) {
              results.duplicateFiles.set(hash, [existingFile]);
            }
            results.duplicateFiles.get(hash).push(fullPath);
          } else {
            results.fileHashes.set(hash, fullPath);
          }
        }
      }
    });
  } catch (error) {
    // نادیده گیری خطاهای permission
  }
}

// 4️⃣ پیدا کردن پوشه‌های خالی
function findEmptyDirs(dir) {
  if (!fs.existsSync(dir) || ignoreDirs.some(ignore => dir.includes(ignore))) return;
  
  try {
    const items = fs.readdirSync(dir);
    
    if (items.length === 0) {
      results.emptyDirs.push(dir);
      return;
    }
    
    let hasFiles = false;
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isFile()) {
        hasFiles = true;
      } else if (stat.isDirectory()) {
        findEmptyDirs(fullPath);
      }
    });
    
    // اگر فقط پوشه‌های خالی داشته باشد
    if (!hasFiles && items.every(item => {
      const fullPath = path.join(dir, item);
      return fs.statSync(fullPath).isDirectory();
    })) {
      const allSubDirsEmpty = items.every(item => {
        const fullPath = path.join(dir, item);
        return results.emptyDirs.includes(fullPath);
      });
      
      if (allSubDirsEmpty) {
        results.emptyDirs.push(dir);
      }
    }
  } catch (error) {
    // نادیده گیری خطاهای permission
  }
}

// 5️⃣ پیدا کردن فایل‌های مشکوک
function findSuspiciousFiles(dir) {
  if (!fs.existsSync(dir) || ignoreDirs.some(ignore => dir.includes(ignore))) return;
  
  try {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        findSuspiciousFiles(fullPath);
      } else if (stat.isFile()) {
        if (suspiciousPatterns.some(pattern => pattern.test(file))) {
          results.suspiciousFiles.push(fullPath);
        }
      }
    });
  } catch (error) {
    // نادیده گیری خطاهای permission
  }
}

// 📊 نمایش نتایج
function displayResults() {
  header('📄 فایل‌های خالی');
  if (results.emptyFiles.length > 0) {
    results.emptyFiles.forEach(file => {
      log(`❌ ${file}`, 'red');
    });
    log(`\n📊 تعداد کل: ${results.emptyFiles.length} فایل خالی`, 'yellow');
  } else {
    log('✅ هیچ فایل خالی پیدا نشد!', 'green');
  }

  header('🔄 فایل‌های تکراری');
  if (results.duplicateFiles.size > 0) {
    results.duplicateFiles.forEach((files, hash) => {
      log(`\n🔍 Hash: ${hash.substring(0, 8)}...`, 'cyan');
      files.forEach((file, index) => {
        if (index === 0) {
          log(`  📄 ${file} ${colors.green}(اصل)${colors.reset}`);
        } else {
          log(`  🔄 ${file} ${colors.red}(تکراری)${colors.reset}`);
        }
      });
    });
    log(`\n📊 تعداد کل: ${results.duplicateFiles.size} گروه تکراری`, 'yellow');
  } else {
    log('✅ هیچ فایل تکراری پیدا نشد!', 'green');
  }

  header('📁 پوشه‌های خالی');
  if (results.emptyDirs.length > 0) {
    results.emptyDirs.forEach(dir => {
      log(`📁 ${dir}`, 'yellow');
    });
    log(`\n📊 تعداد کل: ${results.emptyDirs.length} پوشه خالی`, 'yellow');
  } else {
    log('✅ هیچ پوشه خالی پیدا نشد!', 'green');
  }

  header('⚠️  فایل‌های مشکوک (backup/temp/old)');
  if (results.suspiciousFiles.length > 0) {
    results.suspiciousFiles.forEach(file => {
      log(`⚠️  ${file}`, 'magenta');
    });
    log(`\n📊 تعداد کل: ${results.suspiciousFiles.length} فایل مشکوک`, 'yellow');
  } else {
    log('✅ هیچ فایل مشکوک پیدا نشد!', 'green');
  }
}

// 🗑️ حذف فایل‌ها (اختیاری)
function cleanupFiles() {
  header('🧹 پاکسازی فایل‌ها');
  
  let totalDeleted = 0;
  
  // حذف فایل‌های خالی
  results.emptyFiles.forEach(file => {
    try {
      fs.unlinkSync(file);
      log(`🗑️  حذف شد: ${file}`, 'red');
      totalDeleted++;
    } catch (error) {
      log(`❌ خطا در حذف: ${file}`, 'red');
    }
  });
  
  // حذف فایل‌های تکراری (غیر از اولی)
  results.duplicateFiles.forEach(files => {
    files.slice(1).forEach(file => {
      try {
        fs.unlinkSync(file);
        log(`🗑️  حذف تکراری: ${file}`, 'red');
        totalDeleted++;
      } catch (error) {
        log(`❌ خطا در حذف: ${file}`, 'red');
      }
    });
  });
  
  // حذف پوشه‌های خالی
  results.emptyDirs.forEach(dir => {
    try {
      fs.rmdirSync(dir);
      log(`🗑️  حذف پوشه: ${dir}`, 'red');
      totalDeleted++;
    } catch (error) {
      log(`❌ خطا در حذف پوشه: ${dir}`, 'red');
    }
  });
  
  log(`\n✅ تعداد کل موارد حذف شده: ${totalDeleted}`, 'green');
}

// 🚀 اجرای اصلی
function main() {
  const args = process.argv.slice(2);
  const shouldCleanup = args.includes('--cleanup') || args.includes('-c');
  
  header('🧹 شروع بررسی پروژه');
  
  const rootDirs = [
    './app', './components', './lib', './hooks', './stores', './types', './public',
    './prisma', './testing'
  ];
  
  log('🔍 در حال جستجوی فایل‌های خالی...', 'blue');
  rootDirs.forEach(dir => findEmptyFiles(dir));
  
  log('🔍 در حال جستجوی فایل‌های تکراری...', 'blue');
  rootDirs.forEach(dir => findDuplicateFiles(dir));
  
  log('🔍 در حال جستجوی پوشه‌های خالی...', 'blue');
  rootDirs.forEach(dir => findEmptyDirs(dir));
  
  log('🔍 در حال جستجوی فایل‌های مشکوک...', 'blue');
  rootDirs.forEach(dir => findSuspiciousFiles(dir));
  
  displayResults();
  
  if (shouldCleanup) {
    cleanupFiles();
  } else {
    header('💡 راهنما');
    log('برای حذف خودکار فایل‌ها، دستور زیر را اجرا کنید:', 'cyan');
    log('node project-cleanup.js --cleanup', 'green');
  }
}

// اجرا
main();

/**
 * 📝 دستورالعمل استفاده:
 * 
 * 1. برای بررسی بدون حذف:
 *    node project-cleanup.js
 * 
 * 2. برای بررسی و حذف خودکار:
 *    node project-cleanup.js --cleanup
 *    یا
 *    node project-cleanup.js -c
 * 
 * 3. ساخت executable:
 *    chmod +x project-cleanup.js
 *    ./project-cleanup.js
 * 
 * ⚠️ توجه: گزینه --cleanup فایل‌ها را به طور دائم حذف می‌کند!
 */

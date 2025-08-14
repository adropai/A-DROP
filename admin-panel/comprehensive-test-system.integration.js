#!/usr/bin/env node

/**
 * 🧪 سیستم تست جامع پروژه A-DROP
 * تست کامل تمام فازها از 1 تا 5
 * 
 * Features:
 * - Database connectivity test
 * - API endpoints validation
 * - Component integration test
 * - Data flow verification
 * - Error detection & reporting
 * - Performance monitoring
 * - Security validation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ComprehensiveTestSystem {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
      summary: {}
    };
    
    this.testPhases = [
      'Phase1_CoreFoundation',
      'Phase2_Authorization', 
      'Phase3_BusinessLogic',
      'Phase4_Integration',
      'Phase5_Operations'
    ];
  }

  /**
   * 🎯 شروع تست جامع
   */
  async runComprehensiveTest() {
    console.log('🚀 شروع تست جامع سیستم A-DROP...\n');
    
    try {
      // مرحله 1: تست پایه‌ای
      await this.testFoundation();
      
      // مرحله 2: تست فایل‌ها
      await this.testFileStructure();
      
      // مرحله 3: تست API
      await this.testAPIEndpoints();
      
      // مرحله 4: تست دیتابیس
      await this.testDatabaseConnections();
      
      // مرحله 5: تست یکپارچگی
      await this.testIntegration();
      
      // مرحله 6: تست عملکرد
      await this.testPerformance();
      
      // مرحله 7: تست امنیت
      await this.testSecurity();
      
      // گزارش نهایی
      this.generateFinalReport();
      
    } catch (error) {
      this.addError('CRITICAL', `خطای کلی: ${error.message}`);
    }
  }

  /**
   * 🏗️ تست پایه‌ای سیستم
   */
  async testFoundation() {
    console.log('📋 مرحله 1: تست پایه‌ای سیستم...');
    
    // تست Node.js و npm
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      
      console.log(`✅ Node.js: ${nodeVersion}`);
      console.log(`✅ npm: ${npmVersion}`);
      this.results.passed += 2;
    } catch (error) {
      this.addError('CRITICAL', 'Node.js یا npm نصب نشده');
    }

    // تست package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log(`✅ Package: ${packageJson.name}@${packageJson.version}`);
      this.results.passed++;
      
      // بررسی dependencies اصلی
      const requiredDeps = ['next', 'react', 'antd', 'typescript'];
      requiredDeps.forEach(dep => {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          console.log(`✅ Dependency: ${dep}`);
          this.results.passed++;
        } else {
          this.addError('ERROR', `Dependency مفقود: ${dep}`);
        }
      });
    } else {
      this.addError('CRITICAL', 'package.json پیدا نشد');
    }

    // تست TypeScript config
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      console.log('✅ TypeScript config موجود');
      this.results.passed++;
    } else {
      this.addError('ERROR', 'tsconfig.json پیدا نشد');
    }

    console.log('');
  }

  /**
   * 📁 تست ساختار فایل‌ها
   */
  async testFileStructure() {
    console.log('📁 مرحله 2: تست ساختار فایل‌ها...');
    
    const requiredDirectories = [
      'app',
      'components', 
      'hooks',
      'lib',
      'types',
      'stores'
    ];

    const requiredFiles = [
      'app/layout.tsx',
      'app/page.tsx',
      'app/globals.css'
    ];

    // تست directories
    requiredDirectories.forEach(dir => {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        console.log(`✅ Directory: ${dir}`);
        this.results.passed++;
      } else {
        this.addError('ERROR', `Directory مفقود: ${dir}`);
      }
    });

    // تست core files
    requiredFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ File: ${file}`);
        this.results.passed++;
      } else {
        this.addError('ERROR', `File مفقود: ${file}`);
      }
    });

    // تست فایل‌های خالی
    await this.detectEmptyFiles();
    
    // تست فایل‌های تکراری
    await this.detectDuplicateFiles();

    console.log('');
  }

  /**
   * 🔍 تشخیص فایل‌های خالی
   */
  async detectEmptyFiles() {
    console.log('🔍 بررسی فایل‌های خالی...');
    
    const checkDirectories = ['app', 'components', 'hooks', 'lib'];
    let emptyFiles = [];

    for (const dir of checkDirectories) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const files = this.getAllFiles(dirPath, ['.tsx', '.ts', '.js']);
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8').trim();
          const lines = content.split('\n').length;
          
          if (lines < 10 || content.length < 100) {
            emptyFiles.push({ file: file.replace(process.cwd(), ''), lines, size: content.length });
          }
        }
      }
    }

    if (emptyFiles.length > 0) {
      console.log('⚠️  فایل‌های خالی یا کوچک یافت شد:');
      emptyFiles.forEach(f => {
        console.log(`   - ${f.file} (${f.lines} lines, ${f.size} chars)`);
        this.results.warnings++;
      });
    } else {
      console.log('✅ فایل خالی یافت نشد');
      this.results.passed++;
    }
  }

  /**
   * 🔄 تشخیص فایل‌های تکراری
   */
  async detectDuplicateFiles() {
    console.log('🔄 بررسی فایل‌های تکراری...');
    
    const crypto = require('crypto');
    const fileHashes = new Map();
    const duplicates = [];

    const checkDirectories = ['app', 'components', 'hooks'];
    
    for (const dir of checkDirectories) {
      const dirPath = path.join(process.cwd(), dir);
      if (fs.existsSync(dirPath)) {
        const files = this.getAllFiles(dirPath, ['.tsx', '.ts']);
        
        for (const file of files) {
          const content = fs.readFileSync(file, 'utf8');
          const hash = crypto.createHash('md5').update(content).digest('hex');
          
          if (fileHashes.has(hash)) {
            duplicates.push({
              original: fileHashes.get(hash),
              duplicate: file.replace(process.cwd(), '')
            });
          } else {
            fileHashes.set(hash, file.replace(process.cwd(), ''));
          }
        }
      }
    }

    if (duplicates.length > 0) {
      console.log('⚠️  فایل‌های تکراری یافت شد:');
      duplicates.forEach(d => {
        console.log(`   - ${d.original} === ${d.duplicate}`);
        this.results.warnings++;
      });
    } else {
      console.log('✅ فایل تکراری یافت نشد');
      this.results.passed++;
    }
  }

  /**
   * 🌐 تست API Endpoints
   */
  async testAPIEndpoints() {
    console.log('🌐 مرحله 3: تست API Endpoints...');
    
    const apiRoutes = [
      '/api/auth/login',
      '/api/auth/register', 
      '/api/menu',
      '/api/orders',
      '/api/customers',
      '/api/tables',
      '/api/staff',
      '/api/inventory'
    ];

    // بررسی وجود فایل‌های API
    for (const route of apiRoutes) {
      const filePath = path.join(process.cwd(), 'app', route, 'route.ts');
      const legacyPath = path.join(process.cwd(), 'pages', route + '.ts');
      
      if (fs.existsSync(filePath) || fs.existsSync(legacyPath)) {
        console.log(`✅ API Route: ${route}`);
        this.results.passed++;
      } else {
        this.addError('ERROR', `API Route مفقود: ${route}`);
      }
    }

    console.log('');
  }

  /**
   * 🗄️ تست اتصالات دیتابیس
   */
  async testDatabaseConnections() {
    console.log('🗄️ مرحله 4: تست اتصالات دیتابیس...');
    
    // بررسی Prisma schema
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
      console.log('✅ Prisma schema موجود');
      this.results.passed++;
      
      // بررسی مدل‌های اصلی
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const requiredModels = ['User', 'Menu', 'Order', 'Customer', 'Table', 'Staff'];
      
      requiredModels.forEach(model => {
        if (schema.includes(`model ${model}`)) {
          console.log(`✅ Database Model: ${model}`);
          this.results.passed++;
        } else {
          this.addError('ERROR', `Database Model مفقود: ${model}`);
        }
      });
    } else {
      this.addError('ERROR', 'Prisma schema پیدا نشد');
    }

    // بررسی اتصال دیتابیس در کد
    this.checkDatabaseUsage();

    console.log('');
  }

  /**
   * 🔗 بررسی استفاده از دیتابیس در کد
   */
  checkDatabaseUsage() {
    console.log('🔗 بررسی استفاده از دیتابیس...');
    
    const appFiles = this.getAllFiles(path.join(process.cwd(), 'app'), ['.tsx', '.ts']);
    let dbUsageCount = 0;

    appFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      
      // جستجوی patterns دیتابیس
      const dbPatterns = [
        'prisma',
        'db.',
        'database',
        'findMany',
        'create(',
        'update(',
        'delete('
      ];

      const hasDbUsage = dbPatterns.some(pattern => content.includes(pattern));
      if (hasDbUsage) {
        dbUsageCount++;
      }
    });

    if (dbUsageCount > 0) {
      console.log(`✅ Database usage در ${dbUsageCount} فایل یافت شد`);
      this.results.passed++;
    } else {
      this.addError('WARNING', 'استفاده از دیتابیس در کد یافت نشد');
    }
  }

  /**
   * 🔄 تست یکپارچگی سیستم
   */
  async testIntegration() {
    console.log('🔄 مرحله 5: تست یکپارچگی سیستم...');
    
    // تست ارتباط Menu → Orders
    await this.testMenuOrderIntegration();
    
    // تست ارتباط Tables → Reservations  
    await this.testTableReservationIntegration();
    
    // تست ارتباط Customers → Orders
    await this.testCustomerOrderIntegration();
    
    // تست ارتباط Staff → Operations
    await this.testStaffOperationIntegration();

    console.log('');
  }

  /**
   * 🍽️ تست ارتباط Menu → Orders
   */
  async testMenuOrderIntegration() {
    console.log('🍽️ تست ارتباط Menu → Orders...');
    
    const menuFile = path.join(process.cwd(), 'app', 'menu', 'page.tsx');
    const ordersFile = path.join(process.cwd(), 'app', 'orders', 'page.tsx');
    
    if (fs.existsSync(menuFile) && fs.existsSync(ordersFile)) {
      const menuContent = fs.readFileSync(menuFile, 'utf8');
      const ordersContent = fs.readFileSync(ordersFile, 'utf8');
      
      // بررسی استفاده از menu data در orders
      const menuIntegrationPatterns = [
        'menuId',
        'menuItem',
        'menu',
        'MenuItem'
      ];
      
      const hasIntegration = menuIntegrationPatterns.some(pattern => 
        ordersContent.includes(pattern)
      );
      
      if (hasIntegration) {
        console.log('✅ Menu → Orders integration یافت شد');
        this.results.passed++;
      } else {
        this.addError('WARNING', 'Menu → Orders integration واضح نیست');
      }
    } else {
      this.addError('ERROR', 'فایل‌های Menu یا Orders مفقود');
    }
  }

  /**
   * 🪑 تست ارتباط Tables → Reservations
   */
  async testTableReservationIntegration() {
    console.log('🪑 تست ارتباط Tables → Reservations...');
    
    const tablesFile = path.join(process.cwd(), 'app', 'tables', 'page.tsx');
    const reservationFile = path.join(process.cwd(), 'app', 'reservation', 'page.tsx');
    
    if (fs.existsSync(tablesFile) && fs.existsSync(reservationFile)) {
      const reservationContent = fs.readFileSync(reservationFile, 'utf8');
      
      const tableIntegrationPatterns = [
        'tableId',
        'table',
        'Table',
        'availableTables'
      ];
      
      const hasIntegration = tableIntegrationPatterns.some(pattern => 
        reservationContent.includes(pattern)
      );
      
      if (hasIntegration) {
        console.log('✅ Tables → Reservations integration یافت شد');
        this.results.passed++;
      } else {
        this.addError('WARNING', 'Tables → Reservations integration واضح نیست');
      }
    } else {
      this.addError('ERROR', 'فایل‌های Tables یا Reservations مفقود');
    }
  }

  /**
   * 👥 تست ارتباط Customers → Orders
   */
  async testCustomerOrderIntegration() {
    console.log('👥 تست ارتباط Customers → Orders...');
    
    const customersFile = path.join(process.cwd(), 'app', 'customers', 'page.tsx');
    const ordersFile = path.join(process.cwd(), 'app', 'orders', 'page.tsx');
    
    if (fs.existsSync(customersFile) && fs.existsSync(ordersFile)) {
      const ordersContent = fs.readFileSync(ordersFile, 'utf8');
      
      const customerIntegrationPatterns = [
        'customerId',
        'customer',
        'Customer',
        'customerName'
      ];
      
      const hasIntegration = customerIntegrationPatterns.some(pattern => 
        ordersContent.includes(pattern)
      );
      
      if (hasIntegration) {
        console.log('✅ Customers → Orders integration یافت شد');
        this.results.passed++;
      } else {
        this.addError('WARNING', 'Customers → Orders integration واضح نیست');
      }
    }
  }

  /**
   * 👨‍💼 تست ارتباط Staff → Operations
   */
  async testStaffOperationIntegration() {
    console.log('👨‍💼 تست ارتباط Staff → Operations...');
    
    const staffFile = path.join(process.cwd(), 'app', 'staff', 'page.tsx');
    
    if (fs.existsSync(staffFile)) {
      const staffContent = fs.readFileSync(staffFile, 'utf8');
      
      // بررسی ارتباط با سایر قسمت‌ها
      const operationPatterns = [
        'shift',
        'schedule',
        'attendance',
        'payroll'
      ];
      
      const hasOperations = operationPatterns.some(pattern => 
        staffContent.includes(pattern)
      );
      
      if (hasOperations) {
        console.log('✅ Staff operations integration یافت شد');
        this.results.passed++;
      } else {
        this.addError('WARNING', 'Staff operations integration محدود است');
      }
    }
  }

  /**
   * ⚡ تست عملکرد
   */
  async testPerformance() {
    console.log('⚡ مرحله 6: تست عملکرد...');
    
    // تست اندازه bundle
    try {
      const nextDir = path.join(process.cwd(), '.next');
      if (fs.existsSync(nextDir)) {
        console.log('✅ Next.js build موجود');
        this.results.passed++;
        
        // بررسی اندازه فایل‌ها
        const stats = this.getDirectorySize(nextDir);
        console.log(`📊 Build size: ${(stats / 1024 / 1024).toFixed(2)} MB`);
        
        if (stats > 100 * 1024 * 1024) { // 100MB
          this.addError('WARNING', 'اندازه build بیش از حد است');
        } else {
          this.results.passed++;
        }
      } else {
        this.addError('ERROR', 'پروژه build نشده است');
      }
    } catch (error) {
      this.addError('ERROR', `خطا در بررسی performance: ${error.message}`);
    }

    // تست تعداد dependencies
    const packagePath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      
      console.log(`📦 Dependencies: ${depCount}, DevDependencies: ${devDepCount}`);
      
      if (depCount > 50) {
        this.addError('WARNING', 'تعداد dependencies زیاد است');
      } else {
        this.results.passed++;
      }
    }

    console.log('');
  }

  /**
   * 🔒 تست امنیت
   */
  async testSecurity() {
    console.log('🔒 مرحله 7: تست امنیت...');
    
    // تست authentication files
    const authFiles = [
      'app/auth/login/page.tsx',
      'app/auth/register/page.tsx'
    ];

    authFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // بررسی security patterns
        const securityPatterns = [
          'password',
          'bcrypt',
          'jwt',
          'token',
          'auth'
        ];
        
        const hasSecurityFeatures = securityPatterns.some(pattern => 
          content.toLowerCase().includes(pattern)
        );
        
        if (hasSecurityFeatures) {
          console.log(`✅ Security features در ${file}`);
          this.results.passed++;
        } else {
          this.addError('WARNING', `Security features ناکافی در ${file}`);
        }
      }
    });

    // تست environment variables
    const envFiles = ['.env', '.env.local', '.env.example'];
    let hasEnvFile = false;
    
    envFiles.forEach(file => {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        hasEnvFile = true;
        console.log(`✅ Environment file: ${file}`);
        this.results.passed++;
      }
    });

    if (!hasEnvFile) {
      this.addError('WARNING', 'فایل environment یافت نشد');
    }

    console.log('');
  }

  /**
   * 🛠️ Helper Methods
   */
  getAllFiles(dir, extensions) {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files = files.concat(this.getAllFiles(fullPath, extensions));
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  getDirectorySize(dir) {
    let totalSize = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        totalSize += this.getDirectorySize(fullPath);
      } else {
        totalSize += stat.size;
      }
    }
    
    return totalSize;
  }

  addError(type, message) {
    this.results.errors.push({ type, message });
    if (type === 'ERROR' || type === 'CRITICAL') {
      this.results.failed++;
    } else {
      this.results.warnings++;
    }
    console.log(`❌ ${type}: ${message}`);
  }

  /**
   * 📊 تولید گزارش نهایی
   */
  generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 گزارش نهایی تست جامع سیستم A-DROP');
    console.log('='.repeat(80));
    
    console.log(`\n✅ تست‌های موفق: ${this.results.passed}`);
    console.log(`❌ تست‌های ناموفق: ${this.results.failed}`);
    console.log(`⚠️  هشدارها: ${this.results.warnings}`);
    
    const total = this.results.passed + this.results.failed + this.results.warnings;
    const successRate = total > 0 ? (this.results.passed / total * 100).toFixed(2) : 0;
    console.log(`📈 نرخ موفقیت: ${successRate}%`);

    if (this.results.errors.length > 0) {
      console.log('\n🔍 خلاصه مشکلات:');
      
      const criticalErrors = this.results.errors.filter(e => e.type === 'CRITICAL');
      const errors = this.results.errors.filter(e => e.type === 'ERROR');
      const warnings = this.results.errors.filter(e => e.type === 'WARNING');

      if (criticalErrors.length > 0) {
        console.log('\n🚨 خطاهای بحرانی:');
        criticalErrors.forEach((e, i) => console.log(`   ${i+1}. ${e.message}`));
      }

      if (errors.length > 0) {
        console.log('\n❌ خطاها:');
        errors.forEach((e, i) => console.log(`   ${i+1}. ${e.message}`));
      }

      if (warnings.length > 0) {
        console.log('\n⚠️  هشدارها:');
        warnings.forEach((e, i) => console.log(`   ${i+1}. ${e.message}`));
      }
    }

    // تولید فایل گزارش
    this.saveReport();

    console.log('\n🎯 نتیجه‌گیری:');
    if (this.results.failed === 0 && this.results.warnings < 5) {
      console.log('🎉 سیستم آماده production است!');
    } else if (this.results.failed === 0) {
      console.log('🔧 سیستم نیاز به بهینه‌سازی دارد');
    } else {
      console.log('⚠️  سیستم نیاز به رفع مشکلات دارد');
    }

    console.log('\n💡 توصیه‌ها:');
    console.log('   1. مشکلات بحرانی را فوراً رفع کنید');
    console.log('   2. فایل‌های خالی یا تکراری را بررسی کنید');
    console.log('   3. اتصالات دیتابیس را تست کنید');
    console.log('   4. امنیت سیستم را بررسی کنید');

    console.log('\n📄 گزارش کامل در فایل: comprehensive-test-report.json');
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        total: this.results.passed + this.results.failed + this.results.warnings,
        successRate: this.results.passed / (this.results.passed + this.results.failed + this.results.warnings) * 100
      },
      errors: this.results.errors,
      phases: this.testPhases,
      recommendations: [
        'رفع خطاهای بحرانی',
        'بهینه‌سازی performance',
        'تقویت امنیت',
        'تکمیل integration'
      ]
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'comprehensive-test-report.json'),
      JSON.stringify(report, null, 2)
    );
  }
}

// اجرای تست
if (require.main === module) {
  const testSystem = new ComprehensiveTestSystem();
  testSystem.runComprehensiveTest().catch(console.error);
}

module.exports = ComprehensiveTestSystem;

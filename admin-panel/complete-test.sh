#!/bin/bash

# 🧪 اسکریپت تست کامل و جامع پروژه A-DROP
# بررسی تمام اجزا از فاز 1 تا 5

echo "🚀 شروع تست کامل پروژه A-DROP..."
echo "================================================"

# رنگ‌ها برای output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع برای نمایش پیام‌های رنگی
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# شمارنده نتایج
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# تابع برای شمارش نتایج
count_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $1 -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

echo ""
print_info "مرحله 1: بررسی نیازمندی‌های پایه"
echo "----------------------------------------"

# بررسی Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js نصب شده: $NODE_VERSION"
    count_test 0
else
    print_error "Node.js نصب نشده است"
    count_test 1
fi

# بررسی npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm نصب شده: $NPM_VERSION"
    count_test 0
else
    print_error "npm نصب نشده است"
    count_test 1
fi

# بررسی فایل‌های اساسی
echo ""
print_info "مرحله 2: بررسی ساختار پروژه"
echo "----------------------------------------"

essential_files=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "tailwind.config.js"
    "app/layout.tsx"
    "app/page.tsx"
    "app/globals.css"
)

for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "فایل موجود: $file"
        count_test 0
    else
        print_error "فایل مفقود: $file"
        count_test 1
    fi
done

# بررسی directories اساسی
essential_dirs=(
    "app"
    "components"
    "hooks"
    "lib"
    "types"
    "stores"
)

for dir in "${essential_dirs[@]}"; do
    if [ -d "$dir" ]; then
        print_success "پوشه موجود: $dir"
        count_test 0
    else
        print_error "پوشه مفقود: $dir"
        count_test 1
    fi
done

echo ""
print_info "مرحله 3: بررسی صفحات اصلی"
echo "----------------------------------------"

# بررسی صفحات اصلی
main_pages=(
    "app/dashboard/page.tsx"
    "app/menu/page.tsx"
    "app/orders/page.tsx"
    "app/customers/page.tsx"
    "app/tables/page.tsx"
    "app/kitchen/page.tsx"
    "app/staff/page.tsx"
    "app/cashier/page.tsx"
    "app/analytics/page.tsx"
    "app/auth/login/page.tsx"
    "app/auth/register/page.tsx"
)

for page in "${main_pages[@]}"; do
    if [ -f "$page" ]; then
        # بررسی اینکه فایل خالی نباشد
        if [ -s "$page" ]; then
            print_success "صفحه موجود و دارای محتوا: $page"
            count_test 0
        else
            print_warning "صفحه موجود اما خالی: $page"
            count_test 1
        fi
    else
        print_error "صفحه مفقود: $page"
        count_test 1
    fi
done

echo ""
print_info "مرحله 4: بررسی API Routes"
echo "----------------------------------------"

api_routes=(
    "app/api/auth/login/route.ts"
    "app/api/auth/register/route.ts"
    "app/api/menu/route.ts"
    "app/api/orders/route.ts"
    "app/api/customers/route.ts"
    "app/api/tables/route.ts"
    "app/api/staff/route.ts"
    "app/api/inventory/route.ts"
)

for route in "${api_routes[@]}"; do
    if [ -f "$route" ]; then
        print_success "API Route موجود: $route"
        count_test 0
    else
        print_error "API Route مفقود: $route"
        count_test 1
    fi
done

echo ""
print_info "مرحله 5: بررسی Dependencies"
echo "----------------------------------------"

# بررسی node_modules
if [ -d "node_modules" ]; then
    print_success "Dependencies نصب شده"
    count_test 0
else
    print_warning "Dependencies نصب نشده - در حال نصب..."
    npm install
    if [ $? -eq 0 ]; then
        print_success "Dependencies با موفقیت نصب شد"
        count_test 0
    else
        print_error "خطا در نصب Dependencies"
        count_test 1
    fi
fi

# بررسی dependencies اساسی در package.json
if [ -f "package.json" ]; then
    required_deps=("next" "react" "antd" "typescript" "tailwindcss")
    
    for dep in "${required_deps[@]}"; do
        if grep -q "\"$dep\"" package.json; then
            print_success "Dependency موجود: $dep"
            count_test 0
        else
            print_error "Dependency مفقود: $dep"
            count_test 1
        fi
    done
fi

echo ""
print_info "مرحله 6: بررسی TypeScript"
echo "----------------------------------------"

# TypeScript compile check
if command -v npx &> /dev/null; then
    print_info "در حال بررسی TypeScript..."
    npx tsc --noEmit --skipLibCheck > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "TypeScript کامپایل بدون خطا"
        count_test 0
    else
        print_warning "خطاهای TypeScript یافت شد"
        count_test 1
    fi
else
    print_warning "npx در دسترس نیست"
    count_test 1
fi

echo ""
print_info "مرحله 7: تست Build"
echo "----------------------------------------"

# Build test
print_info "در حال تست Build..."
npm run build > build_output.log 2>&1
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    print_success "Build موفقیت‌آمیز"
    count_test 0
else
    print_error "Build ناموفق"
    print_info "نمایش خطاهای Build:"
    tail -20 build_output.log
    count_test 1
fi

# پاک کردن فایل log
rm -f build_output.log

echo ""
print_info "مرحله 8: اجرای تست‌های جامع"
echo "----------------------------------------"

# اجرای تست جامع JavaScript
if [ -f "comprehensive-test-system.js" ]; then
    print_info "اجرای تست جامع سیستم..."
    node comprehensive-test-system.js > comprehensive_output.log 2>&1
    
    if [ $? -eq 0 ]; then
        print_success "تست جامع سیستم موفق"
        count_test 0
    else
        print_warning "تست جامع با هشدار تمام شد"
        count_test 1
    fi
    
    # نمایش خلاصه نتایج
    if grep -q "نرخ موفقیت" comprehensive_output.log; then
        SUCCESS_RATE=$(grep "نرخ موفقیت" comprehensive_output.log | head -1)
        print_info "$SUCCESS_RATE"
    fi
    
    rm -f comprehensive_output.log
else
    print_warning "فایل تست جامع یافت نشد"
    count_test 1
fi

echo ""
print_info "مرحله 9: بررسی فایل‌های خالی و تکراری"
echo "----------------------------------------"

# یافتن فایل‌های خالی
print_info "جستجوی فایل‌های خالی..."
EMPTY_FILES=$(find app components hooks lib -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 < 10 {print $2}' | grep -v total)

if [ -n "$EMPTY_FILES" ]; then
    print_warning "فایل‌های خالی یا کوچک یافت شد:"
    echo "$EMPTY_FILES"
    count_test 1
else
    print_success "فایل خالی یافت نشد"
    count_test 0
fi

echo ""
print_info "مرحله 10: بررسی امنیت"
echo "----------------------------------------"

# بررسی فایل‌های حساس
sensitive_patterns=("password" "secret" "token" "key")
security_issues=0

for pattern in "${sensitive_patterns[@]}"; do
    # جستجو در فایل‌های کد (نه node_modules)
    MATCHES=$(find app components hooks lib -name "*.tsx" -o -name "*.ts" | xargs grep -l "$pattern" 2>/dev/null | wc -l)
    
    if [ "$MATCHES" -gt 0 ]; then
        print_info "الگوی امنیتی '$pattern' در $MATCHES فایل یافت شد"
    fi
done

# بررسی فایل environment
if [ -f ".env" ] || [ -f ".env.local" ] || [ -f ".env.example" ]; then
    print_success "فایل‌های Environment موجود"
    count_test 0
else
    print_warning "فایل Environment یافت نشد"
    count_test 1
fi

echo ""
echo "================================================"
print_info "خلاصه نهایی تست کامل"
echo "================================================"

# محاسبه نرخ موفقیت
if [ $TOTAL_TESTS -gt 0 ]; then
    SUCCESS_RATE=$(( (PASSED_TESTS * 100) / TOTAL_TESTS ))
else
    SUCCESS_RATE=0
fi

echo ""
echo "📊 آمار کلی:"
echo "   ✅ تست‌های موفق: $PASSED_TESTS"
echo "   ❌ تست‌های ناموفق: $FAILED_TESTS"
echo "   📈 کل تست‌ها: $TOTAL_TESTS"
echo "   🎯 نرخ موفقیت: $SUCCESS_RATE%"

echo ""
echo "🎯 نتیجه‌گیری:"
if [ $SUCCESS_RATE -ge 90 ]; then
    print_success "🎉 سیستم عالی! آماده production"
elif [ $SUCCESS_RATE -ge 75 ]; then
    print_warning "🔧 سیستم خوب، نیاز به بهینه‌سازی"
elif [ $SUCCESS_RATE -ge 50 ]; then
    print_warning "⚠️  سیستم نیاز به رفع مشکلات دارد"
else
    print_error "🚨 سیستم نیاز به بازنگری جدی دارد"
fi

echo ""
echo "💡 توصیه‌های نهایی:"
if [ $FAILED_TESTS -gt 0 ]; then
    echo "   🔧 $FAILED_TESTS مشکل نیاز به رفع دارد"
fi

if [ $SUCCESS_RATE -lt 100 ]; then
    echo "   📋 بررسی فایل‌های مفقود و خطاهای یافت شده"
    echo "   🔍 اجرای تست‌های اضافی برای رفع مشکلات"
fi

echo "   📄 نتایج کامل در فایل‌های گزارش موجود است"
echo ""

# ذخیره گزارش نهایی
{
    echo "# گزارش تست کامل A-DROP"
    echo "تاریخ: $(date)"
    echo ""
    echo "## خلاصه نتایج"
    echo "- تست‌های موفق: $PASSED_TESTS"
    echo "- تست‌های ناموفق: $FAILED_TESTS"
    echo "- کل تست‌ها: $TOTAL_TESTS"
    echo "- نرخ موفقیت: $SUCCESS_RATE%"
    echo ""
    echo "## وضعیت سیستم"
    if [ $SUCCESS_RATE -ge 90 ]; then
        echo "🎉 آماده production"
    elif [ $SUCCESS_RATE -ge 75 ]; then
        echo "🔧 نیاز به بهینه‌سازی"
    else
        echo "⚠️ نیاز به رفع مشکلات"
    fi
} > final-test-report.md

print_success "گزارش نهایی در final-test-report.md ذخیره شد"

echo ""
echo "🚀 تست کامل پایان یافت!"

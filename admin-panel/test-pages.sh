#!/bin/bash

echo "🌐 تست دسترسی صفحات پروژه A-DROP"
echo "=================================="

# صبر برای راه‌اندازی کامل سرور
sleep 3

# لیست صفحات برای تست
declare -a test_pages=(
    ""
    "dashboard"
    "orders"
    "menu"
    "customers"
    "cashier"
    "kitchen"
    "delivery"
    "reservation"
    "tables"
    "inventory"
    "staff"
    "roles"
    "loyalty"
    "marketing"
    "analytics"
    "integrations"
    "ai-training"
    "security"
    "support"
    "settings"
    "auth/login"
    "auth/register"
)

BASE_URL="http://localhost:3001"
success_count=0
error_count=0

echo "شروع تست صفحات..."
echo "==================="

for page in "${test_pages[@]}"; do
    if [ -z "$page" ]; then
        url="$BASE_URL/"
        page_name="صفحه اصلی"
    else
        url="$BASE_URL/$page"
        page_name="/$page"
    fi
    
    # تست با curl
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --connect-timeout 5 --max-time 10)
    
    if [ "$response" = "200" ]; then
        echo "✅ $page_name - OK (200)"
        success_count=$((success_count + 1))
    elif [ "$response" = "404" ]; then
        echo "❌ $page_name - Not Found (404)"
        error_count=$((error_count + 1))
    elif [ "$response" = "500" ]; then
        echo "🔴 $page_name - Server Error (500)"
        error_count=$((error_count + 1))
    else
        echo "🟡 $page_name - Response: $response"
        error_count=$((error_count + 1))
    fi
done

echo ""
echo "📊 نتایج تست:"
echo "============="
echo "✅ صفحات موفق: $success_count"
echo "❌ صفحات ناموفق: $error_count"

total_pages=$((success_count + error_count))
if [ $total_pages -gt 0 ]; then
    success_rate=$((success_count * 100 / total_pages))
    echo "📈 نرخ موفقیت: $success_rate%"
fi

echo ""
if [ $error_count -eq 0 ]; then
    echo "🎉 همه صفحات به درستی کار می‌کنند!"
elif [ $success_rate -ge 80 ]; then
    echo "🟡 اکثر صفحات کار می‌کنند، نیاز به بررسی موارد ناموفق"
else
    echo "🔴 مشکلات جدی در دسترسی صفحات وجود دارد"
fi

echo ""
echo "🔍 نکات مهم:"
echo "============"
echo "• اگر ارور 404 مشاهده کردید، احتمالاً routing مشکل دارد"
echo "• اگر ارور 500 مشاهده کردید، مشکل در کد صفحه است"
echo "• برای صفحات نیازمند authentication، ممکن است redirect شوید"

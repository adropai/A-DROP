const fs = require('fs');
const path = require('path');

// اصلاح Antd deprecation warnings
function fixAntdWarnings() {
  console.log('🔧 Fixing Antd deprecation warnings...');
  
  const filePath = 'E:\\project\\A-DROP\\admin-panel\\components\\orders\\CreateOrderForm.tsx';
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let changes = 0;
    
    // Fix bodyStyle -> styles.body
    const bodyStyleRegex = /bodyStyle=\{\{\s*([^}]+)\s*\}\}/g;
    content = content.replace(bodyStyleRegex, (match, styles) => {
      changes++;
      return `styles={{ body: { ${styles} } }}`;
    });
    
    // Fix headStyle -> styles.header  
    const headStyleRegex = /headStyle=\{\{\s*([^}]+)\s*\}\}/g;
    content = content.replace(headStyleRegex, (match, styles) => {
      changes++;
      return `styles={{ header: { ${styles} } }}`;
    });
    
    // Fix combined headStyle + bodyStyle
    const combinedRegex = /headStyle=\{\{\s*([^}]+)\s*\}\}\s*bodyStyle=\{\{\s*([^}]+)\s*\}\}/g;
    content = content.replace(combinedRegex, (match, headStyles, bodyStyles) => {
      changes++;
      return `styles={{ header: { ${headStyles} }, body: { ${bodyStyles} } }}`;
    });
    
    if (changes > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed ${changes} deprecation warnings in CreateOrderForm.tsx`);
    } else {
      console.log('ℹ️ No deprecation warnings found to fix');
    }
    
  } catch (error) {
    console.error('❌ Error fixing warnings:', error.message);
  }
}

fixAntdWarnings();

#!/usr/bin/env node

/**
 * File Watcher to automatically remove unwanted files
 * Run this in the background during development
 */

const fs = require('fs');
const path = require('path');
const { cleanupFiles } = require('./cleanup-auto-generated.js');

console.log('🔍 Starting file watcher to prevent auto-generation...');

// Watch for file changes
const watchDirectories = ['./app', './components', './hooks', './lib'];

function startWatcher() {
  watchDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (eventType === 'rename' && filename) {
          // Check if a forbidden file was created
          const forbiddenPatterns = [
            /-backup\.(ts|tsx|js|jsx)$/,
            /-new\.(ts|tsx|js|jsx)$/,
            /-old\.(ts|tsx|js|jsx)$/,
            /-temp\.(ts|tsx|js|jsx)$/,
            /-copy\.(ts|tsx|js|jsx)$/,
            /\.test\.(ts|tsx|js|jsx)$/,
            /\.spec\.(ts|tsx|js|jsx)$/
          ];

          const isMatch = forbiddenPatterns.some(pattern => pattern.test(filename));
          
          if (isMatch) {
            const fullPath = path.join(dir, filename);
            setTimeout(() => {
              if (fs.existsSync(fullPath)) {
                try {
                  fs.unlinkSync(fullPath);
                  console.log(`🗑️ Auto-removed: ${filename}`);
                } catch (error) {
                  console.log(`❌ Could not remove: ${filename}`);
                }
              }
            }, 1000); // Wait 1 second before removing
          }
        }
      });
    }
  });

  // Run cleanup every 30 seconds
  setInterval(() => {
    cleanupFiles();
  }, 30000);
}

startWatcher();
console.log('✅ File watcher is running. Press Ctrl+C to stop.');

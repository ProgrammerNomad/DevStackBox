// Test script to verify PHP Extensions IPC handler
const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

// Test if getPHPExtensions function works
async function testPHPExtensions() {
  console.log('Testing PHP Extensions functionality...');
  
  try {
    // Import the function
    const getPHPExtensions = require('./main.js').getPHPExtensions;
    
    // Test with PHP 8.2
    const result = await getPHPExtensions('8.2');
    console.log('PHP Extensions Result:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`✅ Successfully loaded ${Object.keys(result.extensions).length} extensions`);
      
      // Show a few examples
      Object.keys(result.extensions).slice(0, 5).forEach(ext => {
        const config = result.extensions[ext];
        console.log(`  - ${ext}: ${config.enabled ? 'enabled' : 'disabled'} (${config.category})`);
      });
    } else {
      console.log('❌ Failed to load extensions:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run test
testPHPExtensions();

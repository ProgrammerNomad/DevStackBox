/**
 * DevStackBox Test - Verify no duplicate classes or errors
 */

// Test if DevStackBox class is properly defined
console.log('Testing DevStackBox initialization...');

// This should not cause any errors
if (typeof DevStackBox !== 'undefined') {
  console.log('✅ DevStackBox class is available');
} else {
  console.log('❌ DevStackBox class not found');
}

// Test Electron API
if (window.electronAPI) {
  console.log('✅ Electron API is available');
  console.log('Available methods:', Object.keys(window.electronAPI));
} else {
  console.log('❌ Electron API not found');
}

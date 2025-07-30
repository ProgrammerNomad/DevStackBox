const PortableServerManager = require('./src/services/PortableServerManager');
const path = require('path');

console.log('🚀 Testing Portable Server Downloads...\n');

async function testDownloads() {
  try {
    const appPath = __dirname;
    const manager = new PortableServerManager(appPath);
    
    console.log('✅ PortableServerManager created');
    
    // Check current installation status
    const status = await manager.checkInstallation();
    console.log('\n📊 Current Installation Status:');
    Object.entries(status).forEach(([key, installed]) => {
      console.log(`  ${installed ? '✅' : '❌'} ${key}: ${installed ? 'Installed' : 'Not Installed'}`);
    });
    
    // Show what would be downloaded
    console.log('\n📦 Available Downloads:');
    Object.entries(manager.downloadUrls).forEach(([key, config]) => {
      console.log(`  • ${key}: ${config.url.split('/').pop()}`);
    });
    
    if (!status.apache) {
      console.log('\n🔄 Testing Apache download (simulated)...');
      // For now, just show what would happen
      console.log(`Would download: ${manager.downloadUrls.apache.url}`);
      console.log(`Extract to: ${path.join(appPath, manager.downloadUrls.apache.extractTo)}`);
    }
    
    console.log('\n🎉 Portable server manager is ready for downloads!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDownloads();

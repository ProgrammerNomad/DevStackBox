#!/usr/bin/env node

/**
 * DevStackBox Bundle Verification Script
 * Verifies that all required server binaries are properly bundled
 */

const fs = require('fs');
const path = require('path');

const appPath = __dirname;

console.log('🔍 DevStackBox Bundle Verification');
console.log('==================================\n');

const checks = [
  // Apache
  {
    name: 'Apache HTTP Server',
    path: path.join(appPath, 'apache', 'bin', 'httpd.exe'),
    required: true
  },
  {
    name: 'Apache Configuration',
    path: path.join(appPath, 'apache', 'conf', 'httpd.conf'),
    required: true
  },
  
  // MySQL
  {
    name: 'MySQL Server',
    path: path.join(appPath, 'mysql', 'bin', 'mysqld.exe'),
    required: true
  },
  {
    name: 'MySQL Client',
    path: path.join(appPath, 'mysql', 'bin', 'mysql.exe'),
    required: true
  },
  
  // PHP Versions
  {
    name: 'PHP 8.1',
    path: path.join(appPath, 'php', '8.1', 'php.exe'),
    required: false
  },
  {
    name: 'PHP 8.2 (Default)',
    path: path.join(appPath, 'php', '8.2', 'php.exe'),
    required: true
  },
  {
    name: 'PHP 8.3',
    path: path.join(appPath, 'php', '8.3', 'php.exe'),
    required: false
  },
  {
    name: 'PHP 8.4',
    path: path.join(appPath, 'php', '8.4', 'php.exe'),
    required: false
  },
  
  // phpMyAdmin
  {
    name: 'phpMyAdmin',
    path: path.join(appPath, 'phpmyadmin', 'index.php'),
    required: true
  }
];

let passed = 0;
let failed = 0;
let optional = 0;

console.log('Checking bundled components...\n');

checks.forEach(check => {
  const exists = fs.existsSync(check.path);
  const status = exists ? '✅' : (check.required ? '❌' : '⚠️');
  const statusText = exists ? 'FOUND' : (check.required ? 'MISSING' : 'OPTIONAL');
  
  console.log(`${status} ${check.name.padEnd(25)} ${statusText}`);
  
  if (exists) {
    passed++;
  } else if (check.required) {
    failed++;
  } else {
    optional++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`📊 Results: ${passed} found, ${failed} missing, ${optional} optional`);

if (failed === 0) {
  console.log('\n🎉 Bundle verification PASSED!');
  console.log('   DevStackBox is ready to use with pre-bundled servers.');
  console.log('   Default PHP version: 8.2');
} else {
  console.log('\n❌ Bundle verification FAILED!');
  console.log('   Missing required components. Please ensure all server');
  console.log('   binaries are properly extracted to their directories.');
}

console.log('\n📁 Expected directory structure:');
console.log(`
DevStackBox/
├── apache/
│   ├── bin/httpd.exe ✓
│   └── conf/httpd.conf ✓
├── mysql/
│   ├── bin/mysqld.exe ✓
│   └── bin/mysql.exe ✓
├── php/
│   ├── 8.1/php.exe (optional)
│   ├── 8.2/php.exe ✓ (default)
│   ├── 8.3/php.exe (optional)
│   └── 8.4/php.exe (optional)
└── phpmyadmin/
    └── index.php ✓
`);

process.exit(failed > 0 ? 1 : 0);

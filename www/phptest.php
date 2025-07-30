<?php
// DevStackBox - PHP Extensions Test
echo "<h1>DevStackBox PHP Configuration Test</h1>";
echo "<h2>PHP Version: " . PHP_VERSION . "</h2>";

echo "<h3>Required Extensions for WordPress & Laravel:</h3>";

$required_extensions = [
    // Core WordPress Requirements
    'curl', 'gd', 'mbstring', 'mysqli', 'openssl', 'xml', 'zip',
    
    // Additional WordPress Recommended
    'exif', 'fileinfo', 'ftp', 'intl', 'soap', 'sockets',
    
    // Laravel Requirements
    'bcmath', 'json', 'tokenizer', 'pdo', 'pdo_mysql',
    
    // Additional Laravel Recommended
    'sodium', 'tidy', 'xsl', 'bz2', 'gettext',
    
    // Performance & Caching
    'opcache', 'sqlite3', 'pdo_sqlite'
];

echo "<table border='1' style='border-collapse: collapse; width: 100%;'>";
echo "<tr><th>Extension</th><th>Status</th><th>Version</th></tr>";

foreach ($required_extensions as $ext) {
    $loaded = extension_loaded($ext);
    $version = $loaded ? phpversion($ext) : 'N/A';
    $status = $loaded ? '✅ Loaded' : '❌ Missing';
    $color = $loaded ? 'green' : 'red';
    
    echo "<tr>";
    echo "<td>{$ext}</td>";
    echo "<td style='color: {$color};'>{$status}</td>";
    echo "<td>{$version}</td>";
    echo "</tr>";
}

echo "</table>";

echo "<h3>Database Connection Test:</h3>";

// Test MySQL connection
try {
    $pdo = new PDO('mysql:host=localhost;port=3306', 'root', '');
    echo "✅ MySQL Connection: SUCCESS<br>";
    
    // Get MySQL version
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "MySQL Version: {$version}<br>";
    
} catch (PDOException $e) {
    echo "❌ MySQL Connection: FAILED - " . $e->getMessage() . "<br>";
}

echo "<h3>Session Test:</h3>";
if (session_start()) {
    echo "✅ Sessions: Working<br>";
    echo "Session Save Path: " . session_save_path() . "<br>";
} else {
    echo "❌ Sessions: Failed<br>";
}

echo "<h3>File Upload Test:</h3>";
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "Post Max Size: " . ini_get('post_max_size') . "<br>";
echo "Max Execution Time: " . ini_get('max_execution_time') . " seconds<br>";
echo "Memory Limit: " . ini_get('memory_limit') . "<br>";

echo "<h3>Temporary Directories:</h3>";
echo "Upload Temp Dir: " . ini_get('upload_tmp_dir') . "<br>";
echo "System Temp Dir: " . sys_get_temp_dir() . "<br>";

phpinfo(INFO_MODULES);
?>

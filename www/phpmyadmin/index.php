<?php
echo "<h1>phpMyAdmin Test Page</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server: " . $_SERVER['SERVER_NAME'] . "</p>";
echo "<p>Request URI: " . $_SERVER['REQUEST_URI'] . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";

// Test MySQL connection
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    echo "<p style='color: green;'>✓ MySQL Connection: SUCCESS</p>";
    
    // Get MySQL version
    $version = $pdo->query('SELECT VERSION()')->fetchColumn();
    echo "<p>MySQL Version: " . htmlspecialchars($version) . "</p>";
} catch (PDOException $e) {
    echo "<p style='color: red;'>✗ MySQL Connection: FAILED - " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<h2>System Info</h2>";
echo "<pre>";
print_r($_SERVER);
echo "</pre>";
?>

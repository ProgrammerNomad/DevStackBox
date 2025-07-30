<?php
/**
 * phpMyAdmin Connection Test
 * Tests the exact same connection method phpMyAdmin uses
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing phpMyAdmin connection method...\n";

// Test with the exact same settings as phpMyAdmin config
$host = '127.0.0.1';
$port = 3306;
$user = 'root';
$password = '';

echo "Host: $host\n";
echo "Port: $port\n";
echo "User: $user\n";
echo "Password: " . (empty($password) ? 'empty' : 'set') . "\n\n";

// Test 1: MySQLi connection (what phpMyAdmin primarily uses)
echo "=== MySQLi Connection Test ===\n";
try {
    $mysqli = new mysqli($host, $user, $password, '', $port);
    
    if ($mysqli->connect_error) {
        echo "FAILED: " . $mysqli->connect_error . "\n";
        echo "Error code: " . $mysqli->connect_errno . "\n";
    } else {
        echo "SUCCESS: Connected via MySQLi\n";
        echo "Server version: " . $mysqli->server_info . "\n";
        $mysqli->close();
    }
} catch (Exception $e) {
    echo "EXCEPTION: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: PDO connection
echo "=== PDO Connection Test ===\n";
try {
    $dsn = "mysql:host=$host;port=$port";
    $pdo = new PDO($dsn, $user, $password);
    echo "SUCCESS: Connected via PDO\n";
    echo "Version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
} catch (PDOException $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 3: Test with localhost
echo "=== Testing with localhost ===\n";
try {
    $mysqli = new mysqli('localhost', $user, $password, '', $port);
    
    if ($mysqli->connect_error) {
        echo "FAILED with localhost: " . $mysqli->connect_error . "\n";
        echo "Error code: " . $mysqli->connect_errno . "\n";
    } else {
        echo "SUCCESS: Connected via MySQLi with localhost\n";
        echo "Server version: " . $mysqli->server_info . "\n";
        $mysqli->close();
    }
} catch (Exception $e) {
    echo "EXCEPTION with localhost: " . $e->getMessage() . "\n";
}

echo "\nTest completed.\n";
?>

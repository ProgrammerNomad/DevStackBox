<?php
// Simple MySQL connection test for phpMyAdmin debugging
echo "<h2>MySQL Connection Test</h2>";

$host = 'localhost';
$port = 3306;
$user = 'root';
$password = '';

echo "<p><strong>Connection Parameters:</strong></p>";
echo "Host: $host<br>";
echo "Port: $port<br>";
echo "User: $user<br>";
echo "Password: " . (empty($password) ? 'EMPTY' : 'SET') . "<br>";

echo "<p><strong>Testing MySQL Connection...</strong></p>";

// Test using mysqli
if (function_exists('mysqli_connect')) {
    $connection = @mysqli_connect($host, $user, $password, '', $port);
    if ($connection) {
        echo "✅ MySQLi Connection: SUCCESS<br>";
        echo "MySQL Version: " . mysqli_get_server_info($connection) . "<br>";
        mysqli_close($connection);
    } else {
        echo "❌ MySQLi Connection: FAILED<br>";
        echo "Error: " . mysqli_connect_error() . "<br>";
    }
} else {
    echo "❌ MySQLi extension not available<br>";
}

// Test using PDO
if (class_exists('PDO')) {
    try {
        $dsn = "mysql:host=$host;port=$port";
        $pdo = new PDO($dsn, $user, $password);
        echo "✅ PDO Connection: SUCCESS<br>";
        echo "MySQL Version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "<br>";
    } catch (PDOException $e) {
        echo "❌ PDO Connection: FAILED<br>";
        echo "Error: " . $e->getMessage() . "<br>";
    }
} else {
    echo "❌ PDO class not available<br>";
}

echo "<p><strong>PHP Extensions:</strong></p>";
$extensions = ['mysqli', 'pdo', 'pdo_mysql', 'openssl', 'json', 'mbstring'];
foreach ($extensions as $ext) {
    $loaded = extension_loaded($ext);
    echo $ext . ": " . ($loaded ? "✅ LOADED" : "❌ NOT LOADED") . "<br>";
}
?>

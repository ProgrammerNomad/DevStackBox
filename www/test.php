<?php
echo "PHP is working!<br>";
echo "PHP Version: " . phpversion() . "<br>";

// Test MySQL connection
$host = 'localhost';
$port = 3306;
$user = 'root';
$password = '';

try {
    $dsn = "mysql:host=$host;port=$port";
    $pdo = new PDO($dsn, $user, $password);
    echo "MySQL Connection: SUCCESS<br>";
    echo "MySQL Version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "<br>";
} catch (PDOException $e) {
    echo "MySQL Connection: FAILED<br>";
    echo "Error: " . $e->getMessage() . "<br>";
}

// Check mysqli extension
if (extension_loaded('mysqli')) {
    echo "MySQLi Extension: LOADED<br>";
} else {
    echo "MySQLi Extension: NOT LOADED<br>";
}

// Check pdo_mysql extension
if (extension_loaded('pdo_mysql')) {
    echo "PDO MySQL Extension: LOADED<br>";
} else {
    echo "PDO MySQL Extension: NOT LOADED<br>";
}

phpinfo();
?>

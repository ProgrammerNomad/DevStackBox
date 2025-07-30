<?php
echo "Testing MySQL connection...\n";
try {
    $pdo = new PDO('mysql:host=localhost;port=3306', 'root', '');
    echo "SUCCESS: Connected to MySQL\n";
    echo "Version: " . $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
} catch (PDOException $e) {
    echo "FAILED: " . $e->getMessage() . "\n";
}
?>

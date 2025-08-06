<?php 
// Test PHP configuration
echo "<h1>PHP is working!</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Time: " . date('Y-m-d H:i:s') . "</p>";

// Test database connection
if (extension_loaded('mysqli')) {
    echo "<p>✅ MySQLi extension is loaded</p>";
} else {
    echo "<p>❌ MySQLi extension is NOT loaded</p>";
}

if (extension_loaded('gd')) {
    echo "<p>✅ GD extension is loaded</p>";
} else {
    echo "<p>❌ GD extension is NOT loaded</p>";
}

if (extension_loaded('curl')) {
    echo "<p>✅ cURL extension is loaded</p>";
} else {
    echo "<p>❌ cURL extension is NOT loaded</p>";
}

echo "<h2>Loaded Extensions:</h2>";
echo "<pre>";
print_r(get_loaded_extensions());
echo "</pre>";

phpinfo();
?>

<?php
// Direct test of phpMyAdmin configuration
echo "<h2>phpMyAdmin Configuration Test</h2>";

// Include the config file directly
$config_file = 'C:/xampp/htdocs/DevStackBox/phpmyadmin/config.inc.php';

if (file_exists($config_file)) {
    echo "✅ Config file exists<br>";
    
    // Include it and check the configuration
    include $config_file;
    
    echo "<p><strong>Configuration Analysis:</strong></p>";
    
    if (isset($cfg) && is_array($cfg)) {
        echo "✅ Configuration loaded<br>";
        
        if (isset($cfg['Servers'][1])) {
            $server = $cfg['Servers'][1];
            echo "<p><strong>Server 1 Configuration:</strong></p>";
            echo "Auth Type: " . ($server['auth_type'] ?? 'NOT SET') . "<br>";
            echo "Host: " . ($server['host'] ?? 'NOT SET') . "<br>";
            echo "Port: " . ($server['port'] ?? 'NOT SET') . "<br>";
            echo "User: " . ($server['user'] ?? 'NOT SET') . "<br>";
            echo "Password: " . (isset($server['password']) ? (empty($server['password']) ? 'EMPTY' : 'SET') : 'NOT SET') . "<br>";
            echo "AllowNoPassword: " . (isset($server['AllowNoPassword']) ? ($server['AllowNoPassword'] ? 'TRUE' : 'FALSE') : 'NOT SET') . "<br>";
            echo "AllowRoot: " . (isset($server['AllowRoot']) ? ($server['AllowRoot'] ? 'TRUE' : 'FALSE') : 'NOT SET') . "<br>";
            
            // Test connection with these settings
            echo "<p><strong>Testing Connection with Config Settings:</strong></p>";
            
            $host = $server['host'] ?? 'localhost';
            $port = $server['port'] ?? 3306;
            $user = $server['user'] ?? 'root';
            $password = $server['password'] ?? '';
            
            if (function_exists('mysqli_connect')) {
                $connection = @mysqli_connect($host, $user, $password, '', $port);
                if ($connection) {
                    echo "✅ Connection with config settings: SUCCESS<br>";
                    mysqli_close($connection);
                } else {
                    echo "❌ Connection with config settings: FAILED<br>";
                    echo "Error: " . mysqli_connect_error() . "<br>";
                }
            }
        } else {
            echo "❌ Server 1 configuration not found<br>";
        }
    } else {
        echo "❌ Configuration not loaded properly<br>";
    }
} else {
    echo "❌ Config file does not exist<br>";
}
?>

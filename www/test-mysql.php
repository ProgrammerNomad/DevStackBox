<?php
header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MySQL Connection Test - DevStackBox</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background: #f5f5f5; 
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 30px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .success { 
            background: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 5px; 
            border: 1px solid #c3e6cb; 
        }
        .error { 
            background: #f8d7da; 
            color: #721c24; 
            padding: 15px; 
            border-radius: 5px; 
            border: 1px solid #f5c6cb; 
        }
        .info { 
            background: #d1ecf1; 
            color: #0c5460; 
            padding: 15px; 
            border-radius: 5px; 
            border: 1px solid #bee5eb; 
        }
        .back-link {
            display: inline-block;
            margin-top: 20px;
            color: #007bff;
            text-decoration: none;
        }
        .back-link:hover { text-decoration: underline; }
        pre { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px; 
            overflow-x: auto; 
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔌 MySQL Connection Test</h1>
        
        <?php
        // Test MySQL connection
        $host = '127.0.0.1';
        $port = 3306;
        $username = 'root';
        $password = '';
        
        try {
            // Test basic connectivity
            echo '<div class="info"><h3>📡 Testing MySQL Connectivity...</h3></div>';
            
            // Create PDO connection
            $dsn = "mysql:host={$host};port={$port}";
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
            
            echo '<div class="success">
                <h3>✅ MySQL Connection Successful!</h3>
                <p><strong>Host:</strong> ' . htmlspecialchars($host) . '</p>
                <p><strong>Port:</strong> ' . htmlspecialchars($port) . '</p>
                <p><strong>Username:</strong> ' . htmlspecialchars($username) . '</p>
            </div>';
            
            // Get MySQL version
            $version = $pdo->query('SELECT VERSION() as version')->fetch();
            echo '<div class="info">
                <h3>📊 MySQL Server Information</h3>
                <p><strong>Version:</strong> ' . htmlspecialchars($version['version']) . '</p>
            </div>';
            
            // Get server status
            $status = $pdo->query('SHOW STATUS LIKE "Uptime"')->fetch();
            echo '<div class="info">
                <h3>⏱️ Server Status</h3>
                <p><strong>Uptime:</strong> ' . htmlspecialchars($status['Value']) . ' seconds</p>
            </div>';
            
            // Show databases
            $databases = $pdo->query('SHOW DATABASES')->fetchAll();
            echo '<div class="info">
                <h3>🗄️ Available Databases</h3>
                <ul>';
            foreach ($databases as $db) {
                echo '<li>' . htmlspecialchars($db['Database']) . '</li>';
            }
            echo '</ul></div>';
            
            // Test creating a database
            try {
                $pdo->exec('CREATE DATABASE IF NOT EXISTS devstackbox_test');
                $pdo->exec('USE devstackbox_test');
                $pdo->exec('CREATE TABLE IF NOT EXISTS test_table (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    message VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )');
                $pdo->exec("INSERT INTO test_table (message) VALUES ('DevStackBox test successful!')");
                
                $result = $pdo->query('SELECT * FROM test_table ORDER BY id DESC LIMIT 1')->fetch();
                
                echo '<div class="success">
                    <h3>✅ Database Operations Test</h3>
                    <p>Successfully created database, table, and inserted test data:</p>
                    <pre>' . print_r($result, true) . '</pre>
                </div>';
                
            } catch (PDOException $e) {
                echo '<div class="error">
                    <h3>⚠️ Database Operations Test Failed</h3>
                    <p>Error: ' . htmlspecialchars($e->getMessage()) . '</p>
                </div>';
            }
            
        } catch (PDOException $e) {
            echo '<div class="error">
                <h3>❌ MySQL Connection Failed</h3>
                <p><strong>Error:</strong> ' . htmlspecialchars($e->getMessage()) . '</p>
                <p><strong>Make sure:</strong></p>
                <ul>
                    <li>MySQL server is running</li>
                    <li>MySQL is listening on port 3306</li>
                    <li>Root user has no password (default setup)</li>
                </ul>
            </div>';
        }
        ?>
        
        <div class="info">
            <h3>🔧 PHP MySQL Extensions</h3>
            <p><strong>MySQLi:</strong> <?php echo extension_loaded('mysqli') ? '✅ Loaded' : '❌ Not loaded'; ?></p>
            <p><strong>PDO MySQL:</strong> <?php echo extension_loaded('pdo_mysql') ? '✅ Loaded' : '❌ Not loaded'; ?></p>
        </div>
        
        <a href="/" class="back-link">← Back to Home</a>
    </div>
</body>
</html>

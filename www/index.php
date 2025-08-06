<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevStackBox - Local Development Environment</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; text-align: center; }
        .status { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        .warning { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        .links { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 30px; }
        .link-card { background: #007bff; color: white; padding: 20px; text-align: center; text-decoration: none; border-radius: 5px; transition: background 0.3s; }
        .link-card:hover { background: #0056b3; text-decoration: none; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 DevStackBox</h1>
        <p style="text-align: center; color: #666;">Your Local Development Environment</p>
        
        <div class="status success">
            ✅ <strong>Apache is running!</strong> Server is up and operational.
        </div>
        
        <div class="status success">
            ✅ <strong>PHP is working!</strong> Version: <?php echo phpversion(); ?>
        </div>
        
        <?php if (extension_loaded('mysqli')): ?>
        <div class="status success">
            ✅ <strong>MySQL connectivity ready!</strong> MySQLi extension is loaded.
        </div>
        <?php else: ?>
        <div class="status warning">
            ❌ <strong>MySQL not ready:</strong> MySQLi extension not loaded.
        </div>
        <?php endif; ?>
        
        <div class="links">
            <a href="/phpmyadmin" class="link-card">
                <h3>📊 phpMyAdmin</h3>
                <p>Database Management</p>
            </a>
            <a href="/test-php.php" class="link-card">
                <h3>🔧 PHP Info</h3>
                <p>Server Configuration</p>
            </a>
            <a href="/test-mysql.php" class="link-card">
                <h3>🗄️ MySQL Test</h3>
                <p>Database Connection</p>
            </a>
        </div>
        
        <hr style="margin: 40px 0;">
        
        <h3>📋 Quick Links</h3>
        <ul>
            <li><strong>Local Server:</strong> <a href="http://localhost">http://localhost</a></li>
            <li><strong>phpMyAdmin:</strong> <a href="http://localhost/phpmyadmin">http://localhost/phpmyadmin</a></li>
            <li><strong>Document Root:</strong> C:\box\DevStackBox\www</li>
        </ul>
        
        <h3>ℹ️ Server Information</h3>
        <ul>
            <li><strong>PHP Version:</strong> <?php echo phpversion(); ?></li>
            <li><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT']; ?></li>
            <li><strong>Server Name:</strong> <?php echo $_SERVER['SERVER_NAME']; ?></li>
            <li><strong>Server Time:</strong> <?php echo date('Y-m-d H:i:s T'); ?></li>
        </ul>
    </div>
</body>
</html>

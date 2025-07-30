<?php
/**
 * DevStackBox - Default Landing Page
 * A lightweight, portable, open-source local development tool for PHP developers
 */

// Get PHP version and extensions
$phpVersion = phpversion();
$extensions = get_loaded_extensions();
sort($extensions);

// Check MySQL connection
$mysqliAvailable = extension_loaded('mysqli');
$mysqlConnection = false;

if ($mysqliAvailable) {
    try {
        $mysqli = new mysqli('localhost', 'root', '', '', 3306);
        $mysqlConnection = !$mysqli->connect_error;
        if ($mysqli) $mysqli->close();
    } catch (Exception $e) {
        $mysqlConnection = false;
    }
}

// Get server info
$serverInfo = [
    'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'Document Root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'Server Name' => $_SERVER['SERVER_NAME'] ?? 'localhost',
    'Server Port' => $_SERVER['SERVER_PORT'] ?? '80'
];

// Scan for projects
$projectsDir = __DIR__ . '/projects';
$projects = [];
if (is_dir($projectsDir)) {
    $projects = array_filter(scandir($projectsDir), function($item) use ($projectsDir) {
        return $item !== '.' && $item !== '..' && is_dir($projectsDir . '/' . $item);
    });
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevStackBox - Local Development Environment</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 3rem;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 0.5rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h2 {
            color: #4a5568;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .status {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .status.running {
            background: #c6f6d5;
            color: #22543d;
        }
        
        .status.stopped {
            background: #fed7d7;
            color: #742a2a;
        }
        
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .info-table td {
            padding: 0.5rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .info-table td:first-child {
            font-weight: 600;
            color: #4a5568;
            width: 40%;
        }
        
        .extensions-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.5rem;
        }
        
        .extension {
            background: #f7fafc;
            padding: 0.5rem;
            border-radius: 6px;
            font-size: 0.85rem;
            text-align: center;
        }
        
        .projects-list {
            list-style: none;
        }
        
        .projects-list li {
            padding: 0.75rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .projects-list a {
            color: #4299e1;
            text-decoration: none;
            font-weight: 500;
        }
        
        .projects-list a:hover {
            text-decoration: underline;
        }
        
        .quick-links {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .quick-link {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: background 0.3s ease;
        }
        
        .quick-link:hover {
            background: #3182ce;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 3rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>DevStackBox</h1>
            <p>Local Development Environment is Running</p>
        </div>
        
        <div class="grid">
            <!-- Server Status -->
            <div class="card">
                <h2>📊 Server Status</h2>
                <table class="info-table">
                    <tr>
                        <td>Apache</td>
                        <td><span class="status running">Running</span></td>
                    </tr>
                    <tr>
                        <td>MySQL</td>
                        <td>
                            <span class="status <?= $mysqlConnection ? 'running' : 'stopped' ?>">
                                <?= $mysqlConnection ? 'Connected' : 'Not Connected' ?>
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td>PHP Version</td>
                        <td><?= $phpVersion ?></td>
                    </tr>
                </table>
            </div>
            
            <!-- Server Information -->
            <div class="card">
                <h2>⚙️ Server Information</h2>
                <table class="info-table">
                    <?php foreach ($serverInfo as $key => $value): ?>
                    <tr>
                        <td><?= htmlspecialchars($key) ?></td>
                        <td><?= htmlspecialchars($value) ?></td>
                    </tr>
                    <?php endforeach; ?>
                </table>
            </div>
            
            <!-- PHP Extensions -->
            <div class="card">
                <h2>🐘 PHP Extensions (<?= count($extensions) ?>)</h2>
                <div class="extensions-grid">
                    <?php foreach (array_slice($extensions, 0, 20) as $ext): ?>
                    <div class="extension"><?= htmlspecialchars($ext) ?></div>
                    <?php endforeach; ?>
                    <?php if (count($extensions) > 20): ?>
                    <div class="extension">... <?= count($extensions) - 20 ?> more</div>
                    <?php endif; ?>
                </div>
            </div>
            
            <!-- Projects -->
            <div class="card">
                <h2>📁 Your Projects</h2>
                <?php if (empty($projects)): ?>
                <p style="color: #718096; font-style: italic;">
                    No projects found. Create a folder in the <code>projects/</code> directory to get started.
                </p>
                <?php else: ?>
                <ul class="projects-list">
                    <?php foreach ($projects as $project): ?>
                    <li>
                        <a href="/projects/<?= urlencode($project) ?>/"><?= htmlspecialchars($project) ?></a>
                        <span style="color: #718096; font-size: 0.85rem;">Project</span>
                    </li>
                    <?php endforeach; ?>
                </ul>
                <?php endif; ?>
            </div>
            
            <!-- Quick Links -->
            <div class="card">
                <h2>🚀 Quick Links</h2>
                <div class="quick-links">
                    <a href="/phpinfo.php" class="quick-link">PHP Info</a>
                    <a href="/phpmyadmin/" class="quick-link">phpMyAdmin</a>
                    <a href="/projects/" class="quick-link">Projects</a>
                </div>
            </div>
            
            <!-- System Info -->
            <div class="card">
                <h2>💻 System Information</h2>
                <table class="info-table">
                    <tr>
                        <td>Operating System</td>
                        <td><?= php_uname('s') . ' ' . php_uname('r') ?></td>
                    </tr>
                    <tr>
                        <td>Architecture</td>
                        <td><?= php_uname('m') ?></td>
                    </tr>
                    <tr>
                        <td>Memory Limit</td>
                        <td><?= ini_get('memory_limit') ?></td>
                    </tr>
                    <tr>
                        <td>Max Execution Time</td>
                        <td><?= ini_get('max_execution_time') ?>s</td>
                    </tr>
                </table>
            </div>
        </div>
        
        <div class="footer">
            <p>DevStackBox - Making local PHP development simple and portable! 🚀</p>
        </div>
    </div>
</body>
</html>

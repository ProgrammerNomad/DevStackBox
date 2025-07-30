<?php
/**
 * DevStackBox - PHP Information Page
 * Displays detailed PHP configuration and environment information
 */
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PHP Info - DevStackBox</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f8fafc;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .header h1 {
            margin: 0;
            font-size: 2rem;
        }
        
        .back-link {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 1rem;
            transition: background 0.3s ease;
        }
        
        .back-link:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .phpinfo-container {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        /* Override phpinfo() styles */
        .phpinfo-container table {
            margin: 0 !important;
            width: 100% !important;
        }
        
        .phpinfo-container td {
            padding: 12px !important;
            border-bottom: 1px solid #e2e8f0 !important;
        }
        
        .phpinfo-container th {
            background: #4a5568 !important;
            color: white !important;
            padding: 16px 12px !important;
        }
        
        .phpinfo-container .h {
            background: #667eea !important;
            color: white !important;
        }
        
        .phpinfo-container .e {
            background: #f7fafc !important;
            font-weight: 600 !important;
            color: #4a5568 !important;
        }
        
        .phpinfo-container .v {
            background: #ffffff !important;
            color: #2d3748 !important;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>PHP Configuration Information</h1>
        <p>DevStackBox - PHP <?= phpversion() ?></p>
        <a href="/" class="back-link">← Back to Dashboard</a>
    </div>
    
    <div class="phpinfo-container">
        <?php
        // Capture phpinfo() output and clean it up
        ob_start();
        phpinfo();
        $phpinfo = ob_get_contents();
        ob_end_clean();
        
        // Remove the HTML structure and keep only the body content
        $phpinfo = preg_replace('%^.*<body>(.*)</body>.*$%ms', '$1', $phpinfo);
        
        // Clean up the styling
        $phpinfo = str_replace('<table>', '<table class="phpinfo-table">', $phpinfo);
        
        echo $phpinfo;
        ?>
    </div>
</body>
</html>

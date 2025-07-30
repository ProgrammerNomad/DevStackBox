<?php
// DevStackBox PHP Test
echo "<h1>DevStackBox PHP Test</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Script Name: " . $_SERVER['SCRIPT_NAME'] . "</p>";
echo "<p>Current Time: " . date('Y-m-d H:i:s') . "</p>";
phpinfo();
?>

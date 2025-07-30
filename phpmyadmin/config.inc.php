<?php
/**
 * phpMyAdmin configuration for DevStackBox
 * Generated automatically for portable MySQL setup
 */

declare(strict_types=1);

/**
 * This is needed for cookie based authentication to encrypt the cookie.
 * Random 32-byte string for DevStackBox
 */
$cfg['blowfish_secret'] = 'DevStackBox2025LocalDevelopment32'; 

/**
 * Servers configuration
 */
$i = 0;

/**
 * DevStackBox MySQL Server
 */
$i++;
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['host'] = '127.0.0.1';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['AllowNoPassword'] = true; // Allow root login without password for local development
$cfg['Servers'][$i]['AllowRoot'] = true;

/**
 * Directories for saving/loading files from server
 */
$cfg['UploadDir'] = 'C:/xampp/htdocs/DevStackBox/tmp/';
$cfg['SaveDir'] = 'C:/xampp/htdocs/DevStackBox/tmp/';
$cfg['TempDir'] = 'C:/xampp/htdocs/DevStackBox/tmp/';

/**
 * Whether to display icons or text or both icons and text in table row
 * action segment. Value can be either of 'icons', 'text' or 'both'.
 */
$cfg['RowActionType'] = 'icons';

/**
 * Defines whether a user should be displayed a "show all (records)"
 * button in browse mode or not.
 */
$cfg['ShowAll'] = true;

/**
 * Number of rows displayed when browsing a result set. If the result
 * set contains more rows, "Previous" and "Next".
 * Possible values: 25, 50, 100, 250, 500
 */
$cfg['MaxRows'] = 25;

/**
 * Disallow editing of binary fields
 * valid values are:
 *   false    allow editing
 *   'blob'   allow editing except for BLOB fields
 *   'noblob' disallow editing except for BLOB fields
 *   'all'    disallow editing
 */
$cfg['ProtectBinary'] = 'blob';

/**
 * Default language to use, if not browser-defined or user-defined
 * (you find all languages in the locale folder)
 * uncomment the desired line:
 * default = 'en'
 */
$cfg['DefaultLang'] = 'en';

/**
 * How many columns should be used for table display of a database?
 * (a value larger than 1 results in some information being hidden)
 * default = 1
 */
$cfg['PropertiesNumColumns'] = 1;

/**
 * Set to true if you want DB-based query history.If false, this utilizes
 * JS-routines to display query history (lost by window close)
 *
 * This requires configuration storage enabled, see above.
 * default = false
 */
$cfg['QueryHistoryDB'] = false;

/**
 * When using DB-based query history, how many entries should be kept?
 * default = 25
 */
$cfg['QueryHistoryMax'] = 25;

/**
 * Whether or not to query the user before sending the error report to
 * the phpMyAdmin team when a JavaScript error occurs
 *
 * Available options
 * ('ask' | 'always' | 'never')
 * default = 'ask'
 */
$cfg['SendErrorReports'] = 'never';

/**
 * 'URLQueryEncryption' defines whether phpMyAdmin will encrypt sensitive data from the URL query string.
 * 'URLQueryEncryptionSecretKey' is a 32 bytes long secret key used to encrypt/decrypt the URL query string.
 */
$cfg['URLQueryEncryption'] = false;
$cfg['URLQueryEncryptionSecretKey'] = '';

/**
 * Console settings
 */
$cfg['Console']['StartHistory'] = false;
$cfg['Console']['AlwaysExpand'] = false;
$cfg['Console']['CurrentQuery'] = true;
$cfg['Console']['EnterExecutes'] = false;
$cfg['Console']['DarkTheme'] = false;
$cfg['Console']['Mode'] = 'show';
$cfg['Console']['Height'] = 92;
$cfg['Console']['GroupQueries'] = false;
$cfg['Console']['OrderBy'] = 'exec';
$cfg['Console']['Order'] = 'asc';

/**
 * Default server (0 = no default server)
 */
$cfg['ServerDefault'] = 1;

/**
 * Other settings
 */
$cfg['PmaNoRelation_DisableWarning'] = true;
$cfg['SuhosinDisableWarning'] = true;
$cfg['LoginCookieValidityDisableWarning'] = true;

# DevStackBox - PHP Versions

This directory will contain multiple PHP versions for easy switching.

## Structure

```text
php/
├── 7.4/           # PHP 7.4.x
├── 8.0/           # PHP 8.0.x
├── 8.1/           # PHP 8.1.x
├── 8.2/           # PHP 8.2.x
└── 8.3/           # PHP 8.3.x (latest)
```

## Features

- Switch between PHP versions from GUI
- Each version has its own php.ini
- Extension management per version
- CLI and Apache module support

## Next Steps

1. Download PHP binaries for Windows
2. Set up php.ini for each version
3. Configure extensions
4. Test with Apache integration

## Instructions

To add PHP versions:

1. Download PHP from [php.net](https://php.net/downloads)
2. Extract each version to its own folder
3. Copy and configure php.ini
4. Test CLI: `php --version`

DevStackBox includes pre-bundled PHP 8.2 by default, with 8.1, 8.3 and 8.4 available for download.

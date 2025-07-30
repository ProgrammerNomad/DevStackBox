# DevStackBox - MySQL Setup

This directory will contain the portable MySQL Server setup.

## Structure

```text
mysql/
├── bin/           # MySQL executables (mysqld.exe, mysql.exe, etc.)
├── data/          # Database files
├── my.ini         # MySQL configuration
└── logs/          # MySQL logs
```

## Next Steps

1. Download MySQL binaries for Windows
2. Configure my.ini for portable setup
3. Initialize data directory
4. Set up default users and databases

## Instructions

To add MySQL binaries:

1. Download MySQL from official site or use MariaDB
2. Extract to this directory
3. Initialize data directory: `mysqld --initialize-insecure`
4. Test startup

For development purposes, you can also use the existing XAMPP MySQL installation temporarily.

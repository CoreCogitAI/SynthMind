#!/bin/bash

# Exit on error
set -e

# Timestamp for backup
timestamp=$(date +%Y%m%d_%H%M%S)
backup_file="ts_files_backup_${timestamp}.tar.gz"

echo "Creating backup of all .ts files..."
find . -name "*.ts" -print0 | tar czf "$backup_file" --null -T -

echo -e "\nSearching for stray JSDoc closings after proper closings..."
affected_files=$(find . -name "*.ts" -exec rg "\*/\s*\n\s*\*\*/" --multiline -l {} \;)

if [ -z "$affected_files" ]; then
    echo "No files found with stray JSDoc closings."
    echo "Backup created at: $backup_file"
    exit 0
fi

echo -e "\nFound stray closings in these files:"
echo "$affected_files"

echo -e "\nHere are the problematic sections (with context):"
find . -name "*.ts" -exec rg "\*/\s*\n\s*\*\*/" --multiline -B 2 -A 2 {} \;

echo -e "\nBackup created at: $backup_file"
read -p "Do you want to proceed with fixing these files? (y/N): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    echo "Fixing files..."
    # Delete the line with **/ that comes after a line with */
    find . -name "*.ts" -exec sed -i -e '/\*\//{ N; /\*\/.*\n.*\*\*\//{ d; }; P; D; }' {} \;
    
    echo -e "\nChecking for remaining issues..."
    remaining=$(find . -name "*.ts" -exec rg "\*/\s*\n\s*\*\*/" --multiline -l {} \;)
    
    if [ -z "$remaining" ]; then
        echo "All issues fixed successfully!"
    else
        echo "Warning: Some issues remain. You might want to check these files:"
        echo "$remaining"
    fi
    
    echo -e "\nIf you need to restore from backup, use:"
    echo "tar xzf $backup_file"
else
    echo "Operation cancelled. No files were modified."
    echo "Backup file remains at: $backup_file"
fi

#!/bin/bash

# Ensure the script exits if any command fails
set -e

# echo currect directory
echo "Current directory: $(pwd)"

# Function to copy files and print the action
copy_files() {
  local from="$1"
  local to="$2"

  # Find files that match the pattern
  files=$(find $(dirname "$from") -name $(basename "$from"))

  # Check if files were found
  if [ -z "$files" ]; then
    echo "No files matching pattern $from"
    return
  fi

  for file in $files; do
    # Create the destination directory if it doesn't exist
    mkdir -p "$(dirname "$to")"
    
    # Construct the destination path
    destination="$to$(basename "$file")"
    
    # Copy the file
    cp "$file" "$destination"
    echo "Copied $file to $destination"
  done
}

copy_files "src/*.png" "./dist/"
copy_files "src/*.html" "./dist/"
copy_files "src/icons/*.png" "./dist/"
copy_files "src/manifest.json" "./dist/"
copy_files "src/settings.js" "./dist/"
copy_files "src/content.js" "./dist/"

echo "All files copied successfully!"

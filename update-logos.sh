#!/bin/bash

# Update all HTML files in the pages directory

# Find all HTML files in the pages directory
HTML_FILES=$(find pages -name "*.html")

# Loop through each file
for file in $HTML_FILES; do
  echo "Updating $file..."
  
  # Update the header logo
  sed -i '' 's|<span class="bg-gradient-to-r from-primary-600 to-.*-600 text-white font-bold py-1 px-2 rounded-md mr-2">MS</span>|<img src="../images/logos/logo-dark.jpeg" alt="MS Digital Marketing" class="w-10 h-10 rounded-md mr-2 object-cover">|g' "$file"
  
  # Update the favicon
  sed -i '' 's|<link rel="shortcut icon" href="../images/favicon/favicon.svg" type="image/svg+xml">|<link rel="shortcut icon" href="../images/logos/logo-dark.jpeg" type="image/jpeg">|g' "$file"
  sed -i '' 's|<link rel="apple-touch-icon" href="../images/favicon/apple-touch-icon.png">|<link rel="apple-touch-icon" href="../images/logos/logo-dark.jpeg">|g' "$file"
done

echo "All files updated successfully!"

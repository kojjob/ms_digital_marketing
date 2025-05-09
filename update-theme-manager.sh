#!/bin/bash

# This script updates all HTML files to use the centralized theme manager

# Function to update a single HTML file
update_file() {
    local file=$1
    echo "Updating $file..."
    
    # 1. Add theme-manager.js script reference
    if grep -q "Alpine.js" "$file"; then
        # Get the correct path to theme-manager.js based on file location
        if [[ "$file" == pages/* ]]; then
            # Files in pages directory need to use ../js/theme-manager.js
            sed -i '' -e '/<script defer src="https:\/\/unpkg.com\/alpinejs@3.x.x\/dist\/cdn.min.js"><\/script>/a\\
    <!-- Theme Manager -->\\
    <script src="../js/theme-manager.js"></script>' "$file"
        else
            # Files in root directory use js/theme-manager.js
            sed -i '' -e '/<script defer src="https:\/\/unpkg.com\/alpinejs@3.x.x\/dist\/cdn.min.js"><\/script>/a\\
    <!-- Theme Manager -->\\
    <script src="js/theme-manager.js"></script>' "$file"
        fi
    fi
    
    # 2. Update body tag to use Alpine store
    sed -i '' -e 's/x-data="{ darkMode: false, mobileMenuOpen: false }"/x-data="{ darkMode: $store.theme.dark, mobileMenuOpen: false }"/' "$file"
    
    # 3. Update dark mode toggle button
    sed -i '' -e 's/@click="darkMode = !darkMode; localStorage.setItem('\''darkMode'\'', darkMode ? '\''true'\'' : '\''false'\'')/@click="$store.theme.toggle(); darkMode = $store.theme.dark/' "$file"
    
    # 4. Remove old dark mode initialization code
    sed -i '' -e '/\/\/ Check for dark mode preference/,/});/c\\
        // Dark mode is now handled by theme-manager.js' "$file"
}

# Update all HTML files in the root directory
for file in *.html; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Update all HTML files in the pages directory
for file in pages/*.html; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

echo "All HTML files have been updated to use the centralized theme manager."

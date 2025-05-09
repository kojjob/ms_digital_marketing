#!/bin/bash

# This script updates all HTML files to use the centralized theme system

# Function to update a single HTML file
update_file() {
    local file=$1
    echo "Updating $file..."
    
    # Check if the file already has the theme system
    if grep -q "Theme System" "$file"; then
        echo "  Already updated."
        return
    fi
    
    # Check if the file has the theme manager
    if grep -q "Theme Manager" "$file"; then
        # Get the correct path to theme-manager.js based on file location
        if [[ "$file" == pages/* ]]; then
            # Files in pages directory need to use ../js/theme-manager.js
            sed -i '' -e 's/<!-- Theme Manager -->/<!-- Theme System -->/' "$file"
            sed -i '' -e 's|<script src="../js/theme-manager.js"></script>|<script src="../js/theme-manager.js"></script>\n    <script src="../js/theme-switcher.js"></script>\n    <script src="../js/theme-control.js"></script>|' "$file"
        else
            # Files in root directory use js/theme-manager.js
            sed -i '' -e 's/<!-- Theme Manager -->/<!-- Theme System -->/' "$file"
            sed -i '' -e 's|<script src="js/theme-manager.js"></script>|<script src="js/theme-manager.js"></script>\n    <script src="js/theme-switcher.js"></script>\n    <script src="js/theme-control.js"></script>|' "$file"
        fi
        echo "  Updated successfully."
    else
        echo "  No theme manager found, skipping."
    fi
}

# Update all HTML files in the pages directory
for file in pages/*.html; do
    if [ -f "$file" ] && [ "$file" != "pages/contact.html" ] && [ "$file" != "pages/about.html" ]; then
        update_file "$file"
    fi
done

echo "All HTML files have been updated to use the centralized theme system."

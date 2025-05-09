#!/bin/bash

# This script updates all HTML files to use the simple theme toggle

# Function to update a single HTML file
update_file() {
    local file=$1
    echo "Updating $file..."
    
    # Check if the file already has the simple theme toggle
    if grep -q "Simple Theme Toggle" "$file"; then
        echo "  Already updated."
        return
    fi
    
    # Check if the file has the theme system
    if grep -q "Theme System" "$file"; then
        # Get the correct path to js files based on file location
        if [[ "$file" == pages/* ]]; then
            # Files in pages directory need to use ../js/simple-theme-toggle.js
            sed -i '' -e 's/<!-- Theme System -->/<!-- Simple Theme Toggle -->/' "$file"
            sed -i '' -e 's|<script src="../js/theme-manager.js"></script>\n    <script src="../js/theme-switcher.js"></script>\n    <script src="../js/theme-control.js"></script>|<script src="../js/simple-theme-toggle.js"></script>|' "$file"
        else
            # Files in root directory use js/simple-theme-toggle.js
            sed -i '' -e 's/<!-- Theme System -->/<!-- Simple Theme Toggle -->/' "$file"
            sed -i '' -e 's|<script src="js/theme-manager.js"></script>\n    <script src="js/theme-switcher.js"></script>\n    <script src="js/theme-control.js"></script>|<script src="js/simple-theme-toggle.js"></script>|' "$file"
        fi
        echo "  Updated successfully."
    else
        # Check if the file has Alpine.js
        if grep -q "Alpine.js" "$file"; then
            # Get the correct path to js files based on file location
            if [[ "$file" == pages/* ]]; then
                # Find the Alpine.js script tag and add our script after it
                sed -i '' -e '/<script defer src="https:\/\/unpkg.com\/alpinejs@3.x.x\/dist\/cdn.min.js"><\/script>/a\\
    <!-- Simple Theme Toggle -->\\
    <script src="../js/simple-theme-toggle.js"></script>' "$file"
            else
                # Find the Alpine.js script tag and add our script after it
                sed -i '' -e '/<script defer src="https:\/\/unpkg.com\/alpinejs@3.x.x\/dist\/cdn.min.js"><\/script>/a\\
    <!-- Simple Theme Toggle -->\\
    <script src="js/simple-theme-toggle.js"></script>' "$file"
            fi
            echo "  Added theme toggle after Alpine.js."
        else
            echo "  No Alpine.js found, skipping."
        fi
    fi
}

# Update all HTML files in the pages directory
for file in pages/*.html; do
    if [ -f "$file" ] && [ "$file" != "pages/about.html" ] && [ "$file" != "pages/blog.html" ] && [ "$file" != "pages/contact.html" ]; then
        update_file "$file"
    fi
done

echo "All HTML files have been updated to use the simple theme toggle."

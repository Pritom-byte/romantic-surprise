#!/bin/bash
# Watch the current folder for changes
fswatch -0 . | while read -d "" event
do
    # Check if there are changes
    if [[ -n $(git status --porcelain) ]]; then
        git add .
        git commit -m "Auto update $(date)"
        git push
        echo "Changes pushed at $(date)"
    fi
done
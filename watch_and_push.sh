#!/bin/bash
cd "/Users/skinnyfiend/Documents/Pritom's Project/romantic-surprise" || exit

# Watch the current folder for changes
fswatch -0 . | while read -d "" event
do
    if [[ -n $(git status --porcelain) ]]; then
        git add .
        git commit -m "Auto update $(date)"
        git push origin main
        echo "Changes pushed at $(date)"
    fi
done
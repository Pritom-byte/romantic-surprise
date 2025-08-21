#!/bin/bash
# Watch the current folder for changes
fswatch -0 . | while read -d "" event
do
    git add .
    git commit -m "Auto update $(date)" 2>/dev/null
    git push
done
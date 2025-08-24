#!/bin/bash
cd "/Users/skinnyfiend/Document/Pritom's Project/romantic-surprise" || exit
git add .
git commit -m "Auto update $(date)"
git push origin main

# Log to push_log.txt
echo "Pushed at $(date)" >> push_log.txt
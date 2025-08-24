#!/bin/bash
cd "/Users/skinnyfiend/Document/Pritom's Project/romantic-surprise" || exit

# Debounce time (in seconds)
DELAY=3
LAST_RUN=0

fswatch -0 . | while read -d "" event
do
    NOW=$(date +%s)
    if (( NOW - LAST_RUN > DELAY )); then
        if [[ -n $(git status --porcelain) ]]; then
            ./auto_push.sh
            echo "Changes pushed at $(date)"
            echo "Changes pushed at $(date)" >> push_log.txt
        fi
        LAST_RUN=$NOW
    fi
done
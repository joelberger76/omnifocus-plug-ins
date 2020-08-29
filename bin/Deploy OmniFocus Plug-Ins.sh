#!/bin/sh

rsync -a --exclude .git/ ~/Code/omnifocus-plug-ins/plug-ins/ ~/Library/Mobile\ Documents/iCloud\~com\~omnigroup\~OmniFocus/Documents/Plug-Ins/ --delete

## Ensure OmniFocus reloads packages without restarting the app
touch ~/Library/Mobile\ Documents/iCloud\~com\~omnigroup\~OmniFocus/Documents/Plug-Ins/*.omnifocusjs

ctags --excmd=number --tag-relative=no --fields=+a+m+n+S -f /Users/joel/Library/Application\ Support/BBEdit/Completion\ Data/JavaScript/omnifocus-plug-ins.tags -R /Users/joel/Code/omnifocus-plug-ins/plug-ins >/dev/null 2>&1
#!/bin/sh

rsync -a --exclude .git/ ~/Code/omnifocus-plug-ins/plug-ins/ ~/Library/Mobile\ Documents/iCloud\~com\~omnigroup\~OmniFocus/Documents/Plug-Ins/ --delete

## Ensure OmniFocus reloads packages without restarting the app
touch ~/Library/Mobile\ Documents/iCloud\~com\~omnigroup\~OmniFocus/Documents/Plug-Ins/*.omnifocusjs
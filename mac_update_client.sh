#!/bin/sh
cd /home/vasa/client
git fetch && git reset --hard origin/master
npm run pack:osx
rm ./dist/SEEDVenture-darwin-x64.zip
zip ./dist/SEEDVenture-darwin-x64.zip ./dist/SEEDVenture-darwin-x64
git add ./dist/SEEDVenture-darwin-x64.zip
git commit -a -m "[Automatic Bot] MAC Version"
git push origin master
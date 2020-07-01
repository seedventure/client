#!/bin/sh
cd /home/vasa/client
git fetch && git reset --hard origin/master
npm run pack:osx
rm ./dist/SEEDVenture-darwin-x64.zip
cd dist/SEEDVenture-darwin-x64
zip -9 -r ../SEEDVenture-darwin-x64.zip ./
cd ../../
git add ./dist/SEEDVenture-darwin-x64.zip
git lfs track ./dist/SEEDVenture-darwin-x64.zip
npm run pack:lnx64
rm ./dist/SEEDVenture-linux-x64.zip
cd dist/SEEDVenture-linux-x64
zip -9 -r ../SEEDVenture-linux-x64.zip ./
cd ../../
git add ./dist/SEEDVenture-linux-x64.zip
git lfs track ./dist/SEEDVenture-linux-x64.zip
git commit -a -m "[Automatic Bot] MAC and Linux Version"
git push origin master

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
git commit -a -m "[Automatic Bot] MAC Version"
git push origin master

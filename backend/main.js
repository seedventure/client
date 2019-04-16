const {app, BrowserWindow} = require('electron');
const fs = require('fs');

var root = __dirname + '/../frontend/';

var debug = false;
process.argv.forEach(it => it === '--debug' && (debug = true));
var test = false;
process.argv.forEach(it => it === '--test' && (test = true));

var url = test ? 'spa/' : 'https://cdn.jsdelivr.net/gh/seedventure/client/frontend/spa/';
var styleTag = '<link href="' + url + 'style.min.css" rel="stylesheet" type="text/css"></link>';
var scriptTag = '<script src="' + url + 'script.min.js" type="text/javascript"></script>';
var replace = '\n    ' + styleTag + '\n    ' + scriptTag;

app.on('ready', async function() {
    test && (await require('../builder/app').run('frontend', 'spa', 'dist'));
    let win = new BrowserWindow({width: 800, height: 600, webPreferences : { nodeIntegration : false }});
    win.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(fs.readFileSync(root + 'index.html', 'UTF-8').split('${REPLACE}').join((debug && !test) ? '' : replace)), {
        baseURLForDataURL: `file://${root}`
    });
    debug && win.webContents.openDevTools();
});

app.on('window-all-closed', function(){
    if(process.platform != 'darwin') {
        app.quit();
    }
    process.exit(0);
});
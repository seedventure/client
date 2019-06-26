var { app, BrowserWindow, globalShortcut, remote } = require('electron');
const fs = require('fs');
var ecosystemData = JSON.parse(fs.readFileSync(__dirname + '/ecosystemData.json', 'UTF-8'));
var ecosystemDataLocal = {};
try {
    ecosystemDataLocal = JSON.parse(fs.readFileSync(__dirname + '/ecosystemData.local.json', 'UTF-8'));
} catch {
}
Object.keys(ecosystemDataLocal).map(key => ecosystemData[key] = ecosystemDataLocal[key]);
ecosystemData = JSON.stringify(ecosystemData);

app = app || remote.app;

var root = __dirname + '/../frontend/';

var debug = false;
process.argv.forEach(it => it === '--debug' && (debug = true));
var test = false;
process.argv.forEach(it => it === '--test' && (test = true));
var dist = false;
process.argv.forEach(it => it === '--dist' && (dist = true));

var userDataPath = app.getPath('userData').split('\\').join('/');
if (!userDataPath.endsWith('/')) {
    userDataPath += '/';
}

var loadURLOptions = {
    baseURLForDataURL: `file://${root}`
};

var electronWindow = null;

var distURL = (debug || test) ? '' : 'https://cdn.jsdelivr.net/gh/seedventure/client/frontend/';

var lazyLoad = fs.readFileSync(__dirname + '/productionURL.js', 'UTF-8').split('\n').join('');

function loadData() {
    var contracts = fs.readFileSync(__dirname + '/contracts.json', 'UTF-8');
    var replace = '\n    <script type="text/javascript" id="toDelete">window.userDataPath="' + userDataPath + '";window.contracts=' + contracts + ';window.distURL="' + distURL + '";window.ecosystemData=' + ecosystemData + ';var element=document.getElementById("toDelete");element.parentNode.removeChild(element);';
    replace += (debug && !test) ? '' : lazyLoad;
    replace += '</script>';
    electronWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(fs.readFileSync(root + 'index.html', 'UTF-8').split('${REPLACE}').join(replace)), loadURLOptions);
};

app.on('ready', async function () {
    test && (await require('../builder/app').run('frontend', 'spa', 'dist'));
    electronWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: true } });
    loadData();
    (debug || test || dist) && electronWindow.webContents.openDevTools();
    electronWindow.setMenu(null);
    electronWindow.maximize();
    globalShortcut.register('f5', loadData);
    globalShortcut.register('CommandOrControl+R', loadData);
});

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
    process.exit(0);
});
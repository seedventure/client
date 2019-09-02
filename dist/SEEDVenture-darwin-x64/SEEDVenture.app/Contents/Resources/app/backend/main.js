var { app, BrowserWindow, globalShortcut, remote } = require('electron');
const fs = require('fs');
var ecosystemData = JSON.parse(fs.readFileSync(__dirname + '/ecosystemData.json', 'UTF-8'));
var ecosystemDataLocal = {};
try {
    ecosystemDataLocal = JSON.parse(fs.readFileSync(__dirname + '/ecosystemData.local.json', 'UTF-8'));
} catch {
}
Object.keys(ecosystemDataLocal).map(key => ecosystemData[key] = ecosystemDataLocal[key]);

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

const deleteFolderRecursive = async function (path) {
    if (fs.existsSync(path)) {
        for (let entry of fs.readdirSync(path)) {
            const curPath = path + "/" + entry;
            if ((fs.lstatSync(curPath)).isDirectory()) {
                await deleteFolderRecursive(curPath);
            } else {
                try {
                    fs.unlinkSync(curPath);
                } catch (e) {
                }
            }
        }
        try {
            fs.rmdirSync(path);
        } catch (e) {
        }
    }
};

if(fs.existsSync(userDataPath + 'frontend/')) {
    if(fs.existsSync(userDataPath + 'frontend/clear.all')) {
        deleteFolderRecursive(userDataPath + 'frontend/');
    } else if(!debug) {
        var files = fs.readdirSync(userDataPath + 'frontend/');
        if(files && files.length > 0) {
            for(var i = files.length - 1; i >= 0; i--) {
                var file = userDataPath + 'frontend/' + files[i];
                if(fs.lstatSync(file).isDirectory()) {
                    ecosystemData.distDate = parseInt(files[i]);
                    root = file + '/';
                    break;
                }
            }
        }
    }
}

var loadURLOptions = {
    baseURLForDataURL: `file://${root}`
};

var electronWindow = null;

var distURL = (debug || test) ? '' : 'https://cdn.jsdelivr.net/gh/seedventure/client/frontend/';

ecosystemData = JSON.stringify(ecosystemData);

var lazyLoad = fs.readFileSync(__dirname + '/productionURL.js', 'UTF-8').split('\n').join('');

function loadData() {
    if(!debug && !test && !dist && !focus) {
        return;
    }
    electronWindow.webContents.session.clearCache(function () {
        var contracts = fs.readFileSync(__dirname + '/contracts.json', 'UTF-8');
        var replace = '\n    <script type="text/javascript" id="toDelete">window.userDataPath="' + userDataPath + '";window.contracts=' + contracts + ';window.distURL="' + distURL + '";window.ecosystemData=' + ecosystemData + ';var element=document.getElementById("toDelete");element.parentNode.removeChild(element);';
        replace += (debug && !test) ? '' : lazyLoad;
        replace += '</script>';
        electronWindow.loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(fs.readFileSync(root + 'index.html', 'UTF-8').split('${REPLACE}').join(replace)), loadURLOptions);
    });
};

var focus = true;

app.on('ready', async function () {
    await deleteFolderRecursive(userDataPath + 'Cache');
    test && (await require('../builder/app').run('frontend', 'spa', 'dist'));
    electronWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: true } });
    electronWindow.on('focus', () => focus = true);
    electronWindow.on('blur', () => focus = false);
    electronWindow.setMenu(null);
    electronWindow.maximize();
    globalShortcut.register('f5', loadData);
    globalShortcut.register('CommandOrControl+R', loadData);
    loadData();
    (debug || test || dist) && electronWindow.webContents.openDevTools();
});

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
    process.exit(0);
});
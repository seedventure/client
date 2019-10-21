var resolve = require('path').resolve;

var distDate = require('../backend/ecosystemData.json').distDate;

var _root = process.argv[2];
var _src = process.argv[3];
var _dst = process.argv[4];

var sourceFolder = null;
var jsxFolder = null;
var distFolder = null;

var scriptMinSrc = null;
var styleMinSrc = null;
var scriptMinDst = null;
var styleMinDst = null;

var useStrict = '"use strict";';
var safeTypeof = 'function _typeof(e){return e&&typeof Symbol!=\"undefined\"&&e.constructor===Symbol?\"symbol\":typeof e}';
var asyncToGenerator = 'function _asyncToGenerator(e){return function(){var t=e.apply(this,arguments);return new Promise(function(e,n){function r(i,s){try{var o=t[i](s),u=o.value}catch(a){n(a);return}if(!o.done)return Promise.resolve(u).then(function(e){r("next",e)},function(e){r("throw",e)});e(u)}return r("next")})}}';
var style = '';
var script = '';
var scripts = 'window.distDate=' + distDate + ';!window.preloadedScripts && (window.preloadedScripts=[]);Array.prototype.push.apply(window.preloadedScripts,[';
var stylePath = null;
var scriptPath = null;
var styleTag = null;
var scriptTag = null;

const fs = require('fs');
const path = require('path');

const babel = require('./lib/babel.min');
const uglify = require('./lib/uglify-js');

const babelArgs = {
    presets: ['es2015', 'es2015-loose', 'react', 'stage-2'],
    sourceMaps: true
};

const deleteFolderRecursive = async function (path, mustBeEmpty) {
    var remove = false;
    if (fs.existsSync(path)) {
        remove = true;
        for (let entry of fs.readdirSync(path)) {
            const curPath = path + "/" + entry;
            if ((fs.lstatSync(curPath)).isDirectory()) {
                if (!await deleteFolderRecursive(curPath, mustBeEmpty)) {
                    remove = false;
                }
            } else {
                if (mustBeEmpty !== true) {
                    try {
                        fs.unlinkSync(curPath);
                    } catch (e) {
                        (e.message || e).toString().indexOf('no such file or directory') === -1 && console.error(e);
                    }
                } else {
                    remove = false;
                }
            }
        }
        if (remove) {
            try {
                fs.rmdirSync(path);
            } catch (e) {
                (e.message || e).toString().indexOf('no such file or directory') === -1 && console.error(e);
            }
        }
    }
    return remove;
};

const mkDirRecursive = function (pathToCreate) {
    pathToCreate
        .split("/")
        .reduce((prevPath, folder) => {
            const currentPath = path.join(prevPath, folder, "/");
            if (!fs.existsSync(currentPath)) {
                fs.mkdirSync(currentPath);
            }
            return currentPath;
        }, '');
};
const copyFolders = async function (path) {
    !path && (path = '');
    for (let entry of fs.readdirSync(sourceFolder + path)) {
        const curPath = path + "/" + entry;
        if ((fs.lstatSync(sourceFolder + curPath)).isDirectory()) {
            fs.mkdirSync(distFolder + curPath);
            await copyFolders(curPath);
        } else {
            if (entry.endsWith('.scss') || entry.endsWith('.jsx')) {
                continue;
            }
            if (entry.endsWith('.min.css') && (sourceFolder + curPath).indexOf(jsxFolder) !== -1) {
                continue;
            }
            if (entry.endsWith('.html')) {
                var html = fs.readFileSync(sourceFolder + curPath, 'UTF-8');
                var index = html.indexOf('</head>');
                html = html.substring(0, index) + '\n    ' + styleTag + '\n    ' + scriptTag + '\n' + html.substring(index);
                fs.writeFileSync(distFolder + curPath, html);
                continue;
            }
            fs.copyFileSync(sourceFolder + curPath, distFolder + curPath);
        }
    }
};

const buldJsxs = async function (basePath, path) {
    !path && (path = '');
    for (let entry of fs.readdirSync(jsxFolder + path)) {
        const curPath = path + "/" + entry;
        if ((fs.lstatSync(jsxFolder + curPath)).isDirectory()) {
            await buldJsxs(basePath, curPath);
        } else {
            if (!entry.endsWith('.min.css') && !entry.endsWith('.jsx')) {
                continue;
            }
            scripts += ("'" + basePath + curPath + "'" + ',');
            if (entry.endsWith('.min.css')) {
                style += fs.readFileSync(jsxFolder + curPath, 'UTF-8');
                continue;
            }
            if (entry.endsWith('.jsx')) {
                var source = fs.readFileSync(jsxFolder + curPath, 'UTF-8');
                source = babel.transform(source, babelArgs).code;
                source = uglify.convenience(source);
                source = source.split(useStrict).join('');
                source = source.split(safeTypeof).join('');
                source = source.split(asyncToGenerator).join('');
                script += (source + ';');
                continue;
            }
        }
    }
};

var start = async function () {
    try {
        fs.unlinkSync(scriptMinDst);
    } catch {
    }
    try {
        fs.unlinkSync(styleMinDst);
    } catch {
    }
    mkDirRecursive(distFolder);
    await copyFolders();
    await buldJsxs(_src);
    scripts = scripts.substring(0, scripts.length - 1) + ']);';
    script += scripts;
    fs.writeFileSync(scriptPath, script);
    fs.writeFileSync(stylePath, style);
    await deleteFolderRecursive(distFolder + '/' + _src, true);
    fs.copyFileSync(scriptMinSrc, scriptMinDst);
    fs.copyFileSync(styleMinSrc, styleMinDst);
    await deleteFolderRecursive(distFolder);
    console.log("Build End - Exit");
};

async function run(root, src, dst) {
    root && (_root = root);
    src && (_src = src);
    dst && (_dst = dst);

    console.log('SeedVenture - Client Builder');

    sourceFolder = resolve((__dirname + '/../' + _root)).split('\\').join('/');
    console.log('Source Folder: ' + sourceFolder);

    jsxFolder = resolve((__dirname + '/../' + _root + '/' + _src)).split('\\').join('/');
    console.log('Folder to Build: ' + jsxFolder);

    distFolder = resolve((__dirname + '/../' + _dst)).split('\\').join('/');
    console.log('Destination Folder: ' + distFolder);

    scriptMinSrc = distFolder + "/" + _src + "/script.min.js";
    styleMinSrc = distFolder + "/" + _src + "/style.min.css";
    scriptMinDst = jsxFolder + "/script.min.js";
    styleMinDst = jsxFolder + "/style.min.css";

    stylePath = distFolder + '/' + _src + '/style.min.css';
    scriptPath = distFolder + '/' + _src + '/script.min.js';
    styleTag = '<link href="/' + _src + '/style.min.css" rel="stylesheet" type="text/css"></link>';
    scriptTag = '<script src="/' + _src + '/script.min.js" type="text/javascript"></script>';

    console.log('Cleaning Destination Folder...');
    try {
        await deleteFolderRecursive(distFolder);
        await start();
    } catch (e) {
        (e.message || e).toString().indexOf('no such file or directory') === -1 && console.error(e);
    }
}

if (!_dst || _dst === '--test') {
    exports.run = run;
} else {
    run();
}
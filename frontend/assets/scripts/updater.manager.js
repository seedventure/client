function UpdaterManager() {
    var context = this;

    context.electron = window.require('electron').remote;
    context.app = context.electron.app;
    context.fs = context.electron.require('fs');
    context.JSZip = context.electron.require('jszip');
    context.request = context.electron.require('http' + (ecosystemData.distZip.indexOf('https') === 0 ? 's' : ''));
    context.frontendPath = window.userDataPath + 'frontend/';

    context.popupTitle = 'Updating SEEDVenture Client';
    context.popupFooter= '<br/><br/>Client will restart at the end of the operation';

    context.deleteFolderRecursive = async function(path, mustBeEmpty) {
        var remove = false;
        if (context.fs.existsSync(path)) {
            remove = true;
            for (let entry of context.fs.readdirSync(path)) {
                const curPath = path + "/" + entry;
                if ((context.fs.lstatSync(curPath)).isDirectory()) {
                    if (!await context.deleteFolderRecursive(curPath, mustBeEmpty)) {
                        remove = false;
                    }
                } else {
                    if (mustBeEmpty !== true) {
                        try {
                            context.fs.unlinkSync(curPath);
                        } catch (e) {
                            console.error(e);
                        }
                    } else {
                        remove = false;
                    }
                }
            }
            if (remove) {
                try {
                    context.fs.rmdirSync(path);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        return remove;
    };

    context.showProgress = function(message) {
        $.publish('loader/show', [context.popupTitle, message + context.popupFooter]);
    };

    context.download = async function() {
        context.showProgress('Preparing environment...');
        if (!context.fs.existsSync(context.frontendPath)) {
            context.fs.mkdirSync(context.frontendPath);
        }
        try {
            context.fs.unlinkSync(context.frontendPath + 'dist.zip');
        } catch (e) {}
        var path = context.frontendPath + context.distDate + '/';
        try {
            await context.deleteFolderRecursive(path);
        } catch (e) {}
        context.fs.writeFileSync(context.frontendPath + 'clear.all', 'clear.all');
        await new Promise(function(ok) {
            const file = context.fs.createWriteStream(context.frontendPath + 'dist.zip');
            file.on('finish', function() {
                context.showProgress('Installing new version...');
                context.fs.mkdirSync(path);
                context.fs.readFile(context.frontendPath + 'dist.zip', async function(err, data) {
                    err && console.error(err);
                    if (!err) {
                        var zip = new context.JSZip();
                        var contents = await zip.loadAsync(data);
                        Object.keys(contents.files).forEach(async function(filename) {
                            var dest = path + filename;
                            try {
                                context.fs.writeFileSync(dest, await zip.file(filename).async('nodebuffer'));
                            } catch(e) {
                                context.fs.mkdirSync(dest);
                            }
                        });
                    }
                    ok();
                });
            });
            context.showProgress('Downloading Updates...');
            context.request.get(ecosystemData.distZip, function(response) {
                response.pipe(file);
            });
        });
        context.showProgress('Cleaning temporary files...');
        var files = context.fs.readdirSync(context.frontendPath);
        for(var i in files) {
            var file = files[i];
            var isDirectory = context.fs.lstatSync(context.frontendPath + file).isDirectory();
            if(file.indexOf('' + context.distDate) !== -1 && isDirectory) {
                continue;
            }
            !isDirectory && context.fs.unlinkSync(context.frontendPath + file);
            isDirectory && (await context.deleteFolderRecursive(context.frontendPath + file));
        }
        setTimeout(function() {
            context.app.relaunch();
            context.app.quit();
        }, 3000);
    };
};
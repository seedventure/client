var fs = require('fs');
var {resolve} = require("path");
var JSZip = require("jszip");
var zip = new JSZip();

var zipFileName = resolve(__dirname + '/../dist/dist.zip');

try {
    fs.unlinkSync(zipFileName);
} catch(e) {
}

var root = resolve(__dirname + '/../frontend/').split('\\').join('/');
!root.endsWith('/') && (root += '/');

function navigate(p) {
    if(!p) {
        return;
    }
    var path = p.split('\\').join('/');
    if(fs.lstatSync(path).isDirectory()) {
        if(!path.endsWith('/')) {
            path += '/';
        }
        var files = fs.readdirSync(path);
        for(var i in files) {
            navigate(path + files[i]);
        }
        return;
    }
    var file = path.split(root).join('');
    if(file.endsWith('.jsx') || file.endsWith('.scss') || (file.indexOf('spa/') !== -1 && file.indexOf('.min.') !== -1)) {
        return;
    }
    zip.file(file, fs.readFileSync(path), {binary: true});
}
navigate(root);
zip.generateNodeStream({type:'nodebuffer', streamFiles:true })
   .pipe(fs.createWriteStream(zipFileName))
   .on('finish', function () {
       process.exit(0);
    });
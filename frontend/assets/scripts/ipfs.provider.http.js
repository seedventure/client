function IPFSProvider(host, port, protocol) {
    var context = this;
    context.host = host;
    context.port = port;
    context.protocol = protocol;

    context.api = new IpfsHttpClient(host, port, { protocol: protocol });

    context.fs = window.require('electron').remote.require('fs');

    context.uploadBuffer = function uploadBuffer(buffer) {
        return new Promise(function (response, error) {
            context.api.add(buffer, function (err, ipfsHash) {
                if (err) {
                    error(err);
                    return
                }
                response(ipfsHash[0].hash);
            })
        });
    };

    context.uploadFile = function uploadFile(p) {
        var path = p.replace("\\", "/");
        return new Promise(function (response, error) {
            const stream = context.api.addReadableStream();
            stream.on('data', function(file) {
                response(file.hash);
            });
            stream.write({
                path: path.substring(path.lastIndexOf("/") + 1),
                content: context.fs.createReadStream(path)
            });
            stream.end();
        });
    };
}
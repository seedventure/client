function DocumentsUploaderProvider() {
    var context = this;
    context.host = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsHost);
    context.port = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsPort);
    context.protocol = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsProtocol);

    context.api = new IpfsHttpClient(context.host, context.port, { protocol: context.protocol });

    context.fs = window.require('electron').remote.require('fs');

    context.uploadBuffer = function uploadBuffer(buffer) {
        return new Promise(function (response, error) {
            context.api.add(buffer, function (err, ipfsHash) {
                if (err) {
                    error(err);
                    return
                }
                response(ecosystemData.ipfsUrlTemplate + ipfsHash[0].hash);
            })
        });
    };

    context.uploadFile = function uploadFile(p) {
        var path = p.replace("\\", "/");
        return new Promise(function (response, error) {
            const stream = context.api.addReadableStream();
            stream.on('data', function(file) {
                response(ecosystemData.ipfsUrlTemplate + file.hash);
            });
            stream.write({
                path: path.substring(path.lastIndexOf("/") + 1),
                content: context.fs.createReadStream(path)
            });
            stream.end();
        });
    };
}
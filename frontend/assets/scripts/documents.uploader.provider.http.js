function DocumentsUploaderProvider() {
    var context = this;
    context.host = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderHost);

    var protocol = context.host.split('://')[0];
    var plainHost = context.host.split('://')[1];
    context.requestParameters = {
        hostname : plainHost.split(':')[0],
        port : plainHost.indexOf(':') !== -1 ? parseInt(plainHost.split(':')[1]) : protocol === 'http' ? 80 : 443,
        path : (plainHost.indexOf('/') === -1 ? '/' : '/' + plainHost.substring(plainHost.indexOf('/') + 1)),
        method : 'POST'
    };

    context.fs = window.require('electron').remote.require('fs');
    context.http = window.require('electron').remote.require(protocol);

    context.uploadBuffer = async function uploadBuffer(buffer) {
        var result = await Utils.AJAXRequest(context.host, undefined, buffer.toString());
        return result.indexOf('http') === 0 ? result : (context.host + (context.host.endsWith('/') ? '' : '/') + result);
    };

    context.uploadFile = function uploadFile(path) {
        return new Promise(function (ok) {
            var request = context.http.request(context.requestParameters, function (response) {
                response.on("data", function(data) {
                    var result = data.toString();
                    ok(result.indexOf('http') === 0 ? result : (context.host + (context.host.endsWith('/') ? '' : '/') + result));
                });
            });
            context.fs.createReadStream(path.replace("\\", "/")).pipe(request);
        });
    };
}
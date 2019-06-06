function IPFSProvider(host, port, protocol) {
    var context = this;
    context.host = host;
    context.port = port;
    context.protocol = protocol;

    context.api =  new IpfsHttpClient(host, port, {protocol: protocol});

    context.uploadDocument = async function uploadDocument(buffer) {
        return new Promise(function(response, error){
            context.api.add(buffer, function (err, ipfsHash) {
                if(err){
                    error(err)
                    return
                }
                response(ipfsHash[0].hash)
            })
        })
    };
}
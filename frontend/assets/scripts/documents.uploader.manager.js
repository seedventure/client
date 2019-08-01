function DocumentsUploaderManager() {
    var context = this;

    context.uploadDocument = function uploadDocument(document) {
        return context.provider.uploadBuffer(Buffer.from(JSON.stringify(document, null, 4)));
    }

    context.uploadFile = function uploadFile(path) {
        return context.provider.uploadFile(path);
    };

    context.newProvider = function newProvider() {
        return new Promise(function(ok, ko) {
            try { 
                context.provider.stop();
            } catch(e) {
            }
            try { 
                delete context.provider;
                DocumentsUploaderProvider = undefined
                delete DocumentsUploaderProvider;
            } catch(e) {
                console.error(e);
            }
            ScriptLoader.load({
                script: client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderProvider),
                callback : function() {
                    context.provider = new DocumentsUploaderProvider();
                    ok();
                }
            });
        });
    }
    client.collaterateStart.push(context.newProvider);
}
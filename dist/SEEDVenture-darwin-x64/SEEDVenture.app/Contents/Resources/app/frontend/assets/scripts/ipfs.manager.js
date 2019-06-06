function IPFSManager() {
    var context = this;

    context.uploadDocument = async function uploadDocument(document) {
        return await context.provider.uploadDocument(Buffer.from(JSON.stringify(document, null, 4)));
    }

    context.newProvider = function newProvider() {
        try { 
            context.provider.stop();
        } catch {
        }
        ScriptLoader.load({
            script: client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsProvider),
            callback : function() {
                context.provider = new IPFSProvider(client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsHost), client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsPort), client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.ipfsProtocol));
            }
        });
    }
    context.newProvider();
}
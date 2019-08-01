var DocumentUploaderController = function(view) {
    var context = this;
    context.view = view;

    context.changeDocumentUploader = async function changeDocumentUploader(type, url) {
        client.persistenceManager.remove(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderHost);
        url !== undefined && url !== null && url.trim() !== '' && client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderHost, url.trim());
        var oldType = client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderProvider, type);
        $('script[src*="' + oldType + '"]').each(function() {
            var $elem = $(this);
            $elem.attr('src').indexOf('data:text') === -1 && $elem.remove();
        });
        try {
            for(var i = 0; i < window.preloadedScripts.length; i++) {
                if(oldType === window.preloadedScripts[i]) {
                    window.preloadedScripts.splice(i, 1);
                    break;
                }
            }
        } catch(e) {
        }
        await client.documentsUploaderManager.newProvider();
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderProviderSet, true);
        context.view.props.onClick && context.view.props.onClick();
    };
}
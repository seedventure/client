var PreferencesController = function(view) {
    var context = this;
    context.view = view;

    context.changeFactoryAddress = async function changeFactoryAddress(web3URL, etherscanURL, newFactoryAddress) {
        client.configurationManager.forget(client.configurationManager.encryptedUser);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL, web3URL);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL, etherscanURL);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress, newFactoryAddress);
        await client.blockchainManager.newProvider();
        await client.contractsManager.checkBaskets();
    };
}
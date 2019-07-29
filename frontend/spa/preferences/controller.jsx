var PreferencesController = function(view) {
    var context = this;
    context.view = view;

    context.changeFactoryAddress = async function changeFactoryAddress(newFactoryAddress) {
        await client.contractsManager.changeFactoryAddress(newFactoryAddress);
    };
}
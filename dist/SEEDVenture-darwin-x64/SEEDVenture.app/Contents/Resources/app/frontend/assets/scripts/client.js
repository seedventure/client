function Client() {

    var context = this;

    context.collaterateStart = [];

    context.start = function() {
        delete context.start
        context.localeManager.init();
        if (context.collaterateStart && context.collaterateStart.length > 0) {
            for (i in context.collaterateStart) {
                context.collaterateStart[i]();
            }
            context.collaterateStart = [];
        }
        context.callback && context.callback()
    };

    context.init = function(callback) {
        context.callback = callback
        context.configurationManager = new ConfigurationManager();
        context.persistenceManager = new PersistenceManager();
        context.contractsManager = new ContractsManager();
        context.localeManager = new LocaleManager();
        context.userManager = new UserManager();
        context.blockchainManager = new BlockchainManager();
        setTimeout(context.start);
    };
}
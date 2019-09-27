function Client() {

    var context = this;

    context.collaterateStart = [];

    context.start = async function start() {
        delete context.start
        context.localeManager && context.localeManager.init();
        if (context.collaterateStart && context.collaterateStart.length > 0) {
            for (var i in context.collaterateStart) {
                var x = context.collaterateStart[i]();
                if(x && x.then && x.catch) {
                    await x;
                }
            }
            context.collaterateStart = [];
        }
        context.callback && context.callback()
    };

    context.setupEcosystemData = function setupEcosystemData() {
        var localEcosystemData = {
            mainnetEtherscanURL: "https://etherscan.io/",
            mainnetWeb3URL: "wss://mainnet.seedventure.io",
            mainnetFactoryAddress: "0x35c8c5D9Bec0DCd50Ce4bd929FA3BeD9eD1f7C89",
            testnetEtherscanURL: "https://ropsten.etherscan.io/",
            testnetWeb3URL: "wss://testnet.seedventure.io",
            testnetFactoryAddress: "0xf5b5042766eeb6dfc5ba8ebbafc61df26f0901da"
        };
        localEcosystemData.etherscanURL = localEcosystemData.mainnetEtherscanURL;
        localEcosystemData.web3URL = localEcosystemData.mainnetWeb3URL;
        localEcosystemData.factoryAddress = localEcosystemData.mainnetFactoryAddress;
        Object.keys(localEcosystemData).map(it => ecosystemData[it] = localEcosystemData[it]);
    };

    context.init = function(callback) {
        context.callback = callback
        context.setupEcosystemData();
        context.configurationManager = new ConfigurationManager();
        context.persistenceManager = new PersistenceManager();
        context.documentsUploaderManager = new DocumentsUploaderManager();
        context.blockchainManager = new BlockchainManager();
        context.contractsManager = new ContractsManager();
        //context.localeManager = new LocaleManager();
        context.userManager = new UserManager();
        context.updaterManager = new UpdaterManager();
        setTimeout(context.start);
    };
}
function BlockchainManager() {
    var context = this;

    context.defaultLastCheckedBlockNumber = -1
    context.defaultTimeToNextBlockCheck = 7000;

    context.sendSignedTransaction = async function sendSignedTransaction(signedTransaction) {
        return await context.provider.sendSignedTransaction(signedTransaction);
    }

    context.getChainId = async function getChainId() {
        return await context.provider.getChainId();
    };

    context.getNonce = async function getNonce(address) {
        return await context.provider.getNonce(address);
    };

    context.getLastCkeckedBlockNumber = function getLastCkeckedBlockNumber() {
        var lastCkeckedBlockNumber = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber);
        if(lastCkeckedBlockNumber === undefined || lastCkeckedBlockNumber === null) {
            lastCkeckedBlockNumber = context.defaultLastCheckedBlockNumber;
        }
        return lastCkeckedBlockNumber;
    };

    context.onNewBlock = async function onNewBlock(block) {
        if(block.transactions) {
            for(var i in block.transactions) {
                var tx = await context.provider.retrieveTransaction(block.transactions[i], block.number);
                var to = tx.to;
                if(to === undefined || to === null) {
                    continue;
                }
                to = to.toLowerCase();
                var contract = client.contractsManager.getDictionary().Where(it => it.address === to).FirstOrDefault();
                if(contract === undefined || contract === null) {
                    continue;
                }
                var code = tx.input.substring(0, 10);
                var func = client.contractsManager['manage_' + contract.type + '_' + code];
                func && func(tx, block, contract);
            }
        }
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber, block.number);
        context.scheduleNextBlockCheckTimeout();
    };

    context.scheduleNextBlockCheckTimeout = function scheduleNextBlockCheckTimeout(msec) {
        context.nextBlockCheckTimeout && clearTimeout(context.nextBlockCheckTimeout);
        delete context.nextBlockCheckTimeout;
        (msec === undefined || msec === null) && (msec = context.timeToNextBlockCheck);
        (msec === undefined || msec === null) && (msec = context.defaultTimeToNextBlockCheck);
        context.nextBlockCheckTimeout = setTimeout(context.mainLoop, msec);
    };

    context.mainLoop = async function mainLoop() {
        delete context.timeToNextBlockCheck;
        context.lastFetchedBlockNumber === undefined && (context.lastFetchedBlockNumber = await context.provider.fetchLastBlockNumber());
        var lastCheckedBlockNumber = context.getLastCkeckedBlockNumber();
        if(context.lastFetchedBlockNumber !== lastCheckedBlockNumber) {
            context.timeToNextBlockCheck = 0;
            context.provider.retrieveBlock(lastCheckedBlockNumber + 1);
            return;
        }
        delete context.lastFetchedBlockNumber;
        context.scheduleNextBlockCheckTimeout();
    };

    context.newProvider = function newProvider() {
        context.nextBlockCheckTimeout && clearTimeout(context.nextBlockCheckTimeout);
        try { 
            context.provider.stop();
        } catch {
        }
        ScriptLoader.load({
            script: client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3Provider),
            callback : function() {
                context.provider = new BlockchainProvider(client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL), context.onNewBlock);
                //context.nextBlockCheckTimeout = setTimeout(context.mainLoop);
            }
        });
    }

    context.newProvider();
};
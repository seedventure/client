function BlockchainManager() {
    var context = this;

    context.defaultLastCheckedBlockNumber = -1
    context.defaultTimeToNextEventsCheck = 9000;
    context.blockSequenceToCheck = 45000;
    context.addressesSplit = 500;

    context.run = true;

    context.getTopics = function getTopics() {
        if (!context.topics) {
            context.topics = [];
            Object.keys(client.contractsManager).map(key => key.indexOf('0x') === 0 && context.topics.push(key));
            context.topics = [context.topics];
        }
        return context.topics;
    };

    context.pause = function pause() {
        context.run = false;
        context.nextEventCheckTimeout && clearTimeout(context.nextEventCheckTimeout);
    }

    context.resume = function resume() {
        context.nextEventCheckTimeout && clearTimeout(context.nextEventCheckTimeout);
        context.run = true;
        context.nextEventCheckTimeout = setTimeout(context.mainLoop, context.defaultTimeToNextEventsCheck);
    }

    context.sendSignedTransaction = async function sendSignedTransaction(signedTransaction, title) {
        var result;
        var error;
        try {
            result = await new Promise(function(ok, ko) {
                var txHash = web3.utils.sha3(signedTransaction);
                var submit = async function(event, result) {
                    $.unsubscribe('transaction/submit', submit);
                    if (result !== true) {
                        ok();
                        return;
                    }
                    $.publish('transaction/lock', [title, txHash]);
                    var tx = undefined;
                    var error = undefined;
                    try {
                        tx = await context.provider.sendSignedTransaction(signedTransaction);
                    } catch (e) {
                        error = e;
                    }
                    $.publish('transaction/unlock');
                    client.userManager.getBalances();
                    var finalize = function() {
                        $.unsubscribe('transaction/finalize', finalize);
                        if (error) {
                            ko(error);
                            return;
                        }
                        ok(tx);
                    };
                    $.subscribe('transaction/finalize', finalize);
                    $.publish('transaction/submitted', [txHash, title, error, tx]);
                };
                $.subscribe('transaction/submit', submit);
                $.publish('transaction/ask', [txHash, title]);
            });
        } catch (e) {
            error = e;
        }
        await client.userManager.getBalances();
        if(error) {
            throw error;
        }
        return result;
    }

    context.getChainId = async function getChainId() {
        return await context.provider.getChainId();
    };

    context.getNonce = async function getNonce(address) {
        return await context.provider.getNonce(address);
    };

    context.getLastCkeckedBlockNumber = function getLastCkeckedBlockNumber() {
        var lastCkeckedBlockNumber = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber);
        if (lastCkeckedBlockNumber === undefined || lastCkeckedBlockNumber === null) {
            lastCkeckedBlockNumber = context.defaultLastCheckedBlockNumber;
        }
        return lastCkeckedBlockNumber;
    };

    context.onEvents = async function onEvents(events) {
        if (!context.run) {
            return;
        }
        if (!context.addressesToCheck || context.addressesToCheck.length === 0) {
            var newBlockNumber = context.getLastCkeckedBlockNumber() + context.blockSequenceToCheck;
            if (newBlockNumber > context.lastFetchedBlockNumber) {
                newBlockNumber = context.lastFetchedBlockNumber;
            }
            client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber, newBlockNumber);
        }
        if (!events || events.length === 0) {
            context.scheduleNextEventCheckTimeout();
            return;
        }
        for (var i in events) {
            var event = events[i];
            var func = client.contractsManager[event.topics[0]];
            func && context.scheduleCallFunc(func, event);
        }
        context.scheduleNextEventCheckTimeout();
    };

    context.scheduleCallFunc = function scheduleCallFunc(func, event) {
        setTimeout(function() {
            var element = client.contractsManager.getDictionary().Where(it => it.address.toLowerCase() === event.address.toLowerCase()).First();
            func(event, element.element ? element.element : element);
        });
    };

    context.scheduleNextEventCheckTimeout = function scheduleNextEventCheckTimeout(msec) {
        context.nextEventCheckTimeout && clearTimeout(context.nextEventCheckTimeout);
        if (!context.run) {
            return;
        }
        delete context.nextEventCheckTimeout;
        (msec === undefined || msec === null) && (msec = context.timeToNextEventCheck);
        (msec === undefined || msec === null) && (msec = context.defaultTimeToNextEventsCheck);
        context.nextEventCheckTimeout = setTimeout(context.mainLoop, msec);
    };

    context.mainLoop = async function mainLoop() {
        if (!context.run) {
            return;
        }
        delete context.timeToNextEventCheck;
        context.lastFetchedBlockNumber === undefined && (context.lastFetchedBlockNumber = await context.provider.fetchLastBlockNumber());
        var lastCheckedBlockNumber = context.getLastCkeckedBlockNumber();
        if (lastCheckedBlockNumber >= context.lastFetchedBlockNumber) {
            delete context.lastFetchedBlockNumber;
            context.scheduleNextEventCheckTimeout();
            return;
        }
        context.timeToNextEventCheck = 0;
        !context.addressesToCheck && (context.addressesToCheck = []);
        !context.topicsToCheck && (context.topicsToCheck = []);

        if (context.addressesToCheck.length === 0) {
            var addressesToCheck = client.contractsManager.getDictionary().Select(it => it.address).ToArray();
            while (addressesToCheck.length) {
                context.addressesToCheck.push(addressesToCheck.splice(0, addressesToCheck.length > context.addressesSplit ? context.addressesSplit : addressesToCheck.length));
            }
        }
        var address = context.addressesToCheck.shift();
        var fromBlock = lastCheckedBlockNumber + 1;
        var toBlock = fromBlock + context.blockSequenceToCheck;
        if (toBlock > context.lastFetchedBlockNumber) {
            toBlock = context.lastFetchedBlockNumber;
        }
        setTimeout(function() { context.provider.retrieveEvents(fromBlock, toBlock, address, context.getTopics()).then(context.onEvents) });
    };

    context.fetchLastBlockNumber = function fetchLastBlockNumber() {
        return context.provider.fetchLastBlockNumber();
    };

    context.retrieveEvents = function retrieveEvents(fromBlock, toBlock, address, topics) {
        return context.provider.retrieveEvents(fromBlock, toBlock, address, topics);
    };

    context.call = async function call(to, data) {
        return await context.provider.call(to, data);
    }

    context.balanceOf = async function balanceOf(address) {
        return await context.provider.balanceOf(address);
    }

    context.newProvider = function newProvider(stop) {
        context.nextEventCheckTimeout && clearTimeout(context.nextEventCheckTimeout);
        return new Promise(async function(ok, ko) {
            try {
                context.provider.stop();
            } catch {}
            ScriptLoader.load({
                script: client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3Provider),
                callback: async function() {
                    context.provider = new BlockchainProvider(client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL));
                    try {
                        await context.provider.fetchLastBlockNumber();
                    } catch (error) {
                        if (stop === true) {
                            ko(error);
                            return;
                        }
                        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL, ecosystemData.web3URL);
                        setTimeout(async function() {
                            ok((await context.newProvider(true)));
                        });
                        return;
                    }
                    context.nextEventCheckTimeout = setTimeout(context.mainLoop);
                    ok();
                }
            });
        });
    }
    client.collaterateStart.push(context.newProvider);
};
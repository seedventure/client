var EditFundingPoolController = function (view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.sendTransactionTo = async function sendTransactionTo(address, data) {
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(address, data);
        return client.blockchainManager.sendSignedTransaction(signedTransaction);
    };

    context.sendTransactionToFundingPanel = function sendTransactionToFundingPanel(data) {
        return context.sendTransactionTo(context.view.getProduct().fundingPanelAddress, data);
    }

    context.saveDoc = async function saveDoc(data, isStartup) {
        context.view.emit('loader/show', '', 'Uploading to IPFS...');
        var documents = data && data.documents;
        if(documents && documents.length > 0) {
            for(var i = 0; i < documents.length; i++) {
                var document = documents[i];
                if(document.link.indexOf('http') === 0) {
                    continue;
                }
                var hash = await client.ipfsManager.uploadFile(document.link);
                documents[i].link = ecosystemData.ipfsUrlTemplate + hash;
            }
        }
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image,
            documents,
            tags: data.tags
        };
        var hash = await client.ipfsManager.uploadDocument(document);
        var url = ecosystemData.ipfsUrlTemplate + hash;
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.setOwnerData(
            url,
            web3.utils.soliditySha3(JSON.stringify(document))
        );
        var fundingPanelAddress = context.view.getProduct().fundingPanelAddress;
        if(isStartup === true) {
            method = contract.methods.changeMemberData(
                context.view.getProduct().address,
                url,
                web3.utils.soliditySha3(JSON.stringify(document))
            );
            fundingPanelAddress = context.view.props.parent.fundingPanelAddress;
        }
        var tx = await context.sendTransactionTo(fundingPanelAddress, method.encodeABI());
        tx && context.view.back();
    };

    context.updateSeedRate = async function updateSeedRate(seedRate) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.changeTokenExchangeRate(seedRate);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateExchangeRate = async function updateExchangeRate(exchangeRateOnTop) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.changeTokenExchangeOnTopRate(exchangeRateOnTop);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateWhiteListThreshold = async function updateWhiteListThreshold(whiteListThreshold) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.setNewThreshold(whiteListThreshold);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateTotalSupply = async function updateTotalSupply(totalSupply) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.setNewSeedMaxSupply(totalSupply);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.grantFundingManager = async function grantFundingManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addFundingManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyFundingManager = async function denyFundingManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeFundingManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyFundingManager = async function verifyFundingManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundingManager(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.grantFundingOperator = async function grantFundingOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addFundingOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyFundingOperator = async function denyFundingOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeFundingOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyFundingOperator = async function verifyFundingOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundingOperator(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.grantFundsUnlockManager = async function grantFundsUnlockManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addFundsUnlockerManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyFundsUnlockManager = async function denyFundsUnlockManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeFundsUnlockerManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyFundsUnlockManager = async function verifyFundsUnlockManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundsUnlockerManager(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.grantFundsUnlockOperator  = async function grantFundsUnlockOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addFundsUnlockerOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyFundsUnlockOperator = async function denyFundsUnlockOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeFundsUnlockerOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyFundsUnlockOperator = async function verifyFundsUnlockOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundsUnlockerOperator(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.grantWhiteListManager  = async function grantWhiteListManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addWLManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyWhiteListManager = async function denyWhiteListManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeWLManagers(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyWhiteListManager = async function verifyWhiteListManager(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isWLManager(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.grantWhiteListOperator  = async function grantWhiteListOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.addWLOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.denyWhiteListOperator = async function denyWhiteListOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.removeWLOperators(address);
        return await context.sendTransactionTo(context.view.getProduct().adminsToolsAddress, method.encodeABI());
    };

    context.verifyWhiteListOperator = async function verifyWhiteListOperator(address) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isWLOperator(address);
        var result = await client.blockchainManager.call(context.view.getProduct().adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        return result['0'] === true ? 'YES' : 'NO';
    };

    context.changeWalletOnTop = async function changeWalletOnTop(address) {
        var product = context.view.getProduct();
        var oldAddress = await client.contractsManager.call(contracts.AdminTools, product.adminsToolsAddress, 'getWalletOnTopAddress');
        if(address === oldAddress) {
            return;
        }
        await client.contractsManager.submit('Change Wallet on top', contracts.AdminTools, product.adminsToolsAddress, 'setWalletOnTopAddress', address);
    };

    context.setSingleWhitelist = async function setSingleWhitelist(address, whitelistAmount) {
        var product = context.view.getProduct();
        var rate = parseInt(product.exchangeRateOnTop);
        var amount = whitelistAmount * rate;
        amount = Utils.numberToString(amount);
        var isWhitelisted = await client.contractsManager.call(contracts.AdminTools, product.adminsToolsAddress, 'isWhitelisted', address);
        await client.contractsManager.submit('Set whitelist', contracts.AdminTools, product.adminsToolsAddress, isWhitelisted ? 'changeMaxWLAmount' : 'addToWhitelist', address, amount);
    };
};
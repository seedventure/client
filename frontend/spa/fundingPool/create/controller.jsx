var CreateFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.deployBasket = async function deploy(data) {
        context.view.emit('loader/show', 'Uploading to IPFS...');
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image
        };
        var hash = await client.ipfsManager.uploadDocument(document);
        var url = ecosystemData.ipfsUrlTemplate + hash;
        var contract = new web3.eth.Contract(contracts.Factory);
        var method = contract.methods.deployPanelContracts(
            data.name,
            data.symbol,
            url, 
            web3.utils.soliditySha3(JSON.stringify(document)),
            parseInt(data.seedRate),
            parseInt(data.exangeRate),
            parseInt(data.exchangeRateDecimals),
            parseInt(data.totalSupply));
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(ecosystemData.factoryAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
        setTimeout(() => context.view.emit('section/change'), 700);
    };

    context.deployMember = async function deploy(data, product) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundingOperator(address);
        var result = await client.blockchainManager.call(product.adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result);
        } catch (e) {
            result = false;
        }
        if(result !== true) {
            alert('Your user is not able to do this operation');
            return;
        }
        context.view.emit('loader/show', 'Uploading to IPFS...');
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image
        };
        var hash = await client.ipfsManager.uploadDocument(document);
        var url = ecosystemData.ipfsUrlTemplate + hash;
        contract = new web3.eth.Contract(contracts.FundingPanel);
        method = contract.methods.addMemberToSet(
            data.walletAddress,
            0,
            url, 
            web3.utils.soliditySha3(JSON.stringify(document)));
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(product.fundingPanelAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
        setTimeout(() => context.view.emit('section/change'), 700);
    };
};
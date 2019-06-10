var CreateFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.deploy = async function deploy(data) {
        context.view.emit('loader/show', 'Uploading to IPFS...');
        var hash = await client.ipfsManager.uploadDocument({
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image
        });
        var url = ecosystemData.ipfsUrlTemplate + hash;
        var contract = new web3.eth.Contract(contracts.Factory);
        var method = contract.methods.deployPanelContracts(
            data.name,
            data.symbol,
            url, 
            web3.utils.soliditySha3(hash),
            parseInt(data.seedRate),
            parseInt(data.exangeRate),
            parseInt(data.exchangeRateDecimals),
            parseInt(data.totalSupply));
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(ecosystemData.factoryAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
    };
};
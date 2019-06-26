var EditFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.sendTransactionToFundingPanel = async function sendTransactionToFundingPanel(data) {
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(context.view.getProduct().fundingPanelAddress, data);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
    };

    context.saveDoc = async function saveDoc(document) {
        context.view.emit('loader/show', 'Uploading to IPFS...');
        var hash = await client.ipfsManager.uploadDocument(document);
        var url = ecosystemData.ipfsUrlTemplate + hash;
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.setOwnerData(
            url, 
            web3.utils.soliditySha3(JSON.stringify(document))
        );
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateSeedRate = async function updateSeedRate(seedRate) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.changeTokenExchangeRate(seedRate);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateExchangeRate = async function updateExchangeRate(exchangeRate) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.changeTokenExchangeOnTopRate(exchangeRate);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateExchangeRateDecimals = async function updateExchangeRateDecimals(exchangeRateDecimals) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.changeTokenExchangeDecimals(exchangeRateDecimals);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };

    context.updateTotalSupply = async function updateTotalSupply(totalSupply) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.setNewSeedMaxSupply(totalSupply);
        await context.sendTransactionToFundingPanel(method.encodeABI());
    };
};
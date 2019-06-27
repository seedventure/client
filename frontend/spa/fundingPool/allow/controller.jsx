var AllowFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.refreshAllowance = async function refreshAllowance() {
        var contract = new web3.eth.Contract(contracts.ERC20Seed);
        var method = contract.methods.allowance(
            client.userManager.user.wallet,
            context.factoryAddress = ecosystemData.factoryAddress
        );
        var result = await client.blockchainManager.call(ecosystemData.seedTokenAddress, method.encodeABI());
        result = web3.eth.abi.decodeParameters(['uint256'], result);
        context.view.setState({allowance : result['0']});
    };

    context.updateAllowance = async function updateAllowance(allowance) {
        var contract = new web3.eth.Contract(contracts.ERC20Seed);
        var method = contract.methods.increaseAllowance(
            context.factoryAddress = ecosystemData.factoryAddress,
            web3.utils.toWei(allowance + '', 'ether')
        );
        var data = method.encodeABI();
        var signedTransaction = await client.userManager.signTransaction(ecosystemData.seedTokenAddress, data);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
    };
};
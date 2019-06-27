var MemberController = function (view) {
    var context = this;
    context.view = view;

    context.enableMember = async function enableMember(member, product) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundingOperator(client.userManager.user.wallet);
        var result = await client.blockchainManager.call(product.adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result)[0];
        } catch (e) {
            result = false;
        }
        if(result !== true) {
            alert('Your user is not able to do this operation');
            return;
        }
        contract = new web3.eth.Contract(contracts.FundingPanel);
        method = contract.methods.enableMember(member.address);
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(product.fundingPanelAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
    };

    context.disableMember = async function disableMember(member, product) {
        var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundingOperator(client.userManager.user.wallet);
        var result = await client.blockchainManager.call(product.adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result)[0];
        } catch (e) {
            result = false;
        }
        if(result !== true) {
            alert('Your user is not able to perform this operation');
            return;
        }
        contract = new web3.eth.Contract(contracts.FundingPanel);
        method = contract.methods.disableMemberByMember(member.address);
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(product.fundingPanelAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);
    };

    context.unlockAmount = async function unlockAmount(member, product, amount) {var contract = new web3.eth.Contract(contracts.AdminTools);
        var method = contract.methods.isFundsUnlockerOperator(client.userManager.user.wallet);
        var result = await client.blockchainManager.call(product.adminsToolsAddress, method.encodeABI());
        try {
            result = web3.eth.abi.decodeParameters(['bool'], result)[0];
        } catch (e) {
            result = false;
        }
        if(result !== true) {
            alert('Your user is not able to perform this operation');
            return;
        }
        var seedToUnlock = web3.utils.toWei(amount + '', 'ether');
        var seed = await client.contractsManager.seedOf(product.fundingPanelAddress);

        if(parseInt(seed + '') < parseInt(seedToUnlock + '')) {
            alert('Not enough SEED to unlock');
            return;
        }

        contract = new web3.eth.Contract(contracts.FundingPanel);
        method = contract.methods.unlockFunds(member.address, seedToUnlock);
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var signedTransaction = await client.userManager.signTransaction(product.fundingPanelAddress, method);
        client.blockchainManager.sendSignedTransaction(signedTransaction);
        setTimeout(() => context.view.emit('transaction/show', web3.utils.sha3(signedTransaction)), 700);

    };
};
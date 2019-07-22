var ProductController = function (view) {
    var context = this;
    context.view = view;

    context.makeUnsuitable = async function makeUnsuitable(product) {
        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var method = contract.methods.setNewSeedMaxSupply(0);
        method = method.encodeABI();
        await client.blockchainManager.sendSignedTransaction(await client.userManager.signTransaction(product.address, method), "Make Basket Unsuitable");
    };
};
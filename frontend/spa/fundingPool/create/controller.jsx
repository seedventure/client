var CreateFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.deployBasket = async function deployBasket(data) {
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
        context.view.emit('loader/hide');
        var tx = await client.contractsManager.Factory.deployPanelContracts(
            ecosystemData.factoryAddress,
            data.name,
            data.symbol,
            ecosystemData.ipfsUrlTemplate + hash, 
            web3.utils.soliditySha3(JSON.stringify(document)),
            web3.utils.toWei('' + data.seedRate, 'ether'),
            web3.utils.toWei('' + data.exchangeRateOnTop, 'ether'),
            parseInt(data.totalSupply),
            parseInt(data.whiteListThreshold)
        );
        tx && setTimeout(() => context.view.emit('page/change', Products, {view : 'mine'}), 700);
    };

    context.deployMember = async function deployMember(data, product) {
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
        context.view.emit('loader/show', '', 'Uploading to IPFS...');
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image,
            documents: data.documents
        };
        var hash = await client.ipfsManager.uploadDocument(document);
        context.view.emit('loader/hide');
        var tx = await client.contractsManager.FundingPanel.addMemberToSet(
            product.fundingPanelAddress,
            data.walletAddress,
            0,
            ecosystemData.ipfsUrlTemplate + hash, 
            web3.utils.soliditySha3(JSON.stringify(document)));
        tx && context.view.back();
    };
};
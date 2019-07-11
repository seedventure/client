var CreateFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.deployBasket = async function deploy(data) {
        context.view.emit('loader/show', 'Uploading to IPFS...');
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
        var contract = new web3.eth.Contract(contracts.Factory);
        var method = contract.methods.deployPanelContracts(
            data.name,
            data.symbol,
            url, 
            web3.utils.soliditySha3(JSON.stringify(document)),
            web3.utils.toWei('' + data.seedRate, 'ether'),
            web3.utils.toWei('' + data.exangeRate, 'ether'),
            parseInt(data.totalSupply),
            parseInt(data.whiteListThreshold));
        method = method.encodeABI();
        context.view.emit('loader/hide');
        var tx = await client.blockchainManager.sendSignedTransaction(await client.userManager.signTransaction(ecosystemData.factoryAddress, method), "Create new Funding Panel", true);
        tx && setTimeout(() => context.view.emit('section/change'), 700);
    };

    context.deployMember = async function deploy(data, product) {
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
        context.view.emit('loader/show', 'Uploading to IPFS...');
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image,
            documents: data.documents
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
        var tx = await client.blockchainManager.sendSignedTransaction(await client.userManager.signTransaction(product.fundingPanelAddress, method), "Create new Funding Panel");
        tx && setTimeout(() => context.view.emit('section/change'), 700);
    };
};
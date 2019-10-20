var CreateFundingPoolController = function(view) {
    var context = this;
    context.view = view;

    context.urlRegex = new RegExp(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi);

    context.deployBasket = async function deployBasket(data) {
        context.view.emit('loader/show', '', 'Uploading documents...');
        var documents = data && data.documents;
        if(documents && documents.length > 0) {
            for(var i = 0; i < documents.length; i++) {
                var document = documents[i];
                if(document.link.indexOf('http') === 0) {
                    continue;
                }
                try {
                    var link = await client.documentsUploaderManager.uploadFile(document.link);
                    documents[i].link = link;
                } catch(e) {
                    context.view.emit('loader/hide');
                    return alert("Unable to upload file '" + Utils.getLastPartFile(document.link) + "'. Please try again later");
                }
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
        data.basketSuccessFee && (document.basketSuccessFee = data.basketSuccessFee);
        var link;
        try {
            link = await client.documentsUploaderManager.uploadDocument(document);
        } catch(e) {
            context.view.emit('loader/hide');
            return alert("Unable to upload document. An error occurred: '" + (e.message || e) + "'. Please try again later");
        }
        context.view.emit('loader/hide');
        var tx = await client.contractsManager.Factory.deployPanelContracts(
            client.contractsManager.factoryAddress,
            data.name,
            data.symbol,
            link, 
            web3.utils.soliditySha3(JSON.stringify(document)),
            web3.utils.toWei('' + data.seedRate, 'ether'),
            web3.utils.toWei('' + data.exchangeRateOnTop, 'ether'),
            web3.utils.toWei('' + data.totalSupply, 'ether'),
            web3.utils.toWei('' + data.whiteListThreshold, 'ether')
        );
        tx && setTimeout(() => context.view.emit('page/change', Products, {view : 'mine'}), 700);
    };

    context.deployMember = async function deployMember(data, product) {
        try {
            for(var i in product.members) {
                if(data.walletAddress.toLowerCase() === product.members[i].address.toLowerCase()) {
                    alert("The wallet your are using is already associated to another Startup of this basket");
                    return;
                }
            }
        } catch(e) {
        }
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
        context.view.emit('loader/show', '', 'Uploading document...');
        var documents = data && data.documents;
        if(documents && documents.length > 0) {
            for(var i = 0; i < documents.length; i++) {
                var document = documents[i];
                if(document.link.indexOf('http') === 0) {
                    continue;
                }
                try {
                    var link = await client.documentsUploaderManager.uploadFile(document.link);
                    documents[i].link = link;
                } catch(e) {
                    context.view.emit('loader/hide');
                    return alert("Unable to upload file '" + Utils.getLastPartFile(document.link) + "'. Please try again later");
                }
            }
        }
        var document = {
            name : data.name,
            description : data.description,
            url : data.url,
            image : data.image,
            documents,
            totalSupply : Utils.toWei(data.totalSupply)
        };
        data.portfolioValue && (document.portfolioValue = data.portfolioValue);
        data.portfolioCurrency && (document.portfolioCurrency = data.portfolioCurrency);
        var link;
        try {
            link = await client.documentsUploaderManager.uploadDocument(document);
        } catch(e) {
            context.view.emit('loader/hide');
            return alert("Unable to upload document. An error occurred: '" + (e.message || e) + "'. Please try again later");
        }
        context.view.emit('loader/hide');
        var tx = await client.contractsManager.FundingPanel.addMemberToSet(
            product.fundingPanelAddress,
            data.walletAddress,
            0,
            link, 
            web3.utils.soliditySha3(JSON.stringify(document)));
        tx && context.view.back();
    };
};
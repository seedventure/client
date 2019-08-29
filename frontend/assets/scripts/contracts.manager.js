function ContractsManager() {
    var context = this;

    context.SEEDTokenAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress);
    context.factoryAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress);
    context.dexAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.dexAddress);
    context.ethAddress = '0x0000000000000000000000000000000000000000';
    context.addressTopicPrefix = '0x000000000000000000000000';

    context.orderEvent = '0x3f7f2eda73683c21a15f9435af1028c93185b5f1fa38270762dc32be606b3e85';
    context.orderEventData = ['uint', 'uint', 'uint', 'uint'];
    context.cancelEvent = '0x23abf2ec32f342a8a69304f69761adc394b1915db95ad0cfff3772d9fb3ee3c8';
    context.cancelEventData = ['uint', 'uint', 'uint', 'uint'];
    context.tradeEvent = '0x74fe7e1f8cd2a8282b88fefc87ef874cc84ac7b165218719b0b646fb53497f32';
    context.tradeEventData = ['uint', 'uint', 'uint', 'uint', 'uint', 'uint', 'address'];

    context.productQueue = {};

    Object.keys(contracts).map(function(key) {
        contracts[key].map(function(contractElement) {
            if (contractElement.type !== "function") {
                return;
            }!context[key] && (context[key] = {});
            context[key][contractElement.name] = function() {
                var address = arguments[0];
                var argumentsLength = arguments.length - 1;
                var view = contractElement.stateMutability === "view";
                var originalInputLength = contractElement.inputs.length;
                contractElement.payable == true && originalInputLength++;
                if (argumentsLength < originalInputLength) {
                    throw 'Wrong input paramenters length' + (contractElement.payable ? ' for payable contract' : '') + ': expected ' + originalInputLength + ', found ' + argumentsLength
                }
                var title = view ? undefined : argumentsLength > originalInputLength ? arguments[arguments.length - 1] : Utils.toTitle(contractElement.name);
                var args = [];
                title && args.push(title);
                args.push(contracts[key]);
                args.push(address);
                args.push(contractElement.name);
                originalInputLength++;
                for (var i = 1; i < originalInputLength; i++) {
                    args.push(arguments[i]);
                }
                return context[view ? "call" : "submit"].apply(context, args);
            }
        });
    });

    context.seedOf = async function seedOf(address) {
        return await context.tokenBalanceOf(context.SEEDTokenAddress, address);
    };

    context.tokenBalanceOf = async function tokenBalanceOf(contract, address) {
        return await context.call(contracts.Token, contract, 'balanceOf', address);
    };

    context.call = async function call() {
        var contractType = arguments[0];
        var address = arguments[1];
        var methodName = arguments[2];
        var args = [];
        if (arguments.length > 3) {
            for (var i = 3; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
        }

        var outputs = undefined;

        try {
            outputs = Enumerable.From(Enumerable.From(contractType).Where(it => it.type === 'function' && it.name === methodName && ((!it.inputs && args.length === 0) || it.inputs.length === args.length)).First().outputs).Select(it => it.type).ToArray();
        } catch (e) {
            console.error(e);
        }

        var contract = new web3.eth.Contract(contractType);
        var method = contract.methods[methodName].apply(contract, args);
        var result = await client.blockchainManager.call(address, method.encodeABI());
        if (!outputs || outputs.length === 0) {
            return;
        }
        result = web3.eth.abi.decodeParameters(outputs, result);
        return ((result.__length__ || Object.keys(result).length) > 1 ? result : result['0']);
    };

    context.submit = async function submit() {
        var title = arguments[0];
        var contractType = arguments[1];
        var address = arguments[2];
        var methodName = arguments[3];
        var args = [];
        if (arguments.length > 4) {
            for (var i = 4; i < arguments.length; i++) {
                args.push(arguments[i]);
            }
        }
        var contract = new web3.eth.Contract(contractType);
        var method = undefined;
        var value = undefined;
        try {
            method = contract.methods[methodName].apply(contract, args);
        } catch (e) {
            value = args.pop();
            method = contract.methods[methodName].apply(contract, args);
        }
        var signedTransaction = await client.userManager.signTransaction(address, method.encodeABI(), value);
        return await client.blockchainManager.sendSignedTransaction(signedTransaction, title);
    };

    context.getList = function getList() {
        var list = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.list);
        if (list === undefined || list === null) {
            list = {};
        }
        return list;
    };

    context.getArray = function getArray() {
        var array = [];
        var list = context.getList();
        Object.keys(list).map(function(key) {
            array.push(list[key]);
        });
        return array;
    };

    context.getDictionary = function getDictionary() {
        context.dictionary = [];
        context.dictionary.push({
            address: context.factoryAddress.toLowerCase(),
            type: 'factory'
        });
        context.dexAddress && context.dictionary.push({
            address: context.dexAddress.toLowerCase(),
            type: 'dex'
        });
        context.SEEDTokenAddress && context.dictionary.push({
            address: context.SEEDTokenAddress.toLowerCase(),
            type: 'SEEDToken'
        });
        var list = context.getList();
        var keys = Object.keys(list);
        for (var i in keys) {
            var element = list[keys[i]];
            context.dictionary.push({
                address: element.tokenAddress.toLowerCase(),
                type: 'token',
                element: element,
                position: keys[i]
            });
            context.dictionary.push({
                address: element.fundingPanelAddress.toLowerCase(),
                type: 'fundingPanel',
                element: element,
                position: keys[i]
            });
            context.dictionary.push({
                address: element.adminsToolsAddress.toLowerCase(),
                type: 'adminsTools',
                element: element,
                position: keys[i]
            });
        }
        return (context.dictionary = Enumerable.From(context.dictionary));
    };

    context.getAllEventsAsTopics = function getAllEventsAsTopics() {
        var events = [];
        context.getContractEvents(contracts.Factory, events);
        context.getContractEvents(contracts.AdminTools, events);
        context.getContractEvents(contracts.FundingPanel, events);
        context.getContractEvents(contracts.Token, events);
        var topics = [];
        for (var i in events) {
            topics.push([events[i]]);
        }
        return topics;
    };

    context.getContractEvents = function getContractEvents(contractAbi, events) {
        Object.keys(new web3.eth.Contract(contractAbi).events).map(name => {
            if (name.indexOf('(') === -1) {
                return;
            }
            events.push(web3.utils.keccak256(name));
        });
    };

    context.getFundingPanelData = async function getFundingPanelData(product) {
        if (!product) {
            return product;
        }

        if (context.productQueue[product.position]) {
            return product;
        }

        if (context.factoryAddress !== product.factoryAddress) {
            return;
        }

        product.unavailable === true && delete product.lastCheck;
        var checkDate = product.name !== undefined && product.name !== null;
        if (checkDate) {
            try {
                checkDate = !Enumerable.From(client.userManager.user.list).Contains(product.position);
            } catch (e) {}
        }
        var lastCheck = new Date().getTime();
        if (checkDate === true && typeof product.lastCheck !== 'undefined' && lastCheck - product.lastCheck <= 60000) {
            return product;
        }

        context.productQueue[product.position] = true;

        product.lastCheck = lastCheck;

        var contract = new web3.eth.Contract(contracts.FundingPanel);

        var call = product.name === undefined || product.name === null;

        var data = contract.methods.getOwnerData().encodeABI();
        var result = await context.FundingPanel.getOwnerData(product.fundingPanelAddress);
        product.documentUrl = result['0'];
        product.documentHash = result['1'];

        product.exchangeRateOnTop = parseInt(await context.FundingPanel.exchangeRateOnTop(product.fundingPanelAddress));

        data = contract.methods.exchangeRateSeed().encodeABI();
        result = await client.blockchainManager.call(product.fundingPanelAddress, data);
        result = web3.eth.abi.decodeParameters(['uint256'], result);
        product.seedRate = parseInt(result['0']);

        data = contract.methods.seedMaxSupply().encodeABI();
        result = await client.blockchainManager.call(product.fundingPanelAddress, data);
        result = web3.eth.abi.decodeParameters(['uint256'], result);
        product.totalSupply = parseInt(result['0']);

        contract = new web3.eth.Contract(contracts.AdminTools);
        data = contract.methods.getWLThresholdBalance().encodeABI();
        result = await client.blockchainManager.call(product.adminsToolsAddress, data);
        result = web3.eth.abi.decodeParameters(['uint256'], result);
        product.whiteListThreshold = parseInt(result['0']);

        product.walletOnTop = await client.contractsManager.AdminTools.getWalletOnTopAddress(product.adminsToolsAddress);

        contract = new web3.eth.Contract(contracts.Token);
        data = contract.methods.symbol().encodeABI();
        result = await client.blockchainManager.call(product.tokenAddress, data);
        result = web3.eth.abi.decodeParameters(['string'], result);
        product.symbol = result['0'];

        !product.members && (product.members = {});
        contract = new web3.eth.Contract(contracts.FundingPanel);
        data = contract.methods.getMembersNumber().encodeABI();
        result = await client.blockchainManager.call(product.fundingPanelAddress, data);
        result = web3.eth.abi.decodeParameters(['uint256'], result);
        var membersLength = parseInt(result['0']);
        for (var i = 0; i < membersLength; i++) {
            var position = i + '';
            !product.members[position] && (product.members[position] = {});
            var member = product.members[position];

            member.position = position;
            member.productFundingPanelAddress = product.fundingPanelAddress;
            member.productPosition = product.position;
        }

        call && $.publish('fundingPanel/' + product.position + '/updated', product);

        try {
            var xmlResponse = await Utils.AJAXRequest(product.documentUrl, 5000);
            xmlResponse = JSON.parse(xmlResponse);
            call = product.unavailable !== undefined && product.unavailable !== null;
            delete product.unavailable;
            Object.keys(xmlResponse).map(key => product[key] = xmlResponse[key]);
            for (var i in product.members) {
                await context.getFundingPanelMemberData(product.members[i]);
            }
            call && $.publish('fundingPanel/' + product.position + '/updated', product);
        } catch (e) {
            product.unavailable = true;
            setTimeout(function() {
                context.getFundingPanelData(product);
            }, 15000);
        }
        delete context.productQueue[product.position];
        return product;
    };

    context.getFundingPanelMemberData = async function getFundingPanelMemberData(product) {
        if (!product) {
            return;
        }

        if (context.productQueue[product.productPosition + '_' + product.position]) {
            return product;
        }

        if (product.pendingNotications && (!context.changesWaiter || !context.changesWaiter[product.position])) {
            setTimeout(function() {
                context.manageFundingPanelChanged(product);
            });
            return product;
        }

        product.unavailable === true && delete product.lastCheck;
        var checkDate = product.name !== undefined && product.name !== null;
        var lastCheck = new Date().getTime();
        if (checkDate === true && typeof product.lastCheck !== 'undefined' && lastCheck - product.lastCheck <= 60000) {
            return;
        }

        context.productQueue[product.productPosition + '_' + product.position] = true;

        product.lastCheck = lastCheck;

        var call = product.name === undefined || product.name === null;

        var contract = new web3.eth.Contract(contracts.FundingPanel);
        var data = contract.methods.getMemberAddressByIndex(product.position).encodeABI();
        var result = await client.blockchainManager.call(product.productFundingPanelAddress, data);
        result = web3.eth.abi.decodeParameters(['address'], result);
        product.address = result['0'];

        data = contract.methods.getMemberDataByAddress(product.address).encodeABI();
        result = await client.blockchainManager.call(product.productFundingPanelAddress, data);
        result = web3.eth.abi.decodeParameters(['bool', 'uint8', 'string', 'bytes32', 'uint256', 'uint'], result);

        product.disabled = parseInt(result['1']);
        product.documentUrl = result['2'];
        product.documentHash = result['3'];

        call && $.publish('fundingPanel/' + product.productPosition + '/member/' + product.position + '/updated', product);

        try {
            var xmlResponse = await Utils.AJAXRequest(product.documentUrl, 5000);
            xmlResponse = JSON.parse(xmlResponse);
            call = product.unavailable !== undefined && product.unavailable !== null;
            delete product.unavailable;
            Object.keys(xmlResponse).map(key => product[key] = xmlResponse[key]);
            call && $.publish('fundingPanel/' + product.productPosition + '/member/' + product.position + '/updated', product);
        } catch (e) {
            product.unavailable = true;
            setTimeout(function() {
                context.getFundingPanelMemberData(product);
            }, 15000);
        }
        delete context.productQueue[product.productPosition + '_' + product.position];
        return product;
    };

    context.manageFundingPanelChanged = function manageFundingPanelChanged(element) {
        if (!client.configurationManager.hasUnlockedUser()) {
            return;
        }
        var product = element.element || element;
        !context.changesWaiter && (context.changesWaiter = {});
        if (context.changesWaiter[product.position]) {
            return;
        }
        context.changesWaiter[product.position] = true;
        var copy = JSON.parse(JSON.stringify(product));
        product.pendingNotications = true;
        product.unavailable = true;
        try {
            for (var i in product.members) {
                product.members[i].unavailable = true;
            }
        } catch (e) {}
        $.publish('fundingPanel/' + product.position + '/updated', product);
        var subscripted = function(event, product) {
            $.unsubscribe('fundingPanel/' + product.position + '/updated', subscripted);
            delete product.pendingNotications;
            context.notifyPotentialFundingPanelChanges(product, copy);
            delete context.changesWaiter[product.position];
        };
        $.subscribe('fundingPanel/' + product.position + '/updated', subscripted);
        context.getFundingPanelData(product);
    };

    context.notifyPotentialFundingPanelChanges = function notifyPotentialFundingPanelChanges(product, copy) {
        console.log({ product, copy });
    };

    context['0x10b2a5b108c7f1e07744f78d98a096424f89c30fca6176cb114052d552ea4650'] = function whiteListThresholdChanged(event, element) {
        context.manageFundingPanelChanged(element.element || element);
    };

    context['0xb9f320ca5d6edcd5b5ec403b3a0970d8ff03a3ab365497b976507b20e27c7067'] = function memberDisabled(event, element) {
        context.manageFundingPanelChanged(element.element || element);
    };

    context['0x0dcb0d206ae1380b9262e6ac8529c80879595c33706fa1199edd4a7ef72cf3a1'] = function memberEnabled(event, element) {
        context.manageFundingPanelChanged(element.element || element);
    };

    context['0x94d9b0a056867efca93631b338c7fde3befc3f54db36b90b8456b069385c30be'] = function newMemberCreated(event, element) {
        context.manageFundingPanelChanged(element.element || element);
    };

    context['0x4ae00b988cb3b798b8bc44e759790a289c70af1275d958aafd5938e2da3592f9'] = function memberRefreshed(event, element) {
        context.manageFundingPanelChanged(element.element || element);
    };

    context['0xb4630f894cab42818aa587f8d4fc219b8472578638e808b23df12161ad730af6'] = function fundingPanelDataChanged(event, element) {
        context.manageFundingPanelChanged(element);
    };

    context['0x6c0400aaf859104057a4afd47301bdc6ac1829e4fd0b02292b6287ea761862e7'] = function totalSupplyChanged(event, element) {
        context.manageFundingPanelChanged(element);
    };

    context['0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7'] = function depositToDEX(event) {
        if (!client.userManager.user) {
            return;
        }
        var wallet = '0x' + event.topics[2].toLowerCase().split(context.addressTopicPrefix)[1];
        if (wallet !== client.userManager.user.wallet.toLowerCase()) {
            return;
        }
        var contractOrEth = '0x' + event.topics[1].toLowerCase().split(context.addressTopicPrefix)[1];
        contractOrEth === context.ethAddress && $.publish('amount/eth');
        contractOrEth === context.SEEDTokenAddress && $.publish('amount/seed');
        try {
            var product = Enumerable.From(context.getArray()).Where(it => it.tokenAddress.toLowerCase() === contractOrEth).First();
            $.publish('fundingPanel/' + product.position + '/updated', product);
        } catch (e) {}
    };

    context['0xf341246adaac6f497bc2a656f546ab9e182111d630394f0c57c710a59a2cb567'] = function withdrawToDEX(event) {
        return context['0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7'](event);
    };

    context[context.orderEvent] = function dexOrder(event) {
        $.publish('dex/order', event);
    };

    context[context.cancelEvent] = function cancelOrder(event) {
        $.publish('dex/order', event);
    };

    context[context.tradeEvent] = async function dexTrade(event) {
        var first = '0x' + event.topics[1].toLowerCase().split(context.addressTopicPrefix)[1];
        var second = '0x' + event.topics[2].toLowerCase().split(context.addressTopicPrefix)[1];
        var tokenAddress = first === context.SEEDTokenAddress ? second : first;
        var trade = context.elaborateSingleOrder(tokenAddress, context.SEEDTokenAddress, event);
        var product = Enumerable.From(context.getArray()).Where(it => it.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()).FirstOrDefault();
        product && (product.value = trade.amountWei);
        product && $.publish('fundingPanel/' + product.position + '/updated', product);
        $.publish('dex/order', [event, trade]);
    };

    context['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'] = async function erc20Transfer(event, element) {
        if (element.type !== 'SEEDToken') {
            return;
        }
        var product = web3.eth.abi.decodeParameters(['address'], event.topics[2])[0].toLowerCase();
        product = Enumerable.From(context.getArray()).Where(it => it.fundingPanelAddress.toLowerCase() === product).FirstOrDefault();
        if (product) {
            await context.fundingPanelFunded(event, element, product);
            return;
        }
        product = web3.eth.abi.decodeParameters(['address'], event.topics[1])[0].toLowerCase();
        product = Enumerable.From(context.getArray()).Where(it => it.fundingPanelAddress.toLowerCase() === product).FirstOrDefault();
        if (!product) {
            return;
        }
        var member = web3.eth.abi.decodeParameters(['address'], event.topics[2])[0].toLowerCase();
        try {
            for (var i in product.members) {
                var m = product.members[i];
                if (!m.disabled && m.address.toLowerCase() === member.toLowerCase()) {
                    await context.memberFunded(event, element, product, m);
                    return;
                }
            }
        } catch (e) {}
    };

    context.getOrders = async function getOrders(a, evts, event) {
        var events = (evts && JSON.parse(JSON.stringify(evts))) || [];
        var trades = events.shift() || [];
        var main = (a || context.SEEDTokenAddress).toLowerCase();
        var opposite = (a ? context.SEEDTokenAddress : context.ethAddress).toLowerCase();
        var blockNumber = await client.blockchainManager.fetchLastBlockNumber();
        if (!event) {
            events = [];
            var a1 = context.addressTopicPrefix + main.split('0x')[1];
            var a2 = context.addressTopicPrefix + opposite.split('0x')[1];
            var topics = [
                [context.orderEvent, context.cancelEvent, context.tradeEvent],
                [a1, a2],
                [a1, a2]
            ];
            var start = 0;
            var end = context.deployBlock - 1;
            while ((start = (end + 1)) <= blockNumber) {
                end = start + client.blockchainManager.blockSequenceToCheck;
                end = end > blockNumber ? blockNumber : end;
                var evts = await client.blockchainManager.retrieveEvents(Utils.numberToString(start), Utils.numberToString(end), context.dexAddress, topics);
                evts && (events = events.concat(evts));
            }
        };
        if (!event && (!events || events.length === 0)) {
            return;
        }
        var o = (event ? events : {}) || {};
        if (o.length !== undefined) {
            var obj = {};
            o.map(order => obj[order.key] = order);
            o = obj;
        }
        event && context.elaborateSingleOrder(main, opposite, event, blockNumber, o, trades, true);
        !event && events.map(evt => context.elaborateSingleOrder(main, opposite, evt, blockNumber, o, trades));
        var orders = Object.keys(o).map(k => o[k]);
        orders.unshift(trades);
        return orders;
    };

    context.elaborateSingleOrder = function elaborateSingleOrder(main, opposite, event, blockNumber, o, trades, single) {
        var isOrder = event.topics[0].toLowerCase() === context.orderEvent.toLowerCase();
        var isCancel = event.topics[0].toLowerCase() === context.cancelEvent.toLowerCase();
        var isTrade = event.topics[0].toLowerCase() === context.tradeEvent.toLowerCase();
        var data = web3.eth.abi.decodeParameters(isOrder ? context.orderEventData : isCancel ? context.cancelEventData : context.tradeEventData, event.data);
        var first = '0x' + event.topics[1].toLowerCase().split(context.addressTopicPrefix)[1];
        var second = '0x' + event.topics[2].toLowerCase().split(context.addressTopicPrefix)[1];
        if (!((first === main && second === opposite) || (first === opposite && second === main))) {
            return;
        }
        var amountGet = parseInt(data[0]);
        var amountGive = parseInt(data[1]);
        var expires = parseInt(data[2]);
        var nonce = parseInt(data[3]);
        var user = '0x' + event.topics[3].toLowerCase().split(context.addressTopicPrefix)[1];
        var buy = first === main && second === opposite;
        var key = user + '_' + Utils.numberToString(nonce) + '_' + Utils.numberToString(expires);
        var give = Utils.toEther(amountGive);
        var get = Utils.toEther(amountGet);
        var amountNumber = (buy ? give : get) / (buy ? get : give);
        var amountWei = Utils.toWei(amountNumber);
        var amount = Utils.roundWei(amountWei);
        if (isTrade) {
            var decursionAmount = parseInt(data[4]);
            var amountGetDecursion = buy ? (decursionAmount / amountNumber) : decursionAmount;
            var amountGiveDecursion = buy ? decursionAmount : (decursionAmount / amountNumber);
            var decursionUser = data[6].toLowerCase();
            var trade = {
                buy,
                orderKey: key,
                decursionAmount,
                amountGiveDecursion,
                amountGetDecursion,
                user: decursionUser,
                amount,
                amountNumber,
                amountWei,
                transactionHash: event.transactionHash,
                first,
                second
            };
            trades && !Enumerable.From(trades).Any(it => it.transactionHash === trade.transactionHash) && trades.push(trade);
            if (o && o[key]) {
                var orderToDecurt = o[key];
                orderToDecurt.trades.push(trade);
                orderToDecurt.amountGiveSum -= amountGiveDecursion;
                orderToDecurt.amountGetSum -= amountGetDecursion;
            }
            try {
                single === true && (client.usermanager.user.wallet.toLowerCase() === user || client.usermanager.user.wallet.toLowerCase() === decursionUser) && $.publish('amount/seed');
            } catch (e) {}
            return trade;
        }
        if (isCancel) {
            delete o[key];
            return;
        }
        if (blockNumber > expires) {
            return;
        }
        o[key] = {
            key,
            buy,
            user,
            nonce,
            expires,
            first,
            second,
            amountGet,
            amountGive,
            amount,
            amountWei,
            amountNumber,
            trades: [],
            transactionHash: event.transactionHash,
            amountGiveSum: amountGive,
            amountGetSum: amountGet
        };
    };

    context.memberFunded = async function memberFunded(event, element, product, member) {
        !member.totalRaised && (member.totalRaised = 0);
        !product.totalUnlocked && (product.totalUnlocked = 0);
        var amount = parseInt(web3.eth.abi.decodeParameters(['uint256'], event.data)[0]);
        member.totalRaised += amount;
        product.totalUnlocked += amount;
        $.publish('fundingPanel/' + product.position + '/updated', [product, member]);
    };

    context.fundingPanelFunded = async function fundingPanelFunded(event, element, product) {
        !product.totalRaised && (product.totalRaised = 0);

        var investor = web3.eth.abi.decodeParameters(['address'], event.topics[1])[0].toLowerCase();
        var amount = parseInt(web3.eth.abi.decodeParameters(['uint256'], event.data)[0]);
        !product.investors && (product.investors = {});
        !product.investors[investor] && (product.investors[investor] = 0);
        product.investors[investor] += amount;
        product.totalRaised += amount;
        $.publish('fundingPanel/' + product.position + '/updated', product);
        try {
            if (client.userManager.user.wallet.toLowerCase() === investor.toLowerCase()) {
                $('investment/mine', product);
            }
        } catch (e) {}
    }

    context['0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925'] = async function allowanceIncreased(event, element) {};

    context['0x28e958703d566ea9825155c28c95c3d92a2da219b51404343e4653bccd47525a'] = async function newFundingPanel(event, element) {
        var data = web3.eth.abi.decodeParameters(['address', 'address', 'address', 'address', 'uint'], event.data);

        var position = (parseInt(data['4']) - 1).toString();
        var list = context.getList();
        if (list[position] !== undefined && list[position] !== null) {
            return;
        }
        var element = {
            factoryAddress: context.factoryAddress,
            owner: data['0'],
            adminsToolsAddress: data['1'],
            tokenAddress: data['2'],
            fundingPanelAddress: data['3'],
            position
        };
        list[position] = element;
        try {
            if (element.owner.toLowerCase() === client.userManager.user.wallet.toLowerCase()) {
                !client.userManager.user.list && (client.userManager.user.list = []);
                client.userManager.user.list.push(position);
            }
        } catch {}
        $.publish('list/updated');
    };

    context.changeFactoryAddress = async function changeFactoryAddress(factoryAddress) {
        client.blockchainManager.pause();
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.list, {});
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress, factoryAddress);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress, null);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.dexAddress, null);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber, null);
        await context.refreshContext(true);
        await context.checkBaskets();
        client.blockchainManager.resume();
    };

    context.refreshContext = async function refreshContext(cleanBlockNumber) {
        var factoryAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress);
        var data = undefined;
        try {
            data = await context.Factory.getFactoryContext(factoryAddress);
        } catch (e) {
            data = undefined;
        }
        if (!data) {
            return;
        }
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress, data[0].toLowerCase());
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.dexAddress, data[1].toLowerCase());
        cleanBlockNumber === true && client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.lastCheckedBlockNumber, parseInt(data[2]));
        context.deployBlock = parseInt(data[2]);
        context.SEEDTokenAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress).toLowerCase();
        context.factoryAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress).toLowerCase();
        context.dexAddress = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.dexAddress).toLowerCase();
    };

    context.checkBaskets = async function checkBaskets() {
        if (!client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress)) {
            await context.changeFactoryAddress(client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress));
            return;
        }
        await context.refreshContext();
        var result = parseInt(await context.Factory.getTotalFPContracts(context.factoryAddress));
        if (result === 0) {
            return;
        }
        var list = context.getList();
        var indexes = Enumerable.From(Object.keys(list)).Select(it => parseInt(it));
        var missing = Enumerable.Range(0, result).Where(it => !indexes.Contains(it)).ToArray();
        if (missing.length === 0) {
            return;
        }
        for (var i in missing) {
            var index = missing[i];
            result = await context.Factory.getContractsByIndex(context.factoryAddress, index);
            var element = {
                factoryAddress: context.factoryAddress,
                owner: result['0'],
                adminsToolsAddress: result['1'],
                tokenAddress: result['2'],
                fundingPanelAddress: result['3'],
                position: '' + index
            };
            list['' + index] = element;
        }
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.list, list);
        try {
            !client.userManager.user.list && (client.userManager.user.list = []);
            var elements = [];
            for (var i in missing) {
                var element = list[missing[i] + ''];
                if (element.owner.toLowerCase() === client.userManager.user.wallet.toLowerCase()) {
                    client.userManager.user.list.push(element.position);
                    elements.push(element);
                }
            }
        } catch (e) {}
        $.publish('list/updated');
    };
    client.collaterateStart.push(context.checkBaskets);
}
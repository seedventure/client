var DexController = function (view) {
    var context = this;
    context.view = view;

    context.ethAddress = '0x0000000000000000000000000000000000000000';
    context.bytes32 = web3.utils.soliditySha3('');

    context.setBalances = function setBalances(balances) {
        delete context.balances;
        delete context.balancesTime;
        try {
            context.balances = JSON.parse(JSON.stringify(balances));
            context.balancesTime = new Date().getTime();
        } catch(e) {
        }
    };

    context.getBalances = async function getBalances() {
        var address = undefined;
        try {
            address = context.view.getProduct().tokenAddress;
        } catch(e) {
        }
        !context.balancesTime && (context.balancesTime = 0);
        var balances = context.balances;
        if(!balances || new Date().getTime() - context.balancesTime >= 180000) {
            balances = (context.balances = (await client.userManager.getBalances(address || client.contractsManager.SEEDTokenAddress)));
            context.balancesTime = new Date().getTime();
        }
        delete balances.address;
        Object.keys(balances).map(key => balances[key] = Utils.cleanNumber(balances[key]));
        balances.address = address;
        return balances;
    };

    context.depositToken = async function depositToken(amount) {
        var balances = await context.getBalances();
        if(amount > balances.token) {
            alert('Not enough funds to perform this operation');
            return;
        }
        var tokenAddress = balances.address || client.contractsManager.SEEDTokenAddress;
        var tokenSymbol = balances.address ? context.view.getProduct().symbol : 'SEED';

        var allowance = parseInt(await client.contractsManager.call(contracts.Token, tokenAddress, 'allowance', client.userManager.user.wallet, client.contractsManager.dexAddress));

        var toAllow = amount - allowance;
        if(toAllow > 0) {
            try {
                if(!await client.contractsManager.submit('Step 1 of 2 - Allow the DEX to spend ' + Utils.roundWei(toAllow) + ' ' + tokenSymbol + ' tokens for you', contracts.Token, tokenAddress, 'approve', client.contractsManager.dexAddress, Utils.numberToString(toAllow))) {
                    return;
                }
            } catch(e) {
                console.error(e);
                return;
            }
        }
        try {
            await client.contractsManager.submit((toAllow > 0 ? 'Step 2 of 2 - ' : '') + 'Deposit ' + Utils.roundWei(amount) + ' ' + tokenSymbol + ' Tokens in the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'depositToken', tokenAddress, Utils.numberToString(amount));
        } catch(e) {
            console.error(e);
        }
    };

    context.depositSeedOrEther = async function depositSeedOrEther(amount) {
        var balances = await context.getBalances();
        if(amount > (balances.address ? balances.seed : balances.eth)) {
            alert('Not enough funds to perform this operation');
            return;
        }

        var toAllow = 0;
        if(balances.address) {
            var allowance = parseInt(await client.contractsManager.call(contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'allowance', client.userManager.user.wallet, client.contractsManager.dexAddress));
            var toAllow = amount - allowance;
            if(toAllow > 0) {
                try {
                    if(!await client.contractsManager.submit('Step 1 of 2 - Allow the DEX to spend ' + Utils.roundWei(toAllow) + ' SEED Tokens for you', contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'approve', client.contractsManager.dexAddress, Utils.numberToString(toAllow))) {
                        return;
                    }
                } catch(e) {
                    console.error(e);
                    return;
                }
            }
        }
        try {
            balances.address && await client.contractsManager.submit((toAllow > 0 ? 'Step 2 of 2 - ' : '') + 'Deposit ' + Utils.roundWei(amount) + ' SEED Tokens in the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'depositToken', client.contractsManager.SEEDTokenAddress, Utils.numberToString(amount));
            !balances.address && await client.contractsManager.submit('Deposit ' + Utils.roundWei(amount) + ' eth in the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'deposit', Utils.numberToString(amount));
        } catch(e) {
            console.error(e);
        }
    };

    context.withdrawToken = async function withdrawToken(amount) {
        var balances = await context.getBalances();
        if(amount > balances.dexToken) {
            alert('Not enough funds to perform this operation');
            return;
        }
        var tokenAddress = balances.address || client.contractsManager.SEEDTokenAddress;
        var tokenSymbol = balances.address ? context.view.getProduct().symbol : 'SEED';

        try {
            await client.contractsManager.submit('Withdraw ' + Utils.roundWei(amount) + ' ' + tokenSymbol + ' Tokens from the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'withdrawToken', tokenAddress, Utils.numberToString(amount));
        } catch(e) {
            console.error(e);
        }
    };

    context.withdrawSeedOrEther = async function withdrawSeedOrEther(amount) {
        var balances = await context.getBalances();
        if(amount > (balances.address ? balances.dexSEED : balances.dexEth)) {
            alert('Not enough funds to perform this operation');
            return;
        }
        try {
            balances.address && await client.contractsManager.submit((toAllow > 0 ? 'Step 2 of 2 - ' : '') + 'Withdraw ' + Utils.roundWei(amount) + ' SEED Tokens from the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'withdrawToken', client.contractsManager.SEEDTokenAddress, Utils.numberToString(amount));
            !balances.address && await client.contractsManager.submit('Withdraw ' + Utils.roundWei(amount) + ' eth from the DEX', contracts.SeedDex, client.contractsManager.dexAddress, 'withdraw', Utils.numberToString(amount));
        } catch(e) {
            console.error(e);
        }
    };

    context.transferToken = async function transferToken(address, amount) {
        if(address.toLowerCase() === client.userManager.user.wallet.toLowerCase()) {
            alert('Cannot transfer funds to yourself');
            return;
        }
        var balances = await context.getBalances();
        if(amount > balances.token) {
            alert('Not enough funds to perform this operation');
            return;
        }
        var tokenAddress = balances.address || client.contractsManager.SEEDTokenAddress;
        var tokenSymbol = balances.address ? context.view.getProduct().symbol : 'SEED';

        try {
            await client.contractsManager.submit('Transfer ' + Utils.roundWei(amount) + ' ' + tokenSymbol + ' Tokens', contracts.Token, tokenAddress, 'transfer', address, Utils.numberToString(amount));
        } catch(e) {
            console.error(e);
        }
    };

    context.transferSeedOrEther = async function transferSeedOrEther(address, amount) {
        if(address.toLowerCase() === client.userManager.user.wallet.toLowerCase()) {
            alert('Cannot transfer funds to yourself');
            return;
        }
        var balances = await context.getBalances();
        if(amount > (balances.address ? balances.seed : balances.eth)) {
            alert('Not enough funds to perform this operation');
            return;
        }

        try {
            balances.address && await client.contractsManager.submit('Transfer ' + Utils.roundWei(amount) + ' SEED Tokens', contracts.Token, client.contractsManager.SEEDTokenAddress, 'transfer', address, Utils.numberToString(amount));
            if(!balances.address) {
                var signedTx = await client.userManager.signTransaction(address, '0x0', Utils.numberToString(amount));
                await client.blockchainManager.sendSignedTransaction(signedTx, 'Transfer ' + Utils.roundWei(amount) + ' eth');
            }
        } catch(e) {
            console.error(e);
        }
    };

    context.order = async function order(buy, amount, price, total, expires) {
        var balances = await context.getBalances();
        var amountGive = buy ? total : amount;
        var actual = balances.address ? balances.dexSEED : balances.dexEth;
        !buy && (actual = balances.address ? balances.dexToken : balances.dexSEED);
        if(amountGive > actual) {
            return alert('Not enough funds to perform this operation');
        }
        var tokenGet = buy ? balances.address || client.contractsManager.SEEDTokenAddress : balances.address ? client.contractsManager.SEEDTokenAddress : context.ethAddress;
        var amountGet = Utils.numberToString(buy ? amount : total);
        amountGive = Utils.numberToString(amountGive);
        var tokenGive = buy ? balances.address ? client.contractsManager.SEEDTokenAddress : context.ethAddress : balances.address || client.contractsManager.SEEDTokenAddress;
        expires = Utils.numberToString(expires + (await client.blockchainManager.fetchLastBlockNumber()));
        var nonce = Utils.numberToString(new Date().getTime());
        await client.contractsManager.SeedDex.order(client.contractsManager.dexAddress, tokenGet, amountGet, tokenGive, amountGive, expires, nonce, "Place a new " + (buy ? 'buy' : 'sell') + ' order');
    };

    context.cancelOrder = async function cancelOrder(order) {
        await client.contractsManager.SeedDex.cancelOrder(client.contractsManager.dexAddress, order.first, Utils.numberToString(order.amountGet), order.second, Utils.numberToString(order.amountGive), Utils.numberToString(order.expires), Utils.numberToString(order.nonce), context.bytes32, context.bytes32, context.bytes32, "Cancel " + (order.buy ? 'buy' : 'sell') + ' order');
    };

    context.trade = async function trade(order, amount) {
        var balances = await context.getBalances();
        var toCheck = order.buy ? balances.address ? balances.dexToken : balances.dexSEED : balances.address ? balances.dexSEED : balances.dexEth;
        if(amount > toCheck) {
            return alert('Not enough funds to perform this operation');
        }
        if(order.expires < (await client.blockchainManager.fetchLastBlockNumber())) {
            context.view.updateOrders();
            setTimeout(() => alert('Order expired'));
            return;
        }

        await client.contractsManager.SeedDex.trade(client.contractsManager.dexAddress, order.first, Utils.numberToString(order.amountGet), order.second, Utils.numberToString(order.amountGive), Utils.numberToString(order.expires), Utils.numberToString(order.nonce), order.user, context.bytes32, context.bytes32, context.bytes32, Utils.numberToString(amount), "Trade Order");
    };
};
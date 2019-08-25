var DetailController = function (view) {
    var context = this;
    context.view = view;

    context.updateInvestments = async function updateInvestments() {
        if(!client.configurationManager.hasUnlockedUser()) {
            return;
        }
        var basket = context.view.props.parent || context.view.getProduct();

        var balanceOf = parseInt(await client.contractsManager.Token.balanceOf(basket.tokenAddress, client.userManager.user.wallet));
        var isWhiteListed = await client.contractsManager.AdminTools.isWhitelisted(basket.adminsToolsAddress, client.userManager.user.wallet);
        var whiteListAmount = isWhiteListed === false ? undefined : parseInt(await client.contractsManager.AdminTools.getMaxWLAmount(basket.adminsToolsAddress, client.userManager.user.wallet));

        context.view.tokens && (context.view.tokens.innerHTML = Utils.roundWei(balanceOf));
        try {
            context.view.seeds.innerHTML = Utils.roundWei(basket.investors[client.userManager.user.wallet.toLowerCase()]);
        } catch(e) {
        }

        if(context.view.whiteList) {
            var $h3 = $(context.view.whiteList).children().find('h3');
            if(isWhiteListed === false) {
                var html = '<span><i class="fas fa-circle color-yellow"></i>&nbsp;You are NOT whitelisted. Start the procedure <a href="http://seedventure.io" target="_blank">here</a>';
                var diff = basket.whiteListThreshold - balanceOf;
                if(diff > 0) {
                    html += '. You can still accumulate <strong>' + Utils.roundWei(diff) + '</strong> ' + basket.symbol + ' tokens'
                }
                $h3.html(html + '.</span>');
                return;
            }
            if(whiteListAmount <= 0) {
                $h3.html('<span><i class="fas fa-circle color-red"></i>&nbsp;You are BLACKLISTED for this Basket.</span>');
                return;
            }
            var html = '<span><i class="fas fa-circle color-green"></i>&nbsp;You are correctly whitelisted';
            if(whiteListAmount !== undefined && whiteListAmount !== null) {
                html += ' for max <strong>' + Utils.roundWei(whiteListAmount) + '</strong> ' + basket.symbol + ' tokens';
                var diff = whiteListAmount - balanceOf;
                if(diff > 0) {
                    html += '. You can still accumulate <strong>' + Utils.roundWei(diff) + '</strong> ' + basket.symbol + ' tokens'
                }
            }
            $h3.html(html + '.</span>');
        }
    };

    context.invest = async function invest(investment) {
        var investmentWei = parseInt(web3.utils.toWei(investment, 'ether'));
        var basket = context.view.props.parent || context.view.getProduct();
        var totalRaised = parseInt(Utils.numberToString(basket.totalRaised));
        var totalSupply = parseInt(Utils.numberToString(basket.totalSupply));
        if((totalRaised + investmentWei) > totalSupply) {
            alert("Your investment exceedes the basket requirement");
            return;
        }

        var actualBalance = parseInt(await client.contractsManager.seedOf(client.userManager.user.wallet));
        if(investmentWei > actualBalance) {
            alert("You don't have enough SEEDs to invest");
            return;
        }

        var actualInvestment = parseInt(await client.contractsManager.call(contracts.Token, basket.tokenAddress, 'balanceOf', client.userManager.user.wallet));
        var newInvestment = parseFloat(web3.utils.fromWei(Utils.numberToString(basket.seedRate), 'ether')) * parseFloat(investment);
        newInvestment = parseFloat(web3.utils.toWei(Utils.numberToString(newInvestment), 'ether'));
        var whiteListThreshold = basket.whiteListThreshold;

        var isWhiteListed = await client.contractsManager.AdminTools.isWhitelisted(basket.adminsToolsAddress, client.userManager.user.wallet);
        var whiteListAmount = parseInt(await client.contractsManager.AdminTools.getMaxWLAmount(basket.adminsToolsAddress, client.userManager.user.wallet));
        if(isWhiteListed && whiteListAmount === 0) {
            return alert('Cannot invest in this basket, you are blakclisted');
        }
        if(isWhiteListed && (actualInvestment + newInvestment > whiteListAmount)) {
            return alert("Your total investment amount exceeds your Whitelist limit.");
        }
        if(!isWhiteListed && (actualInvestment + newInvestment > whiteListThreshold)) {
            return alert("Your total investment amount exceeds the Whitelist threshold. You must be whitelisted to do this investment");
        }

        var allowance = parseInt(await client.contractsManager.call(contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'allowance', client.userManager.user.wallet, basket.fundingPanelAddress));

        var second = false;
        if((second = investmentWei > allowance)) {
            var toAllow = investmentWei - allowance;
            try {
                if(!await client.contractsManager.submit('Step 1 of 2 - Allow this Basket to spend ' + Utils.roundWei(toAllow) + ' SEEDs for you', contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'approve', basket.fundingPanelAddress, Utils.numberToString(toAllow))) {
                    return;
                }
            } catch(e) {
                console.error(e);
                return;
            }
        }
        try {
            await client.contractsManager.submit((second ? 'Step 2 of 2 - ' : '') + 'Invest ' + Utils.roundWei(investmentWei) + ' SEEDs in this basket', contracts.FundingPanel, basket.fundingPanelAddress, 'holderSendSeeds', Utils.numberToString(investmentWei));
        } catch(e) {
            console.error(e);
        }
    };
};
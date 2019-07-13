var DetailController = function (view) {
    var context = this;
    context.view = view;

    context.updateInvestments = async function updateInvestments() {
        if(!client.configurationManager.hasUnlockedUser()) {
            return;
        }
        var basket = context.view.props.parent || context.view.getProduct();

        var result = await client.contractsManager.call(contracts.AdminTools, basket.adminsToolsAddress, 'isWhitelisted', client.userManager.user.wallet);
        context.view.whiteList.style.display = result ? 'none' : 'block';

        result = await client.contractsManager.call(contracts.Token, basket.tokenAddress, 'balanceOf', client.userManager.user.wallet);
        context.view.tokens.innerHTML = Utils.roundWei(result);

        try {
            context.view.seeds.innerHTML = Utils.roundWei(basket.investors[client.userManager.user.wallet.toLowerCase()].amount);
        } catch(e) {
        }
    };

    context.invest = async function invest(investment) {
        var investmentWei = parseInt(web3.utils.toWei(investment, 'ether'));
        var basket = context.view.props.parent || context.view.getProduct();
        var actualBalance = parseInt(await client.contractsManager.seedOf(client.userManager.user.wallet));
        if(investmentWei > actualBalance) {
            alert("You don't have enough SEEDs to invest");
            return;
        }
        var whiteListThreshold = parseInt(basket.whiteListThreshold);
        var actualInvestment = parseInt('0');
        if(actualInvestment + investmentWei > whiteListThreshold) {
            var isWhiteListed = await client.contractsManager.call(contracts.AdminTools, basket.adminsToolsAddress, 'isWhitelisted', client.userManager.user.wallet);
            if(!isWhiteListed) {
                alert("Your total investment amount exceeds the WhiteList threshold. You must be whitelisted to do this investment");
                return;
            }
        }

        var allowance = parseInt(await client.contractsManager.call(contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'allowance', client.userManager.user.wallet, basket.fundingPanelAddress));

        if(investmentWei > allowance) {
            var toAllow = investmentWei - allowance;
            try {
                await client.contractsManager.submit('Allow this Basket to spend ' + Utils.roundWei(toAllow) + ' SEEDs for you', true, contracts.ERC20Seed, client.contractsManager.SEEDTokenAddress, 'approve', basket.fundingPanelAddress, Utils.numberToString(toAllow));
            } catch(e) {
                console.error(e);
                return;
            }
        }
        try {
            await client.contractsManager.submit('Invest ' + Utils.roundWei(investmentWei) + ' SEEDs in this basket', true, contracts.FundingPanel, basket.fundingPanelAddress, 'holderSendSeeds', Utils.numberToString(investmentWei));
        } catch(e) {
            console.error(e);
        }
    };
};
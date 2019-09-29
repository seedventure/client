var ProductController = function (view) {
    var context = this;
    context.view = view;

    context.makeUnsuitable = async function makeUnsuitable(product) {
        await client.contractsManager.FundingPanel.setNewSeedMaxSupply(product.fundingPanelAddress, 0, "Make Basket Unsuitable");
    };
};
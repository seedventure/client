var ProductsController = function(view) {
    var context = this;
    context.view = view;

    context.loadProducts = function loadProducts() {
        context.view.setState({products : client.contractsManager.getList()});
    };

    context.retryUnavailableProducts = function retryUnavailableProducts() {
        if(context.productsToRetry && context.productsToRetry.length > 0) {
            return;
        }
        context.productsToRetry = Enumerable.From(context.view.getProductsArray()).Where(it => it.unavailable === true).ToArray();
        if(context.productsToRetry.length === 0) {
            return;
        }
        var consume = async function(product) {
            if(!product) {
                return;
            }
            await client.contractsManager.getFundingPanelData(product);
            for(var i = 0; i < context.productsToRetry.length; i++) {
                if(context.productsToRetry[i].position === product.position) {
                    context.productsToRetry.splice(i, 1);
                    return;
                }
            }
        }
        for(var i in context.productsToRetry) {
            setTimeout(() => consume(context.productsToRetry[i]));
        }
    };


};
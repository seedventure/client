var ProductsController = function(view) {
    var context = this;
    context.view = view;

    context.loadProducts = function loadProducts() {
        context.view.setState({products : client.contractsManager.getList()});
    };
};
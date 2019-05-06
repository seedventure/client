var ProductsController = function(view) {
    var context = this;
    context.view = view;

    context.loadProducts = function loadProducts() {
        $.get({
            url: 'data/mock/products.json',
            dataType: 'json',
            cache: false,
            success: data => {
                context.view.setState({products : data});
            }
        });
    }
};
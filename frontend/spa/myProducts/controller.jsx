var MyProductsController = function(view) {
    var context = this;
    context.view = view;

    context.loadMyProducts = function loadMyProducts() {
        $.get({
            url: 'data/mock/myProducts.json',
            dataType: 'json',
            cache: false,
            success: data => {
                context.view.setState({products : data});
            }
        });
    }
};
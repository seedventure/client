var IndexController = function(view) {
    var context = this;
    context.view = view;

    context.forgetUser = function forgetUser() {
        client.userManager.forget();
        context.view.emit('page/change');
    }
};
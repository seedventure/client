var UnlockController = function(view) {
    var context = this;
    context.view = view;

    context.tryUnlock = function tryUnlock(password) {
        try {
            client.configurationManager.unlock(password);
        } catch(e) {
            return false;
        }
        return true;
    }
};
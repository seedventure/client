var UnlockController = function(view) {
    var context = this;
    context.view = view;

    context.tryUnlock = function tryUnlock(password) {
        try {
            return client.configurationManager.unlockUser(password);
        } catch(e) {
            return false;
        }
        return true;
    }
};
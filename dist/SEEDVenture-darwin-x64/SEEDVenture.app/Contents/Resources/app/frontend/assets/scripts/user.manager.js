function UserManager() {
    var context = this;

    context.save = function save(words, pass) {
      context.user = {wallet : '0xabcdef'};
      client.configurationManager.save(context.user, pass, true);
    };

    context.getList = function getList() {
      var list = [];
      context.user && context.user.list && (list = context.user.list);
      return list;
    };

    context.addToList = function addToList(position) {
      var list = context.getList();
      var enumerable = 
      context.save();
    };

    context.removeFromList = function removeFromList() {
      context.save();
    };

    context.forget = function forget() {
      client.configurationManager.forget();
      delete context.user;
    };

    context.save = function save() {
      client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.user, context.user);
    };

    context.init = function init() {
        context.user = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.user);
        $.publish('page/change');
    };
    $.subscribe('configuration/unlocked', context.init);
}
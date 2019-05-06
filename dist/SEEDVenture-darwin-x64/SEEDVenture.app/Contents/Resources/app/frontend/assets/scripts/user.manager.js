function UserManager() {
    var context = this;

    context.save = function save(words, pass) {
      context.user = {wallet : '0xabcdef'};
      client.configurationManager.save({user : context.user}, pass);
    };

    context.forget = function forget() {
      client.configurationManager.forget();
      delete context.user;
    };

    (context.init = function init() {
        context.user = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.user);
    })();
}
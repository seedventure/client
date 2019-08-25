function PersistenceManager() {

  var context = this;

  context.PERSISTENCE_PROPERTIES = [
    'locale',
    'user',
    'list',
    'seedTokenAddress',
    'dexAddress',
    'lastCheckedBlockNumber',
    'documentsUploaderHost',
    'documentsUploaderProviderSet',
    'orderThreshold'
  ];
  Object.keys(ecosystemData).map(function(key) {
      context.PERSISTENCE_PROPERTIES.push(key);
  });

  var persistenceProperties = {};
  for(var i in context.PERSISTENCE_PROPERTIES) {
    persistenceProperties[context.PERSISTENCE_PROPERTIES[i]] = context.PERSISTENCE_PROPERTIES[i];
  }
  context.PERSISTENCE_PROPERTIES = persistenceProperties;

  context.set = function set(name, value) {
    var ret = context.remove(name);
    if (client.configurationManager.content && value !== undefined && value !== null && value !== '') {
      client.configurationManager.content[name] = value;
      client.configurationManager.save();
    }
    return ret;
  }

  context.get = function get(name) {
    context.assertIsKey(name);
    return client.configurationManager.content && client.configurationManager.content[name] !== undefined ? client.configurationManager.content[name] : null;
  }

  context.remove = function remove(name) {
    var ret = context.get(name);
    if(client.configurationManager.content) {
      delete client.configurationManager.content[name];
      client.configurationManager.save();
    }
    return ret;
  };

  context.assertIsKey = function assertIsKey(key) {
    if(key === undefined || key === null || key === '') {
      throw ("Invalid key value");
    }
    for (var name in context.PERSISTENCE_PROPERTIES) {
      if (context.PERSISTENCE_PROPERTIES[name] === key) {
        return;
      }
    }
    throw (key + ' is NOT a recognized key.');
  };
};
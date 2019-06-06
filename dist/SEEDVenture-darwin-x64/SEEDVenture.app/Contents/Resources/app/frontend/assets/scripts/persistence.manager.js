function PersistenceManager() {

  var context = this;

  context.PERSISTENCE_PROPERTIES = [
    'locale',
    'user',
    'list',
    'lastCheckedBlockNumber',
    'web3Provider',
    'web3URL',
    'ipfsProvider',
    'ipfsHost',
    'ipfsPort',
    'ipfsProtocol',
    'gasLimit',
    'gasPrice'
  ];

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
      throw new Exception("Invalid key value");
    }
    for (var name in context.PERSISTENCE_PROPERTIES) {
      if (context.PERSISTENCE_PROPERTIES[name] === key) {
        return;
      }
    }
    throw new Exception(key + ' is NOT a recognized key.');
  };
};
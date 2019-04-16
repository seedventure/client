function PersistenceManager() {

  var context = this;

  context.PERSISTENCE_PROPERTIES = {
    locale : 'locale'
  };

  context.set = function(name, value) {
    var ret = context.remove(name);
    if (value !== undefined && value !== null && value !== '') {
      var valueString = $.stringify(value);
      var valueEncodedString = $.base64.encode(valueString);
      $.jStorage.set(name, valueEncodedString);
    }
    return ret;
  }

  context.get = function(name) {
    var value = null;
    context.assertIsKey(name);
    var valueEncodedString = $.jStorage.get(name);
    if(valueEncodedString !== undefined && valueEncodedString !== null && valueEncodedString !== '') {
      valueString = $.base64.decode(valueEncodedString);
      value = $.parseJSON(valueString);
    }
    return value;
  }

  context.remove = function(name) {
    var ret = context.get(name);
    $.jStorage.deleteKey(name);
    return ret;
  };

  context.assertIsKey = function(key) {
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

  context.clear = function() {
    for (var name in context.PERSISTENCE_PROPERTIES) {
      $.jStorage.deleteKey(context.PERSISTENCE_PROPERTIES[name]);
    }
  };
};
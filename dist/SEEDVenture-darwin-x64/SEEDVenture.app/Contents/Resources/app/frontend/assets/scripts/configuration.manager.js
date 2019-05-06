function ConfigurationManager() {

  var context = this;

  var privateContext = {
    fs : window.require('electron').remote.require('fs'),
    electron : window.require('electron').remote,
    app : window.require('electron').remote.app,
    path : window.require('electron').remote.require('path'),
    CryptoJS : window.require('electron').remote.require('crypto-js'),
    configuration : window.userDataPath + 'config.json'
  }

  context.dump = function dump(password) {
    if(password === undefined || password === null || password.split(' ').join('') === '' || privateContext.password !== md5(password)) {
      throw 'password';
    }
    var userChosenPath = privateContext.electron.dialog.showSaveDialog({ 
      defaultPath: privateContext.app.getPath("desktop"),
      filters : [
        {
          name : "JSON File",
          extensions : ["json"]
        }
      ]
    });
    userChosenPath && privateContext.fs.writeFileSync(userChosenPath, JSON.stringify(privateContext.encryptedContent));
    return userChosenPath;
  };

  context.import = function(userChosenPath) {
    typeof userChosenPath !== 'string' && (userChosenPath = privateContext.electron.dialog.showOpenDialog({ 
      defaultPath: privateContext.app.getPath("desktop"),
      filters : [
        {
          name : "JSON File",
          extensions : ["json"]
        }
      ],
      options : {
          openDirectory : false,
          multiSelections : false
      }
    }));
    if(userChosenPath === undefined || userChosenPath === null) {
      return;
    }
    userChosenPath = (typeof userChosenPath === 'string' ? userChosenPath : userChosenPath[0]).split('\\').join('/');
    if(privateContext.data === (window.userDataPath + 'data.json') && userChosenPath !== (window.userDataPath + 'data.json')) {
      try {
        privateContext.fs.unlinkSync((window.userDataPath + 'data.json'));
      } catch {
      }
    }
    privateContext.fs.writeFileSync(privateContext.configuration, JSON.stringify({data : userChosenPath}));
    context.load();
    return userChosenPath;
  };

  context.move = function move(password) {
    var path = context.dump(password);
    path && context.import(path);
    context.unlock(password);
  };

  context.save = function save(content, password) {
    if(!context.content) {
      if(!content) {
        throw 'content';
      }
      if(password === undefined || password === null || password.split(' ').join('') === '') {
        throw 'password';
      }
    }
    content && (context.content = content);
    password && (privateContext.password = md5(password));
    var data = JSON.stringify(context.content);
    privateContext.encryptedContent = {
      data,
      hash : md5(data)
    };
    privateContext.encryptedContent.data = privateContext.CryptoJS.AES.encrypt(privateContext.encryptedContent.data, privateContext.password).toString();
    privateContext.encryptedContent.data = $.base64.encode(privateContext.encryptedContent.data);
    privateContext.fs.writeFileSync(privateContext.data, JSON.stringify(privateContext.encryptedContent));
  };

  context.unlock = function unlock(password) {
    if(password === undefined || password === null || password.split(' ').join('') === '') {
      return false;
    }
    privateContext.password = md5(password);
    var data = $.base64.decode(privateContext.encryptedContent.data);
    data = privateContext.CryptoJS.AES.decrypt(data, privateContext.password);
    data = data.toString(privateContext.CryptoJS.enc.Utf8);
    var hash = md5(data);
    if(hash !== privateContext.encryptedContent.hash) {
        return false;
    }
    context.content = JSON.parse(data);
    client.userManager.init();
    return true;
  };

  context.forget = function forget() {
    privateContext.fs.unlinkSync(privateContext.configuration);
    context.load();
  }

  context.hasConfig = function hasConfig() {
    return privateContext.encryptedContent !== undefined && privateContext.encryptedContent !== null; 
  };

  context.hasUnlockedConfig = function hasUnlockedConfig() {
    return context.hasConfig() && context.content !== undefined && context.content !== null;
  };

  (context.load = function load() {
    delete privateContext.password;
    delete context.content;
    privateContext.encryptedContent = null;
    privateContext.data = window.userDataPath + 'data.json'
    if(!privateContext.fs.existsSync(privateContext.configuration)) {
      privateContext.fs.writeFileSync(privateContext.configuration, JSON.stringify({data : privateContext.data}));
      privateContext.fs.writeFileSync(privateContext.data, 'null');
    }
    privateContext.data = JSON.parse(privateContext.fs.readFileSync(privateContext.configuration, 'UTF-8')).data;
    if(!privateContext.fs.existsSync(privateContext.data)) {
      privateContext.fs.unlinkSync(privateContext.configuration);
      try {
        privateContext.fs.unlinkSync(window.userDataPath + 'data.json');
      } catch {
      }
      context.load();
      return;
    }
    privateContext.encryptedContent = JSON.parse(privateContext.fs.readFileSync(privateContext.data, 'UTF-8'));
  })();
};
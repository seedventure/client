function ConfigurationManager() {

  var context = this;

  var electron = window.require('electron').remote;
  var privateContext = {
    electron,
    fs: electron.require('fs'),
    app: electron.app,
    path: electron.require('path'),
    CryptoJS: electron.require('crypto-js'),
    configuration: window.userDataPath + 'config.json'
  }

  context.dump = function dump(password) {
    if (password === undefined || password === null || password.split(' ').join('') === '' || privateContext.password !== md5(password)) {
      throw 'password';
    }
    var userChosenPath = privateContext.electron.dialog.showSaveDialog({
      defaultPath: privateContext.app.getPath("desktop"),
      filters: [
        {
          name: "JSON File",
          extensions: ["json"]
        }
      ]
    });
    if(userChosenPath) {
      var oldData = privateContext.data;
      privateContext.data = userChosenPath;
      context.save();
      privateContext.data = oldData;
    }
    return userChosenPath;
  };

  context.import = function (userChosenPath) {
    typeof userChosenPath !== 'string' && (userChosenPath = privateContext.electron.dialog.showOpenDialog({
      defaultPath: privateContext.app.getPath("desktop"),
      filters: [
        {
          name: "JSON File",
          extensions: ["json"]
        }
      ],
      options: {
        openDirectory: false,
        multiSelections: false
      }
    }));
    if (userChosenPath === undefined || userChosenPath === null) {
      return;
    }
    userChosenPath = (typeof userChosenPath === 'string' ? userChosenPath : userChosenPath[0]).split('\\').join('/');
    if (privateContext.data === (window.userDataPath + 'data.json') && userChosenPath !== (window.userDataPath + 'data.json')) {
      try {
        privateContext.fs.unlinkSync((window.userDataPath + 'data.json'));
      } catch {
      }
    }
    privateContext.fs.writeFileSync(privateContext.configuration, JSON.stringify({ data: userChosenPath }));
    context.load();
    return userChosenPath;
  };

  context.move = function move(password) {
    var path = context.dump(password);
    path && context.import(path);
    context.unlockUser(password);
  };

  context.save = function save(user, password, newUser) {
    if (newUser === true) {
      if (!user) {
        throw 'user';
      }
      if (password === undefined || password === null || password.split(' ').join('') === '') {
        throw 'password';
      }
    }
    user && (context.content.user = user);
    password && (privateContext.password = md5(password));
    user = context.content.user;
    var lang = context.content.lang;
    lang && (context.content.lang = {
      lang_config_stuff: lang.lang_config_stuff
    });
    if (user) {
      var data = JSON.stringify(context.content.user);
      privateContext.encryptedContent = {
        data,
        hash: md5(data)
      };
      privateContext.encryptedContent.data = privateContext.CryptoJS.AES.encrypt(privateContext.encryptedContent.data, privateContext.password).toString();
      privateContext.encryptedContent.data = $.base64.encode(privateContext.encryptedContent.data);
    }
    privateContext.encryptedContent && (context.content.user = privateContext.encryptedContent);
    privateContext.fs.writeFileSync(privateContext.data, JSON.stringify(context.content));
    delete context.content.user;
    user && (context.content.user = user);
    lang && (context.content.lang = lang);
  };

  context.unlockUser = function unlockUser(password) {
    if (password === undefined || password === null || password.split(' ').join('') === '') {
      return false;
    }
    privateContext.password = md5(password);
    var data = $.base64.decode(privateContext.encryptedContent.data);
    data = privateContext.CryptoJS.AES.decrypt(data, privateContext.password);
    data = data.toString(privateContext.CryptoJS.enc.Utf8);
    var hash = md5(data);
    if (hash !== privateContext.encryptedContent.hash) {
      return false;
    }
    context.content.user = JSON.parse(data);
    $.publish('configuration/unlocked');
    return true;
  };

  context.forget = function forget() {
    privateContext.fs.unlinkSync(privateContext.configuration);
    context.load();
  }

  context.hasUser = function hasUser() {
    return privateContext.encryptedContent !== undefined && privateContext.encryptedContent !== null;
  };

  context.hasUnlockedUser = function hasUnlockedUser() {
    return context.hasUser() && context.content.user !== undefined && context.content.user !== null;
  };

  (context.load = function load() {
    delete privateContext.password;
    delete context.content;
    privateContext.encryptedContent = null;
    privateContext.data = window.userDataPath + 'data.json'
    if (!privateContext.fs.existsSync(privateContext.configuration)) {
      privateContext.fs.writeFileSync(privateContext.configuration, JSON.stringify({ data: privateContext.data }));
      privateContext.fs.writeFileSync(privateContext.data, '{}');
    }
    privateContext.data = JSON.parse(privateContext.fs.readFileSync(privateContext.configuration, 'UTF-8')).data;
    if (!privateContext.fs.existsSync(privateContext.data)) {
      privateContext.fs.unlinkSync(privateContext.configuration);
      try {
        privateContext.fs.unlinkSync(window.userDataPath + 'data.json');
      } catch {
      }
      context.load();
      return;
    }
    context.content = JSON.parse(privateContext.fs.readFileSync(privateContext.data, 'UTF-8'));
    context.content === undefined || context.content === null && (context.content = {});
    context.content.user && (privateContext.encryptedContent = context.content.user);
    delete context.content.user;
  })();
};
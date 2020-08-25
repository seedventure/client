function Boot(callback) {
  var pathName = document.location.pathname;
    if (pathName.indexOf('/') !== -1) {
        pathName = pathName.substring(pathName.lastIndexOf('/') + 1);
    }
    if (pathName === '') {
        pathName = 'index';
    }
    if (pathName.indexOf('?') !== -1) {
        pathName = pathName.substring(0, pathName.indexOf('?'))
    }
    if (pathName.indexOf('.html') !== -1) {
        pathName = pathName.substring(0, pathName.indexOf('.html'))
    }
    ReactModuleLoader.load({
        modules: ['spa/' + pathName],
        callback : function() {
          React.globalLoader = function() { 
              return React.createElement(Loader, {size : 'x2'});
          };
          ReactDOM.render(React.createElement(window[pathName.firstLetterToUpperCase()]), document.body);
          callback && callback();
        }
    });
}

$(document).ready(function() {
    ReactDOM.render(React.createElement(Loader, {size : 'x2'}), document.body);
    (window.client = new Client()).init(window.lazyLoad || Boot);
});
var Utils = function () {

  window.web3 = new Web3();

  pageTitlePreamble = 'SEEDVenture - Platform';

  getJQueryElement = function (element, defaultElementName) {
    if (defaultElementName === undefined || defaultElementName === null
      || defaultElementName === '') {
      defaultElementName = 'html';
    }
    if (element === undefined || element === null || element === '') {
      return $(defaultElementName);
    }
    if (element instanceof jQuery) {
      return element;
    }
    try {
      element = $(element);
      if (element.parents('html').length > 0) {
        return element;
      }
    } catch (e) {
    }
    return $(defaultElementName);
  };

  getCurrentWindowDimension = function () {
    return {
      width: $(window).width(),
      height: $(window).height()
    };
  };

  getStuffLocation = function () {
    return base_url + '/assets/';
  };

  setPageTitle = function (title) {
    document.title = title;
  };

  setPageMessage = function (message) {
    var title = pageTitlePreamble;
    if (message !== undefined && message !== null && message !== '') {
      title += ' - ' + message;
    }
    setPageTitle(title);
  };

  getCurrentPage = function () {
    return document.location.pathname.replace('/', '');
  };

  goTo = function (path) {
    var url = base_url;
    if (path !== undefined && path !== null && path !== '') {
      if (path !== '/') {
        if (!path.startsWith('/')) {
          path = '/' + path;
        }
        if (!path.endsWith('.html')) {
          path += '.html';
        }
        url += path;
      }
    }
    window.location.href = url;
  }

  roundWei = function (wei) {
    if(!wei) {
      return '0';
    }
    return parseFloat(web3.utils.fromWei(wei + '', 'ether')).toFixed(2)
  }

  return {
    getJQueryElement: getJQueryElement,
    getCurrentWindowDimension: getCurrentWindowDimension,
    getStuffLocation: getStuffLocation,
    setPageTitle: setPageTitle,
    setPageMessage: setPageMessage,
    getCurrentPage: getCurrentPage,
    goTo: goTo,
    roundWei : roundWei
  };
}();
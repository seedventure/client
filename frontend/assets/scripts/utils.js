var Utils = function() {

    window.web3 = new Web3();

    pageTitlePreamble = 'SEEDVenture - Platform';

    var tokenSymbolLimit = 4;
    var weiDecimals = 8;

    var getLastPartFile = function getLastPartFile(name) {
        var name = document.link.split("\\").join("/");
        name = name.split("/");
        var l = name.length -1;
        while(name[l].split(" ").join("") === '') {
            l--;
        }
        return name[l].split(' ').join("");
    };

    var cleanTokenSymbol = function cleanTokenSymbol(target) {
        if (!target) {
            return '';
        }
        var value = target.value || target;
        if (typeof value !== 'string') {
            return value;
        }
        var maxLimit = Utils.tokenSymbolLimit + 2;
        return value.length <= maxLimit ? value : (value.substring(0, Utils.tokenSymbolLimit) + '...');
    };

    var parseNumber = function parseNumber(e, callback) {
        e && e.preventDefault();
        e && e.stopPropagation();
        var target = e.target;
        this.localeTimeout && clearTimeout(this.localeTimeout);
        this.localeTimeout = setTimeout(function() {
            try {
                var value = Utils.cleanNumber(target);
                value = parseFloat(value);
                if (isNaN(value)) {
                    target.value = '';
                    callback && callback();
                    return;
                }
                value = Utils.numberToString(value, true);
                target.value = value;
                callback && callback();
            } catch (e) {
                console.error(e);
            }
        }, 1400);
    };

    var cleanNumber = function cleanNumber(target) {
        var value = target.value || target;
        if (typeof value !== 'string') {
            return isNaN(value) ? 0 : value;
        }
        value = value.split(' ').join('').split(Utils.dozensSeparator).join('').split(Utils.decimalsSeparator);
        value = (value.length === 1 ? parseInt : parseFloat)(value[0] + (value.length === 1 ? '' : ('.' + value[1])));
        return isNaN(value) ? 0 : value;
    };

    copyToClipboard = function copyToClipboard(str) {
        const el = document.createElement('textarea');
        el.value = str === undefined || str === null ? '' : str.toString && str.toString() || ('' + str);
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };

    var AJAXRequest = function(link, timeout, toU) {
        var toUpload = toU !== undefined && toU !== null && typeof toU !== 'string' ? JSON.stringify(toU) : toU;
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
        }
        return new Promise(function(ok, ko) {
            var going = true;
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if (going) {
                        going = false;
                        ok(xmlhttp.responseText);
                    }
                    try {
                        xmlhttp.abort();
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
            xmlhttp.open(toUpload ? 'POST' : 'GET', link + (link.indexOf('?') === -1 ? '?' : '&') + ('cached_' + new Date().getTime()) + '=' + (new Date().getTime()));
            toUpload ? xmlhttp.send(toUpload) : xmlhttp.send();
            (timeout !== undefined && timeout !== null) && setTimeout(function() {
                if (!going) {
                    return;
                }
                going = false;
                try {
                    xmlhttp.abort();
                } catch (e) {
                    console.error(e);
                }
                ko();
            }, timeout);
        });
    }

    getJQueryElement = function(element, defaultElementName) {
        if (defaultElementName === undefined || defaultElementName === null ||
            defaultElementName === '') {
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
        } catch (e) {}
        return $(defaultElementName);
    };

    getCurrentWindowDimension = function() {
        return {
            width: $(window).width(),
            height: $(window).height()
        };
    };

    getStuffLocation = function() {
        return base_url + '/assets/';
    };

    setPageTitle = function(title) {
        document.title = title;
    };

    setPageMessage = function(message) {
        var title = pageTitlePreamble;
        if (message !== undefined && message !== null && message !== '') {
            title += ' - ' + message;
        }
        setPageTitle(title);
    };

    getCurrentPage = function() {
        return document.location.pathname.replace('/', '');
    };

    goTo = function(path) {
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

    numberToString = function numberToString(num, locale) {
        if (num === undefined || num === null) {
            num = 0;
        }
        typeof num === 'string' && (num = Utils.cleanNumber(num))
        let numStr = String(num);

        if (Math.abs(num) < 1.0) {
            let e = parseInt(num.toString().split('e-')[1]);
            if (e) {
                let negative = num < 0;
                if (negative) num *= -1
                num *= Math.pow(10, e - 1);
                numStr = '0.' + (new Array(e)).join('0') + num.toString().substring(2);
                if (negative) numStr = "-" + numStr;
            }
        } else {
            let e = parseInt(num.toString().split('+')[1]);
            if (e > 20) {
                e -= 20;
                num /= Math.pow(10, e);
                numStr = num.toString() + (new Array(e + 1)).join('0');
            }
        }
        if (locale === true) {
            var numStringSplitted = numStr.split(' ').join('').split('.');
            return parseInt(numStringSplitted[0]).toLocaleString() + (numStringSplitted.length === 1 ? '' : (Utils.decimalsSeparator + numStringSplitted[1]))
        }
        return numStr;
    }

    roundWei = function(wei) {
        var ether = Utils.toEther(wei);
        str = Utils.numberToString(ether);
        if (str.indexOf('.') === -1) {
            str += '.0';
        }
        var split = str.split('.');
        var initialDecimals = Utils.weiDecimals;
        while(ether > 0 && split[1].indexOf('999') !== -1) {
            var decimals = initialDecimals;
            while((ether = Math.round(ether * Number('1e+' + decimals)) / Number('1e+' + decimals)) === 0) {
                decimals++;
            }
            str = Utils.numberToString(ether);
            if (str.indexOf('.') === -1) {
                str += '.0';
            }
            split = str.split('.');
            initialDecimals = 2;
        }
        split[0] = parseInt(split[0]).toLocaleString();
        var dec = split[1];
        if (dec.length > Utils.weiDecimals) {
            var firstPart = dec.substring(0, Utils.weiDecimals);
            if (parseInt(firstPart) > 0) {
                dec = firstPart;
            } else {
                var limit = Utils.weiDecimals;
                limit = limit > dec.length ? dec.length : limit;
                firstPart = dec.substring(0, limit);
                dec = parseInt(firstPart) === 0 ? '0' : firstPart;
            }
        }
        if (parseInt(dec) === 0) {
            return split[0];
        }
        while (dec.charAt(dec.length - 1) === '0') {
            dec = dec.substring(0, dec.length - 1);
        }
        return split[0] + Utils.decimalsSeparator + dec;
    }

    var toWei = function toWei(v) {
        var value = v.value || v;
        typeof value === 'string' && (value = Utils.cleanNumber(value));
        typeof value !== 'string' && (value = Utils.numberToString(value));
        if (value.indexOf('.') !== -1) {
            var v = value.split('.');
            var dec = v[1];
            var l = dec.length > 18 ? 18 : dec.length;
            dec = dec.substring(0, l);
            value = v[0] + '.' + dec;
        }
        return parseInt(web3.utils.toWei(value, 'ether'));
    };

    var toEther = function toEther(v) {
        v = v || 0;
        var value = v.value || v;
        typeof value === 'string' && (value = Utils.cleanNumber(value));
        typeof value !== 'string' && (value = Utils.numberToString(value));
        return parseFloat(web3.utils.fromWei(value, 'ether'));
    };

    isEthereumAddress = function(ad) {
        if (ad === undefined || ad === null) {
            return false;
        }
        var address = ad.split(' ').join('');
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            return false;
        } else if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            return true;
        } else {
            address = address.replace('0x', '');
            var addressHash = web3.utils.sha3(address.toLowerCase());
            for (var i = 0; i < 40; i++) {
                if ((parseInt(addressHash[i], 16) > 7 && address[i].toUpperCase() !== address[i]) || (parseInt(addressHash[i], 16) <= 7 && address[i].toLowerCase() !== address[i])) {
                    //return false;
                }
            }
        }
        return true;
    };

    toEthereumChecksumAddress = function(address) {
        address = address.toLowerCase().replace('0x', '');
        var addressHash = web3.utils.sha3(address);
        var checksumAddress = '0x';

        for (var i = 0; i < address.length; i++) {
            if (parseInt(addressHash[i], 16) > 8) {
                checksumAddress += address[i].toUpperCase();
            } else {
                checksumAddress += address[i];
            }
        }
        return checksumAddress;
    };

    var toTitle = function toTitle(name) {
        var title = '';
        for (var i = 0; i < name.length; i++) {
            var character = name.charAt(i);
            if (!isNaN(character * 1) || character === character.toUpperCase()) {
                title += (' ' + character.toUpperCase());
            } else {
                title += (title.length === 0 ? character.toUpperCase() : character);
            }
        }
        return title;
    }

    var normalizeBasketSuccessFee = function normalizeBasketSuccessFee(value) {
        if(!value) {
            return 0;
        }
        typeof value === 'string' && (value = Utils.cleanNumber(value));
        return parseFloat(value.toFixed(2));
    }

    return {
        getJQueryElement: getJQueryElement,
        getCurrentWindowDimension: getCurrentWindowDimension,
        getStuffLocation: getStuffLocation,
        setPageTitle: setPageTitle,
        setPageMessage: setPageMessage,
        getCurrentPage: getCurrentPage,
        goTo: goTo,
        roundWei: roundWei,
        isEthereumAddress: isEthereumAddress,
        toEthereumChecksumAddress,
        numberToString,
        copyToClipboard,
        dozensSeparator: (1000.02).toLocaleString().charAt(1),
        decimalsSeparator: (1000.02).toLocaleString().charAt(5),
        toTitle,
        AJAXRequest,
        parseNumber,
        cleanNumber,
        toWei,
        toEther,
        tokenSymbolLimit,
        cleanTokenSymbol,
        weiDecimals,
        getLastPartFile,
        normalizeBasketSuccessFee
    };
}();
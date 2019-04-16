function LocaleManager() {

    var context = this;

    context.localesCache = {};

    context.currentLocale = null;

    context.saveDefaultLocaleEntries = function(element) {
        var saveDefaultLocaleData = {
            $element: Utils.getJQueryElement(element)
        }
        saveDefaultLocaleData.key = saveDefaultLocaleData.$element.attr('data-lang-id');
        if (saveDefaultLocaleData.key !== undefined && context.defaultLocale[saveDefaultLocaleData.key] === undefined) {
            context.defaultLocale[saveDefaultLocaleData.key] = saveDefaultLocaleData.$element.html();
        }
        saveDefaultLocaleData.$element.find('[data-lang-id]').each(function() {
            var elementData = {
                $element: $(this)
            }
            elementData.key = elementData.$element.attr('data-lang-id');
            if (context.defaultLocale[elementData.key] === undefined) {
                context.defaultLocale[elementData.key] = elementData.$element.html();
            }
        });
        saveDefaultLocaleData.$element.find('input[data-lang-id]').each(function() {
            var elementData = {
                $element: $(this)
            }
            elementData.key = elementData.$element.attr('data-lang-id');
            if (context.defaultLocale[elementData.key] === undefined) {
                context.defaultLocale[elementData.key] = elementData.$element.attr('placeholder');
            }
        });
    };

    context.setLocale = function(langName, callback) {
        if (langName !== null && langName !== undefined) {
            langName = langName.replaceAll('_', '-');
        }
        if (langName === null || langName === undefined || langName === '' ||
            langName == context.defaultLocale.lang_config_stuff.code) {
            context.updateLocale(context.defaultLocale, callback);
            return;
        }
        langName = langName.substring(0, langName.indexOf('-')).toLowerCase() + langName.substring(langName.indexOf('-')).toUpperCase()
        var lang = context.localesCache[langName];
        if (lang !== undefined && lang !== null) {
            context.updateLocale(lang, callback);
        }
        context.retrieveOrTryUpdateLocale(langName, callback);
    };

    context.retrieveOrTryUpdateLocale = function(langName, callback) {
      langName = langName.substring(0, langName.indexOf('-')).toLowerCase() + langName.substring(langName.indexOf('-')).toUpperCase()
        $.get({
            url: Utils.getStuffLocation() + 'locales/' + langName + '.json',
            beforeSend: function(request) {
                if (context.localesCache[langName] !== undefined &&
                    context.localesCache[langName].lang_config_stuff.lastModified !== undefined &&
                    context.localesCache[langName].lang_config_stuff.lastModified !== null) {
                    request.setRequestHeader("If-Modified-Since", context.localesCache[langName].lang_config_stuff.lastModified);
                }
            },
            success: function(payload, statusOrElement, xhr) {
                context.updateLocale(payload, statusOrElement, xhr, callback)
            }
        });
    };

    context.updateLocale = function(lang, statusOrElement, xhr, callback) {
        if((typeof statusOrElement).toLowerCase() === 'function') {
            callback = statusOrElement
            statusOrElement = undefined
        }
        if (lang === undefined || lang === null || lang === '') {
            lang = context.currentLocale;
        }
        if (typeof lang === 'string') {
            var l = context.localesCache[lang];
            if (l !== undefined && l !== null) {
                lang = l;
            } else {
                try {
                    lang = $.parseJSON(lang);
                } catch (e) {}
            }
        }

        if (lang.lang_config_stuff === undefined) {
            statusOrElement = lang;
            lang = context.currentLocale;
        }
        var $element = Utils.getJQueryElement(statusOrElement, 'html');
        context.saveDefaultLocaleEntries($element);

        if (xhr !== undefined) {
            lang.lang_config_stuff.lastModified = xhr.getResponseHeader('last-modified');
        }
        context.localesCache[lang.lang_config_stuff.code] = lang;
        context.currentLocale = lang;
        if (lang.lang_config_stuff.code !== context.defaultLocale.lang_config_stuff.code) {
            client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.locale, lang);
        } else {
            client.persistenceManager.remove(client.persistenceManager.PERSISTENCE_PROPERTIES.locale);
        }
        $('html').attr('lang', lang.lang_config_stuff.code.substring(0, lang.lang_config_stuff.code.indexOf('-')));
        if ($element.attr('data-lang-id') !== undefined) {
            var value = lang[$element.attr('data-lang-id')];
            if ($element.attr('data-lang-function') !== undefined) {
                value = value[$element.attr('data-lang-function')].apply(value);
            }
            if ($element.is('input')) {
                $element.attr('placeholder', value);
            } else {
                $element.html(value);
            }
        }
        $element.find('[data-lang-id]').each(function() {
            var elementData = {
                $element: $(this)
            };
            elementData.value = lang[elementData.$element.attr('data-lang-id')];
            if (elementData.$element.attr('data-lang-function') !== undefined) {
                elementData.value = elementData.value[elementData.$element.attr('data-lang-function')].apply(elementData.value);
            }
            if (elementData.$element.is('input')) {
                elementData.$element.attr('placeholder', elementData.value);
            } else {
                elementData.$element.html(elementData.value);
            }
        });
        $('a[data-lang-code]').removeClass('underline');
        $('a[data-lang-code="' + lang.lang_config_stuff.code + '"').addClass('underline');
        $('#lang-name').html(lang.lang_config_stuff.name);
        callback && setTimeout(callback)
    };

    context.translate = function(data) {
        if (typeof data === 'string') {
            if (typeof context.currentLocale[data] === 'string') {
                return context.currentLocale[data];
            }
            return data;
        }
    };

    context.setStoredLocale = function() {
        var locale = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.locale);
        if (locale !== null && locale.lang_config_stuff.code !== context.defaultLocale.lang_config_stuff.code) {
            context.localesCache[locale.lang_config_stuff.code] = locale;
            context.setLocale(locale.lang_config_stuff.code);
        }
    };

    context.defaultLocaleLoaded = function(defaultLocale) {
        (typeof defaultLocale).toLowerCase() === 'string' && (defaultLocale = JSON.parse(defaultLocale));
        context.defaultLocale = defaultLocale;
        context.localesCache[context.defaultLocale.lang_config_stuff.code] = context.defaultLocale;
        context.currentLocale = context.defaultLocale;
        context.setStoredLocale();
    };

    (context.init = function() {
        React.domRefresh = context.updateLocale;
        $.get({
            url: 'assets/locales/en-US.json',
            success: context.defaultLocaleLoaded
        })
    })();
};
jQuery.fn.updateLocalization=function(){return this.each(function() {client.localeManager.updateLocale($(this))});}
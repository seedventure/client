window.lazyLoad = function () {
    $.get('https://raw.githubusercontent.com/seedventure/client/master/frontend/spa/style.min.css?id=' + new Date().getTime(),
        function (style) {
            $('head').append($(document.createElement('style')).attr('rel', 'stylesheet').attr('type', 'text/css').html(style));
            $.get('https://raw.githubusercontent.com/seedventure/client/master/frontend/spa/script.min.js?id=' + new Date().getTime(),
                function (script) {
                    $('head').append($(document.createElement('script')).attr('type', 'text/javascript').html(script));
                    Boot();
                }
            );
        }
    );
};
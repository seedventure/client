window.lazyLoad = function () {
    $.ajax({
        url : 'https://raw.githubusercontent.com/seedventure/client/master/frontend/spa/style.min.css?id=' + new Date().getTime(),
        cache: false,
        method: 'GET',
        success: function (style) {
            $('head').append($(document.createElement('style')).attr('rel', 'stylesheet').attr('type', 'text/css').html(style));
            $.ajax({
                url : 'https://raw.githubusercontent.com/seedventure/client/master/frontend/spa/script.min.js?id=' + new Date().getTime(),
                cache: false,
                method: 'GET',
                success: function (script) {
                    $('head').append($(document.createElement('script')).attr('type', 'text/javascript').html(script + '\n//# sourceURL=script.min.js'));
                    Boot();
                }
            });
        }
    });
};
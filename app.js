(function($) {

	$.winSize = "";

	// create element that tracks media query size
    $('body').append('<div id="mq"></div>');

    function setWindowSize() {
        $.winSize = parseInt($('#mq').css('z-index'));
    }

    function checkSupportedScripts() {
        setWindowSize();

        if ($.winSize < 3) {
            //run mobile only scripts
            mobileScripts();
        } else {
            //run desktop only scripts
            desktopScripts();
        }
    }

    function desktopScripts() {
    	if (typeof $.test != 'undefined' || $.test != null) {
    		//destroy tabs
            $.test.destroy();
    	}
    }

    function mobileScripts() {
    	if (typeof $.test == 'undefined' || $.test == null) {
        	$.test = new window.tabSet('.c-tabs').build();
        } else {
        	//rebuild tabs
            $.test.build();
        }
    }

    function onResizeScripts() {
        checkSupportedScripts();
    }

    $(window).resize($.debounce(400, onResizeScripts));

    $(document).ready(function(){
    	checkSupportedScripts();
    });

})(window.jQuery);
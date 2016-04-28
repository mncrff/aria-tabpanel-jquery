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
    	if (typeof $.testTabs != 'undefined' || $.testTabs != null) {
    		//destroy tabs
            $.testTabs.destroy();
    	}
    }

    function mobileScripts() {
    	if (typeof $.testTabs == 'undefined' || $.testTabs == null) {
        	$.testTabs = tabSet('.c-tabs');
        } else {
        	//rebuild tabs
            $.testTabs.build();
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
jQuery(function($) {

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
        	$.test = new tabSet('.c-tabs').build();
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

    function tabSet(el) {
        var tabSet = this;
        this.$el = $(el);
        this.$tablist = this.$el.find('.c-tabs__tablist');
        this.$tablinks = this.$tablist.find('a');
        this.tabs = {};

        function tabObj(i, el) {
            var self = this;
            this.anchor = el.getAttribute('href');
            this.index = i;

            this.$el = $(el);
            this.$tabpanel = $(this.anchor);
            this.$tabpanel_header = $(this.anchor+' '+tabSet.$el.data('header'));
        }

        tabObj.prototype.showPanel = function() {
            var self = this;
            this.$el.attr({'aria-selected': true, 'tabindex': 0}).addClass('active');
            setTimeout(function(){ self.$el.focus(); }, 0);
            this.$tabpanel.attr('aria-hidden', false).removeAttr('tabindex').show();
            this.$tabpanel_header.attr('tabindex', 0);
            //this.$tabpanel_header.focus();
        }

        tabObj.prototype.hidePanel = function() {
            this.$el.attr({'aria-selected': false, 'tabindex': -1}).removeClass('active');
            this.$tabpanel.attr({'aria-hidden': true, 'tabindex': -1}).hide();
            this.$tabpanel_header.removeAttr('tabindex');
        }

        tabObj.prototype.createPanel = function() {
            // add aria
            this.$el.attr('role', 'tab').attr('aria-controls', this.anchor.substr(1));
            this.$tabpanel.attr('role', 'tabpanel').attr('aria-labelledby', this.$el.attr('id'));
            //this.$tabpanel_header.addClass('visually-hidden');
        }

        tabObj.prototype.removePanel = function() {
            // remove aria and any 'active' classes or display properties that have been applied
            this.$el.removeAttr('role aria-controls aria-selected tabindex').removeClass('active');
            this.$tabpanel.removeAttr('role aria-labelledby aria-hidden tabindex').css('display', '');
            this.$tabpanel_header.removeAttr('tabindex');
        }


        //init tabs
        this.tabs = this.$tablinks.map(function(i, el) {
            // init a new object created from link
            var tab = new tabObj(i, el);

            // create listeners for each link
            tab.$el.on('click', function(e){

                e.preventDefault();
                //switch tab
                tabSet.switchTo(i);

            }).on('keydown', function(e){

                // strike up or left in the tab => previous tab
                if ( ( e.keyCode == 37 || e.keyCode == 38 ) && !e.ctrlKey ) {
                    e.preventDefault();
                    tabSet.switchTo(getPrev(tab.index));
                }
                // strike down or right in the tab => next tab
                else if ( ( e.keyCode == 40 || e.keyCode == 39 ) && !e.ctrlKey ) {
                    e.preventDefault();
                    tabSet.switchTo(getNext(tab.index));
                }
                // strike home in the tab => 1st tab
                else if ( e.keyCode == 36 ) {
                    e.preventDefault();
                    tabSet.switchTo(0);
                }
                // strike end in the tab => last tab
                else if ( e.keyCode == 35 ) {
                    e.preventDefault();
                    tabSet.switchTo(tabSet.$tablinks.length - 1);
                }

            });

            tab.$tabpanel.on('keydown', function(e){
            	// strike up + ctrl => go to header
                if ( e.keyCode == 38 && e.ctrlKey ) {
                    e.preventDefault();
                    setTimeout(function(){ tab.$el.focus(); }, 0);
                }
                // strike pageup + ctrl => go to prev header
                else if ( e.keyCode == 33 && e.ctrlKey ) {
                    e.preventDefault();
                    tabSet.switchTo(getPrev(tab.index));
                }
                // strike pagedown + ctrl => go to next header
                else if ( e.keyCode == 34 && e.ctrlKey ) {
                    e.preventDefault();
                    tabSet.switchTo(getNext(tab.index));
                }
            });

            // return tab object into an array for storage
            return tab;
        }).toArray();

        function getNext(i) {
        	return (i + 1 >= tabSet.$tablinks.length) ? 0 : i + 1;
        }

        function getPrev(i) {
        	return (i - 1 < 0) ? tabSet.$tablinks.length - 1 : i - 1;
        }

    }

    tabSet.prototype.build = function() {
        // add a class to component to mark it as activated
        this.$el.addClass('.c-tabs__activated');
        // add aria and show the tablist dom elements
        this.$tablist.attr('role', 'tablist');

        $.each(this.tabs, function(i){
            var tab = this;
            tab.createPanel();
        });

        //set first tab as open tab
        this.switchTo(0);

        return this;
    }

    tabSet.prototype.destroy = function() {
        // remove class on component that marks it as activated
        this.$el.removeClass('.c-tabs__activated');
        // remove aria and any 'active' classes or display properties that have been applied
        this.$tablist.removeAttr('role');

        for (i = 0; i < this.tabs.length; i++) {
            this.tabs[i].removePanel();
        }

        return this;
    }

    tabSet.prototype.switchTo = function(n) {
        for (i = 0; i < this.tabs.length; i++) {
            var tab = this.tabs[i];
            if (i != n) {
                tab.hidePanel();
            }
        }

        this.tabs[n].showPanel();
    }
});
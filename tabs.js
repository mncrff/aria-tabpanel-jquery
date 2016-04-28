(function($) {

    // get the next number in a set, which loops back to the beginning
    var getNext = function(n, i) {
        return (i + 1 >= n) ? 0 : i + 1;
    }

    // get the previous number in a set, which loops back to the end of the set
    var getPrev = function(n, i) {
        return (i - 1 < 0) ? n - 1 : i - 1;
    }

    var createOnClick = function(e) {
        var i = e.data.i;
        var self = e.data.self;

        e.preventDefault();
        // switch tab to specified by index
        self.switchTo(i); 
    };

    var createTabOnKeydown = function(e) {
        var i = e.data.i;
        var tab = e.data.tab;
        var self = e.data.self;
        var lng = self.$tablinks.length;

        // strike up or left in the tab => previous tab
        if ( ( e.keyCode == 37 || e.keyCode == 38 ) && !e.ctrlKey ) {
            e.preventDefault();
            // switch to previous tab, looping back to last tab if at beginning of set
            self.switchTo(getPrev(lng, tab.index));
        }
        // strike down or right in the tab => next tab
        else if ( ( e.keyCode == 40 || e.keyCode == 39 ) && !e.ctrlKey ) {
            e.preventDefault();
            // switch to next tab, looping back to first tab if at end of set
            self.switchTo(getNext(lng, tab.index));
        }
        // strike home in the tab => 1st tab
        else if ( e.keyCode == 36 ) {
            e.preventDefault();
            // switch to the first tab of the set
            self.switchTo(0);
        }
        // strike end in the tab => last tab
        else if ( e.keyCode == 35 ) {
            e.preventDefault();
            // switch to the last tab of the set
            self.switchTo(lng - 1);
        }

    };

    var createPanelOnKeydown = function(e) {
        var tab = e.data.tab;
        var self = e.data.self;
        var lng = self.$tablinks.length;

        // strike up + ctrl => go to header
        if ( e.keyCode == 38 && e.ctrlKey ) {
            e.preventDefault();
            // set focus on the tab anchor associated with the current tab
            setTimeout(function(){ tab.$el.focus(); }, 0);
        }
        // strike pageup + ctrl => go to prev header
        else if ( e.keyCode == 33 && e.ctrlKey ) {
            e.preventDefault();
            // switch to previous tab, looping back to last tab if at beginning of set
            // removes focus on elements inside tabpanel and focuses on previous tab anchor
            self.switchTo(getPrev(lng, tab.index));
        }
        // strike pagedown + ctrl => go to next header
        else if ( e.keyCode == 34 && e.ctrlKey ) {
            e.preventDefault();
            // switch to next tab, looping back to first tab if at end of set
            // removes focus on elements inside tabpanel and focuses on next tab anchor
            self.switchTo(getNext(lng, tab.index));
        }

    };

    var tabSet = function(el) {
        var self = this;
        this.$el = $(el);

        var tabObj = function(i, el) {
            var tab = this;
            this.anchor = el.getAttribute('href');
            this.index = i;

            this.$el = $(el);
            this.$tabpanel = $(this.anchor);
            this.$tabpanel_header = $(this.anchor+' '+self.$el.data('header'));
        }

        // change aria attribute values to indicate that the tab contents are showing
        tabObj.prototype.showPanel = function() {
            var tab = this;
            // set tab as 'selected', 'active' and focusable by adding to tab order
            this.$el.attr({'aria-selected': true, 'tabindex': 0}).addClass('active');
            // set focus on tab
            setTimeout(function(){ tab.$el.focus(); }, 0);
            // set tabpanel as visible, and remove the tab order (which was probably set to -1)
            this.$tabpanel.attr('aria-hidden', false).removeAttr('tabindex').show();
            // set tabpanel heading element to be focusable by adding to tab order
            this.$tabpanel_header.attr('tabindex', 0);
            // set focus on tabpanel heading element
            //this.$tabpanel_header.focus();
        }

        // change aria attribute values to indicate that the tab contents are hidden
        tabObj.prototype.hidePanel = function() {
            // remove 'selected' and 'active' states on tab, and remove it from tab order
            this.$el.attr({'aria-selected': false, 'tabindex': -1}).removeClass('active');
            // hide tabpanel and remove it from tab order
            this.$tabpanel.attr({'aria-hidden': true, 'tabindex': -1}).hide();
            // make tabpanel heading element unfocusable
            this.$tabpanel_header.removeAttr('tabindex');
        }

        tabObj.prototype.createPanel = function() {
            // add aria attributes
            this.$el.attr('role', 'tab').attr('aria-controls', this.anchor.substr(1));
            this.$tabpanel.attr('role', 'tabpanel').attr('aria-labelledby', this.$el.attr('id'));
            //this.$tabpanel_header.addClass('visually-hidden');
        }

        tabObj.prototype.removePanel = function() {
            // remove aria attributes and any 'active' classes or display properties that have been applied
            this.$el.removeAttr('role aria-controls aria-selected tabindex').removeClass('active');
            this.$tabpanel.removeAttr('role aria-labelledby aria-hidden tabindex').css('display', '');
            this.$tabpanel_header.removeAttr('tabindex');
        }

        // if a true tabSet object exists
        if (this.$el.length > 0) {

            this.$tablist = this.$el.find('.c-tabs__tablist');
            this.$tablinks = this.$tablist.find('a');
            this.tabs = {};

            // create tabs in this set
            this.tabs = this.$tablinks.map(function(i, el) {
                // init a new object created from anchor element
                var tab = new tabObj(i, el);

                // return tab object into an array for storage
                return tab;
            }).toArray();

            this.build();

        }

    }

    tabSet.prototype.build = function() {
        // if a true tabSet object exists
        if (this.$el.length > 0) {

            var self = this;

            // add a class to component to mark it as activated
            this.$el.addClass('.c-tabs__activated');

            // add aria and show the tablist dom elements
            this.$tablist.attr('role', 'tablist');

            // loop through all tabObjs stored in tabs array
            for (i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                // setup the tab and its panel as an "accessible tabs" component
                tab.createPanel();

                // create listeners for the tab's link
                tab.$el.on('click', {i: i, tab: tab, self: self}, createOnClick).on('keydown', {i: i, tab: tab, self: self}, createTabOnKeydown);
                // create listener for the tab's panel
                tab.$tabpanel.on('keydown', {tab: tab, self: self}, createPanelOnKeydown);
            }

            // set first tab as open tab
            this.switchTo(0);
        }

        // return tabSet object for chaining
        return this;
    }

    tabSet.prototype.destroy = function() {
        // if a true tabSet object exists
        if (this.$el.length > 0) {

            // remove class on component that marks it as activated
            this.$el.removeClass('.c-tabs__activated');

            // remove aria and any 'active' classes or display properties that have been applied
            this.$tablist.removeAttr('role');

            // loop through all tabObjs stored in tabs array
            for (i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                // remove anything that makes this an "accessible tabs" component
                tab.removePanel();

                // remove all event listeners that were added
                tab.$el.off('click', createOnClick).off('click', createTabOnKeydown);
                tab.$tabpanel.off('keydown', createPanelOnKeydown);
            }
        }

        // return tabSet object for chaining
        return this;
    }

    tabSet.prototype.switchTo = function(n) {
        // if a true tabSet object exists
        if (this.$el.length > 0) {

            // hide all tab panels
            for (i = 0; i < this.tabs.length; i++) {
                var tab = this.tabs[i];
                if (i != n) {
                    tab.hidePanel();
                }
            }

            // show specified panel
            this.tabs[n].showPanel();
        }
    }

    // expose tabSet object to global scope for use
    window.tabSet = tabSet;

})(window.jQuery);
/**
 * Global container for all functions and variables
 */
var imContainer = {

    // Reference to last url change event
    lastUrlEvent: null,

    // Cache for url parameter regexps
    _urlParamRegexps: {},

    /**
     * Initializes page
     */
    init: function() {
        // Detect and replace missing html5 features
        this.replaceMissingHtml5Features();

        // Attach event delegation for mouse clicks to body
        $('html').live('click', jQuery.proxy(this.clickDelegation, this));

        $(".overlay-dialog label").fadeOut();

        //        $($("#page-language-selector")[0]).addClass("overlay-dialog floating");
    },


    /**
     * Handle event delegation
     * @param {event} event
     */
    clickDelegation: function(event) {
        var src = $(event.target);

        // If login link clicked, toggle overlay box (also, see below for
        // hiding all)
        if (src.hasClass("overlay-dialog-link")) {
            event.preventDefault();
            event.stopPropagation();

            // If link not already enabled, hide all and then show this one.
            if (!src.hasClass("enabled")) {
                this.toggleOverlayDialog(null, "hide");
                this.toggleOverlayDialog(src, "show");
                return;
            }
        }

        // Clicked anywhere in page, except overlay box: hide all login boxes.
        if (src.closest(".overlay-dialog.floating").length == 0) {
            this.toggleOverlayDialog(null, "hide");
        }
    },


    /**
     * Replaces missing HTML5 features with something appropriate.
     */
    replaceMissingHtml5Features: function() {
        // Input placeholder property
        if (this.placeholderSupported()) {
            $(".overlay-dialog label").addClass("hidden");
        }
    },


    /**
     * Checks if HTML5 placeholder is supported
     * @return boolean
     */
    placeholderSupported: function() {
        return 'placeholder' in document.createElement('input');
    },


    /**
     * Replace pagination with More button.
     */
    addMoreButton: function() {
        var text = gettext('More');
        var paginationElem = $('.pagination');
        paginationElem.html('<button id="more" type="button">'
                            + text + '</button>');
    },


    /**
     * Toggle overlay dialog visibility
     * @param {String} (optional) state. Can be "visible" or "hidden"
     */
    toggleOverlayDialog: function(src, state) {

        // Toggle overlay.
        // Avoding jQuery.hide() as we want to hide things in an accessible way.
        if (state == "show") {
            // Get overlay container
            if (src) {
                // src should be a link; we want the following div
                var overlayContainer = $(src).next(".overlay-dialog");
            } else {
                // want all overlay containers
                var overlayContainer = $(".overlay-dialog");
            }

            overlayContainer.hide();

            var overlayLink = $(overlayContainer).prev(".overlay-dialog-link");
            $(overlayLink).addClass("enabled");

            if (jQuery.support.opacity) {
                $(overlayLink).animate({ backgroundColor: "#D9D9D9" }, 'fast');
                overlayContainer.fadeIn("fast", function() {
                    overlayContainer.addClass("visible");
                });
            } else {
                overlayContainer.addClass("visible");
            }

            // Focus first input element in form
            var inputElements = $(overlayContainer).find("input:visible");
            if (inputElements.length) {
                $(inputElements[0]).focus();
            }

        } else if (state == "hide") {
            if (src) {
                // src should be a link; we want the following div
                var overlayContainer = $(src).next(".overlay-dialog.visible");
            } else {
                // want all overlay containers
                var overlayContainer = $(".overlay-dialog.visible");
            }
            if (overlayContainer) {
                var overlayLink = $(overlayContainer).prev(".overlay-dialog-link");
                $(overlayLink).removeClass("enabled");

                if (jQuery.support.opacity) {
                    $(overlayLink).animate({ backgroundColor: "white" }, 'slow');
                    overlayContainer.fadeOut("slow", function() {
                        overlayContainer.removeClass("visible");
                    });
                } else {
                    overlayContainer.removeClass("visible");
                }
            }
        }

        // reset form
        if ($(overlayContainer).hasClass("login-container") && (overlayContainer.length > 0)) {
            $(overlayContainer).find("form")[0].reset();
        }
    },


    /**
     * Get page content (as JSON)
     * @param {String} url Url to fetch data from
     * @param {Object} params Additional parameters to the one in url
     * @param {Function} callback
     * @param {Boolean} skipHistory If true, do not add to page history
     *                  (for back button, etc.)
     */
    getPage: function(url, params, callback) {
        if (!params) {
            params = {}
        }
        params["format"] = "JSON";

        var self = this;
        var request = {
            url: url,
            data: params,
            success: function(response) { callback(response, self) }
        }
        $.ajax(request);
    },


    /**
     * Get a parameter from an url.
     * @param url Url
     * @param pName Parameter name
     * @returns Parameter value. If not found, null is returned.
     */
    getUrlParameter: function(url, paramName) {
        var rec = this._urlParamRegexps;
        var pn = paramName;
        var regexp = rec[pn] ? rec[pn] : rec[pn] = new RegExp(
                "[.]*" + pn
                + "\=([^&]*)?(&|$)");

        // Get value of parameter
        value = null;
        var match = url.match(regexp)
        if (match) {
            var value = match[1] ? match[1] : null;
        }

        return value;
    },


    /**
     * Pops a parameter from an url.
     * @param url Url
     * @param pName Parameter name
     * @returns Object foo, where foo.url is a new url without the parameter,
     * and foo.value is the value of the parameter wanted. If not found,
     * foo.value is null.
     */
    popUrlParameter: function(url, paramName) {
        // /[.]*query\=([^&]*)?(&|$)/
        var rec = this._urlParamRegexps;
        var pn = paramName;
        var regexp = ( rec[pn] ? rec[pn] :
                rec[pn] = new RegExp( "[.]*" + pn + "\=([^&]*)?(&|$)")
        );

        // Get value of parameter
        value = null;
        var match = url.match(regexp)
        if (match) {
            var value = match[1] ? match[1] : null;

            // Remove paramater
            url = url.replace(regexp, "");

            // Remove trailing ? or &, if any
            if ((url.lastIndexOf("?") == url.length - 1) ||
                    (url.lastIndexOf("&") == url.length - 1)) {
                url = url.slice(0, length-1);
            }
        }
        return {url: url, value: value};
    },


    /**
     * Get a part of an url. Example: To get the category "games" from
     * http://example.com/category/games/?foo=bar, call
     * getUrlPart(url, "category");
     * @param url Url
     * @param pName Parameter name
     * @returns Parameter value. If not found, null is returned.
     */
    getUrlPart: function(url, partName) {
        var parts = url.split("/");
        // Eliminate query string
        if ( parts[parts.length - 1][0] == '?' ) {
            parts = parts.slice(0, -1);
        }
        var pos = $.inArray(partName, parts)
        if (undefined == pos || -1 == pos) {
            value = null;
        }
        else {
            value = parts[pos + 1] ? parts[pos + 1] : null;
        }
        return value;
    },


    /**
     * Build a url, given a path and parameters. If parameters already exist
     * in path, new parameters are correctly appended (using "&") to parameter
     * list.
     * @param {String} path Path
     * @param {Object} params Parameter list
     */
    createUrl: function(path, params) {
        delete params.format;
        params = $.param(params);

        if (params) {
            if (path.indexOf("?") == -1
                        && path.indexOf("&") == -1
                        && path[path.length-1] != "/") {
                    path = path + "/";
            }
            if (path.indexOf("?") != -1) {
                    if (path[path.length-1] != "&") {
                    path = path + "&";
                }
            } else {
                if (path[path.length-1] != "?") {
                    path = path + "?";
                }
            }
            path = path + params;
        }
        return path;
    }
}

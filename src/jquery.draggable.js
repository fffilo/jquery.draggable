;(function($, window) {

    "use strict";

    /**
     * Constructor
     *
     * @param {Object} element HTML node
     * @param {Object} options see window.Draggable.prototype._defaults
     * @return {Void}
     */
    window.Draggable = function(element, options) {
        this.element = element;
        this.options = options;

        this.init();
    }

    /**
     * Draggable prototype
     *
     * @type {Object}
     */
    window.Draggable.prototype = {

        /**
         * Default options
         *
         * @type {Object}
         */
        _defaults: {
            handle: null
        },

        /**
         * Handle mousedown event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mousedown: function(e) {
            if (e.which !== 1) return;

            // mouseup outside viewport fix
            if ($(window).data("jquery-draggable")) {
                this._handle_mouseup(e);
            }

            var that = this;
            var data = {
                element: this.element,
                startStyle: {
                    left: $(this.element).position().left,
                    top: $(this.element).position().top
                },
                position: {
                    start: {
                        x: e.pageX,
                        y: e.pageY
                    },
                    current: null,
                    stop: null
                }
            }

            $("body")
                .addClass("jquery-draggable-dragging");

            $(window)
                .data("jquery-draggable", data)
                .on("mousemove.jquery-draggable", function(e) {
                    that._handle_mousemove.call(that, e);
                })
                .on("mouseup.jquery-draggable", function(e) {
                    that._handle_mouseup.call(that, e);
                });

            e.preventDefault();
        },

        /**
         * Window mousemove event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mousemove: function(e) {
            var data = $(window).data("jquery-draggable");
            if (!data.position.current) {
                $(data.element).trigger("draggablestart", data);
            }

            data.position.current = {
                x: e.pageX,
                y: e.pageY
            }

            this._recalc();

            $(data.element).trigger("draggablemove", data);
        },

        /**
         * Window mouseup event handler
         *
         * @param  {Object} e
         * @return {Void}
         */
        _handle_mouseup: function(e) {
            var data = $(window).data("jquery-draggable");
            data.position.stop = {
                x: e.pageX,
                y: e.pageY
            }
            $(data.element).trigger("draggablestop", data);

            $(window)
                .removeData("jquery-draggable")
                .off(".jquery-draggable");

            $("body")
                .removeClass("jquery-draggable-dragging");
        },

        /**
         * Recalculate element position
         *
         * @return {Void}
         */
        _recalc: function() {
            var data = $(window).data("jquery-draggable");
            if (!data) return;

            var stl = data.startStyle;
            var pos = data.position;
            var css = $.extend({}, stl);

            // auto right/bottom
            css.right = "auto";
            css.bottom = "auto";

            // calculate new position/size
            css.top -= pos.start.y - pos.current.y;
            css.left -= pos.start.x - pos.current.x;

            // set style
            $(data.element).css(css);
        },

        /**
         * Initialize
         *
         * @return {Void}
         */
        init: function() {
            var that = this;
            that.options = $.extend({}, that._defaults, that.options);

            $(that.element)
                .addClass("jquery-draggable")
                .data("jquery-draggable", that);

            // flag handles
            if (!that.options.handle) that.options.handle = that.element;
            $(that.element)
                .find(that.options.handle)
                .add($(that.element).filter(that.options.handle))
                    .addClass("jquery-draggable-handle")
                    .on("mousedown", function(e) {
                        that._handle_mousedown.call(that, e);
                    });
        },

        /**
         * Destroy
         *
         * @return {Void}
         */
        destroy: function() {
            $(this.element)
                .removeClass("jquery-draggable")
                .removeData("jquery-draggable");
            $(that.options.handle)
                .removeClass("jquery-draggable-handle");
        }

    }

    // jQuery plugin
    $.fn.draggable = function(options) {
        return $(this).each(function() {
            // check
            var lib = $(this).data("jquery-draggable");

            // init
            if (!lib) {
                lib = new Draggable(this, typeof options === "object" ? options : {});
            }

            // global methods
            if (typeof options === "string" && options.substr(0,1) !== "_" && options in lib) {
                return lib[options]();
            }
        });
    }

})(jQuery, window);

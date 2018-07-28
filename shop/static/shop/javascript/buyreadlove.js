/**
 * Created by cpkthompson on 12/27/2017.
 */
window.theme = window.theme || {};

/* ================ SLATE ================ */
window.theme = window.theme || {};

theme.Sections = function Sections() {
    this.constructors = {};
    this.instances = [];

    $(document)
        .on('buyreadlove:section:load', this._onSectionLoad.bind(this))
        .on('buyreadlove:section:unload', this._onSectionUnload.bind(this))
        .on('buyreadlove:section:select', this._onSelect.bind(this))
        .on('buyreadlove:section:deselect', this._onDeselect.bind(this))
        .on('buyreadlove:block:select', this._onBlockSelect.bind(this))
        .on('buyreadlove:block:deselect', this._onBlockDeselect.bind(this));
};

theme.Sections.prototype = _.assignIn({}, theme.Sections.prototype, {
    _createInstance: function (container, constructor) {
        var $container = $(container);
        var id = $container.attr('data-section-id');
        var type = $container.attr('data-section-type');

        constructor = constructor || this.constructors[type];

        if (_.isUndefined(constructor)) {
            return;
        }

        var instance = _.assignIn(new constructor(container), {
            id: id,
            type: type,
            container: container
        });

        this.instances.push(instance);
    },

    _onSectionLoad: function (evt) {
        var container = $('[data-section-id]', evt.target)[0];
        if (container) {
            this._createInstance(container);
        }
    },

    _onSectionUnload: function (evt) {
        this.instances = _.filter(this.instances, function (instance) {
            var isEventInstance = (instance.id === evt.detail.sectionId);

            if (isEventInstance) {
                if (_.isFunction(instance.onUnload)) {
                    instance.onUnload(evt);
                }
            }

            return !isEventInstance;
        });
    },

    _onSelect: function (evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function (instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onSelect)) {
            instance.onSelect(evt);
        }
    },

    _onDeselect: function (evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function (instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onDeselect)) {
            instance.onDeselect(evt);
        }
    },

    _onBlockSelect: function (evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function (instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockSelect)) {
            instance.onBlockSelect(evt);
        }
    },

    _onBlockDeselect: function (evt) {
        // eslint-disable-next-line no-shadow
        var instance = _.find(this.instances, function (instance) {
            return instance.id === evt.detail.sectionId;
        });

        if (!_.isUndefined(instance) && _.isFunction(instance.onBlockDeselect)) {
            instance.onBlockDeselect(evt);
        }
    },

    register: function (type, constructor) {
        this.constructors[type] = constructor;

        $('[data-section-type=' + type + ']').each(function (index, container) {
            this._createInstance(container, constructor);
        }.bind(this));
    }
});

window.slate = window.slate || {};


/**
 * A11y Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help make your theme more accessible
 * to users with visual impairments.
 *
 *
 * @namespace a11y
 */

slate.a11y = {

    /**
     * For use when focus shifts to a container rather than a link
     * eg for In-page links, after scroll, focus shifts to content area so that
     * next `tab` is where user expects if focusing a link, just $link.focus();
     *
     * @param {JQuery} $element - The element to be acted upon
     */
    pageLinkFocus: function ($element) {
        var focusClass = 'js-focus-hidden';

        $element.first()
            .attr('tabIndex', '-1')
            .focus()
            .addClass(focusClass)
            .one('blur', callback);

        function callback() {
            $element.first()
                .removeClass(focusClass)
                .removeAttr('tabindex');
        }
    },

    /**
     * If there's a hash in the url, focus the appropriate element
     */
    focusHash: function () {
        var hash = window.location.hash;

        // is there a hash in the url? is it an element on the page?
        if (hash && document.getElementById(hash.slice(1))) {
            this.pageLinkFocus($(hash));
        }
    },

    /**
     * When an in-page (url w/hash) link is clicked, focus the appropriate element
     */
    bindInPageLinks: function () {
        $('a[href*=#]').on('click', function (evt) {
            this.pageLinkFocus($(evt.currentTarget.hash));
        }.bind(this));
    },

    /**
     * Traps the focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {jQuery} options.$elementToFocus - Element to be focused when focus leaves container
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    trapFocus: function (options) {
        var eventName = options.namespace
            ? 'focusin.' + options.namespace
            : 'focusin';

        if (!options.$elementToFocus) {
            options.$elementToFocus = options.$container;
        }

        options.$container.attr('tabindex', '-1');
        options.$elementToFocus.focus();

        $(document).off('focusin');

        $(document).on(eventName, function (evt) {
            if (options.$container[0] !== evt.target && !options.$container.has(evt.target).length) {
                options.$container.focus();
            }
        });
    },

    /**
     * Removes the trap of focus in a particular container
     *
     * @param {object} options - Options to be used
     * @param {jQuery} options.$container - Container to trap focus within
     * @param {string} options.namespace - Namespace used for new focus event handler
     */
    removeTrapFocus: function (options) {
        var eventName = options.namespace
            ? 'focusin.' + options.namespace
            : 'focusin';

        if (options.$container && options.$container.length) {
            options.$container.removeAttr('tabindex');
        }

        $(document).off(eventName);
    }
};

/**
 * Image Helper Functions
 * -----------------------------------------------------------------------------
 * A collection of functions that help with basic image operations.
 *
 */

theme.Images = (function () {

    /**
     * Preloads an image in memory and uses the browsers cache to store it until needed.
     *
     * @param {Array} images - A list of image urls
     * @param {String} size - A buyreadlove image size attribute
     */

    function preload(images, size) {
        if (typeof images === 'string') {
            images = [images];
        }

        for (var i = 0; i < images.length; i++) {
            var image = images[i];
            this.loadImage(this.getSizedImageUrl(image, size));
        }
    }

    /**
     * Loads and caches an image in the browsers cache.
     * @param {string} path - An image url
     */
    function loadImage(path) {
        new Image().src = path;
    }

    /**
     * Swaps the src of an image for another OR returns the imageURL to the callback function
     * @param image
     * @param element
     * @param callback
     */
    function switchImage(image, element, callback) {
        var size = this.imageSize(element.src);
        var imageUrl = this.getSizedImageUrl(image.src, size);

        if (callback) {
            callback(imageUrl, image, element); // eslint-disable-line callback-return
        } else {
            element.src = imageUrl;
        }
    }

    /**
     * +++ Useful
     * Find the buyreadlove image attribute size
     *
     * @param {string} src
     * @returns {null}
     */
    function imageSize(src) {
        var match = src.match(/.+_((?:pico|icon|thumb|small|compact|medium|large|grande)|\d{1,4}x\d{0,4}|x\d{1,4})[_\.@]/);

        if (match !== null) {
            return match[1];
        } else {
            return null;
        }
    }

    /**
     * +++ Useful
     * Adds a buyreadlove size attribute to a URL
     *
     * @param src
     * @param size
     * @returns {*}
     */
    function getSizedImageUrl(src, size) {
        if (size == null) {
            return src;
        }

        if (size === 'master') {
            return this.removeProtocol(src);
        }

        var match = src.match(/\.(jpg|jpeg|gif|png|bmp|bitmap|tiff|tif)(\?v=\d+)?$/i);

        if (match != null) {
            var prefix = src.split(match[0]);
            var suffix = match[0];

            return this.removeProtocol(prefix[0] + '_' + size + suffix);
        }

        return null;
    }

    function removeProtocol(path) {
        return path.replace(/http(s)?:/, '');
    }

    return {
        preload: preload,
        loadImage: loadImage,
        switchImage: switchImage,
        imageSize: imageSize,
        getSizedImageUrl: getSizedImageUrl,
        removeProtocol: removeProtocol
    };
})();

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 * Alternatives
 * - Accounting.js - http://openexchangerates.github.io/accounting.js/
 *
 */

theme.Currency = (function () {
    var moneyFormat = '${{amount}}'; // eslint-disable-line camelcase

    function formatMoney(cents, format) {
        if (typeof cents === 'string') {
            cents = cents.replace('.', '');
        }
        var value = '';
        var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
        var formatString = (format || moneyFormat);

        function formatWithDelimiters(number, precision, thousands, decimal) {
            precision = precision || 2;
            thousands = thousands || ',';
            decimal = decimal || '.';

            if (isNaN(number) || number == null) {
                return 0;
            }

            number = (number / 100.0).toFixed(precision);

            var parts = number.split('.');
            var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
            var centsAmount = parts[1] ? (decimal + parts[1]) : '';

            return dollarsAmount + centsAmount;
        }

        switch (formatString.match(placeholderRegex)[1]) {
            case 'amount':
                value = formatWithDelimiters(cents, 2);
                break;
            case 'amount_no_decimals':
                value = formatWithDelimiters(cents, 0);
                break;
            case 'amount_with_comma_separator':
                value = formatWithDelimiters(cents, 2, '.', ',');
                break;
            case 'amount_no_decimals_with_comma_separator':
                value = formatWithDelimiters(cents, 0, '.', ',');
                break;
            case 'amount_no_decimals_with_space_separator':
                value = formatWithDelimiters(cents, 0, ' ');
                break;
        }

        return formatString.replace(placeholderRegex, value);
    }

    return {
        formatMoney: formatMoney
    }
})();

/**
 * Variant Selection scripts
 * ------------------------------------------------------------------------------
 *
 * Handles change events from the variant inputs in any `cart/add` forms that may
 * exist.  Also updates the master select and triggers updates when the variants
 * price or image changes.
 *
 * @namespace variants
 */

slate.Variants = (function () {

    /**
     * Variant constructor
     *
     * @param {object} options - Settings from `product.js`
     */
    function Variants(options) {
        this.$container = options.$container;
        this.product = options.product;
        this.singleOptionSelector = options.singleOptionSelector;
        this.originalSelectorId = options.originalSelectorId;
        this.enableHistoryState = options.enableHistoryState;
        this.currentVariant = this._getVariantFromOptions();

        $(this.singleOptionSelector, this.$container).on('change', this._onSelectChange.bind(this));
    }

    Variants.prototype = _.assignIn({}, Variants.prototype, {

        /**
         * Get the currently selected options from add-to-cart form. Works with all
         * form input elements.
         *
         * @return {array} options - Values of currently selected variants
         */
        _getCurrentOptions: function () {
            var currentOptions = _.map($(this.singleOptionSelector, this.$container), function (element) {
                var $element = $(element);
                var type = $element.attr('type');
                var currentOption = {};

                if (type === 'radio' || type === 'checkbox') {
                    if ($element[0].checked) {
                        currentOption.value = $element.val();
                        currentOption.index = $element.data('index');

                        return currentOption;
                    } else {
                        return false;
                    }
                } else {
                    currentOption.value = $element.val();
                    currentOption.index = $element.data('index');

                    return currentOption;
                }
            });

            // remove any unchecked input values if using radio buttons or checkboxes
            currentOptions = _.compact(currentOptions);

            return currentOptions;
        },

        /**
         * Find variant based on selected values.
         *
         * @param  {array} selectedValues - Values of variant inputs
         * @return {object || undefined} found - Variant object from product.variants
         */
        _getVariantFromOptions: function () {
            var selectedValues = this._getCurrentOptions();
            var variants = this.product.variants;

            var found = _.find(variants, function (variant) {
                return selectedValues.every(function (values) {
                    return _.isEqual(variant[values.index], values.value);
                });
            });

            return found;
        },

        /**
         * Event handler for when a variant input changes.
         */
        _onSelectChange: function () {
            var variant = this._getVariantFromOptions();

            this.$container.trigger({
                type: 'variantChange',
                variant: variant
            });

            if (!variant) {
                return;
            }

            this._updateMasterSelect(variant);
            this._updateImages(variant);
            this._updatePrice(variant);
            this._updateSKU(variant);
            this.currentVariant = variant;

            if (this.enableHistoryState) {
                this._updateHistoryState(variant);
            }
        },

        /**
         * Trigger event when variant image changes
         *
         * @param  {object} variant - Currently selected variant
         * @return {event}  variantImageChange
         */
        _updateImages: function (variant) {
            var variantImage = variant.featured_image || {};
            var currentVariantImage = this.currentVariant.featured_image || {};

            if (!variant.featured_image || variantImage.src === currentVariantImage.src) {
                return;
            }

            this.$container.trigger({
                type: 'variantImageChange',
                variant: variant
            });
        },

        /**
         * Trigger event when variant price changes.
         *
         * @param  {object} variant - Currently selected variant
         * @return {event} variantPriceChange
         */
        _updatePrice: function (variant) {
            if (variant.price === this.currentVariant.price && variant.compare_at_price === this.currentVariant.compare_at_price) {
                return;
            }

            this.$container.trigger({
                type: 'variantPriceChange',
                variant: variant
            });
        },

        /**
         * Trigger event when variant sku changes.
         *
         * @param  {object} variant - Currently selected variant
         * @return {event} variantSKUChange
         */
        _updateSKU: function (variant) {
            if (variant.sku === this.currentVariant.sku) {
                return;
            }

            this.$container.trigger({
                type: 'variantSKUChange',
                variant: variant
            });
        },

        /**
         * Update history state for product deeplinking
         *
         * @param  {variant} variant - Currently selected variant
         * @return {k}         [description]
         */
        _updateHistoryState: function (variant) {
            if (!history.replaceState || !variant) {
                return;
            }

            var newurl = window.location.protocol + '//' + window.location.host + window.location.pathname + '?variant=' + variant.id;
            window.history.replaceState({path: newurl}, '', newurl);
        },

        /**
         * Update hidden master select of variant change
         *
         * @param  {variant} variant - Currently selected variant
         */
        _updateMasterSelect: function (variant) {
            $(this.originalSelectorId, this.$container).val(variant.id);
        }
    });

    return Variants;
})();


/* ================ GLOBAL ================ */
/*============================================================================
 Drawer modules
 ==============================================================================*/
theme.Drawers = (function () {
    function Drawer(id, position, options) {
        var defaults = {
            close: '.js-drawer-close',
            open: '.js-drawer-open-' + position,
            openClass: 'js-drawer-open',
            dirOpenClass: 'js-drawer-open-' + position
        };

        this.nodes = {
            $parent: $('html').add('body'),
            $page: $('#PageContainer')
        };

        this.config = $.extend(defaults, options);
        this.position = position;

        this.$drawer = $('#' + id);

        if (!this.$drawer.length) {
            return false;
        }

        this.drawerIsOpen = false;
        this.init();
    }

    Drawer.prototype.init = function () {
        $(this.config.open).on('click', $.proxy(this.open, this));
        this.$drawer.on('click', this.config.close, $.proxy(this.close, this));
    };

    Drawer.prototype.open = function (evt) {
        // Keep track if drawer was opened from a click, or called by another function
        var externalCall = false;

        // Prevent following href if link is clicked
        if (evt) {
            evt.preventDefault();
        } else {
            externalCall = true;
        }

        // Without this, the drawer opens, the click event bubbles up to nodes.$page
        // which closes the drawer.
        if (evt && evt.stopPropagation) {
            evt.stopPropagation();
            // save the source of the click, we'll focus to this on close
            this.$activeSource = $(evt.currentTarget);
        }

        if (this.drawerIsOpen && !externalCall) {
            return this.close();
        }


        // Add is-transitioning class to moved elements on open so drawer can have
        // transition for close animation
        this.$drawer.prepareTransition();

        this.nodes.$parent.addClass(this.config.openClass + ' ' + this.config.dirOpenClass);
        this.drawerIsOpen = true;

        // Set focus on drawer
        slate.a11y.trapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });

        // Run function when draw opens if set
        if (this.config.onDrawerOpen && typeof this.config.onDrawerOpen === 'function') {
            if (!externalCall) {
                this.config.onDrawerOpen();
            }
        }

        if (this.$activeSource && this.$activeSource.attr('aria-expanded')) {
            this.$activeSource.attr('aria-expanded', 'true');
        }

        this.bindEvents();

        return this;
    };

    Drawer.prototype.close = function () {
        if (!this.drawerIsOpen) { // don't close a closed drawer
            return;
        }

        // deselect any focused form elements
        $(document.activeElement).trigger('blur');

        // Ensure closing transition is applied to moved elements, like the nav
        this.$drawer.prepareTransition();

        this.nodes.$parent.removeClass(this.config.dirOpenClass + ' ' + this.config.openClass);

        this.drawerIsOpen = false;

        // Remove focus on drawer
        slate.a11y.removeTrapFocus({
            $container: this.$drawer,
            namespace: 'drawer_focus'
        });

        this.unbindEvents();
    };

    Drawer.prototype.bindEvents = function () {
        this.nodes.$parent.on('keyup.drawer', $.proxy(function (evt) {
            // close on 'esc' keypress
            if (evt.keyCode === 27) {
                this.close();
                return false;
            } else {
                return true;
            }
        }, this));

        // Lock scrolling on mobile
        this.nodes.$page.on('touchmove.drawer', function () {
            return false;
        });

        this.nodes.$page.on('click.drawer', $.proxy(function () {
            this.close();
            return false;
        }, this));
    };

    Drawer.prototype.unbindEvents = function () {
        this.nodes.$page.off('.drawer');
        this.nodes.$parent.off('.drawer');
    };

    return Drawer;
})();


/* ================ MODULES ================ */
window.theme = window.theme || {};

theme.Header = (function () {
    var selectors = {
        body: 'body',
        navigation: '#AccessibleNav',
        siteNavHasDropdown: '.site-nav--has-dropdown',
        siteNavChildLinks: '.site-nav__child-link',
        siteNavActiveDropdown: '.site-nav--active-dropdown',
        siteNavLinkMain: '.site-nav__link--main',
        siteNavChildLink: '.site-nav__link--last'
    };

    var config = {
        activeClass: 'site-nav--active-dropdown',
        childLinkClass: 'site-nav__child-link'
    };

    var cache = {};

    function init() {
        cacheSelectors();

        cache.$parents.on('click.siteNav', function (evt) {
            var $el = $(this);

            if (!$el.hasClass(config.activeClass)) {
                // force stop the click from happening
                evt.preventDefault();
                evt.stopImmediatePropagation();
            }

            showDropdown($el);
        });

        // check when we're leaving a dropdown and close the active dropdown
        $(selectors.siteNavChildLink).on('focusout.siteNav', function () {
            setTimeout(function () {
                if ($(document.activeElement).hasClass(config.childLinkClass) || !cache.$activeDropdown.length) {
                    return;
                }

                hideDropdown(cache.$activeDropdown);
            });
        });

        // close dropdowns when on top level nav
        cache.$topLevel.on('focus.siteNav', function () {
            if (cache.$activeDropdown.length) {
                hideDropdown(cache.$activeDropdown);
            }
        });

        cache.$subMenuLinks.on('click.siteNav', function (evt) {
            // Prevent click on body from firing instead of link
            evt.stopImmediatePropagation();
        });
    }

    function cacheSelectors() {
        cache = {
            $nav: $(selectors.navigation),
            $topLevel: $(selectors.siteNavLinkMain),
            $parents: $(selectors.navigation).find(selectors.siteNavHasDropdown),
            $subMenuLinks: $(selectors.siteNavChildLinks),
            $activeDropdown: $(selectors.siteNavActiveDropdown)
        };
    }

    function showDropdown($el) {
        $el.addClass(config.activeClass);

        // close open dropdowns
        if (cache.$activeDropdown.length) {
            hideDropdown(cache.$activeDropdown);
        }

        cache.$activeDropdown = $el;

        // set expanded on open dropdown
        $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'true');

        setTimeout(function () {
            $(window).on('keyup.siteNav', function (evt) {
                if (evt.keyCode === 27) {
                    hideDropdown($el);
                }
            });

            $(selectors.body).on('click.siteNav', function () {
                hideDropdown($el);
            });
        }, 250);
    }

    function hideDropdown($el) {
        // remove aria on open dropdown
        $el.find(selectors.siteNavLinkMain).attr('aria-expanded', 'false');
        $el.removeClass(config.activeClass);

        // reset active dropdown
        cache.$activeDropdown = $(selectors.siteNavActiveDropdown);

        $(selectors.body).off('click.siteNav');
        $(window).off('keyup.siteNav');
    }

    function unload() {
        $(window).off('.siteNav');
        cache.$parents.off('.siteNav');
        cache.$subMenuLinks.off('.siteNav');
        cache.$topLevel.off('.siteNav');
        $(selectors.siteNavChildLink).off('.siteNav');
        $(selectors.body).off('.siteNav');
    }

    return {
        init: init,
        unload: unload
    };
})();

window.theme = window.theme || {};

theme.MobileNav = (function () {
    var classes = {
        mobileNavOpenIcon: 'mobile-nav--open',
        mobileNavCloseIcon: 'mobile-nav--close',
        subNavLink: 'mobile-nav__sublist-link',
        return: 'mobile-nav__return-btn',
        subNavActive: 'is-active',
        subNavClosing: 'is-closing',
        navOpen: 'js-menu--is-open',
        subNavShowing: 'sub-nav--is-open',
        thirdNavShowing: 'third-nav--is-open',
        subNavToggleBtn: 'js-toggle-submenu'
    };
    var cache = {};
    var isTransitioning;
    var $activeSubNav;
    var $activeTrigger;
    var menuLevel = 1;
    // Breakpoints from src/stylesheets/global/variables.scss.liquid
    var mediaQuerySmall = 'screen and (max-width: 749px)';

    function init() {
        cacheSelectors();

        cache.$mobileNavToggle.on('click', toggleMobileNav);
        cache.$subNavToggleBtn.on('click.subNav', toggleSubNav);

        // Close mobile nav when unmatching mobile breakpoint
        enquire.register(mediaQuerySmall, {
            unmatch: function () {
                closeMobileNav();
            }
        });
    }

    function toggleMobileNav() {
        if (cache.$mobileNavToggle.hasClass(classes.mobileNavCloseIcon)) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    }

    function cacheSelectors() {
        cache = {
            $pageContainer: $('#PageContainer'),
            $siteHeader: $('.site-header'),
            $mobileNavToggle: $('.js-mobile-nav-toggle'),
            $mobileNavContainer: $('.mobile-nav-wrapper'),
            $mobileNav: $('#MobileNav'),
            $subNavToggleBtn: $('.' + classes.subNavToggleBtn)
        };
    }

    function openMobileNav() {
        var translateHeaderHeight = cache.$siteHeader.outerHeight() + cache.$siteHeader.offset().top;

        cache.$mobileNavContainer
            .prepareTransition()
            .addClass(classes.navOpen);

        cache.$mobileNavContainer.css({
            transform: 'translate3d(0, ' + translateHeaderHeight + 'px, 0)'
        });
        cache.$pageContainer.css({
            transform: 'translate3d(0, ' + cache.$mobileNavContainer[0].scrollHeight + 'px, 0)'
        });

        slate.a11y.trapFocus({
            $container: cache.$mobileNav,
            namespace: 'navFocus'
        });

        cache.$mobileNavToggle
            .addClass(classes.mobileNavCloseIcon)
            .removeClass(classes.mobileNavOpenIcon);

        // close on escape
        $(window).on('keyup.mobileNav', function (evt) {
            if (evt.which === 27) {
                closeMobileNav();
            }
        });
    }

    function closeMobileNav() {
        cache.$mobileNavContainer.prepareTransition().removeClass(classes.navOpen);

        cache.$mobileNavContainer.css({
            transform: 'translate3d(0, -100%, 0)'
        });
        cache.$pageContainer.removeAttr('style');

        cache.$mobileNavContainer.one('TransitionEnd.navToggle webkitTransitionEnd.navToggle transitionend.navToggle oTransitionEnd.navToggle', function () {
            slate.a11y.removeTrapFocus({
                $container: cache.$mobileNav,
                namespace: 'navFocus'
            });
        });

        cache.$mobileNavToggle
            .addClass(classes.mobileNavOpenIcon)
            .removeClass(classes.mobileNavCloseIcon);

        $(window).off('keyup.mobileNav');
    }

    function toggleSubNav(evt) {
        if (isTransitioning) {
            return;
        }

        var $toggleBtn = $(evt.currentTarget);
        var isReturn = $toggleBtn.hasClass(classes.return);
        isTransitioning = true;

        if (isReturn) {
            // Close all subnavs by removing active class on buttons
            $('.' + classes.subNavToggleBtn + '[data-level="' + (menuLevel - 1) + '"]')
                .removeClass(classes.subNavActive);

            if ($activeTrigger && $activeTrigger.length) {
                $activeTrigger.removeClass(classes.subNavActive);
            }
        } else {
            $toggleBtn.addClass(classes.subNavActive);
        }

        $activeTrigger = $toggleBtn;

        goToSubnav($toggleBtn.data('target'));
    }

    function goToSubnav(target) {

        /*eslint-disable buyreadlove/jquery-dollar-sign-reference */

        var $targetMenu = target
            ? $('.mobile-nav__dropdown[data-parent="' + target + '"]')
            : cache.$mobileNav;

        menuLevel = $targetMenu.data('level') ? $targetMenu.data('level') : 1;

        if ($activeSubNav && $activeSubNav.length) {
            $activeSubNav
                .prepareTransition()
                .addClass(classes.subNavClosing);
        }

        $activeSubNav = $targetMenu;

        var $elementToFocus = target
            ? $targetMenu.find('.' + classes.subNavLink + ':first')
            : $activeTrigger;

        /*eslint-enable buyreadlove/jquery-dollar-sign-reference */

        var translateMenuHeight = $targetMenu[0].scrollHeight;
        if (!target) {
            translateMenuHeight = $targetMenu.outerHeight();
        }

        var openNavClass = menuLevel > 2
            ? classes.thirdNavShowing
            : classes.subNavShowing;

        cache.$mobileNavContainer
            .css('height', translateMenuHeight)
            .removeClass(classes.thirdNavShowing)
            .addClass(openNavClass);

        if (!target) {
            // Show top level nav
            cache.$mobileNavContainer
                .removeClass(classes.thirdNavShowing)
                .removeClass(classes.subNavShowing);
        }

        // Focusing an item in the subnav early forces element into view and breaks the animation.
        cache.$mobileNavContainer.one('TransitionEnd.subnavToggle webkitTransitionEnd.subnavToggle transitionend.subnavToggle oTransitionEnd.subnavToggle', function () {
            slate.a11y.trapFocus({
                $container: $targetMenu,
                $elementToFocus: $elementToFocus,
                namespace: 'subNavFocus'
            });

            cache.$mobileNavContainer.off('.subnavToggle');
            isTransitioning = false;
        });

        // Match height of subnav
        cache.$pageContainer.css({
            transform: 'translate3d(0, ' + translateMenuHeight + 'px, 0)'
        });

        $activeSubNav.removeClass(classes.subNavClosing);
    }

    return {
        init: init,
        closeMobileNav: closeMobileNav
    };
})(jQuery);

window.theme = window.theme || {};

theme.Search = (function () {
    var selectors = {
        search: '.search',
        searchSubmit: '.search__submit',
        searchInput: '.search__input',

        siteHeader: '.site-header',
        siteHeaderSearchToggle: '.site-header__search-toggle',
        siteHeaderSearch: '.site-header__search',

        searchDrawer: '.search-bar',
        searchDrawerInput: '.search-bar__input',

        searchHeader: '.search-header',
        searchHeaderInput: '.search-header__input',
        searchHeaderSubmit: '.search-header__submit',

        mobileNavWrapper: '.mobile-nav-wrapper'
    };

    var classes = {
        focus: 'search--focus',
        mobileNavIsOpen: 'js-menu--is-open'
    };

    function init() {
        if (!$(selectors.siteHeader).length) {
            return;
        }

        initDrawer();
        searchSubmit();

        $(selectors.searchHeaderInput).add(selectors.searchHeaderSubmit).on('focus blur', function () {
            $(selectors.searchHeader).toggleClass(classes.focus);
        });

        $(selectors.siteHeaderSearchToggle).on('click', function () {
            var searchHeight = $(selectors.siteHeader).outerHeight();
            var searchOffset = $(selectors.siteHeader).offset().top - searchHeight;

            $(selectors.searchDrawer).css({
                height: searchHeight + 'px',
                top: searchOffset + 'px'
            });
        });
    }

    function initDrawer() {
        // Add required classes to HTML
        $('#PageContainer').addClass('drawer-page-content');
        $('.js-drawer-open-top').attr('aria-controls', 'SearchDrawer').attr('aria-expanded', 'false');

        theme.SearchDrawer = new theme.Drawers('SearchDrawer', 'top', {
            onDrawerOpen: searchDrawerFocus
        });
    }

    function searchDrawerFocus() {
        searchFocus($(selectors.searchDrawerInput));

        if ($(selectors.mobileNavWrapper).hasClass(classes.mobileNavIsOpen)) {
            theme.MobileNav.closeMobileNav();
        }
    }

    function searchFocus($el) {
        $el.focus();
        // set selection range hack for iOS
        $el[0].setSelectionRange(0, $el[0].value.length);
    }

    function searchSubmit() {
        $(selectors.searchSubmit).on('click', function (evt) {
            var $el = $(evt.target);
            var $input = $el.parents(selectors.search).find(selectors.searchInput);
            if ($input.val().length === 0) {
                evt.preventDefault();
                searchFocus($input);
            }
        });
    }

    return {
        init: init
    };
})();

(function () {
    var selectors = {
        backButton: '.return-link'
    };

    var $backButton = $(selectors.backButton);

    if (!document.referrer || !$backButton.length || !window.history.length) {
        return;
    }

    $backButton.one('click', function (evt) {
        evt.preventDefault();

        var referrerDomain = urlDomain(document.referrer);
        var shopDomain = urlDomain(window.location.href);

        if (shopDomain === referrerDomain) {
            history.back();
        }

        return false;
    });

    function urlDomain(url) {
        var anchor = document.createElement('a');
        anchor.ref = url;

        return anchor.hostname;
    }
})();


/* ================ TEMPLATES ================ */
(function () {
    var $filterBy = $('#BlogTagFilter');

    if (!$filterBy.length) {
        return;
    }

    $filterBy.on('change', function () {
        location.href = $(this).val();
    });

})();

window.theme = theme || {};

theme.customerTemplates = (function () {

    function initEventListeners() {
        // Show reset password form
        $('#RecoverPassword').on('click', function (evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });

        // Hide reset password form
        $('#HideRecoverPasswordLink').on('click', function (evt) {
            evt.preventDefault();
            toggleRecoverPasswordForm();
        });
    }

    /**
     *
     *  Show/Hide recover password form
     *
     */
    function toggleRecoverPasswordForm() {
        $('#RecoverPasswordForm').toggleClass('hide');
        $('#CustomerLoginForm').toggleClass('hide');
    }

    /**
     *
     *  Show reset password success message
     *
     */
    function resetPasswordSuccess() {
        var $formState = $('.reset-password-success');

        // check if reset password form was successfully submited.
        if (!$formState.length) {
            return;
        }

        // show success message
        $('#ResetSuccess').removeClass('hide');
    }

    /**
     *
     *  Show/hide customer address forms
     *
     */
    function customerAddressForm() {
        var $newAddressForm = $('#AddressNewForm');

        if (!$newAddressForm.length) {
            return;
        }

        // Initialize observers on address selectors, defined in buyreadlove_common.js
        if (buyreadlove) {
            // eslint-disable-next-line no-new
            new buyreadlove.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
                hideElement: 'AddressProvinceContainerNew'
            });
        }

        // Initialize each edit form's country/province selector
        $('.address-country-option').each(function () {
            var formId = $(this).data('form-id');
            var countrySelector = 'AddressCountry_' + formId;
            var provinceSelector = 'AddressProvince_' + formId;
            var containerSelector = 'AddressProvinceContainer_' + formId;

            // eslint-disable-next-line no-new
            new buyreadlove.CountryProvinceSelector(countrySelector, provinceSelector, {
                hideElement: containerSelector
            });
        });

        // Toggle new/edit address forms
        $('.address-new-toggle').on('click', function () {
            $newAddressForm.toggleClass('hide');
        });

        $('.address-edit-toggle').on('click', function () {
            var formId = $(this).data('form-id');
            $('#EditAddress_' + formId).toggleClass('hide');
        });

        $('.address-delete').on('click', function () {
            var $el = $(this);
            var formId = $el.data('form-id');
            var confirmMessage = $el.data('confirm-message');

            // eslint-disable-next-line no-alert
            if (confirm(confirmMessage || 'Are you sure you wish to delete this address?')) {
                buyreadlove.postLink('/account/addresses/' + formId, {parameters: {_method: 'delete'}});
            }
        });
    }

    /**
     *
     *  Check URL for reset password hash
     *
     */
    function checkUrlHash() {
        var hash = window.location.hash;

        // Allow deep linking to recover password form
        if (hash === '#recover') {
            toggleRecoverPasswordForm();
        }
    }

    return {
        init: function () {
            checkUrlHash();
            initEventListeners();
            resetPasswordSuccess();
            customerAddressForm();
        }
    };
})();


/*================ SECTIONS ================*/
window.theme = window.theme || {};

theme.Cart = (function () {
    var selectors = {
        edit: '.js-edit-toggle'
    };
    var config = {
        showClass: 'cart__update--show',
        showEditClass: 'cart__edit--active',
        cartNoCookies: 'cart--no-cookies'
    };

    function Cart(container) {
        this.$container = $(container);
        this.$edit = $(selectors.edit, this.$container);

        if (!this.cookiesEnabled()) {
            this.$container.addClass(config.cartNoCookies);
        }

        this.$edit.on('click', this._onEditClick.bind(this));
    }

    Cart.prototype = _.assignIn({}, Cart.prototype, {
        onUnload: function () {
            this.$edit.off('click', this._onEditClick);
        },

        _onEditClick: function (evt) {
            var $evtTarget = $(evt.target);
            var $updateLine = $('.' + $evtTarget.data('target'));

            $evtTarget.toggleClass(config.showEditClass);
            $updateLine.toggleClass(config.showClass);
        },

        cookiesEnabled: function () {
            var cookieEnabled = navigator.cookieEnabled;

            if (!cookieEnabled) {
                document.cookie = 'testcookie';
                cookieEnabled = (document.cookie.indexOf('testcookie') !== -1);
            }
            return cookieEnabled;
        }
    });

    return Cart;
})();

window.theme = window.theme || {};

theme.Filters = (function () {
    var constants = {
        SORT_BY: 'sort_by'
    };
    var selectors = {
        filterSelection: '.filters-toolbar__input--filter',
        sortSelection: '.filters-toolbar__input--sort',
        defaultSort: '.collection-header__default-sort'
    };

    function Filters(container) {
        var $container = this.$container = $(container);

        this.$filterSelect = $(selectors.filterSelection, $container);
        this.$sortSelect = $(selectors.sortSelection, $container);
        this.$selects = $(selectors.filterSelection, $container).add($(selectors.sortSelection, $container));

        this.defaultSort = this._getDefaultSortValue();
        this._resizeSelect(this.$selects);
        this.$selects.removeClass('hidden');

        this.$filterSelect.on('change', this._onFilterChange.bind(this));
        this.$sortSelect.on('change', this._onSortChange.bind(this));
    }

    Filters.prototype = _.assignIn({}, Filters.prototype, {
        _onSortChange: function (evt) {
            var sort = this._sortValue();
            if (sort.length) {
                window.location.search = sort;
            } else {
                // clean up our url if the sort value is blank for default
                window.location.href = window.location.href.replace(window.location.search, '');
            }
            this._resizeSelect($(evt.target));
        },

        _onFilterChange: function (evt) {
            window.location.href = this.$filterSelect.val() + window.location.search;
            this._resizeSelect($(evt.target));
        },

        _getSortValue: function () {
            return this.$sortSelect.val() || this.defaultSort;
        },

        _getDefaultSortValue: function () {
            return $(selectors.defaultSort, this.$container).val();
        },

        _sortValue: function () {
            var sort = this._getSortValue();
            var query = '';

            if (sort !== this.defaultSort) {
                query = constants.SORT_BY + '=' + sort;
            }

            return query;
        },

        _resizeSelect: function ($selection) {
            $selection.each(function () {
                var $this = $(this);
                var arrowWidth = 10;
                // create test element
                var text = $this.find('option:selected').text();
                var $test = $('<span>').html(text);

                // add to body, get width, and get out
                $test.appendTo('body');
                var width = $test.width();
                $test.remove();

                // set select width
                $this.width(width + arrowWidth);
            });
        },

        onUnload: function () {
            this.$filterSelect.off('change', this._onFilterChange);
            this.$sortSelect.off('change', this._onSortChange);
        }
    });

    return Filters;
})();

window.theme = window.theme || {};

theme.HeaderSection = (function () {

    function Header() {
        theme.Header.init();
        theme.MobileNav.init();
        theme.Search.init();
    }

    Header.prototype = _.assignIn({}, Header.prototype, {
        onUnload: function () {
            theme.Header.unload();
        }
    });

    return Header;
})();


/* eslint-disable no-new */
theme.Product = (function () {
    function Product(container) {
        var $container = this.$container = $(container);
        var sectionId = $container.attr('data-section-id');

        this.settings = {
            // Breakpoints from src/stylesheets/global/variables.scss.liquid
            mediaQueryMediumUp: 'screen and (min-width: 750px)',
            mediaQuerySmall: 'screen and (max-width: 749px)',
            bpSmall: false,
            enableHistoryState: $container.data('enable-history-state') || false,
            imageSize: null,
            imageZoomSize: null,
            namespace: '.slideshow-' + sectionId,
            sectionId: sectionId,
            sliderActive: false,
            zoomEnabled: false
        };

        this.selectors = {
            addToCart: '#AddToCart-' + sectionId,
            addToCartText: '#AddToCartText-' + sectionId,
            comparePrice: '#ComparePrice-' + sectionId,
            originalPrice: '#ProductPrice-' + sectionId,
            SKU: '.variant-sku',
            originalPriceWrapper: '.product-price__price-' + sectionId,
            originalSelectorId: '#ProductSelect-' + sectionId,
            productFeaturedImage: '#FeaturedImage-' + sectionId,
            productImageWrap: '#FeaturedImageZoom-' + sectionId,
            productPrices: '.product-single__price-' + sectionId,
            productThumbImages: '.product-single__thumbnail--' + sectionId,
            productThumbs: '.product-single__thumbnails-' + sectionId,
            saleClasses: 'product-price__sale product-price__sale--single',
            saleLabel: '.product-price__sale-label-' + sectionId,
            singleOptionSelector: '.single-option-selector-' + sectionId
        }

        // Stop parsing if we don't have the product json script tag when loading
        // section in the Theme Editor
        if (!$('#ProductJson-' + sectionId).html()) {
            return;
        }

        this.productSingleObject = JSON.parse(document.getElementById('ProductJson-' + sectionId).innerHTML);

        this.settings.zoomEnabled = $(this.selectors.productFeaturedImage).hasClass('js-zoom-enabled');
        this.settings.imageSize = theme.Images.imageSize($(this.selectors.productFeaturedImage).attr('src'));

        if (this.settings.zoomEnabled) {
            this.settings.imageZoomSize = theme.Images.imageSize($(this.selectors.productImageWrap).data('zoom'));
        }

        this._initBreakpoints();
        this._stringOverrides();
        this._initVariants();
        this._initImageSwitch();
        this._setActiveThumbnail();

        // Pre-loading product images to avoid a lag when a thumbnail is clicked, or
        // when a variant is selected that has a variant image
        theme.Images.preload(this.productSingleObject.images, this.settings.imageSize);
    }

    Product.prototype = _.assignIn({}, Product.prototype, {
        _stringOverrides: function () {
            theme.productStrings = theme.productStrings || {};
            $.extend(theme.strings, theme.productStrings);
        },

        _initBreakpoints: function () {
            var self = this;

            enquire.register(this.settings.mediaQuerySmall, {
                match: function () {
                    // initialize thumbnail slider on mobile if more than three thumbnails
                    if ($(self.selectors.productThumbImages).length > 3) {
                        self._initThumbnailSlider();
                    }

                    // destroy image zooming if enabled
                    if (self.settings.zoomEnabled) {
                        _destroyZoom($(self.selectors.productImageWrap));
                    }

                    self.settings.bpSmall = true;
                },
                unmatch: function () {
                    if (self.settings.sliderActive) {
                        self._destroyThumbnailSlider();
                    }

                    self.settings.bpSmall = false;
                }
            });

            enquire.register(this.settings.mediaQueryMediumUp, {
                match: function () {
                    if (self.settings.zoomEnabled) {
                        _enableZoom($(self.selectors.productImageWrap));
                    }
                }
            });
        },

        _initVariants: function () {
            var options = {
                $container: this.$container,
                enableHistoryState: this.$container.data('enable-history-state') || false,
                singleOptionSelector: this.selectors.singleOptionSelector,
                originalSelectorId: this.selectors.originalSelectorId,
                product: this.productSingleObject
            };

            this.variants = new slate.Variants(options);

            this.$container.on('variantChange' + this.settings.namespace, this._updateAddToCart.bind(this));
            this.$container.on('variantImageChange' + this.settings.namespace, this._updateImages.bind(this));
            this.$container.on('variantPriceChange' + this.settings.namespace, this._updatePrice.bind(this));
            this.$container.on('variantSKUChange' + this.settings.namespace, this._updateSKU.bind(this));
        },

        _initImageSwitch: function () {
            if (!$(this.selectors.productThumbImages).length) {
                return;
            }

            var self = this;

            $(this.selectors.productThumbImages).on('click', function (evt) {
                evt.preventDefault();
                var $el = $(this);
                var imageSrc = $el.attr('href');
                var zoomSrc = $el.data('zoom');

                self._switchImage(imageSrc, zoomSrc);
                self._setActiveThumbnail(imageSrc);
            });
        },

        _setActiveThumbnail: function (src) {
            var activeClass = 'active-thumb';

            // If there is no element passed, find it by the current product image
            if (typeof src === 'undefined') {
                src = $(this.selectors.productFeaturedImage).attr('src');
            }

            // Set active thumbnails (incl. slick cloned thumbs) with matching 'href'
            var $thumbnail = $(this.selectors.productThumbImages + '[href="' + src + '"]');
            $(this.selectors.productThumbImages).removeClass(activeClass);
            $thumbnail.addClass(activeClass);
        },

        _switchImage: function (image, zoomImage) {
            $(this.selectors.productFeaturedImage).attr('src', image);

            // destroy image zooming if enabled
            if (this.settings.zoomEnabled) {
                _destroyZoom($(this.selectors.productImageWrap));
            }

            if (!this.settings.bpSmall && this.settings.zoomEnabled && zoomImage) {
                $(this.selectors.productImageWrap).data('zoom', zoomImage);
                _enableZoom($(this.selectors.productImageWrap));
            }
        },

        _initThumbnailSlider: function () {
            var options = {
                slidesToShow: 4,
                slidesToScroll: 3,
                infinite: false,
                prevArrow: '.thumbnails-slider__prev--' + this.settings.sectionId,
                nextArrow: '.thumbnails-slider__next--' + this.settings.sectionId,
                responsive: [
                    {
                        breakpoint: 321,
                        settings: {
                            slidesToShow: 3
                        }
                    }
                ]
            };

            $(this.selectors.productThumbs).slick(options);
            this.settings.sliderActive = true;
        },

        _destroyThumbnailSlider: function () {
            $(this.selectors.productThumbs).slick('unslick');
            this.settings.sliderActive = false;
        },

        _updateAddToCart: function (evt) {
            var variant = evt.variant;

            if (variant) {
                $(this.selectors.productPrices)
                    .removeClass('visibility-hidden')
                    .attr('aria-hidden', 'true');

                if (variant.available) {
                    $(this.selectors.addToCart).prop('disabled', false);
                    $(this.selectors.addToCartText).text(theme.strings.addToCart);
                } else {
                    // The variant doesn't exist, disable submit button and change the text.
                    // This may be an error or notice that a specific variant is not available.
                    $(this.selectors.addToCart).prop('disabled', true);
                    $(this.selectors.addToCartText).text(theme.strings.soldOut);
                }
            } else {
                $(this.selectors.addToCart).prop('disabled', true);
                $(this.selectors.addToCartText).text(theme.strings.unavailable);
                $(this.selectors.productPrices)
                    .addClass('visibility-hidden')
                    .attr('aria-hidden', 'false');
            }
        },

        _updateImages: function (evt) {
            var variant = evt.variant;
            var sizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageSize);
            var zoomSizedImgUrl;

            if (this.settings.zoomEnabled) {
                zoomSizedImgUrl = theme.Images.getSizedImageUrl(variant.featured_image.src, this.settings.imageZoomSize);
            }

            this._switchImage(sizedImgUrl, zoomSizedImgUrl);
            this._setActiveThumbnail(sizedImgUrl);
        },

        _updatePrice: function (evt) {
            var variant = evt.variant;

            // Update the product price
            $(this.selectors.originalPrice).html(theme.Currency.formatMoney(variant.price, theme.moneyFormat));

            // Update and show the product's compare price if necessary
            if (variant.compare_at_price > variant.price) {
                $(this.selectors.comparePrice)
                    .html(theme.Currency.formatMoney(variant.compare_at_price, theme.moneyFormat))
                    .removeClass('hide');

                $(this.selectors.originalPriceWrapper).addClass(this.selectors.saleClasses);

                $(this.selectors.saleLabel).removeClass('hide');
            } else {
                $(this.selectors.comparePrice).addClass('hide');
                $(this.selectors.saleLabel).addClass('hide');
                $(this.selectors.originalPriceWrapper).removeClass(this.selectors.saleClasses);
            }
        },

        _updateSKU: function (evt) {
            var variant = evt.variant;

            // Update the sku
            $(this.selectors.SKU).html(variant.sku);
        },

        onUnload: function () {
            this.$container.off(this.settings.namespace);
        }
    });

    function _enableZoom($el) {
        var zoomUrl = $el.data('zoom');
        $el.zoom({
            url: zoomUrl
        });
    }

    function _destroyZoom($el) {
        $el.trigger('zoom.destroy');
    }

    return Product;
})();

theme.Quotes = (function () {
    var config = {
        mediaQuerySmall: 'screen and (max-width: 749px)',
        mediaQueryMediumUp: 'screen and (min-width: 750px)',
        slideCount: 0
    };
    var defaults = {
        accessibility: true,
        arrows: false,
        dots: true,
        autoplay: false,
        touchThreshold: 20,
        slidesToShow: 3,
        slidesToScroll: 3
    };

    function Quotes(container) {
        var $container = this.$container = $(container);
        var sectionId = $container.attr('data-section-id');
        var wrapper = this.wrapper = '.quotes-wrapper';
        var slider = this.slider = '#Quotes-' + sectionId;
        var $slider = $(slider, wrapper);

        var sliderActive = false;
        var mobileOptions = $.extend({}, defaults, {
            slidesToShow: 1,
            slidesToScroll: 1,
            adaptiveHeight: true
        });

        config.slideCount = $slider.data('count');

        // Override slidesToShow/Scroll if there are not enough blocks
        if (config.slideCount < defaults.slidesToShow) {
            defaults.slidesToShow = config.slideCount;
            defaults.slidesToScroll = config.slideCount;
        }

        $slider.on('init', this.a11y.bind(this));

        enquire.register(config.mediaQuerySmall, {
            match: function () {
                initSlider($slider, mobileOptions);
            }
        });

        enquire.register(config.mediaQueryMediumUp, {
            match: function () {
                initSlider($slider, defaults);
            }
        });

        function initSlider(sliderObj, args) {
            if (sliderActive) {
                sliderObj.slick('unslick');
                sliderActive = false;
            }

            sliderObj.slick(args);
            sliderActive = true;
        }
    }

    Quotes.prototype = _.assignIn({}, Quotes.prototype, {
        onUnload: function () {
            enquire.unregister(config.mediaQuerySmall);
            enquire.unregister(config.mediaQueryMediumUp);

            $(this.slider, this.wrapper).slick('unslick');
        },

        onBlockSelect: function (evt) {
            // Ignore the cloned version
            var $slide = $('.quotes-slide--' + evt.detail.blockId + ':not(.slick-cloned)');
            var slideIndex = $slide.data('slick-index');

            // Go to selected slide, pause autoplay
            $(this.slider, this.wrapper).slick('slickGoTo', slideIndex);
        },

        a11y: function (event, obj) {
            var $list = obj.$list;
            var $wrapper = $(this.wrapper, this.$container);

            // Remove default Slick aria-live attr until slider is focused
            $list.removeAttr('aria-live');

            // When an element in the slider is focused set aria-live
            $wrapper.on('focusin', function (evt) {
                if ($wrapper.has(evt.target).length) {
                    $list.attr('aria-live', 'polite');
                }
            });

            // Remove aria-live
            $wrapper.on('focusout', function (evt) {
                if ($wrapper.has(evt.target).length) {
                    $list.removeAttr('aria-live');
                }
            });
        }
    });

    return Quotes;
})();

theme.slideshows = {};

theme.SlideshowSection = (function () {
    function SlideshowSection(container) {
        var $container = this.$container = $(container);
        var sectionId = $container.attr('data-section-id');
        var slideshow = this.slideshow = '#Slideshow-' + sectionId;

        $('.slideshow__video', slideshow).each(function () {
            var $el = $(this);
            theme.SlideshowVideo.init($el);
            theme.SlideshowVideo.loadVideo($el.attr('id'));
        });

        theme.slideshows[slideshow] = new theme.Slideshow(slideshow);
    }

    return SlideshowSection;
})();

theme.SlideshowSection.prototype = _.assignIn({}, theme.SlideshowSection.prototype, {
    onUnload: function () {
        delete theme.slideshows[this.slideshow];
    },

    onBlockSelect: function (evt) {
        var $slideshow = $(this.slideshow);

        // Ignore the cloned version
        var $slide = $('.slideshow__slide--' + evt.detail.blockId + ':not(.slick-cloned)');
        var slideIndex = $slide.data('slick-index');

        // Go to selected slide, pause autoplay
        $slideshow.slick('slickGoTo', slideIndex).slick('slickPause');
    },

    onBlockDeselect: function () {
        // Resume autoplay
        $(this.slideshow).slick('slickPlay');
    }
});


$(document).ready(function () {
    var sections = new theme.Sections();

    sections.register('cart-template', theme.Cart);
    sections.register('product', theme.Product);
    sections.register('collection-template', theme.Filters);
    sections.register('product-template', theme.Product);
    sections.register('header-section', theme.HeaderSection);
    sections.register('map', theme.Maps);
    sections.register('slideshow-section', theme.SlideshowSection);
    sections.register('quotes', theme.Quotes);
});

theme.init = function () {
    theme.customerTemplates.init();

    slate.rte.wrapTable();
    slate.rte.iframeReset();

    // Common a11y fixes
    slate.a11y.pageLinkFocus($(window.location.hash));

    $('.in-page-link').on('click', function (evt) {
        slate.a11y.pageLinkFocus($(evt.currentTarget.hash));
    });

    $('a[href="#"]').on('click', function (evt) {
        evt.preventDefault();
    });

};

$(theme.init);

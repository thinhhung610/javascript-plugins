/**
 *  @name superBox
 *  @description superBox plugin
 *  @version 1.0
 *  @options
 *    option
 *  @events
 *    event
 *  @methods
 *    init
 *    publicMethod
 *    destroy
 */
;(function($, window, undefined) {
  var pluginName = 'superBox',
      win = $(window),
      body = $(document.body),
      eventOpenName = 'click.open_' + pluginName,
      eventCloseName = 'click.close_' + pluginName,
      validModal = document.createTextNode('The modal invalid');

  var mergeOptions = function(el, options) {
    var url = el.attr('href') || el.data('href');
    var getUrl = function(url) {
      var opts = {},
          strOpt, arrOpt, arrKeyValue;

      if(url) {
        opts.link = url.match(/^[^\?]+\??/)[0].slice(0, -1);
        strOpt = url.replace(/^[^\?]+\??/, '');
        if(strOpt) {
          arrOpt = strOpt.split(/[;&]/);
          for(var i = arrOpt.length - 1; i >= 0; i--) {
            arrKeyValue = arrOpt[i].split('=');
            if(arrKeyValue && arrKeyValue.length === 2) {
              opts[arrKeyValue[0]] = arrKeyValue[1];
            }
          }
        }
      }
      return opts;
    };

    return $.extend(true, options, getUrl(url));
  };

  var initPopupContainer = function() {
    var popupContainerEl = $('#' + pluginName + '-container');
    if(!popupContainerEl.length) {
      return $('<div id="' + pluginName + '-container">').appendTo(body);
    }
    return popupContainerEl;
  };

  var createPopup = function(content, id, width, height, zindex) {
    var popupContainer = $('<div id="' + id + '" style="z-index:' + zindex + '" class="popup hidden">'),
        popupInner = $('<div class="inner"><a class="popup-close" data-close="">X</a></div>');
    content.addClass('popup-content');
    popupInner.css({
      width: width,
      height: height
    }).append(content);
    return popupContainer.append(popupInner);
  };

  var getAjaxContent = function(modal, url) {
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'html',
      success: function(res) {
        modal.empty().append(res);
      },
      error: function(jqXHR, textStatus) {
        modal.empty().append(validModal);
        console.log(textStatus);
      }
    });
  };

  var getIframeContent = function(modal, url) {
    modal.prop('src', url);
  };

  var initPopup = function(options, container, strAftId) {
    var opacity = options.overlayOpacity,
        popup, content, styleOverlayStr;

    if(options.type === 'ajax') {
      content = $('<div class="ajax-content"><img src="images/loader.gif">');
    } else if(options.type === 'iframe') {
      content = $('<div class="iframe-content"><iframe src="' + options.link + '">');
    } else {
      content = $(options.link).after('<div class="hidden" id="placeholder-' + strAftId + '">').detach() || validModal;
    }

    popup = createPopup(
      content,
      'popup-' + strAftId,
      options.width,
      options.height,
      options.zIndex
    );

    styleOverlayStr = '-moz-opacity: ' + opacity + '; opacity: ' + opacity + '; filter: alpha(opacity='+ opacity * 100 +'); z-index: ' + options.zIndex;
    container.append('<div id="overlay-' + strAftId + '" class="overlay hidden" style="' + styleOverlayStr + '">');

    return popup.appendTo(container);
  };

  var effectPopup = function(el, effect, transition, callback) {
    if(!$.isFunction(callback)) {
      callback = function() {};
    }

    var fadeEffect = function() {
      if(el.hasClass('hidden')) {
        el.removeClass('hidden').stop().fadeIn(transition, callback);
      } else {
        el.stop().fadeOut(transition, callback).addClass('hidden');
      }
    };

    switch(effect) {
      case 'fade':
        fadeEffect();
        break;
      default:
        el.toggleClass('hidden');
        break;
    }
  };

  var processMultiPopup = function(action, optScroll, modal, totalShow) {
    if(optScroll === 'outer') {
      if(action === 'open') {
        body.addClass('overflow');
      } else {
        if(totalShow < 2) {
          body.removeClass('overflow');
        }
      }
    } else {
      modal.toggleClass('overflow-y');
    }
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this,
          el = that.element,
          defaultOpts = that.options,
          opts, modal, closeEl, container, strAftId;

      opts = that.options = mergeOptions(el, defaultOpts);
      container = that.popupContainer = initPopupContainer();
      strAftId = that.strAftId = opts.type + '-' + container.find('.popup').length;

      if(!that.modal) {
        modal = that.modal = initPopup(opts, that.popupContainer, strAftId);
        that.popupOverlay = modal.prev();
      }

      if($.parseJSON(opts.isAutoShow)) { that.open(); }

      el.off(eventOpenName).on(eventOpenName, function(e) {
        e.preventDefault();
        that.open();
      });

      closeEl = modal.find(opts.closeButton);
      if($.parseJSON(opts.isCloseViaOverlay)) {
        closeEl = modal.add(closeEl);
        modal.children().off(eventCloseName).on(eventCloseName, function(e) {
          e.stopPropagation();
        });
      }

      closeEl.off(eventCloseName).on(eventCloseName, function(e) {
        e.preventDefault();
        that.close();
      });

      if($.parseJSON(opts.isReposition)) {
        var eventResizeName = 'resize.' + pluginName + '-' + strAftId;
        win.off(eventResizeName).on(eventResizeName, function() {
          that.reposition();
        });
      }
    },
    open: function() {
      if(this.isOpen) { return; }
      var opts = this.options,
          modal = this.modal,
          el = modal,
          totalShowPopup = this.popupContainer.find('.popup').not(':hidden').length;

      if($.isFunction(opts.beforeOpen)) {
        opts.beforeOpen();
      }

      if($.parseJSON(opts.isOverlay)) {
        el = el.add(this.popupOverlay);
      }

      if(totalShowPopup) {
        var zIndex = el.css('zIndex');
        el.css('zIndex', (zIndex !== 'auto' ? parseInt(zIndex) : 0) + 1);
      } else {
        if(opts.height > win.height()) {
          body.addClass('overflow');
        } else {
          body.removeClass('overflow');
        }
      }

      if(opts.type === 'ajax') {
        getAjaxContent(modal.find('.ajax-content'), opts.link);
      } else if(opts.type === 'iframe') {
        getIframeContent(modal.find('iframe'), opts.link);
      }

      processMultiPopup('open', opts.scroll, modal.children(), totalShowPopup);
      effectPopup(el, opts.effect, opts.transition, opts.afterOpen);
      this.isOpen = true;
      this.reposition();
    },
    close: function() {
      if(!this.isOpen) { return; }
      var opts = this.options,
          modal = this.modal,
          el = modal,
          totalShowPopup = this.popupContainer.find('.popup').not(':hidden').length;

      if($.isFunction(opts.beforeClose)) {
        opts.beforeClose();
      }

      if($.parseJSON(opts.isOverlay)) {
        el = el.add(this.popupOverlay);
      }

      effectPopup(el, opts.effect, opts.transition, opts.afterClose);
      processMultiPopup('close', opts.scroll, modal.children(), totalShowPopup);
      this.isOpen = false;
    },
    reposition: function() {
      if(!this.isOpen) { return; }
      var opts = this.options,
          modal = this.modal.children(),
          content = modal.find('.popup-content'),
          top = 0,
          left = 0,
          pos;

      try {
        pos = $.parseJSON(opts.position);
      } catch(err) {
        pos = opts.position;
      }

      if($.isArray(pos) && pos.length) {
        top = pos[0] || top;
        left = pos[1] || left;
      } else {
        var modalH = modal.outerHeight(),
            modalW = modal.outerWidth();
        top = Math.max(0, (win.height() - modalH) / 2);
        left = Math.max(0, (win.width() - modalW) / 2);
      }

      if(content.height() + top > win.height()) {
        content.css('marginBottom', top);
      }

      modal.css({
        top: top,
        left: left
      });
    },
    destroy: function() {
      var el = this.element,
          opts = this.options,
          strAftId = this.strAftId;

      if($.parseJSON(opts.isReposition)) {
        win.off('resize.' + pluginName + '-' + strAftId);
      }

      if(opts.type === 'inline') {
        var placeholderEl = $('#placeholder-' + strAftId);
        $(opts.link).insertAfter(placeholderEl);
        placeholderEl.remove();
      }

      this.popupOverlay.remove();
      this.modal.remove();
      el.off(eventOpenName);
      $.removeData(el[0], pluginName);
    }
  };

  $.fn[pluginName] = function(options, params) {
    return this.each(function() {
      var instance = $.data(this, pluginName);
      if (!instance) {
        $.data(this, pluginName, new Plugin(this, options));
      } else if (instance[options]) {
        instance[options](params);
      } else {
        window.console && console.log(options ? options + ' method is not exists in ' + pluginName : pluginName + ' plugin has been initialized');
      }
    });
  };

  $.fn[pluginName].defaults = {
    width: 600,
    height: 600,
    zIndex: 9999,
    type: 'inline', // 'ajax' | 'iframe'
    scroll: 'inner', // 'inner' | 'outer'
    position: 'center', // 'center' | [top, left]
    effect: 'fade',
    transition: 500,
    closeButton: '[data-close]',
    isOverlay: true,
    overlayOpacity: 0.6,
    isReposition: true,
    isAutoShow: false,
    isCloseViaOverlay: true,
    beforeOpen: function() {},
    afterOpen: function() {},
    beforeClose: function() {},
    afterClose: function() {}
  };

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]();
  });

}(jQuery, window));

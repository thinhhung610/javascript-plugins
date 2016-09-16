/**
 *  @name slideshow
 *  @description description
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
  var pluginName = 'slideshow',
      win = $(window),
      doc = $(document);

  var updatePreview = function(element) {
    var preview = $(document.createElement('div')).addClass('preview'),
        wrap = $(document.createElement('div')).addClass('wrap overflow');
    var listSlide = element.find('li');
    var length = listSlide.length,
        i = 0;

    for(; i < length; i++) {
      listSlide[i].dataset.slide = i;
      listSlide[i].className = 'slide slide-' + i +
      (i === 0 ? ' first active' : '') +
      (i === length - 1 ? ' last' : '');
    }
    element.append(listSlide);
    wrap.append(element);
    preview.append(wrap);

    return preview;
  };

  var updateControls = function() {
    var controls = document.createElement('div'),
        ul = document.createElement('ul'),
        liNext = document.createElement('li'),
        liPrev = document.createElement('li'),
        aNext = document.createElement('a'),
        aPrev = document.createElement('a');

    aNext.appendChild(document.createTextNode('Next'));
    aPrev.appendChild(document.createTextNode('Prev'));
    liNext.className = 'next';
    liNext.appendChild(aNext);
    liPrev.className = 'prev';
    liPrev.appendChild(aPrev);
    ul.appendChild(liPrev);
    ul.appendChild(liNext);
    controls.className = 'controls';
    controls.appendChild(ul);

    return controls;
  };

  var slideEffect = function(element, type, effect, speed, callback) {
    var newElement,
        parentElement = element.parent(),
        slidePostition;

    if(type === 'next') {
      if(element.hasClass('last')) {
        newElement = parentElement.find('.first');
      } else {
        newElement = element.next();
      }
    }
    else if(type === 'prev') {
      if(element.hasClass('first')) {
        newElement = parentElement.find('.last');
      } else {
        newElement = element.prev();
      }
    }

    slidePostition = parseInt(newElement.data('slide'));

    switch(effect) {
      case 'horizontal':
        element.removeClass('active');
        newElement.addClass('active');
        parentElement.stop().animate({'left': '-' + slidePostition * 100 + '%'}, speed, callback);
        break;
      case 'vertical':
        element.removeClass('active');
        newElement.addClass('active');
        parentElement.stop().animate({'top': '-' + slidePostition * 100 + '%'}, speed, callback);
        break;
      default:
        element.stop().fadeOut(speed).removeClass('active');
        newElement.stop().fadeIn(speed, callback).addClass('active');
        break;
    }
  };

  var configStyle = function(element, options) {
    var wrapSlide = element.find('.wrap'),
        ulSlide = wrapSlide.find('ul'),
        slides = ulSlide.find('li'),
        totalSlide = slides.length;

    switch(options.effect) {
      case 'horizontal':
        wrapSlide.width(options.width);
        slides.width(options.width);
        ulSlide.css({
          'width': options.width * totalSlide,
          'height': options.height
        });
        break;
      case 'vertical':
        wrapSlide.height(options.height);
        slides.height(options.height);
        ulSlide.css({
          'width': options.width,
          'height': options.height * totalSlide
        });
        break;
      default:
        ulSlide.css({
          'width': options.width,
          'height': options.height
        });
        break;
    }
    ulSlide.addClass('list-slide slide-' + options.effect);
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
          options = that.options;

      that.setup();

      if(options.auto) {
        that.play();
      }
    },
    setup: function () {
      if(this.isSetup) { return; }

      var that = this,
          el = that.element,
          options = that.options;
      var listSlide = el.prop('tagName') === 'UL' ? el : el.find('ul');
      var parentListSlide = listSlide.parent();
      var newListSlide;

      listSlide.remove();
      newListSlide = updatePreview(listSlide);
      configStyle(newListSlide, options);
      parentListSlide.append(newListSlide);

      if(options.control) {
        var listControl;

        that.controls = updateControls();
        listControl = that.controls.getElementsByTagName('li');

        listControl[0].getElementsByTagName('a')[0].onclick = function() {
          that.prev();
        };
        listControl[1].getElementsByTagName('a')[0].onclick = function() {
          that.next();
        };
        parentListSlide.append(that.controls);
      }

      that.isSetup = true;
    },
    play: function() {
      if(this.isPlay) { return; }

      var that = this,
          options = that.options;

      that.interval = setInterval(function() {
        that.next();
      }, options.pause);

      that.isPlay = true;
    },
    pause: function() {
      if(!this.isPlay) { return; }

      var that = this,
          options = that.options;

      window.clearInterval(that.interval);
      that.isPlay = false;
    },
    next: function() {
      var el = this.element,
          options = this.options;
      slideEffect(el.find('.active'), 'next', options.effect, options.speed, options.onAfterNext());
    },
    prev: function() {
      var el = this.element,
          options = this.options;
      slideEffect(el.find('.active'), 'prev', options.effect, options.speed, options.onAfterPrev());
    },
    destroy: function() {
      var controls = $(this.controls);

      window.clearInterval(this.interval);
      controls.find('a').off('click');
      controls.remove();
      $.removeData(this.element[0], pluginName);
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
    effect: 'horizontal',
    speed: 400,
    pause: 3000,
    height: 225,
    width: 960,
    control: true,
    auto: true,
    onAfterNext: function(){},
    onAfterPrev: function(){}
  };

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]();
  });

}(jQuery, window));

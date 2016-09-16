/**
 *  @name Validation
 *  @description plugin validate form
 *  @version 1.0
 *  @options
 *    option
 *  @events
 *    event
 *  @methods
 *    init
 *    validate
 *    destroy
 */
;(function($, window, undefined) {
  var pluginName = 'validation';

  /**
   * [getOptions : get data value from element
   * @param  {[Object]} data
   * @return {[Object]}
   */
  var getOptions = function(data) {
    var options = {};

    /**
     * [parseOptions : process data from element ]
     * @param  {[String]} optionKey
     * @param  {[String]} optionData
     * @return {[Object]}
     */
    var parseOptions = function(optionKey, optionData) {
      var options = {};

      if(/^(messages)/gi.test(optionKey)) {
        var objMessage = {},
            messageOption = 'messages',
            messageRule = optionKey.split(messageOption)[1];
        objMessage[messageRule.toLowerCase()] = optionData;
        options[messageOption] = objMessage;
      }
      else if(optionKey === 'rules') {
        var objRules = {},
            ruleArray = optionData.split(','),
            ruleArrayLength = ruleArray.length,
            i;

        for(i = 0; i < ruleArrayLength; i++) {
          var ruleValue = ruleArray[i].trim();
          objRules[ruleValue] = ruleValue;
          options[optionKey] = objRules;
        }
      }

      return options;
    };

    for(var key in data) {
      options = $.extend(true, options, parseOptions(key, data[key]));
    }

    return options;
  };

  /**
   * [getAttributeOptions : get options from element attribute]
   * @param  {[Object]} element
   * @return {[Object]}
   */
  var getAttributeOptions = function(element) {
    var el = $(element),
        options = {}, rules = {},
        type = element.type;

    if(/^(email|url|number)$/.test(type)) {
      rules[type] = type;
    }

    if(el.attr('minlength')) {
      rules['minlength'] = 'minlength';
    }

    if(el.attr('required')) {
      rules['required'] = 'required';
    }

    options.rules = rules;

    return options;
  };

  /**
   * [setTagRule : initialize validate event for Tag element]
   * @param {[Object]} element
   * @param {[Object]} options
   */
  var setTagRule = function(element, options) {
    $(element).change(function() {
      isCheckTagRule(element, options);
    });
  };

  /**
   * [isCheckTagRule : ]
   * @param  {[type]}  element [description]
   * @param  {[type]}  options [description]
   * @return {Boolean}         [description]
   */
  var isCheckTagRule = function(element, options) {
    var elValue = element.value.replace(/\s+/g, '');

    for(var rule in options.rules) {
      var errorMessage;

      removeErrorMessage(element);

      if(rule !== "minlength") {
        if(!isCheckRules(rule, elValue)) {
          errorMessage = options.messages ? (options.messages[rule] || L10n.messages[rule])
                                          : L10n.messages[rule];
          addErrorMessage(element, errorMessage);
          return false;
        }
      }
      else {
        var minLength = $(element).attr('minlength'),
            currentLength = elValue.length;

        if(currentLength < minLength && currentLength !== 0) {
          errorMessage = options.messages ? (options.messages[rule] || L10n.messages[rule])
                                          : L10n.messages.minLength + minLength + L10n.messages.characters;
          addErrorMessage(element, errorMessage);
          return false;
        }
      }
    }

    return true;
  };

  /**
   * [isCheckRules : check rule email, url and required for Tag]
   * @param  {[String]}  rule
   * @param  {[String]}  value
   * @return {Boolean}
   */
  var isCheckRules = function(rule, value) {
    if(value) {
      if(rule === "email" && !isValidEmail(value)) {
        return false;
      }
      else if(rule === "url" && !isValidUrl(value)) {
        return false;
      }
      else if(rule === "number" && !isValidNumber(value)) {
        return false;
      }
    }
    else if(rule === "required") {
      return false;
    }

    return true;
  };

  /**
   * addErrorMessage : Append error message for validate field
   * @param {Object} element
   * @param {String} message
   * @param {String} position ['after' (default) or 'before']
   */
  var addErrorMessage = function(element, message, position) {
    var el = $(element);
    position = position || 'after';
    el.addClass('field-error');
    el[position]('<span class="message error">' + message + '</span>');
  };

  /**
   * removeErrorMessage : Remove error mesage
   * @param  {Object} element
   * @return {Void}
   */
  var removeErrorMessage = function(element) {
    $(element).removeClass('field-error').next('.error').remove();
  };

  /**
   * isValidEmail : Check email format
   * @param  {String}  email
   * @return {Boolean}
   */
  var isValidEmail = function(email) {
    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
  };

  /**
   * [isValidUrl : Check url format]
   * @param  {[String]}  url
   * @return {Boolean}
   */
  var isValidUrl = function(url) {
    return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(url);
  };

  /**
   * [isValidNumber : Check number value]
   * @param  {[String]}  number
   * @return {Boolean}
   */
  var isValidNumber = function(number) {
    return /^\d+$/.test(number);
  };

  function Plugin(element, options) {
    this.element = $(element);
    this.options = $.extend({}, $.fn[pluginName].defaults, options);
    this.init();
  }

  Plugin.prototype = {
    init: function() {
      var that = this,
          form = that.element;

      that.validate();

      form.submit(function(event) {
        if(!that.validate('submit')) {
          return false;
        }
      });
    },
    validate: function(params) {
      var that = this,
          form = that.element,
          tags = 'input, select, textarea';

      form.find(tags).each(function(index) {
        if(!/^(submit|button)$/.test(this.type)) {
          var options = $.extend(
            true,
            getAttributeOptions(this),
            getOptions(this.dataset),
            getOptions(that.options[this.name])
          );

          if(params === "submit") {
            if(!isCheckTagRule(this, options)) {
              return false;
            }
          }
          else {
            setTagRule(this, options);
            return false;
          }
        }
      });

      return true;
    },
    destroy: function() {
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
        window.console && console.log(
          options ? options + ' method is not exists in ' + pluginName
                  : pluginName + ' plugin has been initialized'
        );
      }
    });
  };

  /**
   * [default options]
   * @type {Object}
   * {
   *   fieldName (name of field is validate) : {
   *     rules: @type {String} (required, email, url, minlength),
   *     messages(+Rule): @type {String}
   *   }
   * }
   * eg:
   * {
   *   newsletter : {
   *     rules: 'required, email',
   *     messagesRequired: 'This field is required.',
   *     messageEmail: 'Please enter a valid email address.'
   *   }
   * }
   */
  $.fn[pluginName].defaults = {};

  $(function() {
    $('[data-' + pluginName + ']')[pluginName]();
  });

}(jQuery, window));

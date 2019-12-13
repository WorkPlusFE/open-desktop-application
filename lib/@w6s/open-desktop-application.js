/*!
 * @w6s/open-desktop-application.js v1.0.0
 * (c) 2019 WorkPlusFE
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.openDesktopApplication = factory());
}(this, (function () { 'use strict';

    function _registerEvent(target, eventType, cb) {
      if (target.addEventListener) {
        target.addEventListener(eventType, cb);
        return {
          remove: function () {
            target.removeEventListener(eventType, cb);
          }
        };
      } else {
        target.attachEvent(eventType, cb);
        return {
          remove: function () {
            target.detachEvent(eventType, cb);
          }
        };
      }
    }

    function _createHiddenIframe(target, uri) {
      var iframe = document.createElement("iframe");
      iframe.src = uri;
      iframe.id = "hiddenIframe";
      iframe.style.display = "none";
      target.appendChild(iframe);
      return iframe;
    }

    function openUriWithHiddenFrame(uri, failCb, successCb) {
      var timeout = setTimeout(function () {
        failCb();
        handler.remove();
      }, 1000);
      var iframe = document.querySelector("#hiddenIframe");

      if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
      }

      var handler = _registerEvent(window, "blur", onBlur);

      function onBlur() {
        clearTimeout(timeout);
        handler.remove();
        successCb();
      }

      iframe.contentWindow.location.href = uri;
    }

    function openUriWithTimeoutHack(uri, failCb, successCb) {
      var timeout = setTimeout(function () {
        failCb();
        handler.remove();
      }, 1000); //handle page running in an iframe (blur must be registered with top level window)

      var target = window;

      while (target != target.parent) {
        target = target.parent;
      }

      var handler = _registerEvent(target, "blur", onBlur);

      function onBlur() {
        clearTimeout(timeout);
        handler.remove();
        successCb();
      }

      window.location = uri;
    }

    function openUriUsingFirefox(uri, failCb, successCb) {
      var iframe = document.querySelector("#hiddenIframe");

      if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
      }

      try {
        iframe.contentWindow.location.href = uri;
        successCb();
      } catch (e) {
        if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") {
          failCb();
        }
      }
    }

    function openUriUsingIEInOlderWindows(uri, failCb, successCb) {
      if (getInternetExplorerVersion() === 10) {
        openUriUsingIE10InWindows7(uri, failCb, successCb);
      } else if (getInternetExplorerVersion() === 9 || getInternetExplorerVersion() === 11) {
        openUriWithHiddenFrame(uri, failCb, successCb);
      } else {
        openUriInNewWindowHack(uri, failCb, successCb);
      }
    }

    function openUriUsingIE10InWindows7(uri, failCb, successCb) {
      var timeout = setTimeout(failCb, 1000);
      window.addEventListener("blur", function () {
        clearTimeout(timeout);
        successCb();
      });
      var iframe = document.querySelector("#hiddenIframe");

      if (!iframe) {
        iframe = _createHiddenIframe(document.body, "about:blank");
      }

      try {
        iframe.contentWindow.location.href = uri;
      } catch (e) {
        failCb();
        clearTimeout(timeout);
      }
    }

    function openUriInNewWindowHack(uri, failCb, successCb) {
      var myWindow = window.open('', '', 'width=0,height=0');
      myWindow.document.write("<iframe src='" + uri + "'></iframe>");
      setTimeout(function () {
        try {
          myWindow.location.href;
          myWindow.setTimeout("window.close()", 1000);
          successCb();
        } catch (e) {
          myWindow.close();
          failCb();
        }
      }, 1000);
    }

    function openUriWithMsLaunchUri(uri, failCb, successCb) {
      navigator.msLaunchUri(uri, successCb, failCb);
    }

    function checkBrowser() {
      var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
      var ua = navigator.userAgent.toLowerCase();
      return {
        isOpera: isOpera,
        isFirefox: typeof InstallTrigger !== 'undefined',
        isSafari: ~ua.indexOf('safari') && !~ua.indexOf('chrome') || Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        isChrome: !!window.chrome && !isOpera,
        isIE:
        /*@cc_on!@*/
         !!document.documentMode // At least IE6

      };
    }

    function getInternetExplorerVersion() {
      var rv = -1;

      if (navigator.appName === "Microsoft Internet Explorer") {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null) rv = parseFloat(RegExp.$1);
      } else if (navigator.appName === "Netscape") {
        var ua = navigator.userAgent;
        var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");

        if (re.exec(ua) != null) {
          rv = parseFloat(RegExp.$1);
        }
      }

      return rv;
    }

    var customProtocolDetection = function (uri, failCb, successCb, unsupportedCb) {
      function failCallback() {
        failCb && failCb();
      }

      function successCallback() {
        successCb && successCb();
      }

      if (navigator.msLaunchUri) {
        //for IE and Edge in Win 8 and Win 10
        openUriWithMsLaunchUri(uri, failCb, successCb);
      } else {
        var browser = checkBrowser();

        if (browser.isFirefox) {
          openUriUsingFirefox(uri, failCallback, successCallback);
        } else if (browser.isChrome || browser.isIOS) {
          openUriWithTimeoutHack(uri, failCallback, successCallback);
        } else if (browser.isIE) {
          openUriUsingIEInOlderWindows(uri, failCallback, successCallback);
        } else if (browser.isSafari) {
          openUriWithHiddenFrame(uri, failCallback, successCallback);
        } else {
          unsupportedCb(); //not supported, implement please
        }
      }
    };

    /**
     * Copyright (c) 2013-present, Facebook, Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */
    /**
     * Use invariant() to assert state which your program assumes to be true.
     *
     * Provide sprintf-style format (only %s is supported) and arguments
     * to provide information about what broke and what you were
     * expecting.
     *
     * The invariant message will be stripped in production, but the invariant
     * will remain to ensure logic does not differ in production.
     */

    var NODE_ENV = process.env.NODE_ENV;

    var invariant = function (condition, format, a, b, c, d, e, f) {
      if (NODE_ENV !== 'production') {
        if (format === undefined) {
          throw new Error('invariant requires an error message argument');
        }
      }

      if (!condition) {
        var error;

        if (format === undefined) {
          error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
        } else {
          var args = [a, b, c, d, e, f];
          var argIndex = 0;
          error = new Error(format.replace(/%s/g, function () {
            return args[argIndex++];
          }));
          error.name = 'Invariant Violation';
        }

        error.framesToPop = 1; // we don't care about invariant's own frame

        throw error;
      }
    };

    var invariant_1 = invariant;

    /*!
     * @w6s/query-string.js v1.2.1
     * (c) 2019 Hejx
     * Released under the MIT License.
     * https://github.com/WorkPlusFE/workplus-query-string#readme
     */

    var stringify = function stringify() {
      var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return Object.keys(obj).sort().map(function (key) {
        var val = obj[key];

        if (val === undefined || val === null) {
          val = '';
        }

        return key + '=' + val;
      }).join('&');
    };

    /**
     * lodash 4.0.1 (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright 2012-2016 The Dojo Foundation <http://dojofoundation.org/>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright 2009-2016 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     * Available under MIT license <https://lodash.com/license>
     */

    /** `Object#toString` result references. */
    var stringTag = '[object String]';
    /** Used for built-in method references. */

    var objectProto = Object.prototype;
    /**
     * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
     * of values.
     */

    var objectToString = objectProto.toString;
    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */

    var isArray = Array.isArray;
    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */

    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }
    /**
     * Checks if `value` is classified as a `String` primitive or object.
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
     * @example
     *
     * _.isString('abc');
     * // => true
     *
     * _.isString(1);
     * // => false
     */


    function isString(value) {
      return typeof value == 'string' || !isArray(value) && isObjectLike(value) && objectToString.call(value) == stringTag;
    }

    var lodash_isstring = isString;

    /**
     * lodash 3.0.2 (Custom Build) <https://lodash.com/>
     * Build: `lodash modern modularize exports="npm" -o ./`
     * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     * Available under MIT license <https://lodash.com/license>
     */

    /**
     * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // Avoid a V8 JIT bug in Chrome 19-20.
      // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    var lodash_isobject = isObject;

    /**
     * open-desktop-application
     *
     * @param object { protocol, action, query, fail, success }
     * 
     * protocol: string (eg, workplus)
     * action: string (eg, joinchat)
     * query: object (eg, { id: 1, name: 'test' })
     * fail: function
     * success: function
     *  
     * return => workplus://joinchat/?id=1&name=test
     */

    function openDesktopApplication(params) {
      try {
        var protocol = params.protocol,
            action = params.action,
            query = params.query,
            fail = params.fail,
            success = params.success;
        invariant_1(lodash_isstring(protocol), '[protocol] Must be a non-empty string');
        invariant_1(lodash_isstring(action), '[action] Must be a non-empty string');
        var openUri = "".concat(protocol, "://").concat(action);

        if (lodash_isobject(query)) {
          openUri += "?".concat(stringify(query));
        }

        customProtocolDetection(openUri, function failCb(e) {
          lodash_isstring(fail) && fail(e);
        }, function successCb() {
          lodash_isstring(success) && success();
        }, function unsupportedCb() {
          lodash_isstring(fail) && fail({
            supported: false
          });
        });
      } catch (error) {
        console.log(error);
      }
    }

    return openDesktopApplication;

})));

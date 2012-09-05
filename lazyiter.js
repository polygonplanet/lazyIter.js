/*
 * lazyIter.js - JavaScript asynchronous lazy loops.
 *
 * These iterators are the minimum version of Pot.js's iterators.
 * Pot.js : http://polygonplanet.github.com/Pot.js/
 *
 * Version 1.03, 2012-09-06
 * Copyright (c) 2012 polygon planet <polygon.planet.aqua@gmail.com>
 * Dual licensed under the MIT or GPL v2 licenses.
 */
/*
 * Usage:
 *   -------------------------------------------------------------------------
 *   // forEach:
 *   //
 *   // lazyIter.forEach(object, func, callback [, speed [, context]])
 *
 *   // Array.
 *   lazyIter.forEach(['a', 'b', 'c'], function(val, i) {
 *     console.log(i + ':' + val);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   '0:a'
 *   //   '1:b'
 *   //   '2:c'
 *   //   'End loop'
 *
 *   // Object.
 *   lazyIter.forEach({a: 1, b: 2, c: 3}, function(val, key) {
 *     console.log(key + ':' + val);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   'a:1'
 *   //   'b:2'
 *   //   'c:3'
 *   //   'End loop'
 *   -------------------------------------------------------------------------
 *   // repeat:
 *   //
 *   // lazyIter.repeat(max, func, callback [, speed [, context]])
 *
 *   // Specify as number.
 *   lazyIter.repeat(10, function(i) {
 *     console.log(i);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   0
 *   //   1
 *   //   ...
 *   //   9
 *   //   'End loop'
 *
 *   // Specify first, step and end number like for statement.
 *   lazyIter.repeat({begin: 0, step: 5, end: 30}, function(i) {
 *     console.log(i);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   0
 *   //   5
 *   //   10
 *   //   15
 *   //   20
 *   //   25
 *   //   'End loop'
 *   -------------------------------------------------------------------------
 *   // forEver:
 *   //
 *   // lazyIter.forEver(func, callback [, speed [, context]])
 *
 *   var end = 10;
 *   lazyIter.forEver(function(i) {
 *     if (i === end) {
 *       throw lazyIter.StopIteration;
 *     }
 *     console.log(i);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   0
 *   //   1
 *   //   ...
 *   //   9
 *   //   'End loop'
 *
 * You can stop each iterations by "throw lazyIter.StopIteration;".
 * An argument "context" will be used as "this" in callback function.
 * You can specify iteration "speed" by following types:
 *   - 'ninja'  : fastest
 *   - 'rapid'  : faster
 *   - 'fast'   : fast
 *   - 'normal' : normal (default)
 *   - 'slow'   : slowly
 *   - 'doze'   : more slowly
 *   - 'limp'   : most slowly
 *
 * Speed example:
 *
 *   lazyIter.forEach(['a', 'b', 'c'], function(val, i) {
 *     console.log(i + ':' + val);
 *   }, function() {
 *     console.log('End loop');
 *   }, 'slow');
 *   // result:
 *   //   '0:a'
 *   //   '1:b'
 *   //   '2:c'
 *   //   'End loop'
 *
 *   //
 *   // or
 *   //
 *   // lazyIter.[method].[speed](object, func, callback [, context])
 *   //
 *
 *   lazyIter.forEach.slow(['a', 'b', 'c'], function(val, i) {
 *     console.log(i + ':' + val);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   '0:a'
 *   //   '1:b'
 *   //   '2:c'
 *   //   'End loop'
 *
 *   lazyIter.repeat.fast(10, function(i) {
 *     console.log(i);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   0
 *   //   1
 *   //   ...
 *   //   9
 *   //   'End loop'
 *
 *   var end = 10;
 *   lazyIter.forEver.ninja(function(i) {
 *     if (i === end) {
 *       throw lazyIter.StopIteration;
 *     }
 *     console.log(i);
 *   }, function() {
 *     console.log('End loop');
 *   });
 *   // result:
 *   //   0
 *   //   1
 *   //   ...
 *   //   9
 *   //   'End loop'
 *
 *
 * Test fiddle: http://jsfiddle.net/polygonplanet/JLT2r/
 */
;(function(lazyIter, globals) {
  'use strict';

  // Export the lazyIter object for Node.js and CommonJS.
  if (typeof exports !== 'undefined' && exports) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = lazyIter;
    }
    exports.lazyIter = lazyIter;
  } else if (typeof define === 'function' && define.amd) {
    // for AMD.
    define('lazyiter', function() {
      return lazyIter;
    });
  } else {
    (globals || Function('return this;')() || {}).lazyIter = lazyIter;
  }

}(function() {
  'use strict';

  var
  toString = Object.prototype.toString,
  hasOwn = Object.prototype.hasOwnProperty,
  isArray = function(o) {
    return (o && o.isArray) || toString.call(o) === '[object Array]';
  },
  isNumeric = function(n) {
    return (n == null ||
           (n === ''  ||
           (n ==  ''  && n && n.constructor === String)) ||
           (typeof n === 'object' && n.constructor !== Number)) ?
            false : !isNaN(n - 0);
  },
  isNodeJS = function() {
    if (typeof process !== 'undefined' && process && process.version &&
        typeof require === 'function' &&
        (typeof exports === 'object' ||
        (typeof module === 'object' && typeof module.exports === 'object'))
    ) {
      return true;
    }
    return false;
  }(),
  // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Object/keys
  getKeys = function() {
    var hasDontEnumBug = !({toString : null})
                       .propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function(object) {
      var results = [], type = typeof object, p, i;

      if (type === 'object' || type === 'function') {
        if (Object.keys) {
          return Object.keys(object);
        }

        for (p in object) {
          if (hasOwn.call(object, p)) {
            results[results.length] = p;
          }
        }

        if (hasDontEnumBug) {
          for (i = 0; i < dontEnumsLength; i++) {
            if (hasOwn.call(object, dontEnums[i])) {
              results[results.length] = dontEnums[i];
            }
          }
        }
      }
      return results;
    };
  }(),

  lazyIter = {
    stop : {},
    forEach : function(object, func, callback, speed, context) {
      lazyLoop.exec(lazyLoop.forEach(object, func, context), speed, callback);
    },
    repeat : function(max, func, callback, speed, context) {
      lazyLoop.exec(lazyLoop.repeat(max, func, context), speed, callback);
    },
    forEver : function(func, callback, speed, context) {
      lazyLoop.exec(lazyLoop.forEver(func, context), speed, callback);
    }
  },

  lazyLoop = {
    stop : lazyIter.stop,
    speeds : {
      limp   : -1,
      doze   :  0,
      slow   :  2,
      normal :  5,
      fast   : 12,
      rapid  : 36,
      ninja  : 60
    },
    delays : {
      limp   : 1000,
      doze   :  100,
      slow   :   13,
      normal :    0,
      fast   :    0,
      rapid  :    0,
      ninja  :    0
    },
    interval : 5,
    exec : function(iter, speed, callback) {
      var that = this, end, interval = this.interval,
          time = {
            start : +new Date(),
            loop  : null,
            diff  : null,
            risk  : null,
            axis  : null,
            rest  : 100
          };

      if (speed != null) {
        if (typeof speed === 'string' && speed in this.speeds) {
          interval = this.speeds[speed];
        } else if (isNumeric(speed)) {
          interval = speed - 0;
        }
      }

      callLazy.flush(function revback() {
        var cutback, done, delay = 0;

        time.loop = +new Date();

        do {
          try {
            iter.next();
          } catch (e) {
            if (e === that.stop) {
              end = true;
              break;
            }
            throw e;
          }

          done = +new Date();
          time.risk = done - time.start;
          time.diff = done - time.loop;

          if (time.diff >= interval) {
            if (interval < that.speeds.normal) {
              cutback = true;
            } else {
              if (time.diff < interval + 8) {
                time.axis = 2;
              } else if (time.diff < interval + 36) {
                time.axis = 5;
              } else if (time.diff < interval + 48) {
                time.axis = 7;
              } else {
                time.axis = 10;
              }

              if (time.axis >= 10 || Math.random() * 10 < time.axis) {
                cutback = true;
              }
            }
          }
        } while (!cutback);

        if (end) {
          callback && callback();
        } else {
          if (Math.random() * 10 < Math.max(2, (time.axis || 2) / 2.75)) {
            delay += Math.min(
              time.rest,
              Math.max(1,
                Math.ceil(
                  (time.risk / (time.rest + time.diff)) + time.diff
                )
              )
            );
          }
          if (delay) {
            setTimeout(revback, delay);
          } else {
            callLazy.flush(revback);
          }
        }
      });
    },
    forEach : function(object, callback, context) {
      var that = this, i = 0, len, keys;

      if (isArray(object)) {
        return {
          next : function() {
            while (true) {
              if (i >= object.length) {
                throw that.stop;
              }
              if (!(i in object)) {
                i++;
                continue;
              }
              callback.call(context, object[i], i, object);
              return i++;
            }
          }
        };
      } else {
        keys = getKeys(object);
        len = keys.length;

        return {
          next : function() {
            var key;
            if (i >= len) {
              throw that.stop;
            }
            key = keys[i];
            callback.call(context, object[key], key, object);
            i++;
          }
        };
      }
    },
    repeat : function(max, callback, context) {
      var that = this, i, loops, n, last;

      if (!max || max == null) {
        n = 0;
      } else if (isNumeric(max)) {
        n = max - 0;
      } else {
        n = max || {};
        if (isNumeric(n.start)) {
          n.begin = n.start;
        }
        if (isNumeric(n.stop - 0)) {
          n.end = n.stop;
        }
      }
      loops = {
        begin : isNumeric(n.begin) ? n.begin - 0 : 0,
        end   : isNumeric(n.end)   ? n.end   - 0 : (n || 0) - 0,
        step  : isNumeric(n.step)  ? n.step  - 0 : 1,
        last  : false,
        prev  : null
      };
      i = loops.step ? loops.begin : loops.end;
      last = loops.end - loops.step;
      return {
        next : function() {
          if (i < loops.end) {
            loops.last = (i >= last);
            loops.prev = callback.call(context, i, loops.last, loops);
          } else {
            throw that.stop;
          }
          i += loops.step;
        }
      };
    },
    forEver : function(callback, context) {
      var i = 0;

      return {
        next : function() {
          callback.call(context, i);
          try {
            if (!isFinite(++i) || i >= Number.MAX_VALUE) {
              throw 0;
            }
          } catch (e) {
            i = 0;
          }
        }
      };
    }
  },

  addSpeeds = function(type) {
    var key;

    for (key in lazyLoop.speeds) {
      void function(speed) {
        var method;

        if (type === 'forEver') {
          method = function(func, callback, context) {
            return lazyIter[type](func, callback, speed, context);
          };
        } else {
          method = function(val, func, callback, context) {
            return lazyIter[type](val, func, callback, speed, context);
          };
        }
        lazyIter[type][speed] = method;
      }(key);
    }
    return addSpeeds;
  },

  callLazy = {
    flush : function(callback) {
      (this.byEvent || this.byTick || this.byTimer)(callback);
    },
    byEvent : function() {
      var IMAGE;

      if (isNodeJS ||
          typeof window !== 'object'  || typeof document !== 'object' ||
          typeof Image !== 'function' || window.opera ||
          typeof document.addEventListener !== 'function'
      ) {
        return false;
      }

      try {
        if (typeof new Image().addEventListener !== 'function') {
          return false;
        }
      } catch (e) {
        return false;
      }

      // Dummy 1x1 gif image.
      IMAGE = 'data:image/gif;base64,' +
              'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

      return function(callback) {
        var done, handler, img = new Image();

        handler = function() {
          try {
            img.removeEventListener('load', handler, false);
            img.removeEventListener('error', handler, false);
          } catch (e) {}
          if (!done) {
            done = true;
            callback();
          }
        };
        img.addEventListener('load', handler, false);
        img.addEventListener('error', handler, false);
        try {
          img.src = IMAGE;
        } catch (e) {
          this.byEvent = this.byTimer;
        }
      };
    }(),
    byTick : function() {
      if (!isNodeJS || typeof process !== 'object' ||
          typeof process.nextTick !== 'function') {
        return false;
      }
      return function(callback) {
        process.nextTick(callback);
      };
    }(),
    byTimer : function(callback, msec) {
      return setTimeout(callback, msec || 0);
    }
  };

  lazyIter.StopIteration = lazyIter.stop;
  lazyIter.speeds = lazyLoop.speeds;
  lazyIter.delays = lazyLoop.delays;

  addSpeeds('forEach')('repeat')('forEver');

  return lazyIter;

}(), this));

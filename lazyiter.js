/*
 * lazyIter.js - JavaScript asynchronous lazy loops.
 *
 * These iterators are the minimum version of Pot.js's iterators.
 * Pot.js : http://polygonplanet.github.com/Pot.js/
 *
 * Version 1.00, 2012-09-02
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
            total : null,
            loop  : null,
            diff  : null,
            risk  : null,
            axis  : null,
            rest  : 100,
            limit : 255
          };

      if (speed != null) {
        if (typeof speed === 'string' && speed in this.speeds) {
          interval = this.speeds[speed];
        } else if (isNumeric(speed)) {
          interval = speed - 0;
        }
      }

      setTimeout(function revback() {
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
          callback();
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
          setTimeout(revback, delay);
        }
      }, 0);
    },
    forEach : function(object, callback, context) {
      var that = this, i = 0, len, p, keys = [];

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
        for (p in object) {
          keys[keys.length] = p;
        }
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
  };

  lazyIter.StopIteration = lazyIter.stop;
  lazyIter.speeds = lazyLoop.speeds;
  lazyIter.delays = lazyLoop.delays;

  return lazyIter;

}(), this));

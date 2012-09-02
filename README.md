lazyIter.js
===========

JavaScript asynchronous lazy loops.

These iterators are the minimum version of Pot.js's iterators.  
Pot.js : http://polygonplanet.github.com/Pot.js/


**lazyIter Test fiddle**: http://jsfiddle.net/polygonplanet/JLT2r/


### Usage:

------
    // forEach:
    //
    // lazyIter.forEach(object, func, callback [, speed [, context]])

    // Array.
    lazyIter.forEach(['a', 'b', 'c'], function(val, i) {
      console.log(i + ':' + val);
    }, function() {
      console.log('End loop');
    });
    // result:
    //   '0:a'
    //   '1:b'
    //   '2:c'
    //   'End loop'

    // Object.
    lazyIter.forEach({a: 1, b: 2, c: 3}, function(val, key) {
      console.log(key + ':' + val);
    }, function() {
      console.log('End loop');
    });
    // result:
    //   'a:1'
    //   'b:2'
    //   'c:3'
    //   'End loop'

------
    // repeat:
    //
    // lazyIter.repeat(max, func, callback [, speed [, context]])

    // Specify as number.
    lazyIter.repeat(10, function(i) {
      console.log(i);
    }, function() {
      console.log('End loop');
    });
    // result:
    //   0
    //   1
    //   ...
    //   9
    //   'End loop'

    // Specify first, step and end number like for statement.
    lazyIter.repeat({begin: 0, step: 5, end: 30}, function(i) {
      console.log(i);
    }, function() {
      console.log('End loop');
    });
    // result:
    //   0
    //   5
    //   10
    //   15
    //   20
    //   25
    //   'End loop'

------
    // forEver:
    //
    // lazyIter.forEver(func, callback [, speed [, context]])

    var end = 10;
    lazyIter.forEver(function(i) {
      if (i === end) {
        throw lazyIter.StopIteration;
      }
      console.log(i);
    }, function() {
      console.log('End loop');
    });
    // result:
    //   0
    //   1
    //   ...
    //   9
    //   'End loop'


You can stop each iterations by "**throw lazyIter.StopIteration;**".  
An argument "***context***" will be used as "***this***" in callback function.  
You can specify iteration "***speed***" by following types:

  - '**ninja**'  : fastest
  - '**rapid**'  : faster
  - '**fast**'   : fast
  - '**normal**' : normal (default)
  - '**slow**'   : slowly
  - '**doze**'   : more slowly
  - '**limp**'   : most slowly


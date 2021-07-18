"use strict";

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

Array.prototype.myReduce = function (fn, initialValue) {
  var arr = this;

  var _arr = _toArray(arr),
      begin = _arr[0],
      remain = _arr.slice(1);

  var hasInitialValue = initialValue !== void 0;
  var pre = !hasInitialValue ? begin : initialValue;
  var array = hasInitialValue ? remain : arr;
  console.log(array);

  for (var i = 0; i < array.length; i++) {
    pre = fn(pre, array[i], i, array);
  }

  return pre;
};

var sum1 = [1, 2, 3, 4].myReduce(function (pre, cur) {
  return pre + cur;
});
var sum2 = [1, 2, 3, 4].myReduce(function (pre, cur) {
  return pre + cur;
}, 2);
console.log(sum1);
console.log(sum2);
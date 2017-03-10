/**
 * @fileoverview
 * @author Taketoshi Aono
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var toString = Object.prototype.toString;
var Reflect = (function () {
    function Reflect() {
    }
    Reflect.className = function (obj) {
        return toString.call(obj).match(this.classNameRegexp)[1].toLowerCase();
    };
    return Reflect;
}());
Reflect.classNameRegexp = /\[object ([^]+)\]/;
exports.Reflect = Reflect;
function or() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var value = values.shift();
    while (value) {
        if (value !== undefined && value !== null) {
            return value;
        }
        value = value.shift();
    }
    return null;
}
exports.or = or;
function recursive(callback, initialValue) {
    var stack = [or(initialValue, null)];
    var pop = function (val) { stack.pop(); return or(val, stack[stack.length - 1]); };
    while (stack.length) {
        stack.push(callback(stack[stack.length - 1], pop, stack));
    }
}
exports.recursive = recursive;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRzs7O0FBR0gsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUM7QUFHM0M7SUFBQTtJQU1BLENBQUM7SUFIZSxpQkFBUyxHQUF2QixVQUF3QixHQUFHO1FBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekUsQ0FBQztJQUNILGNBQUM7QUFBRCxDQU5BLEFBTUM7QUFMZ0IsdUJBQWUsR0FBRyxtQkFBbUIsQ0FBQTtBQUR6QywwQkFBTztBQVNwQjtJQUFtQixnQkFBUztTQUFULFVBQVMsRUFBVCxxQkFBUyxFQUFULElBQVM7UUFBVCwyQkFBUzs7SUFDMUIsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzNCLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDYixFQUFFLENBQUMsQ0FBQyxLQUFLLEtBQUssU0FBUyxJQUFJLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7UUFDZixDQUFDO1FBQ0QsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUM7QUFURCxnQkFTQztBQUdELG1CQUE2QixRQUFxRSxFQUFFLFlBQWdCO0lBQ2xILElBQU0sS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZDLElBQU0sR0FBRyxHQUFHLFVBQUEsR0FBRyxJQUFLLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxDQUFDLENBQUE7SUFDMUUsT0FBTyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDcEIsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUQsQ0FBQztBQUNILENBQUM7QUFORCw4QkFNQyIsImZpbGUiOiJ1dGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVvdmVydmlld1xuICogQGF1dGhvciBUYWtldG9zaGkgQW9ub1xuICovXG5cblxuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5cbmV4cG9ydCBjbGFzcyBSZWZsZWN0IHtcbiAgcHJpdmF0ZSBzdGF0aWMgY2xhc3NOYW1lUmVnZXhwID0gL1xcW29iamVjdCAoW15dKylcXF0vXG4gIFxuICBwdWJsaWMgc3RhdGljIGNsYXNzTmFtZShvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopLm1hdGNoKHRoaXMuY2xhc3NOYW1lUmVnZXhwKVsxXS50b0xvd2VyQ2FzZSgpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIG9yKC4uLnZhbHVlcykge1xuICBsZXQgdmFsdWUgPSB2YWx1ZXMuc2hpZnQoKTtcbiAgd2hpbGUgKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgdmFsdWUgPSB2YWx1ZS5zaGlmdCgpOyBcbiAgfVxuICByZXR1cm4gbnVsbDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcmVjdXJzaXZlPFQ+KGNhbGxiYWNrOiAob2JqOiBhbnksIHBvcDogKHZhbHVlPzogYW55KSA9PiBhbnksIHN0YWNrOiBhbnlbXSkgPT4gdm9pZCwgaW5pdGlhbFZhbHVlPzogVCkge1xuICBjb25zdCBzdGFjayA9IFtvcihpbml0aWFsVmFsdWUsIG51bGwpXTtcbiAgY29uc3QgcG9wID0gdmFsID0+IHtzdGFjay5wb3AoKTsgcmV0dXJuIG9yKHZhbCwgc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0pO31cbiAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgIHN0YWNrLnB1c2goY2FsbGJhY2soc3RhY2tbc3RhY2subGVuZ3RoIC0gMV0sIHBvcCwgc3RhY2spKTtcbiAgfVxufVxuIl19

/**
 * @fileoverview
 * @author Taketoshi Aono
 */


const toString = Object.prototype.toString;


export class Reflect {
  private static classNameRegexp = /\[object ([^]+)\]/
  
  public static className(obj) {
    return toString.call(obj).match(this.classNameRegexp)[1].toLowerCase();
  }
}


export function or(...values) {
  let value = values.shift();
  while (value) {
    if (value !== undefined && value !== null) {
      return value;
    }
    value = value.shift(); 
  }
  return null;
}


export function recursive<T>(callback: (obj: any, pop: (value?: any) => any, stack: any[]) => void, initialValue?: T) {
  const stack = [or(initialValue, null)];
  const pop = val => {stack.pop(); return or(val, stack[stack.length - 1]);}
  while (stack.length) {
    stack.push(callback(stack[stack.length - 1], pop, stack));
  }
}

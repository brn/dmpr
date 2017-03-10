/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import {
  Reflect,
  recursive,
  or
} from './utils';


enum TraversalState {
  OBJECT_ROOT = 1,
  OBJECT_PROPERTY_START,
  OBJECT_PROPERTY_END,
  ARRAY_ROOT,
  ARRAY_ELEMENT_START,
  ARRAY_ELEMENT_END,
  ROOT
}

enum ContextState {
  OBJECT_PREPARE = 1,
  OBJECT_PROPERTY_ENUMERATION,
  ARRAY,
  ORDINAL
}


class StackFrame {
  private vp: any[] = [];
  private cp: any[] = [];
  private csp: ContextState[] = [];
  private ip: TraversalState[] = [];

  constructor() {
    this.ip.push(TraversalState.OBJECT_ROOT);
  }

  public pushIP(state: TraversalState) {
    this.ip.push(state);
  }

  public popIP(): TraversalState {
    return this.ip.pop();
  }

  public peekIP() {return this.ip[this.ip.length - 1]}

  
  public pushCP(value: any) {
    this.cp.push(value);
  }

  public popCP(): any {
    return this.cp.pop();
  }

  public peekCP() {return this.cp[this.cp.length - 1]}

  
  public pushCSP(value: ContextState) {
    this.csp.push(value);
  }

  public popCSP(): ContextState {
    return this.csp.pop();
  }

  public peekCSP(): ContextState {return this.csp[this.csp.length - 1]}

  public exchangeCSP(state: ContextState): ContextState {
    const last = this.csp.pop();
    this.csp.push(state);
    return last;
  }

  public exchangeIP(state: TraversalState): TraversalState {
    const ret = this.ip.pop();
    this.ip.push(state);
    return ret;
  }


  public pushVP(value: any) {
    this.vp.push(value);
  }

  public popVP(): any {
    return this.vp.pop();
  }

  public peekVP(): any {return this.vp[this.vp.length - 1]}

  public exchangeVP(value: any): any {
    const ret = this.vp.pop();
    this.vp.push(value);
    return ret;
  }

  public get ipLength() {return this.ip.length;}
}


class ObjectKeyDescriptorGetter {
  public static getDescriptors(obj) {
    let proto = obj;
    let descriptors = [];
    while (proto) {
      const names = Object.getOwnPropertyNames(proto);
      for (const name of names) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, name);
        if (!this.isBuiltin(name, descriptor)) {
          descriptors.push({name, descriptor});
        }
      }
      proto = Object.getPrototypeOf(proto);
    }
    return descriptors;
  }


  private static isBuiltin(key: string, {value}: {value?: any}) {
    return key === '__proto__' || (key in Object.prototype && Object.prototype[key] === value);
  }
}


class StateSentinel {
}


export interface Descriptor {
  configurable: boolean;
  enumerable: boolean;
  writable?: boolean;
  value?: any;
  get?: any;
  set?: any;
}


/**
 * Traverse Object
 * Format:
 * {
 *   type: string // type name,
 *   value?: any // value,
 *   descriptors: {
 *     name: {
 *       configurable: boolean;
 *       enumerable: boolean;
 *       writable?: boolean;
 *       value?: any;
 *       get?: any;
 *       set?: any
 *     },
 *     ...
 *   }
 * }
 */
export class ObjectTraversal<T> {
  private stateSentinel = new StateSentinel();

  private stack = new StackFrame();
  
  public traverse(obj: any) {
    this.stack.pushVP(obj);
    while (this.stack.ipLength) {
      console.log(this.stack);
      switch (this.stack.popIP()) {
      case TraversalState.OBJECT_ROOT: {
        this.handleRootState(this.stack.peekVP());
        break;
      }
      case TraversalState.OBJECT_PROPERTY_START: {
        const ret = this.handleObjectProperty();
        if (ret.state) {
          this.stack.pushIP(ret.state);
        }
        if (ret.value) {
          this.stack.pushVP(ret.value);
        }
        break;
      }
      case TraversalState.OBJECT_PROPERTY_END: {
        this.finishObject();
        break;
      }
      case TraversalState.ARRAY_ELEMENT_START: {
        const array = this.stack.peekCP();
        if (array.length) {
          const element = array.pop();
          this.stack.pushIP(TraversalState.ARRAY_ELEMENT_START);
          this.stack.pushVP(element);
          this.stack.pushIP(TraversalState.OBJECT_ROOT);
        } else {
          this.stack.pushIP(TraversalState.ARRAY_ELEMENT_END);
        }
        break;
      }
      case TraversalState.ARRAY_ELEMENT_END: {
        this.finishArray();
        break;
      }
      }
    }
    return this.stack.popVP();
  }


  private handleRootState(obj) {
    const type = Reflect.className(obj);
    switch (type) {
    case 'object':
      const descriptors = ObjectKeyDescriptorGetter.getDescriptors(obj);
      this.stack.pushIP(TraversalState.OBJECT_PROPERTY_START);
      this.stack.exchangeVP(this.stateSentinel);
      this.stack.pushCP({descriptors, object: obj});
      this.stack.pushCSP(ContextState.OBJECT_PREPARE);
      break;
    case 'array':
      this.stack.exchangeVP(this.stateSentinel);
      this.stack.pushIP(TraversalState.ARRAY_ELEMENT_START);
      this.stack.pushCP(obj);
      this.stack.pushCSP(ContextState.ARRAY);
      break;
    case 'function':
      this.handlePrimitiveSerialization(obj, o => this.serializeFunction(o));
      break;
    case 'regexp':
      this.handlePrimitiveSerialization(obj, o => this.serializeRegexp(o));
      break;
    case 'string':
      this.handlePrimitiveSerialization(obj, o => "${o}");
      break;
    case 'number':
    case 'boolean':
      this.handlePrimitiveSerialization(obj, o => o);
      break;
    default:
    }
  }


  private handleObjectProperty() {
    let descriptorInfo;
    if (this.stack.peekCSP() !== ContextState.OBJECT_PROPERTY_ENUMERATION) {
      const cp = this.stack.popCP();
      descriptorInfo = cp.descriptors.pop();
      this.stack.pushCP({descriptorInfo, keyDescriptors: cp});
      this.stack.exchangeCSP(ContextState.OBJECT_PROPERTY_ENUMERATION);
    } else {
      const {keyDescriptors} = this.stack.popCP();
      descriptorInfo = keyDescriptors.descriptors.pop();
      this.stack.pushCP({descriptorInfo, keyDescriptors});
    }

    if (descriptorInfo && descriptorInfo.descriptor) {
      this.stack.pushIP(TraversalState.OBJECT_PROPERTY_START);
      if (descriptorInfo.descriptor.value) {
        return {value: descriptorInfo.descriptor.value, state: TraversalState.OBJECT_ROOT};
      }
      return {
        value: `"${descriptorInfo.name}": {
          "configurable": ${descriptorInfo.descriptor.configurable},
          "enumerable": ${descriptorInfo.descriptor.enumerable},
          "set": ${this.serializeFunction(descriptorInfo.descriptor.set)},
          "get": ${this.serializeFunction(descriptorInfo.descriptor.get)}
        }`,
        state: null
      };
    }
    return {value: null, state: TraversalState.OBJECT_PROPERTY_END};
  }


  private serializeFunction(fn: Function) {
    if (fn) {
      const str = Function.prototype.toString.call(fn).replace(/\n\s/g, '');
      if (/^function(){[native code]}$/.test(str)) {
        return 'function() {throw new Error("Native function or bound function can\'t serialize.")}'
      }
      return `"${str}"`;
    }
    return null;
  }

  private serializeRegexp(regexp: RegExp) {
    return `{"type":"regexp", "value": "/${regexp.source}/${regexp.flags}"}`
  }


  /**
   * Serialize primitive values.
   * RETURN last vp
   */
  private handlePrimitiveSerialization(obj: any, serialize: (v: any) => string): void {
    switch (this.stack.peekCSP()) {
    case ContextState.OBJECT_PROPERTY_ENUMERATION: {
      const {descriptorInfo} = this.stack.peekCP();
      const ret = `"${descriptorInfo.name}": {
        "configurable": ${descriptorInfo.descriptor.configurable},
        "enumerable": ${descriptorInfo.descriptor.enumerable},
        "writable": ${descriptorInfo.descriptor.writable},
        "value": ${serialize(obj)}
      }`.replace(/\s/g, '');
      this.stack.exchangeVP(ret);
      break;
    }
    case ContextState.ARRAY:
    case ContextState.ORDINAL: {
      this.stack.exchangeVP(serialize(obj));
      break;
    }
    }
  }

  private finishObject() {
    this.stack.popCSP();
    this.stack.popCP();
    const ret = [];
    let sp = this.stack.popVP();
    while (1) {
      ret.push(sp);
      sp = this.stack.popVP();
      if (sp === this.stateSentinel) {
        let result = `{
          "type": "object",
          "descriptors": {
            ${ret.join(',\n')}
          }
        }`;
        if (this.stack.peekCSP() === ContextState.OBJECT_PROPERTY_ENUMERATION) {
          const {descriptorInfo: {name}} = this.stack.peekCP();
          this.stack.pushVP(null);
          this.handlePrimitiveSerialization(result, v => v);
          result = this.stack.popVP();
        }
        this.stack.pushVP(result);
        break;
      }
    }
  }


  private finishArray() {
    this.stack.popCP();
    this.stack.popCSP();
    const ret = [];
    let sp = this.stack.popVP();
    while (1) {
      if (sp === this.stateSentinel) {
        let value;
        if (this.stack.peekCSP() === ContextState.OBJECT_PROPERTY_ENUMERATION) {
          const {descriptorInfo: {name}} = this.stack.peekCP();
          this.stack.pushVP(null);
          this.handlePrimitiveSerialization(`[${ret.join(',')}]`, v => v);
          value = this.stack.popVP();
        } else {
          value = `[${ret.join(',')}]`;
        }
        this.stack.pushVP(value);
        break;
      } else {
        ret.push(sp);
      }
      sp = this.stack.popVP();
    }
  }
}

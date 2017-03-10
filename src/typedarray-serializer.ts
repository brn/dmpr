/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import {
  Serializer
} from './serializer';
import {
  ObjectTraversal
} from './object-traversal';


export class TypedArraySerializer implements Serializer<ArrayBuffer> {
  public serialize(obj: any): ArrayBuffer {
    const o = new ObjectTraversal();
    const result = o.traverse(obj);
    const len = result.length;
    const buffer = new Int32Array(new ArrayBuffer(len % 4 === 0? len: len * 4));
    for (let i = 0, length = result.length; i < length; i++) {
      buffer[i] = result.charCodeAt(i);
    }
    return buffer.buffer;
  }
}

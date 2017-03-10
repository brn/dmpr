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


export class StringSerializer implements Serializer<string> {
  public serialize(obj: any): string {
    const o = new ObjectTraversal();
    return o.traverse(obj);
  }
}

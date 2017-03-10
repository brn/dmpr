/**
 * @fileoverview
 * @author Taketoshi Aono
 */

export interface Serializer<T> {
  serialize(object: any): T;
}

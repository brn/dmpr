/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import {
  ObjectTraversal
} from '../serializer';
import * as sourceMap from 'source-map-support';

sourceMap.install();
describe('ObjectTraversal', () => {
  describe('traverse', () => {
    it('traverse object graph', () => {
      const o = new ObjectTraversal();
      const ret = o.traverse({a: 1, b: 2, get x() {return 100}});
      console.log(ret);
    });
    it('traverse object graph with array', () => {
      const o = new ObjectTraversal();
      const ret = o.traverse({a: 1, b: 2, c: [1,2,3], d: {x: 1}, get y() {return 2000}, regexp: /test-regexp/});
      console.log(JSON.parse(ret));
    });
  });
});

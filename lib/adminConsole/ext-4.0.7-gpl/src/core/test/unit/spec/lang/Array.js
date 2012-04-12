/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Array", function() {
    var array;

    describe("Ext.Array.indexOf", function() {
        var indexOf = Ext.Array.indexOf;

        describe("without from argument", function() {
            beforeEach(function() {
                array = [1, 2, 3, 4, 5, 6];
            });

            afterEach(function(){
                array = null;
            });

            it("should always return -1 on an empty array", function(){
                expect(indexOf([], 1)).toEqual(-1);
            });

            it("should return -1 if them it doesn't exist", function() {
                expect(indexOf(array, 7)).toEqual(-1);
            });

            it("should return the matching index if found", function() {
                expect(indexOf(array, 4)).toEqual(3);
            });

            it("should return the first matching index if found", function(){
                array.push(1);
                expect(indexOf(array, 1)).toEqual(0);
            });
        });

        describe("with from argument", function() {
            beforeEach(function() {
                array = [1, 2, 3, 4, 5, 6, 7];
            });

            it("should return the matched index if found", function() {
                expect(indexOf(array, 5, 3)).toEqual(4);
            });

            it("should return the matched index if found", function() {
                expect(indexOf(array, 5, 4)).toEqual(4);
            });

            it("should return -1 if the item doesn't exist after the passed from value", function() {
                expect(indexOf(array, 5, 5)).toEqual(-1);
            });
        });

    });
    describe("removing items", function() {
        var remove = Ext.Array.remove,
            myArray;

        it("should do nothing when removing from an empty array", function() {
            myArray = [];

            expect(function() {
                remove(myArray, 1);
            }).not.toRaiseExtError();

            expect(myArray).toEqual([]);
        });

        describe("when removing an item inside an array", function() {
            beforeEach(function() {
                myArray = [1, 2, 3, 4, 5];

                remove(myArray, 1);
            });

            it("should remove the item", function() {
                expect(myArray).toEqual([2, 3, 4, 5]);
            });

            it("should update the index of the following items", function() {
                expect(myArray[1]).toEqual(3);
                expect(myArray[2]).toEqual(4);
                expect(myArray[3]).toEqual(5);
            });

            it("should remove only using a strict type check", function(){
                remove(myArray, '2');
                expect(myArray).toEqual([2, 3, 4, 5]);
            });
        });
    });

    describe("contains", function() {
        var contains = Ext.Array.contains;

        it("should always return false with an empty array", function(){
            expect(contains([], 1)).toBe(false);
        });

        it("should return false if an item does not exist in the array", function() {
            expect(contains([1, 2, 3], 10)).toBe(false);
        });

        it("should return true if an item exists in the array", function() {
            expect(contains([8, 9, 10], 10)).toBe(true);
        });

        it("should only match with strict type checking", function(){
            expect(contains([1, 2, 3, 4, 5], '1')).toBe(false);
        });
    });

    describe("include", function(){
        var include = Ext.Array.include,
            myArray;

        it("should always add to an empty array", function(){
            myArray = [];
            include(myArray, 1);
            expect(myArray).toEqual([1]);
        });

        it("should add the item if it doesn't exist", function(){
            myArray = [1];
            include(myArray, 2);
            expect(myArray).toEqual([1, 2]);
        });

        it("should always add to the end of the array", function(){
            myArray = [9, 8, 7, 6];
            include(myArray, 10);
            expect(myArray).toEqual([9, 8, 7, 6, 10]);
        });

        it("should match using strict type checking", function(){
            myArray = ['1'];
            include(myArray, 1);
            expect(myArray).toEqual(['1', 1]);
        });

        it("should not modify the array if the value exists", function(){
            myArray = [4, 5, 6];
            include(myArray, 7);
            expect(myArray).toEqual([4, 5, 6, 7]);
        });
    });

    describe("clone", function(){
        var clone = Ext.Array.clone;

        it("should clone an empty array to be empty", function(){
            expect(clone([])).toEqual([]);
        });

        it("should clone an array with items", function(){
            expect(clone([1, 3, 5])).toEqual([1, 3, 5]);
        });

        it("should create a new reference", function(){
            var arr = [1, 2, 3];
            expect(clone(arr)).not.toBe(arr);
        });

        it("should do a shallow clone", function(){
            var o = {},
                arr = [o],
                result;

            result = clone(arr);
            expect(result[0]).toBe(o);
        });
    });

    describe("clean", function(){
        var clean = Ext.Array.clean;

        it("should return an empty array if cleaning an empty array", function(){
            expect(clean([])).toEqual([]);
        });

        it("should remove undefined values", function(){
            expect(clean([undefined])).toEqual([]);
        });

        it("should remove null values", function(){
            expect(clean([null])).toEqual([]);
        });

        it("should remove empty strings", function(){
            expect(clean([''])).toEqual([]);
        });

        it("should remove empty arrays", function(){
            expect(clean([[]])).toEqual([]);
        });

        it("should remove a mixture of empty values", function(){
            expect(clean([null, undefined, '', []])).toEqual([]);
        });

        it("should remove all occurrences of empty values", function(){
            expect(clean([null, null, null, undefined, '', '', '', undefined])).toEqual([]);
        });

        it("should leave non empty values untouched", function(){
            expect(clean([1, 2, 3])).toEqual([1, 2, 3]);
        });

        it("should remove only the empty values", function(){
            expect(clean([undefined, null, 1, null, 2])).toEqual([1, 2]);
        });

        it("should preserve order on removal", function(){
            expect(clean([1, null, 2, null, null, null, 3, undefined, '', '', 4])).toEqual([1, 2, 3, 4]);
        });
    });

    describe("unique", function(){
        var unique = Ext.Array.unique;

        it("should return an empty array if run on an empty array", function(){
            expect(unique([])).toEqual([]);
        });

        it("should return a new reference", function(){
            var arr = [1, 2, 3];
            expect(unique(arr)).not.toBe(arr);
        });

        it("should return a copy if all items are unique", function(){
            expect(unique([6, 7, 8])).toEqual([6, 7, 8]);
        });

        it("should only use strict typing to match", function(){
            expect(unique([1, '1'])).toEqual([1, '1']);
        });

        it("should preserve the order when removing", function(){
            expect(unique([1, 2, 1, 3, 1, 1, 1, 6, 5, 1])).toEqual([1, 2, 3, 6, 5]);
        });
    });

    describe("map", function(){
        var map = Ext.Array.map,
            emptyFn = function(v){
                return v;
            };

        it("should return an empty array if run on an empty array", function(){
            expect(map([], function(){})).toEqual([]);
        });

        it("should return a new reference", function(){
            var arr = [1, 2];
            expect(map(arr, emptyFn)).not.toBe(arr);
        });

        it("should execute the function for each item in the array", function(){
            expect(map([1, 2, 3, 4, 5], function(v){
                return v * 2;
            })).toEqual([2, 4, 6, 8, 10]);
        });

        it("should get called with the correct scope", function(){
            var scope = {},
                realScope;
            map([1, 2, 3, 4, 5], function(){
                realScope = this;
            }, scope);
            expect(realScope).toBe(scope);
        });

        it("should get called with the argument, index and array", function(){
            var item,
                index,
                arr,
                data = [1];

            map(data, function(){
                item = arguments[0];
                index = arguments[1];
                arr = arguments[2];
            });
            expect(item).toEqual(1);
            expect(index).toEqual(0);
            expect(arr).toBe(data);
        });
    });

    describe("from", function(){
        var from = Ext.Array.from;

        it("should return an empty array for an undefined value", function(){
            expect(from(undefined)).toEqual([]);
        });

        it("should return an empty array for a null value", function(){
            expect(from(null)).toEqual([]);
        });

        it("should convert an array", function(){
            expect(from([1, 2, 3])).toEqual([1, 2, 3]);
        });

        it("should preserve the order", function(){
            expect(from(['a', 'string', 'here'])).toEqual(['a', 'string', 'here']);
        });

        it("should convert a single value to an array", function(){
            expect(from(true)).toEqual([true]);
            expect(from(700)).toEqual([700]);
        });

        it("should convert arguments to an array", function(){
            var test, fn = function(){
                test = from(arguments);
            };
            fn(1, 2, 3);
            expect(test instanceof Array).toBeTruthy();
            expect(test).toEqual([1, 2, 3]);
        });

        it("should convert a DOM collection to an array", function(){
            var ct = document.body.appendChild(document.createElement('div')),
                node1 = ct.appendChild(document.createElement('div')),
                node2 = ct.appendChild(document.createElement('div')),
                node3 = ct.appendChild(document.createElement('div')),
                collection = ct.getElementsByTagName('div'),
                result = from(collection);

            expect(result instanceof Array).toBeTruthy();
            expect(result).toEqual([node1, node2, node3]);
            document.body.removeChild(ct);

        });
    });

    describe("toArray", function(){
        var toArray = Ext.Array.toArray;

        it("should convert an array", function(){
            expect(toArray([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
        });

        it("should convert a string", function(){
            expect(toArray('12345')).toEqual(['1', '2', '3', '4', '5']);
        });

        it("should create a new reference", function(){
            var arr = [6, 7, 8];
            expect(toArray(arr)).not.toBe(arr);
        });

        it("should convert arguments", function(){
            var test, fn = function(){
                test = toArray(arguments);
            };
            fn(-1, -2, -3);
            expect(test instanceof Array).toBeTruthy();
            expect(test).toEqual([-1, -2, -3]);
        });

        it("should convert a DOM collection", function(){
            var ct = document.body.appendChild(document.createElement('div')),
                node1 = ct.appendChild(document.createElement('div')),
                node2 = ct.appendChild(document.createElement('div')),
                node3 = ct.appendChild(document.createElement('div')),
                collection = ct.getElementsByTagName('div'),
                result = toArray(collection);

            expect(result instanceof Array).toBeTruthy();
            expect(result).toEqual([node1, node2, node3]);
            document.body.removeChild(ct);
        });

        describe("start/end parameters", function(){
            it("should default to whole of the array", function(){
                expect(toArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            });

            it("should work with only the start parameter specified", function(){
                expect(toArray([1, 2, 3, 4, 5, 6], 2)).toEqual([3, 4, 5, 6]);
            });

            it("should work with only the end parameter specified", function(){
                expect(toArray([1, 2, 3, 4, 5, 6], null, 4)).toEqual([1, 2, 3, 4]);
            });

            it("should work with both params specified", function(){
                expect(toArray([1, 2, 3, 4, 5, 6], 2, 4)).toEqual([3, 4]);
            });

            it("should work with nagative end", function(){
                expect(toArray([1, 2, 3, 4, 5, 6], 2, -1)).toEqual([3, 4, 5]);
            });
        });
    });

    describe("pluck", function(){
        var pluck = Ext.Array.pluck;
        it("should return an empty array when an empty array is passed", function(){
            expect(pluck([], 'prop')).toEqual([]);
        });

        it("should pull the properties from objects in the array", function(){
            var arr = [{prop: 1}, {prop: 2}, {prop: 3}];
            expect(pluck(arr, 'prop')).toEqual([1, 2, 3]);
        });

        it("should return a new reference", function(){
            var arr = [{prop: 1}, {prop: 2}, {prop: 3}];
            expect(pluck(arr, 'prop')).not.toBe(arr);
        });

        it("should work on a DOM collection", function(){
            var ct = document.body.appendChild(document.createElement('div')),
                i = 0,
                node;

            for(; i < 5; ++i) {
                node = ct.appendChild(document.createElement('div'));
                node.className = 'node' + i;
            }

            expect(pluck(ct.getElementsByTagName('div'), 'className')).toEqual(['node0', 'node1', 'node2', 'node3', 'node4']);
            document.body.removeChild(ct);
        });
    });

    describe("filter", function(){
        var filter = Ext.Array.filter,
            trueFn = function(){
                return true;
            };

        it("should return an empty array if filtering an empty array", function(){
            expect(filter([], trueFn)).toEqual([]);
        });

        it("should create a new reference", function(){
            var arr = [1, 2, 3];
            expect(filter(arr, trueFn)).not.toBe(arr);
        });

        it("should add items if the filter function returns true", function(){
            expect(filter([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(val){
                return val % 2 === 0;
            })).toEqual([2, 4, 6, 8, 10]);
        });

        it("should add items if the filter function returns a truthy value", function(){
            expect(filter([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(val){
                if (val % 2 === 0) {
                    return 1;
                }
            })).toEqual([2, 4, 6, 8, 10]);
        });

        it("should not add items if the filter function returns a falsy value", function(){
            expect(filter([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(val){
                return 0;
            })).toEqual([]);
        });

        it("should pass the correct parameters", function(){
            var values = [],
                indexes = [],
                arrs = [],
                data = [1, 2, 3];

            filter([1, 2, 3], function(val, index, arr){
                values.push(val);
                indexes.push(index);
                arrs.push(arr);
            });

            expect(values).toEqual([1, 2, 3]);
            expect(indexes).toEqual([0, 1, 2]);
            expect(arrs).toEqual([data, data, data]);
        });

        it("should do a shallow copy", function(){
            var o1 = {prop: 1},
                o2 = {prop: 2},
                o3 = {prop: 3};

            expect(filter([o1, o2, o3], trueFn)).toEqual([o1, o2, o3]);
        });

        it("should execute in scope when passed", function(){
            var scope = {},
                actual;

            expect(filter([1, 2, 3], function(){
                actual = this;
            }, scope));
            expect(actual).toBe(scope);
        });
    });

    describe("forEach", function(){
        var forEach = Ext.Array.forEach;

        it("should not execute on an empty array", function(){
            var count = 0;
            forEach([], function(){
                ++count;
            });
            expect(count).toEqual(0);
        });

        it("should execute for each item in the array", function(){
            var count = 0;
            forEach([1, 2, 3, 4, 5], function(){
                ++count;
            });
            expect(count).toEqual(5);
        });

        it("should execute in the appropriate scope", function(){
            var scope = {},
                actual;

            forEach([1, 2, 3], function(){
                actual = this;
            }, scope);

            expect(actual).toBe(scope);
        });

        it("should pass the appropriate params to the callback", function(){
            var values = [],
                indexes = [],
                arrs = [],
                data = [1, 2, 3];

            forEach(data, function(val, index, arr){
                values.push(val);
                indexes.push(index);
                arrs.push(arr);
            });

            expect(values).toEqual([1, 2, 3]);
            expect(indexes).toEqual([0, 1, 2]);
            expect(arrs).toEqual([data, data, data]);
        });
    });

    describe("each", function(){
        var each = Ext.Array.each;

        describe("return values", function(){
            xit("should return 0 if the passed value is empty", function(){
                expect(each([])).toEqual(0);
            });

            it("should return the stopping index if iteration is halted", function(){
                expect(each([1, 2, 3], function(val){
                    return val != 2;
                })).toEqual(1);
            });

            it("should return true if iteration is not stopped", function(){
                expect(each([4, 5, 6], function(){
                    return true;
                })).toBeTruthy();
            });
        });

        describe("scope/parameters", function(){
            it("should execute in the specified scope", function(){
                var scope = {},
                    actual;

                each([1, 2, 3], function(){
                    actual = this;
                }, scope);
                expect(actual).toBe(scope);
            });

            it("should pass the item, index and array", function(){
                var values = [],
                    indexes = [],
                    arrs = [],
                    data = [1, 2, 3];

                each(data, function(val, index, arr){
                    values.push(val);
                    indexes.push(index);
                    arrs.push(arr);
                });

                expect(values).toEqual([1, 2, 3]);
                expect(indexes).toEqual([0, 1, 2]);
                expect(arrs).toEqual([data, data, data]);
            });
        });

        describe("stopping iteration", function(){
            it("should not stop iteration by default", function(){
                var count = 0;
                each([1, 2, 3, 4, 5], function(){
                    ++count;
                });
                expect(count).toEqual(5);
            });

            it("should not stop unless an explicit false is returned", function(){
                var count = 0;
                each([1, 2, 3, 4, 5], function(){
                    ++count;
                    return null;
                });
                expect(count).toEqual(5);
            });

            it("should stop immediately if false is returned", function(){
                var count = 0;
                each([1, 2, 3, 4, 5], function(v){
                    ++count;
                    return v != 2;
                });
                expect(count).toEqual(2);
            });
        });

        describe("other collection types", function(){
            it("should iterate arguments", function(){
                var test, values = [], fn = function(){
                    test = each(arguments, function(val){
                        values.push(val);
                    });
                };
                fn(1, 2, 3);
                expect(values).toEqual([1, 2, 3]);
            });

            it("should iterate over a DOM collection", function(){
                var ct = document.body.appendChild(document.createElement('div')),
                    node1 = ct.appendChild(document.createElement('div')),
                    node2 = ct.appendChild(document.createElement('div')),
                    node3 = ct.appendChild(document.createElement('div')),
                    collection = ct.getElementsByTagName('div'),
                    result = [];

                each(collection, function(node){
                    result.push(node.tagName.toLowerCase());
                });

                expect(result).toEqual(['div', 'div', 'div']);
                document.body.removeChild(ct);
            });
        });

        it("should iterate once over a single, non empty value", function(){
            var count = 0;
            each('string', function(){
                ++count;
            });
            expect(count).toEqual(1);
        });
    });

    describe("every", function(){
        var every = Ext.Array.every;

        describe("scope/params", function(){
            it("should execute in the specified scope", function(){
                var scope = {},
                    actual;

                every([1, 2, 3], function(){
                    actual = this;
                }, scope);
                expect(actual).toBe(scope);
            });

            it("should pass the item, index and array", function(){
                var values = [],
                    indexes = [],
                    arrs = [],
                    data = [1, 2, 3];

                every(data, function(val, index, arr){
                    values.push(val);
                    indexes.push(index);
                    arrs.push(arr);
                    return true;
                });

                expect(values).toEqual([1, 2, 3]);
                expect(indexes).toEqual([0, 1, 2]);
                expect(arrs).toEqual([data, data, data]);
            });
        });

        it("should return true on an empty array", function(){
            expect(every([], function(){})).toBeTruthy();
        });

        it("should throw an exception if no fn is passed", function(){
            expect(function(){
                every([1, 2, 3]);
            }).toRaiseExtError();
        });

        it("should stop as soon as a false value is found", function(){
            var count = 0,
                result;

            result = every([true, true, false, true], function(v){
                ++count;
                return v;
            });
            expect(count).toEqual(3);
            expect(result).toBeFalsy();
        });

        it("should return true if all values match the function", function(){
            expect(every([1, 2, 3, 4, 5, 6, 7, 8, 9], function(v){
                return v < 10;
            })).toBeTruthy();
        });
    });

    describe("some", function(){
        var some = Ext.Array.some;

        describe("scope/params", function(){
            it("should execute in the specified scope", function(){
                var scope = {},
                    actual;

                some([1, 2, 3], function(){
                    actual = this;
                }, scope);
                expect(actual).toBe(scope);
            });

            it("should pass the item, index and array", function(){
                var values = [],
                    indexes = [],
                    arrs = [],
                    data = [1, 2, 3];

                some(data, function(val, index, arr){
                    values.push(val);
                    indexes.push(index);
                    arrs.push(arr);
                    return true;
                });

                expect(values).toEqual([1]);
                expect(indexes).toEqual([0]);
                expect(arrs).toEqual([data]);
            });
        });

        it("should return false on an empty array", function(){
            expect(some([], function(){})).toBeFalsy();
        });

        it("should throw an exception if no fn is passed", function(){
            expect(function(){
                some([1, 2, 3]);
            }).toRaiseExtError();
        });

        it("should stop as soon as a matching value is found", function(){
            var count = 0,
                result;

            result = some([1, 2, 3, 4], function(val){
                ++count;
                return val == 3;
            });
            expect(count).toEqual(3);
            expect(result).toBeTruthy();
        });

        it("should return false if nothing matches the matcher function", function(){
            var count = 0,
                result;

            result = some([1, 2, 3, 4, 5, 6, 7, 8, 9], function(val){
                ++count;
                return val > 9;
            });
            expect(count).toEqual(9);
            expect(result).toBeFalsy();
        });
    });

    describe("merge", function(){
        var merge = Ext.Array.merge;

        it("should return an empty array if run on an empty array", function(){
            expect(merge([])).toEqual([]);
        });

        it("should return a new reference", function(){
            var arr = [1, 2, 3];
            expect(merge(arr)).not.toBe(arr);
        });

        it("should return a copy if all items are unique", function(){
            expect(merge([6, 7, 8])).toEqual([6, 7, 8]);
        });

        it("should only use strict typing to match", function(){
            expect(merge([1, '1'])).toEqual([1, '1']);
        });

        it("should accept two or more arrays and return a unique union with items in order of first appearance", function(){
            expect(merge([1, 2, 3], ['1', '2', '3'], [4, 1, 5, 2], [6, 3, 7, '1'], [8, '2', 9, '3'])).toEqual([1, 2, 3, '1', '2', '3', 4, 5, 6, 7, 8, 9]);
        });
    });

    describe("intersect", function(){
        var intersect = Ext.Array.intersect;

        it("should return an empty array if no arrays are passed", function(){
            expect(intersect()).toEqual([]);
        });

        it("should return an empty array if one empty array is passed", function(){
            expect(intersect([])).toEqual([]);
        });

        it("should return a new reference", function(){
            var arr = [1, 2, 3];
            expect(intersect(arr)).not.toBe(arr);
        });

        it("should return a copy if one array is passed", function(){
            expect(intersect([6, 7, 8])).toEqual([6, 7, 8]);
        });

        it("should return an intersection of two or more arrays with items in order of first appearance", function(){
            expect(intersect([1, 2, 3], [4, 3, 2, 5], [2, 6, 3])).toEqual([2, 3]);
        });

        it("should return an empty array if there is no intersecting values", function(){
            expect(intersect([1, 2, 3], [4, 5, 6])).toEqual([]);
        });

        it("should contain the unique set of intersected values only", function(){
            expect(intersect([1, 1, 2, 3, 3], [1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
        });

        it("should only use strict typing to match", function(){
            expect(intersect([1], ['1'])).toEqual([]);
        });
    });

    describe("difference", function(){
        var difference = Ext.Array.difference;

        it("should return a set difference of two arrays with items in order of first appearance", function(){
            expect(difference([1, 2, 3, 4], [3, 2])).toEqual([1, 4]);
        });

        it("should return the first array unchanged if there is no difference", function(){
            expect(difference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]);
        });

        it("should return a new reference", function(){
            var arr = [1, 2, 3];
            expect(difference(arr, [3, 2])).not.toBe(arr);
        });

        it("should remove multiples of the same value from the first array", function(){
            expect(difference([1, 2, 3, 2, 4, 1], [2, 1])).toEqual([3, 4]);
        });

        it("should only use strict typing to match", function(){
            expect(difference([1], ['1'])).toEqual([1]);
        });
    });

    describe("sort", function() {
       var sarray, narray;
       beforeEach(function() {
          sarray = ['bbb', 'addda', 'erere', 'fff', 'de3'];
          narray = [1,3,2,4,6,7];

       });

       describe("with strings", function() {
           it("should be able to sort an array without sortFn", function() {
                Ext.Array.sort(sarray);
                expect(sarray).toEqual(['addda', 'bbb', 'de3', 'erere', 'fff']);
           });


           it("should be able to use a sortFn that returns a Number", function() {
                Ext.Array.sort(sarray, function(a,b){ 
                    if (a === b) {
                        return 0;
                    } 
                    return  a > b ? 1: -1;
                });
                expect(sarray).toEqual(['addda', 'bbb', 'de3', 'erere', 'fff']);
           });
       });

       describe("with numbers", function() {
           it("should be able to sort an array without sortFn", function() {
                Ext.Array.sort(narray);
                expect(narray).toEqual([1,2,3,4,6,7]);
           });


           it("should be able to use a sortFn that returns a Number", function() {
                Ext.Array.sort(narray, function(a,b){
                    return a - b;
                });
                expect(narray).toEqual([1,2,3,4,6,7]);
           });
       });
    });

    describe("min", function() {
        describe("numbers", function() {
            it("without comparisonFn", function() {
                expect(Ext.Array.min([1,2,3,4,5,6])).toEqual(1);
            });

            it("with comparisonFn", function() {
                expect(Ext.Array.min([1,2,3,4,5,6], function(a, b) { return a < b ? 1 : -1; })).toEqual(6);
            });
        });
    });

    describe("max", function() {
        describe("numbers", function() {
            it("without comparisonFn", function() {
                expect(Ext.Array.max([1,2,3,4,5,6])).toEqual(6);
            });

            it("with comparisonFn", function() {
                expect(Ext.Array.max([1,2,3,4,5,6], function(a, b) { return a < b ? 1 : -1; })).toEqual(1);
            });
        });
    });

    describe("sum", function() {
        it("should return 21", function() {
            expect(Ext.Array.sum([1,2,3,4,5,6])).toEqual(21);
        });
    });

    describe("mean", function() {
        it("should return 3.5", function() {
            expect(Ext.Array.mean([1,2,3,4,5,6])).toEqual(3.5);
        });
    });

    function testReplace (replace) {
        it('should remove items in the middle', function () {
            var array = [0, 1, 2, 3, 4, 5, 6, 7];
            replace(array, 2, 2);
            expect(Ext.encode(array)).toEqual('[0,1,4,5,6,7]');
        });
        it('should insert items in the middle', function () {
            var array = [0, 1, 2, 3, 4, 5, 6, 7];
            replace(array, 2, 0, ['a','b']);
            expect(Ext.encode(array)).toEqual('[0,1,"a","b",2,3,4,5,6,7]');
        });
        it('should replace in the middle with more items', function () {
            var array = [0, 1, 2, 3, 4, 5, 6, 7];
            replace(array, 2, 2, ['a','b', 'c', 'd']);
            expect(Ext.encode(array)).toEqual('[0,1,"a","b","c","d",4,5,6,7]');
        });
        it('should replace in the middle with fewer items', function () {
            var array = [0, 1, 2, 3, 4, 5, 6, 7];
            replace(array, 2, 4, ['a','b']);
            expect(Ext.encode(array)).toEqual('[0,1,"a","b",6,7]');
        });
        it('should delete at front', function () {
            var array = [0, 1, 2, 3];
            replace(array, 0, 2);
            expect(Ext.encode(array)).toEqual('[2,3]');
        });
        it('should delete at tail', function () {
            var array = [0, 1, 2, 3];
            replace(array, 2, 2);
            expect(Ext.encode(array)).toEqual('[0,1]');
        });
        it('should delete everything', function () {
            var array = [0, 1, 2, 3];
            replace(array, 0, 4);
            expect(Ext.encode(array)).toEqual('[]');
        });
        it('should insert at front', function () {
            var array = [0, 1];
            replace(array, 0, 0, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('["a","b","c","d","e",0,1]');
        });
        it('should insert at tail', function () {
            var array = [0, 1];
            replace(array, array.length, 0, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('[0,1,"a","b","c","d","e"]');
        });
        it('should insert into empty array', function () {
            var array = [];
            replace(array, 0, 0, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('["a","b","c","d","e"]');
        });
        it('should replace at front', function () {
            var array = [0, 1];
            replace(array, 0, 1, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('["a","b","c","d","e",1]');
        });
        it('should replace at tail', function () {
            var array = [0, 1];
            replace(array, 1, 1, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('[0,"a","b","c","d","e"]');
        });
        it('should replace entire array', function () {
            var array = [0, 1, 2, 3];
            replace(array, 0, array.length, ['a','b','c','d','e']);
            expect(Ext.encode(array)).toEqual('["a","b","c","d","e"]');
        });
        it('should handle negative index', function () {
            var array = [0, 1, 2, 3];
            replace(array, -2, 20); // should clip
            expect(Ext.encode(array)).toEqual('[0,1]');
        });
        it('should work around the IE8 bug', function () {
            // see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/6e946d03-e09f-4b22-a4dd-cd5e276bf05a/
            var array = [],
                lengthBefore,
                j = 20;

            while (j--) {
                array.push("A");
            }

            array.splice(15, 0, "F", "F", "F", "F", "F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F","F");
            // the fact that this is an APPLY is not instrumental to reproducing this bug

            lengthBefore = array.length; // = 41

            // everything above should be exactly preserved including the true splice call.
            // That way we have produced the Array Time Bomb... now see if it explodes!

            replace(array, 13, 0, ["XXX"]); // add one element (this was the failure)

            expect(array.length).toEqual(lengthBefore+1);
        });
    }

    describe('replaceSim', function () {
        // The _replace method is our corrected method for IE8, but we make it available (in
        // debug builds) on all browsers to see that it works.
        testReplace(Ext.Array._replaceSim);
    });

    describe('replaceNative', function () {
        // and test the wrapper on other browsers
        testReplace(Ext.Array.replace);
    });

    describe('splice', function () {
        it('returns proper result array at the front', function () {
            var ret = Ext.Array._spliceSim([1,2,3,4], 0, 2);
            expect(Ext.encode(ret)).toEqual('[1,2]');
        });
        it('returns proper result array at the end', function () {
            var ret = Ext.Array._spliceSim([1,2,3,4], 2, 2);
            expect(Ext.encode(ret)).toEqual('[3,4]');
        });
        it('returns proper result array from the middle', function () {
            var ret = Ext.Array._spliceSim([1,2,3,4], 1, 2);
            expect(Ext.encode(ret)).toEqual('[2,3]');
        });
        it('return an empty array when nothing removed', function () {
            var ret = Ext.Array._spliceSim([1,2,3,4], 1, 0);
            expect(Ext.encode(ret)).toEqual('[]');
        });
    });

    describe('slice', function(){
        
        var array;
        
        describe('with Array', function(){
            beforeEach(function(){
                array = [{0:0}, {1:1}, {2:2}, {3:3}];
            });
            tests();
        });
        
        describe('with arguments', function(){
            beforeEach(function(){
                array = (function(){ return arguments; })({0:0}, {1:1}, {2:2}, {3:3});
            });
            tests();
        });
        
        function tests(){
            it('should shallow clone', function(){
                var newArray = Ext.Array.slice(array, 0);
                expect(newArray === array).toBe(false);
                expect(newArray[0] === array[0]).toBe(true);
            });
            it('should not require a begin or end', function(){
                var newArray = Ext.Array.slice(array);
                expect(newArray === array).toBe(false);
                expect(newArray[0]).toBe(array[0]);
            });
            it('should slice off the first item', function(){
                var newArray = Ext.Array.slice(array, 1);
                expect(newArray.length).toBe(3);
                expect(newArray[0]).toBe(array[1]);
                expect(newArray[2]).toBe(array[3]);
            });
            it('should ignore `end` if undefined', function(){
                var newArray = Ext.Array.slice(array, 1, undefined);
                expect(newArray.length).toBe(3);
                expect(newArray[0]).toBe(array[1]);
                expect(newArray[2]).toBe(array[3]);
            });
            it('should ignore `begin` if undefined', function(){
                var newArray = Ext.Array.slice(array, undefined);
                expect(newArray.length).toBe(4);
                expect(newArray[0]).toBe(array[0]);
                expect(newArray[3]).toBe(array[3]);
            });
            it('should ignore `begin` and `end` if undefined', function(){
                var newArray = Ext.Array.slice(array, undefined, undefined);
                expect(newArray.length).toBe(4);
                expect(newArray[0]).toBe(array[0]);
                expect(newArray[3]).toBe(array[3]);
            });
            it('should slice out the middle', function(){
                var newArray = Ext.Array.slice(array, 1, -1);
                expect(newArray.length).toBe(2);
                expect(newArray[0]).toBe(array[1]);
                expect(newArray[1]).toBe(array[2]);
            });
        }
    });
});


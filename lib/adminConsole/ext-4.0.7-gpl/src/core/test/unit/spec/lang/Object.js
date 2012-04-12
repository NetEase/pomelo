/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Object", function(){

    describe("getKeys", function(){
        var getKeys = Ext.Object.getKeys;
        it("should return an empty array for a null value", function(){
            expect(getKeys(null)).toEqual([]);
        });

        it("should return an empty array for an empty object", function(){
            expect(getKeys({})).toEqual([]);
        });

        it("should return all the keys in the object", function(){
            expect(getKeys({
                foo: 1,
                bar: 2,
                baz: 3
            })).toEqual(['foo', 'bar', 'baz']);
        });
    });

    describe("getValues", function(){
        var getValues = Ext.Object.getValues;
        it("should return an empty array for a null value", function(){
            expect(getValues(null)).toEqual([]);
        });

        it("should return an empty array for an empty object", function(){
            expect(getValues({})).toEqual([]);
        });

        it("should return all the values in the object", function(){
            expect(getValues({
                foo: 1,
                bar: 2,
                baz: 3
            })).toEqual([1, 2, 3]);
        });
    });

    describe("getKey", function(){
        var getKey = Ext.Object.getKey;

        it("should return null for a null object", function(){
            expect(getKey(null, 'foo')).toBeNull();
        });

        it("should return null for an empty object", function(){
            expect(getKey({}, 'foo')).toBeNull();
        });

        it("should return null if the value doesn't exist", function(){
            expect(getKey({
                foo: 1,
                bar: 2
            }, 3)).toBeNull();
        });

        it("should only do strict matching", function(){
            expect(getKey({
                foo: 1
            }, '1')).toBeNull();
        });

        it("should return the correct key if it matches", function(){
            expect(getKey({
                foo: 1
            }, 1)).toEqual('foo');
        });

        it("should only return the first matched value", function(){
            expect(getKey({
                bar: 1,
                foo: 1
            }, 1)).toEqual('bar');
        });
    });

    describe("each", function(){
        var each = Ext.Object.each;

        describe("scope/params", function(){
            it("should execute using the passed scope", function(){
                var scope = {},
                    actual;

                each({
                    foo: 1,
                    bar: 'value',
                    baz: false
                }, function(){
                    actual = this;
                }, scope);
                expect(actual).toBe(scope);
            });

            it("should default the scope to the object", function(){
                var o = {
                    foo: 1,
                    bar: 'value',
                    baz: false
                }, actual;

                each(o, function(){
                    actual = this;
                });
                expect(actual).toBe(o);
            });

            it("should execute passing the key value and object", function(){
                var keys = [],
                    values = [],
                    data = {
                        foo: 1,
                        bar: 'value',
                        baz: false
                    },
                    obj;

                each(data, function(key, value, o){
                    keys.push(key);
                    values.push(value);
                    obj = o;
                });

                expect(keys).toEqual(['foo', 'bar', 'baz']);
                expect(values).toEqual([1, 'value', false]);
                expect(obj).toBe(data);
            });
        });

        describe("stopping", function(){
            it("should not stop by default", function(){
                var count = 0;
                each({
                    a: 1,
                    b: 2,
                    c: 3,
                    d: 4
                }, function(){
                    ++count;
                });
                expect(count).toEqual(4);
            });

            it("should only stop if the function returns false", function(){
                var count = 0;
                each({
                    a: 1,
                    b: 2,
                    c: 3,
                    d: 4
                }, function(){
                    ++count;
                    return null;
                });
                expect(count).toEqual(4);
            });

            it("should stop immediately when false is returned", function(){
                var count = 0;
                each({
                    a: 1,
                    b: 2,
                    c: 3,
                    d: 4
                }, function(key){
                    ++count;
                    return key != 'b';
                });
                expect(count).toEqual(2);
            });
        });
    });

    describe("toQueryString", function(){
        var toQueryString = Ext.Object.toQueryString;

        describe("defaults", function(){
            it("should return an empty string for a null object", function(){
                expect(toQueryString(null)).toEqual('');
            });

            it("should return an empty string for an empty object", function(){
                expect(toQueryString({})).toEqual('');
            });
        });

        describe("simple values", function(){
            it("should separate a property/value by an =", function(){
                expect(toQueryString({
                    foo: 1
                })).toEqual('foo=1');
            });

            it("should separate pairs by an &", function(){
                expect(toQueryString({
                    foo: 1,
                    bar: 2
                })).toEqual('foo=1&bar=2');
            });

            it("should handle properties with empty values", function(){
                expect(toQueryString({
                    foo: null
                })).toEqual('foo=');
            });

            it("should encode dates", function(){
                var d = new Date(2011, 0, 1);
                expect(toQueryString({
                    foo: d
                })).toEqual('foo=2011-01-01T00%3A00%3A00');
            });

            it("should url encode the key", function(){
                expect(toQueryString({
                    'a prop': 1
                })).toEqual('a%20prop=1');
            });

            it("should url encode the value", function(){
                expect(toQueryString({
                    prop: '$300 & 5 cents'
                })).toEqual('prop=%24300%20%26%205%20cents');
            });

            it("should encode both key and value at the same time", function(){
               expect(toQueryString({
                   'a prop': '$300'
               })).toEqual('a%20prop=%24300');
            });
        });

        describe("arrays", function(){
            it("should support an array value", function(){
                expect(toQueryString({
                    foo: [1, 2, 3]
                })).toEqual('foo=1&foo=2&foo=3');
            });

            it("should be able to support multiple arrays", function(){
                expect(toQueryString({
                    foo: [1, 2],
                    bar: [3, 4]
                })).toEqual('foo=1&foo=2&bar=3&bar=4');
            });

            it("should be able to mix arrays and normal values", function(){
                expect(toQueryString({
                    foo: 'val1',
                    bar: ['val2', 'val3'],
                    baz: 'val4'
                })).toEqual('foo=val1&bar=val2&bar=val3&baz=val4');
            });
        });

        describe("recursive", function() {
            it("should support both nested arrays and objects", function() {
                expect(decodeURIComponent(Ext.Object.toQueryString({
                    username: 'Jacky',
                    dateOfBirth: {
                        day: 1,
                        month: 2,
                        year: 1911
                    },
                    hobbies: ['coding', 'eating', 'sleeping', [1,2]]
                }, true))).toEqual('username=Jacky&dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=1&hobbies[3][1]=2')
            })
        });

    });

    describe("merge", function(){
        var merge = Ext.Object.merge;

        describe("simple values", function(){
            it("should copy over numeric values", function(){
                expect(merge({}, 'prop1', 1)).toEqual({
                    prop1: 1
                });
            });

            it("should copy over string values", function(){
                expect(merge({}, 'prop1', 'val')).toEqual({
                    prop1: 'val'
                });
            });

            it("should copy over boolean values", function(){
                expect(merge({}, 'prop1', true)).toEqual({
                    prop1: true
                });
            });

            it("should copy over null values", function(){
                expect(merge({}, 'prop1', null)).toEqual({
                    prop1: null
                });
            });
        });

        describe("complex values", function(){
            it("should copy a simple object but not have the same reference", function(){
                var o = {
                    foo: 'prop',
                    tada: {
                        blah: 'bleh'
                    }
                }, result = merge({}, 'prop', o);

                expect(result.prop).toEqual({
                    foo: 'prop',
                    tada: {
                        blah: 'bleh'
                    }
                });
                expect(result.prop).not.toBe(o);
            });

            it("should NOT merge an instance (the constructor of which is not Object)", function(){
                var o = new Ext.Base(),
                    result = merge({}, 'prop1', o);

                expect(result.prop1).toBe(o);
            });
        });

        describe("overwriting properties", function(){
            it("should merge objects if an object exists on the source and the passed value is an object literal", function(){
                expect(merge({
                    prop: {
                        foo: 1
                    }
                }, 'prop', {
                    bar: 2
                })).toEqual({
                    prop: {
                        foo: 1,
                        bar: 2
                    }
                });
            });

            it("should copy an object reference if an object exists on the source and the passed value is some kind of class", function(){
                var o = new Ext.Base(),
                    result = merge({
                        prop: {}
                    }, 'prop', o);

                expect(result).toEqual({
                    prop: o
                });
                expect(result.prop).toBe(o);
            });

            it("should replace the value of the target object if it is not an object", function(){
                var o = new Ext.Base(),
                    result = merge({
                        prop: 1
                    }, 'prop', o);

                expect(result.prop).toEqual(o);
                expect(result.prop).toBe(o);
            });

            it("should overwrite simple values", function(){
                expect(merge({
                    prop: 1
                }, 'prop', 2)).toEqual({
                    prop: 2
                });
            });
        });

        describe("merging objects", function(){
            it("should merge objects", function(){
                expect(merge({}, {
                    foo: 1
                })).toEqual({
                    foo: 1
                });
            });

            it("should merge left to right", function(){
                expect(merge({}, {
                    foo: 1
                }, {
                    foo: 2
                }, {
                    foo: 3
                })).toEqual({
                    foo: 3
                })
            });
        });

        it("should modify and return the source", function(){
            var o = {},
                result = merge(o, 'foo', 'bar');

            expect(result.foo).toEqual('bar');
            expect(result).toBe(o);

        });
    });

    describe("toQueryObjects", function() {
        var object = {
            username: 'Jacky',
            dateOfBirth: {
                day: 1,
                month: 2,
                year: 1911
            },
            hobbies: ['coding', 'eating', 'sleeping', [1,2,3]]
        };

        it("simple key value", function() {
            expect(Ext.Object.toQueryObjects('username', 'Jacky')).toEqual([
                {
                    name: 'username',
                    value: 'Jacky'
                }
            ]);
        });

        it("non-recursive array", function() {
            expect(Ext.Object.toQueryObjects('hobbies', ['eating', 'sleeping', 'coding'])).toEqual([
                {
                    name: 'hobbies',
                    value: 'eating'
                },
                {
                    name: 'hobbies',
                    value: 'sleeping'
                },
                {
                    name: 'hobbies',
                    value: 'coding'
                }
            ]);
        });

        it("recursive object", function() {
            expect(Ext.Object.toQueryObjects('dateOfBirth', {
                day: 1,
                month: 2,
                year: 1911,
                somethingElse: {
                    nested: {
                        very: 'very',
                        deep: {
                            inHere: true
                        }
                    }
                }
            }, true)).toEqual([
                {
                    name: 'dateOfBirth[day]',
                    value: 1
                },
                {
                    name: 'dateOfBirth[month]',
                    value: 2
                },
                {
                    name: 'dateOfBirth[year]',
                    value: 1911
                },
                {
                    name: 'dateOfBirth[somethingElse][nested][very]',
                    value: 'very'
                },
                {
                    name: 'dateOfBirth[somethingElse][nested][deep][inHere]',
                    value: true
                }
            ]);
        });

        it("recursive array", function() {
            expect(Ext.Object.toQueryObjects('hobbies', [
                'eating', 'sleeping', 'coding', ['even', ['more']]
            ], true)).toEqual([
                {
                    name: 'hobbies[0]',
                    value: 'eating'
                },
                {
                    name: 'hobbies[1]',
                    value: 'sleeping'
                },
                {
                    name: 'hobbies[2]',
                    value: 'coding'
                },
                {
                    name: 'hobbies[3][0]',
                    value: 'even'
                },
                {
                    name: 'hobbies[3][1][0]',
                    value: 'more'
                }
            ]);
        });
    });

    describe("fromQueryString", function() {
        var fromQueryString = Ext.Object.fromQueryString;

        describe("standard mode", function() {
            it("empty string", function(){
                expect(fromQueryString('')).toEqual({});
            });

            it("simple single key value pair", function(){
                expect(fromQueryString('name=Jacky')).toEqual({name: 'Jacky'});
            });

            it("simple single key value pair with empty value", function(){
                expect(fromQueryString('name=')).toEqual({name: ''});
            });

            it("multiple key value pairs", function(){
                expect(fromQueryString('name=Jacky&loves=food')).toEqual({name: 'Jacky', loves: 'food'});
            });

            it("multiple key value pairs with URI encoded component", function(){
                expect(fromQueryString('a%20property=%24300%20%26%205%20cents')).toEqual({'a property': '$300 & 5 cents'});
            });

            it("simple array", function(){
                expect(fromQueryString('foo=1&foo=2&foo=3')).toEqual({foo: ['1', '2', '3']});
            });
        });

        describe("recursive mode", function() {
            it("empty string", function(){
                expect(fromQueryString('', true)).toEqual({});
            });

            it("simple single key value pair", function(){
                expect(fromQueryString('name=Jacky', true)).toEqual({name: 'Jacky'});
            });

            it("simple single key value pair with empty value", function(){
                expect(fromQueryString('name=', true)).toEqual({name: ''});
            });

            it("multiple key value pairs", function(){
                expect(fromQueryString('name=Jacky&loves=food', true)).toEqual({name: 'Jacky', loves: 'food'});
            });

            it("multiple key value pairs with URI encoded component", function(){
                expect(fromQueryString('a%20property=%24300%20%26%205%20cents', true)).toEqual({'a property': '$300 & 5 cents'});
            });

            it("simple array (last value with the same name will overwrite previous value)", function(){
                expect(fromQueryString('foo=1&foo=2&foo=3', true)).toEqual({foo: '3'});
            });

            it("simple array with empty brackets", function(){
                expect(fromQueryString('foo[]=1&foo[]=2&foo[]=3', true)).toEqual({foo: ['1', '2', '3']});
            });

            it("simple array with non-empty brackets", function(){
                expect(fromQueryString('foo[0]=1&foo[1]=2&foo[2]=3', true)).toEqual({foo: ['1', '2', '3']});
            });

            it("simple array with non-empty brackets and non sequential keys", function(){
                expect(fromQueryString('foo[3]=1&foo[1]=2&foo[2]=3&foo[0]=0', true)).toEqual({foo: ['0', '2', '3', '1']});
            });

            it("simple array with non-empty brackets and non sequential keys and holes", function(){
                expect(fromQueryString('foo[3]=1&foo[1]=2&foo[2]=3', true)).toEqual({foo: [undefined, '2', '3', '1']});
            });

            it("nested array", function(){
                expect(fromQueryString('some[0][0]=stuff&some[0][1]=morestuff&some[0][]=otherstuff&some[1]=thingelse', true)).toEqual({
                    some: [
                        ['stuff', 'morestuff', 'otherstuff'],
                        'thingelse'
                    ]
                });
            });

            it("nested object", function(){
                expect(fromQueryString('dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&dateOfBirth[extra][hour]=4&dateOfBirth[extra][minute]=30', true)).toEqual({
                    dateOfBirth: {
                        day: '1',
                        month: '2',
                        year: '1911',
                        extra: {
                            hour: '4',
                            minute: '30'
                        }
                    }
                });
            });

            it("nested mixed types", function(){
                expect(fromQueryString('username=Jacky&dateOfBirth[day]=1&dateOfBirth[month]=2&dateOfBirth[year]=1911&hobbies[0]=coding&hobbies[1]=eating&hobbies[2]=sleeping&hobbies[3][0]=nested&hobbies[3][1]=stuff', true)).toEqual({
                    username: 'Jacky',
                    dateOfBirth: {
                        day: '1',
                        month: '2',
                        year: '1911'
                    },
                    hobbies: ['coding', 'eating', 'sleeping', ['nested', 'stuff']]
                });
            });
        });
    });

});


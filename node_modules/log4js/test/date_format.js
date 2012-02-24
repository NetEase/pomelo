var vows = require('vows')
, assert = require('assert')
, dateFormat = require('../lib/date_format');

vows.describe('date_format').addBatch({
    'Date extensions': {
        topic: function() {
            return new Date(2010, 0, 11, 14, 31, 30, 5);
        },
        'should format a date as string using a pattern': function(date) {
            assert.equal(
                dateFormat.asString(dateFormat.DATETIME_FORMAT, date),
                "11 01 2010 14:31:30.005"
            );
        },
        'should default to the ISO8601 format': function(date) {
            assert.equal(
                dateFormat.asString(date),
                '2010-01-11 14:31:30.005'
            );
        }
    }
}).export(module);

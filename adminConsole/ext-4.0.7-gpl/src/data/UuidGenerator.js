/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @extend Ext.data.IdGenerator
 * @author Don Griffin
 *
 * This class generates UUID's according to RFC 4122. This class has a default id property.
 * This means that a single instance is shared unless the id property is overridden. Thus,
 * two {@link Ext.data.Model} instances configured like the following share one generator:
 *
 *     Ext.define('MyApp.data.MyModelX', {
 *         extend: 'Ext.data.Model',
 *         idgen: 'uuid'
 *     });
 *
 *     Ext.define('MyApp.data.MyModelY', {
 *         extend: 'Ext.data.Model',
 *         idgen: 'uuid'
 *     });
 *
 * This allows all models using this class to share a commonly configured instance.
 *
 * # Using Version 1 ("Sequential") UUID's
 *
 * If a server can provide a proper timestamp and a "cryptographic quality random number"
 * (as described in RFC 4122), the shared instance can be configured as follows:
 *
 *     Ext.data.IdGenerator.get('uuid').reconfigure({
 *         version: 1,
 *         clockSeq: clock, // 14 random bits
 *         salt: salt,      // 48 secure random bits (the Node field)
 *         timestamp: ts    // timestamp per Section 4.1.4
 *     });
 *
 *     // or these values can be split into 32-bit chunks:
 *
 *     Ext.data.IdGenerator.get('uuid').reconfigure({
 *         version: 1,
 *         clockSeq: clock,
 *         salt: { lo: saltLow32, hi: saltHigh32 },
 *         timestamp: { lo: timestampLow32, hi: timestamptHigh32 }
 *     });
 *
 * This approach improves the generator's uniqueness by providing a valid timestamp and
 * higher quality random data. Version 1 UUID's should not be used unless this information
 * can be provided by a server and care should be taken to avoid caching of this data.
 *
 * See http://www.ietf.org/rfc/rfc4122.txt for details.
 */
Ext.define('Ext.data.UuidGenerator', function () {
    var twoPow14 = Math.pow(2, 14),
        twoPow16 = Math.pow(2, 16),
        twoPow28 = Math.pow(2, 28),
        twoPow32 = Math.pow(2, 32);

    function toHex (value, length) {
        var ret = value.toString(16);
        if (ret.length > length) {
            ret = ret.substring(ret.length - length); // right-most digits
        } else if (ret.length < length) {
            ret = Ext.String.leftPad(ret, length, '0');
        }
        return ret;
    }

    function rand (lo, hi) {
        var v = Math.random() * (hi - lo + 1);
        return Math.floor(v) + lo;
    }

    function split (bignum) {
        if (typeof(bignum) == 'number') {
            var hi = Math.floor(bignum / twoPow32);
            return {
                lo: Math.floor(bignum - hi * twoPow32),
                hi: hi
            };
        }
        return bignum;
    }

    return {
        extend: 'Ext.data.IdGenerator',

        alias: 'idgen.uuid',

        id: 'uuid', // shared by default

        /**
         * @property {Number/Object} salt
         * When created, this value is a 48-bit number. For computation, this value is split
         * into 32-bit parts and stored in an object with `hi` and `lo` properties.
         */

        /**
         * @property {Number/Object} timestamp
         * When created, this value is a 60-bit number. For computation, this value is split
         * into 32-bit parts and stored in an object with `hi` and `lo` properties.
         */

        /**
         * @cfg {Number} version
         * The Version of UUID. Supported values are:
         *
         *  * 1 : Time-based, "sequential" UUID.
         *  * 4 : Pseudo-random UUID.
         *
         * The default is 4.
         */
        version: 4,

        constructor: function() {
            var me = this;

            me.callParent(arguments);

            me.parts = [];
            me.init();
        },

        generate: function () {
            var me = this,
                parts = me.parts,
                ts = me.timestamp;

            /*
               The magic decoder ring (derived from RFC 4122 Section 4.2.2):

               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
               |                          time_low                             |
               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
               |           time_mid            |  ver  |        time_hi        |
               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
               |res|  clock_hi |   clock_low   |    salt 0   |M|     salt 1    |
               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
               |                         salt (2-5)                            |
               +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

                         time_mid      clock_hi (low 6 bits)
                time_low     | time_hi |clock_lo
                    |        |     |   || salt[0]
                    |        |     |   ||   | salt[1..5]
                    v        v     v   vv   v v
                    0badf00d-aced-1def-b123-dfad0badbeef
                                  ^    ^     ^
                            version    |     multicast (low bit)
                                       |
                                    reserved (upper 2 bits)
            */
            parts[0] = toHex(ts.lo, 8);
            parts[1] = toHex(ts.hi & 0xFFFF, 4);
            parts[2] = toHex(((ts.hi >>> 16) & 0xFFF) | (me.version << 12), 4);
            parts[3] = toHex(0x80 | ((me.clockSeq >>> 8) & 0x3F), 2) +
                       toHex(me.clockSeq & 0xFF, 2);
            parts[4] = toHex(me.salt.hi, 4) + toHex(me.salt.lo, 8);

            if (me.version == 4) {
                me.init(); // just regenerate all the random values...
            } else {
                // sequentially increment the timestamp...
                ++ts.lo;
                if (ts.lo >= twoPow32) { // if (overflow)
                    ts.lo = 0;
                    ++ts.hi;
                }
            }

            return parts.join('-').toLowerCase();
        },

        getRecId: function (rec) {
            return rec.getId();
        },

        /**
         * @private
         */
        init: function () {
            var me = this,
                salt, time;

            if (me.version == 4) {
                // See RFC 4122 (Secion 4.4)
                //   o  If the state was unavailable (e.g., non-existent or corrupted),
                //      or the saved node ID is different than the current node ID,
                //      generate a random clock sequence value.
                me.clockSeq = rand(0, twoPow14-1);

                // we run this on every id generation...
                salt = me.salt || (me.salt = {});
                time = me.timestamp || (me.timestamp = {});

                // See RFC 4122 (Secion 4.4)
                salt.lo = rand(0, twoPow32-1);
                salt.hi = rand(0, twoPow16-1);
                time.lo = rand(0, twoPow32-1);
                time.hi = rand(0, twoPow28-1);
            } else {
                // this is run only once per-instance
                me.salt = split(me.salt);
                me.timestamp = split(me.timestamp);

                // Set multicast bit: "the least significant bit of the first octet of the
                // node ID" (nodeId = salt for this implementation):
                me.salt.hi |= 0x100;
            }
        },

        /**
         * Reconfigures this generator given new config properties.
         */
        reconfigure: function (config) {
            Ext.apply(this, config);
            this.init();
        }
    };
}());


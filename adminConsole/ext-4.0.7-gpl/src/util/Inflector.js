/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * General purpose inflector class that {@link #pluralize pluralizes}, {@link #singularize singularizes} and
 * {@link #ordinalize ordinalizes} words. Sample usage:
 *
 *     //turning singular words into plurals
 *     Ext.util.Inflector.pluralize('word'); //'words'
 *     Ext.util.Inflector.pluralize('person'); //'people'
 *     Ext.util.Inflector.pluralize('sheep'); //'sheep'
 *
 *     //turning plurals into singulars
 *     Ext.util.Inflector.singularize('words'); //'word'
 *     Ext.util.Inflector.singularize('people'); //'person'
 *     Ext.util.Inflector.singularize('sheep'); //'sheep'
 *
 *     //ordinalizing numbers
 *     Ext.util.Inflector.ordinalize(11); //"11th"
 *     Ext.util.Inflector.ordinalize(21); //"21th"
 *     Ext.util.Inflector.ordinalize(1043); //"1043rd"
 *
 * # Customization
 *
 * The Inflector comes with a default set of US English pluralization rules. These can be augmented with additional
 * rules if the default rules do not meet your application's requirements, or swapped out entirely for other languages.
 * Here is how we might add a rule that pluralizes "ox" to "oxen":
 *
 *     Ext.util.Inflector.plural(/^(ox)$/i, "$1en");
 *
 * Each rule consists of two items - a regular expression that matches one or more rules, and a replacement string. In
 * this case, the regular expression will only match the string "ox", and will replace that match with "oxen". Here's
 * how we could add the inverse rule:
 *
 *     Ext.util.Inflector.singular(/^(ox)en$/i, "$1");
 *
 * Note that the ox/oxen rules are present by default.
 */
Ext.define('Ext.util.Inflector', {

    /* Begin Definitions */

    singleton: true,

    /* End Definitions */

    /**
     * @private
     * The registered plural tuples. Each item in the array should contain two items - the first must be a regular
     * expression that matchers the singular form of a word, the second must be a String that replaces the matched
     * part of the regular expression. This is managed by the {@link #plural} method.
     * @property {Array} plurals
     */
    plurals: [
        [(/(quiz)$/i),                "$1zes"  ],
        [(/^(ox)$/i),                 "$1en"   ],
        [(/([m|l])ouse$/i),           "$1ice"  ],
        [(/(matr|vert|ind)ix|ex$/i),  "$1ices" ],
        [(/(x|ch|ss|sh)$/i),          "$1es"   ],
        [(/([^aeiouy]|qu)y$/i),       "$1ies"  ],
        [(/(hive)$/i),                "$1s"    ],
        [(/(?:([^f])fe|([lr])f)$/i),  "$1$2ves"],
        [(/sis$/i),                   "ses"    ],
        [(/([ti])um$/i),              "$1a"    ],
        [(/(buffal|tomat|potat)o$/i), "$1oes"  ],
        [(/(bu)s$/i),                 "$1ses"  ],
        [(/(alias|status|sex)$/i),    "$1es"   ],
        [(/(octop|vir)us$/i),         "$1i"    ],
        [(/(ax|test)is$/i),           "$1es"   ],
        [(/^person$/),                "people" ],
        [(/^man$/),                   "men"    ],
        [(/^(child)$/),               "$1ren"  ],
        [(/s$/i),                     "s"      ],
        [(/$/),                       "s"      ]
    ],

    /**
     * @private
     * The set of registered singular matchers. Each item in the array should contain two items - the first must be a
     * regular expression that matches the plural form of a word, the second must be a String that replaces the
     * matched part of the regular expression. This is managed by the {@link #singular} method.
     * @property {Array} singulars
     */
    singulars: [
      [(/(quiz)zes$/i),                                                    "$1"     ],
      [(/(matr)ices$/i),                                                   "$1ix"   ],
      [(/(vert|ind)ices$/i),                                               "$1ex"   ],
      [(/^(ox)en/i),                                                       "$1"     ],
      [(/(alias|status)es$/i),                                             "$1"     ],
      [(/(octop|vir)i$/i),                                                 "$1us"   ],
      [(/(cris|ax|test)es$/i),                                             "$1is"   ],
      [(/(shoe)s$/i),                                                      "$1"     ],
      [(/(o)es$/i),                                                        "$1"     ],
      [(/(bus)es$/i),                                                      "$1"     ],
      [(/([m|l])ice$/i),                                                   "$1ouse" ],
      [(/(x|ch|ss|sh)es$/i),                                               "$1"     ],
      [(/(m)ovies$/i),                                                     "$1ovie" ],
      [(/(s)eries$/i),                                                     "$1eries"],
      [(/([^aeiouy]|qu)ies$/i),                                            "$1y"    ],
      [(/([lr])ves$/i),                                                    "$1f"    ],
      [(/(tive)s$/i),                                                      "$1"     ],
      [(/(hive)s$/i),                                                      "$1"     ],
      [(/([^f])ves$/i),                                                    "$1fe"   ],
      [(/(^analy)ses$/i),                                                  "$1sis"  ],
      [(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i), "$1$2sis"],
      [(/([ti])a$/i),                                                      "$1um"   ],
      [(/(n)ews$/i),                                                       "$1ews"  ],
      [(/people$/i),                                                       "person" ],
      [(/s$/i),                                                            ""       ]
    ],

    /**
     * @private
     * The registered uncountable words
     * @property {String[]} uncountable
     */
     uncountable: [
        "sheep",
        "fish",
        "series",
        "species",
        "money",
        "rice",
        "information",
        "equipment",
        "grass",
        "mud",
        "offspring",
        "deer",
        "means"
    ],

    /**
     * Adds a new singularization rule to the Inflector. See the intro docs for more information
     * @param {RegExp} matcher The matcher regex
     * @param {String} replacer The replacement string, which can reference matches from the matcher argument
     */
    singular: function(matcher, replacer) {
        this.singulars.unshift([matcher, replacer]);
    },

    /**
     * Adds a new pluralization rule to the Inflector. See the intro docs for more information
     * @param {RegExp} matcher The matcher regex
     * @param {String} replacer The replacement string, which can reference matches from the matcher argument
     */
    plural: function(matcher, replacer) {
        this.plurals.unshift([matcher, replacer]);
    },

    /**
     * Removes all registered singularization rules
     */
    clearSingulars: function() {
        this.singulars = [];
    },

    /**
     * Removes all registered pluralization rules
     */
    clearPlurals: function() {
        this.plurals = [];
    },

    /**
     * Returns true if the given word is transnumeral (the word is its own singular and plural form - e.g. sheep, fish)
     * @param {String} word The word to test
     * @return {Boolean} True if the word is transnumeral
     */
    isTransnumeral: function(word) {
        return Ext.Array.indexOf(this.uncountable, word) != -1;
    },

    /**
     * Returns the pluralized form of a word (e.g. Ext.util.Inflector.pluralize('word') returns 'words')
     * @param {String} word The word to pluralize
     * @return {String} The pluralized form of the word
     */
    pluralize: function(word) {
        if (this.isTransnumeral(word)) {
            return word;
        }

        var plurals = this.plurals,
            length  = plurals.length,
            tuple, regex, i;

        for (i = 0; i < length; i++) {
            tuple = plurals[i];
            regex = tuple[0];

            if (regex == word || (regex.test && regex.test(word))) {
                return word.replace(regex, tuple[1]);
            }
        }

        return word;
    },

    /**
     * Returns the singularized form of a word (e.g. Ext.util.Inflector.singularize('words') returns 'word')
     * @param {String} word The word to singularize
     * @return {String} The singularized form of the word
     */
    singularize: function(word) {
        if (this.isTransnumeral(word)) {
            return word;
        }

        var singulars = this.singulars,
            length    = singulars.length,
            tuple, regex, i;

        for (i = 0; i < length; i++) {
            tuple = singulars[i];
            regex = tuple[0];

            if (regex == word || (regex.test && regex.test(word))) {
                return word.replace(regex, tuple[1]);
            }
        }

        return word;
    },

    /**
     * Returns the correct {@link Ext.data.Model Model} name for a given string. Mostly used internally by the data
     * package
     * @param {String} word The word to classify
     * @return {String} The classified version of the word
     */
    classify: function(word) {
        return Ext.String.capitalize(this.singularize(word));
    },

    /**
     * Ordinalizes a given number by adding a prefix such as 'st', 'nd', 'rd' or 'th' based on the last digit of the
     * number. 21 -> 21st, 22 -> 22nd, 23 -> 23rd, 24 -> 24th etc
     * @param {Number} number The number to ordinalize
     * @return {String} The ordinalized number
     */
    ordinalize: function(number) {
        var parsed = parseInt(number, 10),
            mod10  = parsed % 10,
            mod100 = parsed % 100;

        //11 through 13 are a special case
        if (11 <= mod100 && mod100 <= 13) {
            return number + "th";
        } else {
            switch(mod10) {
                case 1 : return number + "st";
                case 2 : return number + "nd";
                case 3 : return number + "rd";
                default: return number + "th";
            }
        }
    }
}, function() {
    //aside from the rules above, there are a number of words that have irregular pluralization so we add them here
    var irregulars = {
            alumnus: 'alumni',
            cactus : 'cacti',
            focus  : 'foci',
            nucleus: 'nuclei',
            radius: 'radii',
            stimulus: 'stimuli',
            ellipsis: 'ellipses',
            paralysis: 'paralyses',
            oasis: 'oases',
            appendix: 'appendices',
            index: 'indexes',
            beau: 'beaux',
            bureau: 'bureaux',
            tableau: 'tableaux',
            woman: 'women',
            child: 'children',
            man: 'men',
            corpus:	'corpora',
            criterion: 'criteria',
            curriculum:	'curricula',
            genus: 'genera',
            memorandum:	'memoranda',
            phenomenon:	'phenomena',
            foot: 'feet',
            goose: 'geese',
            tooth: 'teeth',
            antenna: 'antennae',
            formula: 'formulae',
            nebula: 'nebulae',
            vertebra: 'vertebrae',
            vita: 'vitae'
        },
        singular;

    for (singular in irregulars) {
        this.plural(singular, irregulars[singular]);
        this.singular(irregulars[singular], singular);
    }
});

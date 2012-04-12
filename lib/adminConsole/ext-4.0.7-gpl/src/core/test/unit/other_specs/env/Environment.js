/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Browser and Ext.OS", function() {
    var profiles = {
        Safari_502_Mac: {
            platform: 'MacIntel',
            userAgent: 'Safari_5533.18.5Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-us) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari5', 'Safari502', 'WebKit', 'WebKit533', 'WebKit533181'],
                    version: '5.0.2'
                },
                os: {
                    name: 'MacOSX',
                    flags: ['MacOSX'],
                    version: ''
                }
            }
        },

        Chrome_70517_Mac: {
            platform: 'MacIntel',
            userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7',
            expect: {
                browser: {
                    name: 'Chrome',
                    flags: ['Chrome', 'Chrome7', 'Chrome7051744', 'WebKit', 'WebKit5347', 'WebKit534'],
                    version: '7.0.517.44'
                },
                os: {
                    name: 'MacOSX',
                    flags: ['MacOSX'],
                    version: ''
                }
            }
        },

        Opera_980_Mac: {
            platform: 'MacIntel',
            userAgent: 'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.6.30 Version/10.63',
            expect: {
                browser: {
                    name: 'Opera',
                    flags: ['Opera', 'Opera9', 'Opera980', 'Presto', 'Presto2630', 'Presto2'],
                    version: '9.80'
                },
                os: {
                    name: 'MacOSX',
                    flags: ['MacOSX'],
                    version: ''
                }
            }
        },

        IE_8_Win7: {
            platform: 'Win32',
            userAgent: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; .NET CLR 3.5.30729)',
            expect: {
                browser: {
                    name: 'IE',
                    flags: ['IE', 'IE8', 'IE80', 'Trident', 'Trident4', 'Trident40'],
                    version: '8.0'
                },
                os: {
                    name: 'Windows',
                    flags: ['Windows'],
                    version: ''
                }
            }
        },

        IE_7_WinVista: {
            platform: 'Win32',
            userAgent: 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)',
            expect: {
                browser: {
                    name: 'IE',
                    flags: ['IE', 'IE7', 'IE70', 'Other'],
                    version: '7.0'
                },
                os: {
                    name: 'Windows',
                    flags: ['Windows'],
                    version: ''
                }
            }
        },

        IE_61_WinXP: {
            platform: 'Win32',
            userAgent: 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)',
            expect: {
                browser: {
                    name: 'IE',
                    flags: ['IE', 'IE6', 'IE61', 'Other'],
                    version: '6.1'
                },
                os: {
                    name: 'Windows',
                    flags: ['Windows'],
                    version: ''
                }
            }
        },

        iPad_32: {
            platform: 'iPad',
            userAgent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari404', 'WebKit', 'WebKit531', 'WebKit5312110'],
                    version: '4.0.4'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS32', 'iPad'],
                    version: '3.2'
                }
            }
        },

        iPhone_31: {
            platform: 'iPhone',
            userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit528', 'WebKit52818'],
                    version: '4.0'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS313', 'iPhone'],
                    version: '3.1.3'
                }
            }
        },

        iPod_41: {
            platform: 'iPod',
            userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B118 Safari/6531.22.7',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari405', 'WebKit', 'WebKit532', 'WebKit5329'],
                    version: '4.0.5'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS4', 'iOS41', 'iPod'],
                    version: '4.1'
                }
            }
        },

        iPod_31: {
            platform: 'iPod',
            userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit528', 'WebKit52818'],
                    version: '4.0'
                },
                os: {
                    name: 'iOS',
                    flags: ['iOS', 'iOS3', 'iOS313', 'iPod'],
                    version: '3.1.3'
                }
            }
        },

        Android_22_G2: {
            platform: 'Linux armv7l',
            userAgent: ' Mozilla/5.0 (Linux; U; Android 2.2; en-us; T-Mobile G2 Build/ FRF91) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22'],
                    version: '2.2'
                }
            }
        },

        Android_22_Desire: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-vn; Desire_A8181 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22'],
                    version: '2.2'
                }
            }
        },

        Android_22_NexusOne: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/ FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit533', 'WebKit5331'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android22'],
                    version: '2.2'
                }
            }
        },

        Android_21_GalaxyS: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; fr-fr; GT-I9000 Build/ECLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['Safari', 'Safari4', 'Safari40', 'WebKit', 'WebKit530', 'WebKit53017'],
                    version: '4.0'
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android21'],
                    version: '2.1update1'
                }
            }
        },

        Android_21_Evo: {
            platform: 'Linux armv7l',
            userAgent: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; Sprint APA9292KT Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko)',
            expect: {
                browser: {
                    name: 'Other',
                    flags: ['WebKit', 'WebKit530', 'WebKit53017'],
                    version: ''
                },
                os: {
                    name: 'Android',
                    flags: ['Android', 'Android2', 'Android21'],
                    version: '2.1update1'
                }
            }
        },

        BlackBerry_Torch: {
            platform: 'BlackBerry',
            userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.246 Mobile Safari/534.1+',
            expect: {
                browser: {
                    name: 'Safari',
                    flags: ['WebKit', 'WebKit534', 'WebKit5341', 'Safari', 'Safari6', 'Safari600246'],
                    version: '6.0.0.246'
                },
                os: {
                    name: 'BlackBerry',
                    flags: ['BlackBerry', 'BlackBerry6', 'BlackBerry600246'],
                    version: '6.0.0.246'
                }
            }
        }
    };
    
    var mockGlobal = {
            document: {
                compatMode: ""
            },
            location: {
                protocol: "http:"
            }
        },
        profile,
        expected,
        flags;

    //~ Ext.each(profiles, function(name) {
        //~ console.log(arguments);
    specFor(profiles, function(name) {
        describe(name, function() {
            beforeEach(function() {
                profile = profiles[name];

                Ext.global = Ext.merge({}, mockGlobal, {
                    navigator: {
                        platform: profile.platform,
                        userAgent: profile.userAgent
                    }
                });

                expected = profile.expect;
            });

            afterEach(function() {
                Ext.global = window;
            });

            it("Ext.env.Browser", function() {
                var browserEnv = new Ext.env.Browser();

                expect(browserEnv.name).toBe(expected.browser.name);

                expect(browserEnv.version.toString()).toBe(expected.browser.version);

                flags = [];

                for (var k in browserEnv.is) {
                    if (!browserEnv.is.hasOwnProperty(k)) {
                        continue;
                    }

                    if (browserEnv.is[k] === true) {
                        flags.push(k);
                    }
                }

                expect(flags.sort()).toEqual(expected.browser.flags.sort());
            });

            it("Ext.env.OS", function() {
                var platformEnv = new Ext.env.OS();

                expect(platformEnv.name).toBe(expected.os.name);

                expect(platformEnv.version.toString()).toBe(expected.os.version);

                flags = [];

                for (var k in platformEnv.is) {
                    if (!platformEnv.is.hasOwnProperty(k)) {
                        continue;
                    }

                    if (platformEnv.is[k] === true) {
                        flags.push(k);
                    }
                }

                expect(flags.sort()).toEqual(expected.os.flags.sort());
            });
        });


    });
        
});


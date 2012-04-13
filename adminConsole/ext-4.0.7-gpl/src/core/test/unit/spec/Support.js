/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Support", function() {
	describe("Ext.is", function() {

		var platform     = {
			detect: function(navigatorObject) {
				var result     = [];

				Ext.is.init(navigatorObject);

				if (Ext.is.Desktop) {
					result.push('Desktop');
				}
				if (Ext.is.Tablet) {
					result.push('Tablet');
				}
				if (Ext.is.Phone) {
					result.push('Phone');
				}

				if (Ext.is.iPad) {
					result.push('iPad');
				}
				if (Ext.is.iPhone) {
					result.push('iPhone');
				}
				if (Ext.is.iPod) {
					result.push('iPod');
				}

				if (Ext.is.Mac) {
					result.push('Mac');
				}
				if (Ext.is.Windows) {
					result.push('Windows');
				}
				if (Ext.is.Linux) {
					result.push('Linux');
				}
				if (Ext.is.Android) {
					result.push('Android');
				}
				if (Ext.is.iOS) {
					result.push('iOS');
				}
				if (Ext.is.Blackberry) {
					result.push('BlackBerry');
				}

				// Reset back to use actual navigator host object
				Ext.is.init(window.navigator);

				return result.join(' ');
			},

			data: {
				'Desktop Mac': {
					Safari_502_Mac: {
						platform: 'MacIntel',
						userAgent: 'Safari_5533.18.5Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-us) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5'
					},

					Chrome_70517_Mac: {
						platform: 'MacIntel',
						userAgent: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_4; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7'
					},

					Opera_1063_Mac: {
						platform: 'MacIntel',
						userAgent: 'Opera/9.80 (Macintosh; Intel Mac OS X; U; en) Presto/2.6.30 Version/10.63'
					}
				},
				'Desktop Windows': {
					IE_9Beta_Win7: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; .NET4.0C; Media Center PC 6.0)'
					},

					IE_8_Win7: {
						platform: 'Win32',
						userAgent: 'Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; .NET CLR 3.5.30729)'
					},

					IE_7_WinVista: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; MSIE 7.0; Windows NT 6.0; en-US)'
					},

					IE_61_WinXP: {
						platform: 'Win32',
						userAgent: 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)'
					},

					Firefox_36_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.2.13) Gecko/20101203 Firefox/3.6.13'
					},

					Firefox_35_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.1.15) Gecko/20101026 Firefox/3.5.15'
					},

					Firefox_3_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.9.0.19) Gecko/2010031422 Firefox/3.0.19'
					},

					Opera_1054_XP: {
						platform: 'Win32',
						userAgent: 'Opera/9.80 (Windows NT 5.1; U; en) Presto/2.5.24 Version/10.54'
					},

					Opera_964_XP: {
						platform: 'Win32',
						userAgent: 'Opera/9.64 (Windows NT 5.1; U; en) Presto/2.1.1'
					},

					Safari_5_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4'
					},

					Safari_4_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3 Safari/525.29'
					},

					Safari_3_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3 Safari/525.29'
					},

					Chrome_8_Win7: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.10 (KHTML, like Gecko) Chrome/8.0.552.215 Safari/534.10'
					},

					Chrome_7_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.7 (KHTML, like Gecko) Chrome/7.0.517.44 Safari/534.7'
					},

					Chrome_6_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.2 (KHTML, like Gecko) Chrome/6.0.453.1 Safari/534.2'
					},

					Chrome_5_XP: {
						platform: 'Win32',
						userAgent: 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/533.4 (KHTML, like Gecko) Chrome/5.0.375.126 Safari/533.4'
					}
				},
				'Tablet iPad iOS': {
					iPad_32: {
						platform: 'iPad',
						userAgent: 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10'
					}
				},
				'Phone iPhone iOS': {
					iPhone_31: {
						platform: 'iPhone',
						userAgent: 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16'
					}
				},
				'Phone iPod iOS': {
					iPod_41: {
						platform: 'iPod',
						userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 4_1 like Mac OS X; en-us) AppleWebKit/532.9 (KHTML, like Gecko) Version/4.0.5 Mobile/8B118 Safari/6531.22.7'
					},

					iPod_31: {
						platform: 'iPod',
						userAgent: 'Mozilla/5.0 (iPod; U; CPU iPhone OS 3_1_3 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7E18 Safari/528.16'
					}
				},
				'Phone Linux Android': {
					Android_22_G2: {
						platform: 'Linux armv7l',
						userAgent: ' Mozilla/5.0 (Linux; U; Android 2.2; en-us; T-Mobile G2 Build/ FRF91) AppleWebKit/533.1(KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
					},

					Android_22_Desire: {
						platform: 'Linux armv7l',
						userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-vn; Desire_A8181 Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
					},

					Android_22_NexusOne: {
						platform: 'Linux armv7l',
						userAgent: 'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/ FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1'
					},

					Android_21_GalaxyS: {
						platform: 'Linux armv7l',
						userAgent: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; fr-fr; GT-I9000 Build/ECLAIR) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17'
					},

					Android_21_Evo: {
						platform: 'Linux armv7l',
						userAgent: 'Mozilla/5.0 (Linux; U; Android 2.1-update1; en-us; Sprint APA9292KT Build/ERE27) AppleWebKit/530.17 (KHTML, like Gecko)'
					}
				},
				'Phone BlackBerry': {
					BlackBerry_Torch: {
						platform: 'BlackBerry',
						userAgent: 'Mozilla/5.0 (BlackBerry; U; BlackBerry 9800; en-US) AppleWebKit/534.1+ (KHTML, like Gecko) Version/6.0.0.246 Mobile Safari/534.1+'
					}
				}
			}
		},
		generateSpecsFor = function(type) {
			for (var data in platform.data[type]) {
				if (platform.data.hasOwnProperty(type)) {
					it("should detect " + data + " as " + type, function() {
						expect(platform.detect(platform.data[type][data])).toEqual(type);
					});
				}
			}
		};

		generateSpecsFor('Desktop Mac');
		generateSpecsFor('Desktop Windows');
		generateSpecsFor('Tablet iPad iOS');
		generateSpecsFor('Phone iPhone iOS');
		generateSpecsFor('Phone iPod iOS');
		generateSpecsFor('Phone Linux Android');
		generateSpecsFor('Phone BlackBerry');
	});

	describe("Ext.supports", function() {

		describe("OrientationChange", function() {
			it("should return true when supported", function() {
				expect(Ext.supports.OrientationChange).toBe((typeof window.orientation != 'undefined') && ('onorientationchange' in window));
			});
		});

		describe("DeviceMotion", function() {
			it("should return true when supported", function() {
				expect(Ext.supports.DeviceMotion).toBe('ondevicemotion' in window);
			});
		});

		describe("Touch", function() {
			it("should return true when supported", function() {
				expect(Ext.supports.Touch).toBe(('ontouchstart' in window) && (!Ext.is.Desktop));
			});
		});

	});
});


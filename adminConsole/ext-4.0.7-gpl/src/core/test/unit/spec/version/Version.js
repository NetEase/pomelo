/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
describe("Ext.Version", function() {
		var version = new Ext.Version("1.2.3beta");

		describe("toString", function() {
			it("should cast to string", function() {
				expect(version+"").toBe("1.2.3beta");
			});
		});

		describe("getMajor", function() {
			it("should return 1", function() {
				expect(version.getMajor()).toBe(1);
			});
		});

		describe("getMinor", function() {
			it("should return 2", function() {
				expect(version.getMinor()).toBe(2);
			});
		});

		describe("getPatch", function() {
			it("should return 3", function() {
				expect(version.getPatch()).toBe(3);
			});
		});

		describe("getBuild", function() {
			it("should return 0", function() {
				expect(version.getBuild()).toBe(0);
			});
		});

		describe("getRelease", function() {
			it("should return beta", function() {
				expect(version.getRelease()).toBe("beta");
			});
		});

		describe("getShortVersion", function() {
			it("should return 123", function() {
				expect(version.getShortVersion()).toBe("123");
			});
		});

		describe("toArray", function() {
			it("should return [1, 2, 3, 0, 'beta']", function() {
				expect(version.toArray()).toEqual([1, 2, 3, 0, 'beta']);
			});
		});

		describe("isGreaterThan", function() {
			it("should be greater than 1.2.3alpha", function() {
				expect(version.isGreaterThan("1.2.3alpha")).toBeTruthy();
			});
			it("should not be greater than 1.2.3RC", function() {
				expect(version.isGreaterThan("1.2.3RC")).toBeFalsy();
			});
		});

		describe("isLessThan", function() {
			it("should not be smaller than 1.2.3alpha", function() {
				expect(version.isLessThan("1.2.3alpha")).toBeFalsy();
			});
			it("should be smaller than 1.2.3RC", function() {
				expect(version.isLessThan("1.2.3RC")).toBeTruthy();
			});
		});

		describe("equals", function() {
			it("should equals 1.2.3beta", function() {
				expect(version.equals("1.2.3beta")).toBeTruthy();
			});
		});

		describe("match", function() {
			it("should match integer 1", function() {
				expect(version.match(1)).toBeTruthy();
			});
			it("should match float 1.2", function() {
				expect(version.match(1.2)).toBeTruthy();
			});
			it("should match string 1.2.3", function() {
				expect(version.match("1.2.3")).toBeTruthy();
			});
			it("should not match string 1.2.3alpha", function() {
				expect(version.match("1.2.3alpha")).toBeFalsy();
			});
		});
	});

	describe("Ext.Version Statics", function() {

		describe("getComponentValue", function() {
			it("should return 0", function() {
				expect(Ext.Version.getComponentValue(undefined)).toBe(0);
			});

			it("should return -2", function() {
				expect(Ext.Version.getComponentValue(-2)).toBe(-2);
			});

			it("should return 2", function() {
				expect(Ext.Version.getComponentValue("2")).toBe(2);
			});

			it("should return -5", function() {
				expect(Ext.Version.getComponentValue("alpha")).toBe(-5);
			});

			it("should return unknown", function() {
				expect(Ext.Version.getComponentValue("unknown")).toBe("unknown");
			});
		});

		describe("compare", function() {
			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.2")).toBe(1);
			});

			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", 1)).toBe(1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", 2)).toBe(-1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.4")).toBe(-1);
			});

			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3dev")).toBe(1);
			});

			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3alpha")).toBe(1);
			});

			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3a")).toBe(1);
			});

			it("should return 0", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3b")).toBe(0);
			});

			it("should return 0", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3beta")).toBe(0);
			});

			it("should return 1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3alpha")).toBe(1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3RC")).toBe(-1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3rc")).toBe(-1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3#")).toBe(-1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3pl")).toBe(-1);
			});

			it("should return -1", function() {
				expect(Ext.Version.compare("1.2.3beta", "1.2.3p")).toBe(-1);
			});
		});
	});


	describe("Versioning", function() {
		describe("Ext.setVersion", function() {
			it("should return an instance of Ext.Version", function() {
				Ext.setVersion("test", "1.0.1");

				expect(Ext.getVersion("test") instanceof Ext.Version).toBe(true);
			});
		});

		describe("deprecated Ext.version", function() {
			it("should be undefined", function() {
				expect(Ext.version).toBe(undefined);
			});
		});
});


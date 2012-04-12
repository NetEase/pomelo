/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.onReady(function(){
	// expanders
	Ext.getBody().on('click', function(e, t){
		t = Ext.get(t);
		e.stopEvent();

		var bd = t.next('div.expandable-body');
		bd.enableDisplayMode();
		var bdi = bd.first();
		var expanded = bd.isVisible();

		if(expanded){
			bd.hide();
		}else{
			bdi.hide();
			bd.show();
			bdi.slideIn('l', {duration:0.2, stopAnimation: true, easing:'easeOut'});
		}

		t.update(!expanded ? 'Hide details' : 'Show details');

	}, null, {delegate:'a.expander'});
});


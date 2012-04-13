/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Greek (Old Version) Translations by Vagelis
 * 03-June-2007
 */
Ext.onReady(function(){
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Öüñôùóç...</div>';
    }

    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} åðéëåãìÝíç(åò) ãñáììÞ(Ýò)";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Êëåßóôå áõôÞ ôçí êáñôÝëá";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Ç ôéìÞ óôï ðåäßï äåí åßíáé Ýãêõñç";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Öüñôùóç...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
        "ÉáíïõÜñéïò",
        "ÖåâñïõÜñéïò",
        "ÌÜñôéïò",
        "Áðñßëéïò",
        "ÌÜéïò",
        "Éïýíéïò",
        "Éïýëéïò",
        "Áýãïõóôïò",
        "ÓåðôÝìâñéïò",
        "Ïêôþâñéïò",
        "ÍïÝìâñéïò",
        "ÄåêÝìâñéïò"
        ];

        Ext.Date.dayNames = [
        "ÊõñéáêÞ",
        "ÄåõôÝñá",
        "Ôñßôç",
        "ÔåôÜñôç",
        "ÐÝìðôç",
        "ÐáñáóêåõÞ",
        "ÓÜââáôï"
        ];
    }

    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "ÅíôÜîåé",
            cancel : "Áêýñùóç",
            yes    : "Íáé",
            no     : "¼÷é"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // Greek Euro
            dateFormat: 'ì/ç/Å'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "ÓÞìåñá",
            minText           : "Ç çìåñïìçíßá áõôÞ åßíáé ðñéí ôçí ìéêñüôåñç çìåñïìçíßá",
            maxText           : "Ç çìåñïìçíßá áõôÞ åßíáé ìåôÜ ôçí ìåãáëýôåñç çìåñïìçíßá",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	: Ext.Date.monthNames,
            dayNames		: Ext.Date.dayNames,
            nextText          : 'Åðüìåíïò ÌÞíáò (Control+Right)',
            prevText          : 'Ðñïçãïýìåíïò ÌÞíáò (Control+Left)',
            monthYearText     : 'ÅðéëÝîôå ÌÞíá (Control+Up/Down ãéá ìåôáêßíçóç óôá Ýôç)',
            todayTip          : "{0} (Spacebar)",
            format            : "ì/ç/Å"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Óåëßäá",
            afterPageText  : "áðü {0}",
            firstText      : "Ðñþôç óåëßäá",
            prevText       : "Ðñïçãïýìåíç óåëßäá",
            nextText       : "Åðüìåíç óåëßäá",
            lastText       : "Ôåëåõôáßá óåëßäá",
            refreshText    : "ÁíáíÝùóç",
            displayMsg     : "ÅìöÜíéóç {0} - {1} áðü {2}",
            emptyMsg       : 'Äåí âñÝèçêáí åããñáöÝò ãéá åìöÜíéóç'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Ôï åëÜ÷éóôï ìÝãåèïò ãéá áõôü ôï ðåäßï åßíáé {0}",
            maxLengthText : "Ôï ìÝãéóôï ìÝãåèïò ãéá áõôü ôï ðåäßï åßíáé {0}",
            blankText     : "Ôï ðåäßï áõôü åßíáé õðï÷ñåùôïêü",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Ç åëÜ÷éóôç ôéìÞ ãéá áõôü ôï ðåäßï åßíáé {0}",
            maxText : "Ç ìÝãéóôç ôéìÞ ãéá áõôü ôï ðåäßï åßíáé {0}",
            nanText : "{0} äåí åßíáé Ýãêõñïò áñéèìüò"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "ÁðåíåñãïðïéçìÝíï",
            disabledDatesText : "ÁðåíåñãïðïéçìÝíï",
            minText           : "Ç çìåñïìçíßá ó' áõôü ôï ðåäßï ðñÝðåé íá åßíáé ìåôÜ áðü {0}",
            maxText           : "Ç çìåñïìçíßá ó' áõôü ôï ðåäßï ðñÝðåé íá åßíáé ðñéí áðü {0}",
            invalidText       : "{0} äåí åßíáé Ýãêõñç çìåñïìçíßá - ðñÝðåé íá åßíáé ôçò ìïñöÞò {1}",
            format            : "ì/ç/Å"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Öüñôùóç..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Áõôü ôï ðåäßï ðñÝðåé íá åßíáé e-mail address ôçò ìïñöÞò "user@example.com"',
            urlText      : 'Áõôü ôï ðåäßï ðñÝðåé íá åßíáé ìéá äéåýèõíóç URL ôçò ìïñöÞò "http:/'+'/www.example.com"',
            alphaText    : 'Áõôü ôï ðåäßï ðñÝðåé íá ðåñéÝ÷åé ãñÜììáôá êáé _',
            alphanumText : 'Áõôü ôï ðåäßï ðñÝðåé íá ðåñéÝ÷åé ãñÜììáôá, áñéèìïýò êáé _'
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Áýîïõóá Ôáîéíüìçóç",
            sortDescText : "Öèßíïõóá Ôáîéíüìçóç",
            lockText     : "Êëåßäùìá óôÞëçò",
            unlockText   : "Îåêëåßäùìá óôÞëçò",
            columnsText  : "ÓôÞëåò"
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "¼íïìá",
            valueText  : "ÔéìÞ",
            dateFormat : "ì/ç/Å"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Óýñåôå ãéá áëëáãÞ ìåãÝèïõò.",
            collapsibleSplitTip : "Óýñåôå ãéá áëëáãÞ ìåãÝèïõò. Double click ãéá áðüêñõøç."
        });
    }
});

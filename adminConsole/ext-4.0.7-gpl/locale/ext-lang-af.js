/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * List compiled by mystix on the extjs.com forums.
 * Thank you Mystix!
 *
 * Afrikaans Translations
 * by Thys Meintjes (20 July 2007)
 */
Ext.onReady(function() {
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Besig om te laai...</div>';
    }
    /* Ext single string translations */
    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} geselekteerde ry(e)";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Maak die oortjie toe";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Die waarde in hierdie veld is foutief";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Besig om te laai...";
    }

    /* Javascript month and days translations */
    if (Ext.Date) {
        Ext.Date.monthNames = [
        "Januarie",
        "Februarie",
        "Maart",
        "April",
        "Mei",
        "Junie",
        "Julie",
        "Augustus",
        "September",
        "Oktober",
        "November",
        "Desember"
        ];

        Ext.Date.dayNames = [
        "Sondag",
        "Maandag",
        "Dinsdag",
        "Woensdag",
        "Donderdag",
        "Vrydag",
        "Saterdag"
        ];
    }
    /* Ext components translations */
    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Kanselleer",
            yes    : "Ja",
            no     : "Nee"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'R',  // Sith Efrikan Rand
            dateFormat: 'd-m-Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Vandag",
            minText           : "Hierdie datum is vroër as die minimum datum",
            maxText           : "Hierdie dataum is later as die maximum datum",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	 : Ext.Date.monthNames,
            dayNames		 : Ext.Date.dayNames,
            nextText          : 'Volgende Maand (Beheer+Regs)',
            prevText          : 'Vorige Maand (Beheer+Links)',
            monthYearText     : "Kies 'n maand (Beheer+Op/Af volgende/vorige jaar)",
            todayTip          : "{0} (Spasie)",
            format            : "d-m-y",
            startDay          : 0
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Bladsy",
            afterPageText  : "van {0}",
            firstText      : "Eerste Bladsy",
            prevText       : "Vorige Bladsy",
            nextText       : "Volgende Bladsy",
            lastText       : "Laatste Bladsy",
            refreshText    : "Verfris",
            displayMsg     : "Wys {0} - {1} van {2}",
            emptyMsg       : 'Geen data om te wys nie'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Die minimum lengte van die veld is {0}",
            maxLengthText : "Die maximum lengte van die veld is {0}",
            blankText     : "Die veld is verpligtend",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Die minimum waarde vir die veld is {0}",
            maxText : "Die maximum waarde vir die veld is {0}",
            nanText : "{0} is nie 'n geldige waarde nie"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Afgeskakel",
            disabledDatesText : "Afgeskakel",
            minText           : "Die datum in hierdie veld moet na {0} wees",
            maxText           : "Die datum in hierdie veld moet voor {0} wees",
            invalidText       : "{0} is nie 'n geldige datum nie - datumformaat is {1}",
            format            : "d/m/y",
            altFormats        : "d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Besig om te laai..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : "Hierdie veld moet 'n e-pos adres wees met die formaat 'gebruiker@domein.za'",
            urlText      : "Hierdie veld moet 'n URL wees me die formaat 'http:/'+'/www.domein.za'",
            alphaText    : 'Die veld mag alleenlik letters en _ bevat',
            alphanumText : 'Die veld mag alleenlik letters, syfers en _ bevat'
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Sorteer Oplopend",
            sortDescText : "Sorteer Aflopend",
            lockText     : "Vries Kolom",
            unlockText   : "Ontvries Kolom",
            columnsText  : "Kolomme"
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Naam",
            valueText  : "Waarde",
            dateFormat : "Y-m-j"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Trek om grootte aan te pas.",
            collapsibleSplitTip : "Trek om grootte aan te pas. Dubbel-klik om weg te steek."
        });
    }
});

/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Latvian Translations
 * By salix 17 April 2007
 */
Ext.onReady(function() {
    if(Ext.Updater){
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Notiek ielāde...</div>';
    }
    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} iezīmētu rindu";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Aizver šo zīmni";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Vērtība šajā laukā nav pareiza";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Ielādē...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
        "Janvāris",
        "Februāris",
        "Marts",
        "Aprīlis",
        "Maijs",
        "Jūnijs",
        "Jūlijs",
        "Augusts",
        "Septembris",
        "Oktobris",
        "Novembris",
        "Decembris"
        ];

        Ext.Date.dayNames = [
        "Svētdiena",
        "Pirmdiena",
        "Otrdiena",
        "Trešdiena",
        "Ceturtdiena",
        "Piektdiena",
        "Sestdiena"
        ];
    }

    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "Labi",
            cancel : "Atcelt",
            yes    : "Jā",
            no     : "Nē"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'Ls',  // Latvian Lati
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Šodiena",
            minText           : "Norādītais datums ir mazāks par minimālo datumu",
            maxText           : "Norādītais datums ir lielāks par maksimālo datumu",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	: Ext.Date.monthNames,
            dayNames		: Ext.Date.dayNames,
            nextText          : 'Nākamais mēnesis (Control+pa labi)',
            prevText          : 'Iepriekšējais mēnesis (Control+pa kreisi)',
            monthYearText     : 'Mēneša izvēle (Control+uz augšu/uz leju lai pārslēgtu gadus)',
            todayTip          : "{0} (Tukšumzīme)",
            format            : "d.m.Y",
            startDay          : 1
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Lapa",
            afterPageText  : "no {0}",
            firstText      : "Pirmā lapa",
            prevText       : "iepriekšējā lapa",
            nextText       : "Nākamā lapa",
            lastText       : "Pēdējā lapa",
            refreshText    : "Atsvaidzināt",
            displayMsg     : "Rāda no {0} līdz {1} ierakstiem, kopā {2}",
            emptyMsg       : 'Nav datu, ko parādīt'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Minimālais garums šim laukam ir {0}",
            maxLengthText : "Maksimālais garums šim laukam ir {0}",
            blankText     : "Šis ir obligāts lauks",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Minimālais garums šim laukam ir  {0}",
            maxText : "Maksimālais garums šim laukam ir  {0}",
            nanText : "{0} nav pareizs skaitlis"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Atspējots",
            disabledDatesText : "Atspējots",
            minText           : "Datumam šajā laukā jābūt lielākam kā {0}",
            maxText           : "Datumam šajā laukā jābūt mazākam kā {0}",
            invalidText       : "{0} nav pareizs datums - tam jābūt šādā formātā: {1}",
            format            : "d.m.Y"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Ielādē..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Šajā laukā jāieraksta e-pasta adrese formātā "lietotās@domēns.lv"',
            urlText      : 'Šajā laukā jāieraksta URL formātā "http:/'+'/www.domēns.lv"',
            alphaText    : 'Šis lauks drīkst saturēt tikai burtus un _ zīmi',
            alphanumText : 'Šis lauks drīkst saturēt tikai burtus, ciparus un _ zīmi'
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Kārtot pieaugošā secībā",
            sortDescText : "Kārtot dilstošā secībā",
            lockText     : "Noslēgt kolonnu",
            unlockText   : "Atslēgt kolonnu",
            columnsText  : "Kolonnas"
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Nosaukums",
            valueText  : "Vērtība",
            dateFormat : "j.m.Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Velc, lai mainītu izmēru.",
            collapsibleSplitTip : "Velc, lai mainītu izmēru. Dubultklikšķis noslēpj apgabalu."
        });
    }
});

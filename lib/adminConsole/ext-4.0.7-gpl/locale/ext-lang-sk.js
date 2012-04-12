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
 * Slovak Translation by Michal Thomka
 * 14 April 2007
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Nahrávam...</div>';
    }
    
    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} označených riadkov";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Zavrieť túto záložku";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "Hodnota v tomto poli je nesprávna";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Nahrávam...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
           "Január",
           "Február",
           "Marec",
           "Apríl",
           "Máj",
           "Jún",
           "Júl",
           "August",
           "September",
           "Október",
           "November",
           "December"
        ];

        Ext.Date.dayNames = [
           "Nedeľa",
           "Pondelok",
           "Utorok",
           "Streda",
           "Štvrtok",
           "Piatok",
           "Sobota"
        ];
    }

    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "OK",
          cancel : "Zrušiť",
          yes    : "Áno",
          no     : "Nie"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // Slovakian Euro
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Dnes",
          minText           : "Tento dátum je menší ako minimálny možný dátum",
          maxText           : "Tento dátum je väčší ako maximálny možný dátum",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames        : Ext.Date.monthNames,
          dayNames          : Ext.Date.dayNames,
          nextText          : 'Ďalší Mesiac (Control+Doprava)',
          prevText          : 'Predch. Mesiac (Control+Doľava)',
          monthYearText     : 'Vyberte Mesiac (Control+Hore/Dole pre posun rokov)',
          todayTip          : "{0} (Medzerník)",
          format            : "d.m.Y"
       });
    }


    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "Strana",
          afterPageText  : "z {0}",
          firstText      : "Prvá Strana",
          prevText       : "Predch. Strana",
          nextText       : "Ďalšia Strana",
          lastText       : "Posledná strana",
          refreshText    : "Obnoviť",
          displayMsg     : "Zobrazujem {0} - {1} z {2}",
          emptyMsg       : 'iadne dáta'
       });
    }


    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "Minimálna dĺžka pre toto pole je {0}",
          maxLengthText : "Maximálna dĺžka pre toto pole je {0}",
          blankText     : "Toto pole je povinné",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "Minimálna hodnota pre toto pole je {0}",
          maxText : "Maximálna hodnota pre toto pole je {0}",
          nanText : "{0} je nesprávne číslo"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Zablokované",
          disabledDatesText : "Zablokované",
          minText           : "Dátum v tomto poli musí byť až po {0}",
          maxText           : "Dátum v tomto poli musí byť pred {0}",
          invalidText       : "{0} nie je správny dátum - musí byť vo formáte {1}",
          format            : "d.m.Y"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Nahrávam..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Toto pole musí byť e-mailová adresa vo formáte "user@example.com"',
          urlText      : 'Toto pole musí byť URL vo formáte "http:/'+'/www.example.com"',
          alphaText    : 'Toto pole može obsahovať iba písmená a znak _',
          alphanumText : 'Toto pole može obsahovať iba písmená, čísla a znak _'
       });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Zoradiť vzostupne",
          sortDescText : "Zoradiť zostupne",
          lockText     : "Zamknúť stľpec",
          unlockText   : "Odomknúť stľpec",
          columnsText  : "Stľpce"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Názov",
          valueText  : "Hodnota",
          dateFormat : "d.m.Y"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Potiahnite pre zmenu rozmeru",
          collapsibleSplitTip : "Potiahnite pre zmenu rozmeru. Dvojklikom schováte."
       });
    }
});

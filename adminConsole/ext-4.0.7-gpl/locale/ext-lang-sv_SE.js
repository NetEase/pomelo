/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Swedish translation (utf8-encoding)
 * By Erik Andersson, Monator Technologies
 * 24 April 2007
 * Changed by Cariad, 29 July 2007
 */
Ext.onReady(function() {
    
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Laddar...</div>';
    }

    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} markerade rad(er)";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Stäng denna flik";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "Värdet i detta fält är inte tillåtet";
    }

    if(Ext.LoadMask){
       Ext.LoadMask.prototype.msg = "Laddar...";
    }
    
    if (Ext.Date){
        Ext.Date.monthNames = [
           "januari",
           "februari",
           "mars",
           "april",
           "maj",
           "juni",
           "juli",
           "augusti",
           "september",
           "oktober",
           "november",
           "december"
        ];

        Ext.Date.dayNames = [
           "söndag",
           "måndag",
           "tisdag",
           "onsdag",
           "torsdag",
           "fredag",
           "lördag"
        ];
    }
    
    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "OK",
          cancel : "Avbryt",
          yes    : "Ja",
          no     : "Nej"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'kr',  // Swedish Krone
            dateFormat: 'Y-m-d'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Idag",
          minText           : "Detta datum inträffar före det tidigast tillåtna",
          maxText           : "Detta datum inträffar efter det senast tillåtna",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames	: Ext.Date.monthNames,
          dayNames		: Ext.Date.dayNames,
          nextText          : 'Nästa månad (Ctrl + högerpil)',
          prevText          : 'Föregående månad (Ctrl + vänsterpil)',
          monthYearText     : 'Välj en månad (Ctrl + uppåtpil/neråtpil för att ändra årtal)',
          todayTip          : "{0} (mellanslag)",
          format            : "Y-m-d",
          startDay          : 1
       });
    }

    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "Sida",
          afterPageText  : "av {0}",
          firstText      : "Första sidan",
          prevText       : "Föregående sida",
          nextText       : "Nästa sida",
          lastText       : "Sista sidan",
          refreshText    : "Uppdatera",
          displayMsg     : "Visar {0} - {1} av {2}",
          emptyMsg       : 'Det finns ingen data att visa'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "Minsta tillåtna längd för detta fält är {0}",
          maxLengthText : "Största tillåtna längd för detta fält är {0}",
          blankText     : "Detta fält är obligatoriskt",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "Minsta tillåtna värde för detta fält är {0}",
          maxText : "Största tillåtna värde för detta fält är {0}",
          nanText : "{0} är inte ett tillåtet nummer"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Inaktiverad",
          disabledDatesText : "Inaktiverad",
          minText           : "Datumet i detta fält måste inträffa efter {0}",
          maxText           : "Datumet i detta fält måste inträffa före {0}",
          invalidText       : "{0} är inte ett tillåtet datum - datum ska anges i formatet {1}",
          format            : "Y-m-d"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Laddar..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Detta fält ska innehålla en e-post adress i formatet "användare@domän.se"',
          urlText      : 'Detta fält ska innehålla en länk (URL) i formatet "http:/'+'/www.domän.se"',
          alphaText    : 'Detta fält får bara innehålla bokstäver och "_"',
          alphanumText : 'Detta fält får bara innehålla bokstäver, nummer och "_"'
       });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Sortera stigande",
          sortDescText : "Sortera fallande",
          lockText     : "Lås kolumn",
          unlockText   : "Lås upp kolumn",
          columnsText  : "Kolumner"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Namn",
          valueText  : "Värde",
          dateFormat : "Y-m-d"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Dra för att ändra storleken.",
          collapsibleSplitTip : "Dra för att ändra storleken. Dubbelklicka för att gömma."
       });
    }
});

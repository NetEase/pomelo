/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 *
 * Norwegian translation (Nynorsk: no-NN)
 * By Tore Kjørsvik 21-January-2008
 *  
 */
Ext.onReady(function (){
if(Ext.Updater) {
    Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Lastar...</div>';
}

if(Ext.view.View){
  Ext.view.View.prototype.emptyText = "";
}

if(Ext.grid.Panel){
  Ext.grid.Panel.prototype.ddText = "{0} markert(e) rad(er)";
}

if(Ext.TabPanelItem){
  Ext.TabPanelItem.prototype.closeText = "Lukk denne fana";
}

if(Ext.form.field.Base){
  Ext.form.field.Base.prototype.invalidText = "Verdien i dette feltet er ugyldig";
}

if(Ext.LoadMask){
  Ext.LoadMask.prototype.msg = "Lastar...";
}

if(Ext.Date) {
    Ext.Date.monthNames = [
      "Januar",
      "Februar",
      "Mars",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];

    Ext.Date.getShortMonthName = function(month) {
      return Ext.Date.monthNames[month].substring(0, 3);
    };

    Ext.Date.monthNumbers = {
      Jan : 0,
      Feb : 1,
      Mar : 2,
      Apr : 3,
      Mai : 4,
      Jun : 5,
      Jul : 6,
      Aug : 7,
      Sep : 8,
      Okt : 9,
      Nov : 10,
      Des : 11
    };

    Ext.Date.getMonthNumber = function(name) {
      return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    };

    Ext.Date.dayNames = [
      "Søndag",
      "Måndag",
      "Tysdag",
      "Onsdag",
      "Torsdag",
      "Fredag",
      "Laurdag"
    ];

    Ext.Date.getShortDayName = function(day) {
      return Ext.Date.dayNames[day].substring(0, 3);
    };
}

if(Ext.MessageBox){
  Ext.MessageBox.buttonText = {
    ok     : "OK",
    cancel : "Avbryt",
    yes    : "Ja",
    no     : "Nei"
  };
}

if(Ext.util.Format){
    Ext.apply(Ext.util.Format, {
        thousandSeparator: '.',
        decimalSeparator: ',',
        currencySign: 'kr',  // Norwegian Krone
        dateFormat: 'd.m.Y'
    });
}

if(Ext.picker.Date){
  Ext.apply(Ext.picker.Date.prototype, {
    todayText         : "I dag",
    minText           : "Denne datoen er før tidlegaste tillatne dato",
    maxText           : "Denne datoen er etter seinaste tillatne dato",
    disabledDaysText  : "",
    disabledDatesText : "",
    monthNames	      : Ext.Date.monthNames,
    dayNames		      : Ext.Date.dayNames,
    nextText          : 'Neste månad (Control+Pil Høgre)',
    prevText          : 'Førre månad (Control+Pil Venstre)',
    monthYearText     : 'Velj ein månad (Control+Pil Opp/Ned for å skifte år)',
    todayTip          : "{0} (Mellomrom)",
    format            : "d.m.y",
    startDay          : 1
  });
}

if(Ext.picker.Month) {
  Ext.apply(Ext.picker.Month.prototype, {
      okText            : "&#160;OK&#160;",
      cancelText        : "Avbryt"
  });
}

if(Ext.toolbar.Paging){
  Ext.apply(Ext.PagingToolbar.prototype, {
    beforePageText : "Side",
    afterPageText  : "av {0}",
    firstText      : "Første sida",
    prevText       : "Førre sida",
    nextText       : "Neste sida",
    lastText       : "Siste sida",
    refreshText    : "Oppdater",
    displayMsg     : "Viser {0} - {1} av {2}",
    emptyMsg       : 'Ingen data å vise'
  });
}

if(Ext.form.field.Text){
  Ext.apply(Ext.form.field.Text.prototype, {
    minLengthText : "Den minste lengda for dette feltet er {0}",
    maxLengthText : "Den største lengda for dette feltet er {0}",
    blankText     : "Dette feltet er påkravd",
    regexText     : "",
    emptyText     : null
  });
}

if(Ext.form.field.Number){
  Ext.apply(Ext.form.field.Number.prototype, {
    minText : "Den minste verdien for dette feltet er {0}",
    maxText : "Den største verdien for dette feltet er {0}",
    nanText : "{0} er ikkje eit gyldig nummer"
  });
}

if(Ext.form.field.Date){
  Ext.apply(Ext.form.field.Date.prototype, {
    disabledDaysText  : "Deaktivert",
    disabledDatesText : "Deaktivert",
    minText           : "Datoen i dette feltet må vere etter {0}",
    maxText           : "Datoen i dette feltet må vere før {0}",
    invalidText       : "{0} er ikkje ein gyldig dato - han må vere på formatet {1}",
    format            : "d.m.y",
    altFormats        : "d.m.Y|d/m/y|d/m/Y|d-m-y|d-m-Y|d.m|d/m|d-m|dm|dmy|dmY|Y-m-d|d"
  });
}

if(Ext.form.field.ComboBox){
  Ext.apply(Ext.form.field.ComboBox.prototype, {
    valueNotFoundText : undefined
  });
    Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
        loadingText       : "Lastar..."
    });
}

if(Ext.form.field.VTypes){
   Ext.apply(Ext.form.field.VTypes, {
      emailText    : 'Dette feltet skal vere ei epost adresse på formatet "bruker@domene.no"',
      urlText      : 'Dette feltet skal vere ein link (URL) på formatet "http:/'+'/www.domene.no"',
      alphaText    : 'Dette feltet skal berre innehalde bokstavar og _',
      alphanumText : 'Dette feltet skal berre innehalde bokstavar, tal og _'
   });
}

if(Ext.form.field.HtmlEditor){
  Ext.apply(Ext.form.field.HtmlEditor.prototype, {
    createLinkText : 'Ver venleg og skriv inn URL for lenken:',
    buttonTips : {
      bold : {
        title: 'Feit (Ctrl+B)',
        text: 'Gjer den valde teksten feit.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      italic : {
        title: 'Kursiv (Ctrl+I)',
        text: 'Gjer den valde teksten kursiv.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      underline : {
        title: 'Understrek (Ctrl+U)',
        text: 'Understrek den valde teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      increasefontsize : {
        title: 'Forstørr tekst',
        text: 'Gjer fontstorleik større.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      decreasefontsize : {
        title: 'Forminsk tekst',
        text: 'Gjer fontstorleik mindre.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      backcolor : {
        title: 'Tekst markeringsfarge',
        text: 'Endre bakgrunnsfarge til den valde teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      forecolor : {
        title: 'Font farge',
        text: 'Endre farge på den valde teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifyleft : {
        title: 'Venstrejuster tekst',
        text: 'Venstrejuster teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifycenter : {
        title: 'Sentrer tekst',
        text: 'Sentrer teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifyright : {
        title: 'Høgrejuster tekst',
        text: 'Høgrejuster teksten.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      insertunorderedlist : {
        title: 'Punktliste',
        text: 'Start ei punktliste.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      insertorderedlist : {
        title: 'Nummerert liste',
        text: 'Start ei nummerert liste.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      createlink : {
        title: 'Lenke',
        text: 'Gjer den valde teksten til ei lenke.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      sourceedit : {
        title: 'Rediger kjelde',
        text: 'Bytt til kjelderedigeringsvising.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      }
    }
  });
}

if(Ext.grid.header.Container){
  Ext.apply(Ext.grid.header.Container.prototype, {
    sortAscText  : "Sorter stigande",
    sortDescText : "Sorter fallande",
    lockText     : "Lås kolonne",
    unlockText   : "Lås opp kolonne",
    columnsText  : "Kolonner"
  });
}

if(Ext.grid.GroupingFeature){
  Ext.apply(Ext.grid.GroupingFeature.prototype, {
    emptyGroupText : '(Ingen)',
    groupByText    : 'Grupper etter dette feltet',
    showGroupsText : 'Vis i grupper'
  });
}

if(Ext.grid.PropertyColumnModel){
  Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
    nameText   : "Namn",
    valueText  : "Verdi",
    dateFormat : "d.m.Y"
  });
}

if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
  Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
    splitTip            : "Dra for å endre storleik.",
    collapsibleSplitTip : "Dra for å endre storleik. Dobbelklikk for å skjule."
  });
}

});

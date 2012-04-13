/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Italian translation
 * By eric_void
 * 04-10-2007, 11:25 AM
 * Updated by Federico Grilli 21/12/2007 
 */
Ext.onReady(function(){
    if(Ext.Updater){
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Caricamento in corso...</div>';
    }

    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} righe selezionate";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Chiudi pannello";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "Valore non valido";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Caricamento in corso...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
           "Gennaio",
           "Febbraio",
           "Marzo",
           "Aprile",
           "Maggio",
           "Giugno",
           "Luglio",
           "Agosto",
           "Settembre",
           "Ottobre",
           "Novembre",
           "Dicembre"
        ];

        Ext.Date.getShortMonthName = function(month) {
          return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
          Gen : 0,
          Feb : 1,
          Mar : 2,
          Apr : 3,
          Mag : 4,
          Giu : 5,
          Lug : 6,
          Ago : 7,
          Set : 8,
          Ott : 9,
          Nov : 10,
          Dic : 11
        };

        Ext.Date.getMonthNumber = function(name) {
          return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = [
           "Domenica",
           "Luned\u00EC",
           "Marted\u00EC",
           "Mercoled\u00EC",
           "Gioved\u00EC",
           "Venerd\u00EC",
           "Sabato"
        ];

        Ext.Date.getShortDayName = function(day) {
          return Ext.Date.dayNames[day].substring(0, 3);
        };
    }

    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "OK",
          cancel : "Annulla",
          yes    : "S\u00EC",
          no     : "No"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // Italian Euro
            dateFormat: 'd/m/Y'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Oggi",
          minText           : "Data precedente alla data minima",
          maxText           : "Data successiva alla data massima",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames		: Ext.Date.monthNames,
          dayNames			: Ext.Date.dayNames,
          nextText          : 'Mese successivo (Ctrl+Destra)',
          prevText          : 'Mese precedente (Ctrl+Sinistra)',
          monthYearText     : 'Scegli un mese (Ctrl+Su/Giu per cambiare anno)',
          todayTip          : "{0} (Barra spaziatrice)",
          format            : "d/m/y",
    	  startDay          : 1
       });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;OK&#160;",
          cancelText        : "Annulla"
      });
    }

    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "Pagina",
          afterPageText  : "di {0}",
          firstText      : "Prima pagina",
          prevText       : "Pagina precedente",
          nextText       : "Pagina successiva",
          lastText       : "Ultima pagina",
          refreshText    : "Aggiorna",
          displayMsg     : "Record {0} - {1} di {2}",
          emptyMsg       : 'Nessun dato da mostrare'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "La lunghezza minima \u00E8 {0}",
          maxLengthText : "La lunghezza massima \u00E8 {0}",
          blankText     : "Campo obbligatorio",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "Il valore minimo \u00E8 {0}",
          maxText : "Il valore massimo \u00E8 {0}",
          nanText : "{0} non \u00E8 un valore numerico corretto",
          decimalSeparator: ','
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Disabilitato",
          disabledDatesText : "Disabilitato",
          minText           : "La data deve essere successiva al {0}",
          maxText           : "La data deve essere precedente al {0}",
          invalidText       : "{0} non \u00E8 una data valida. Deve essere nel formato {1}",
          format            : "d/m/y",
          altFormats        : "d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Caricamento in corso..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Il campo deve essere un indirizzo e-mail nel formato "user@example.com"',
          urlText      : 'Il campo deve essere un indirizzo web nel formato "http:/'+'/www.example.com"',
          alphaText    : 'Il campo deve contenere solo lettere e _',
          alphanumText : 'Il campo deve contenere solo lettere, numeri e _'
       });
    }

    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : 'Inserire un URL per il link:',
        buttonTips : {
          bold : {
            title: 'Grassetto (Ctrl+B)',
            text: 'Rende il testo selezionato in grassetto.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: 'Corsivo (Ctrl+I)',
            text: 'Rende il testo selezionato in corsivo.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: 'Sottolinea (Ctrl+U)',
            text: 'Sottolinea il testo selezionato.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: 'Ingrandisci testo',
            text: 'Aumenta la dimensione del carattere.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: 'Rimpicciolisci testo',
            text: 'Diminuisce la dimensione del carattere.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: 'Colore evidenziatore testo',
            text: 'Modifica il colore di sfondo del testo selezionato.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: 'Colore carattere',
            text: 'Modifica il colore del testo selezionato.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: 'Allinea a sinistra',
            text: 'Allinea il testo a sinistra.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: 'Centra',
            text: 'Centra il testo.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: 'Allinea a destra',
            text: 'Allinea il testo a destra.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: 'Elenco puntato',
            text: 'Elenco puntato.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: 'Elenco numerato',
            text: 'Elenco numerato.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: 'Collegamento',
            text: 'Trasforma il testo selezionato in un collegamanto.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: 'Sorgente',
            text: 'Passa alla modalit\u00E0 editing del sorgente.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Ordinamento crescente",
          sortDescText : "Ordinamento decrescente",
          lockText     : "Blocca colonna",
          unlockText   : "Sblocca colonna",
          columnsText  : "Colonne"
       });
    }

    if(Ext.grid.GroupingFeature){
      Ext.apply(Ext.grid.GroupingFeature.prototype, {
        emptyGroupText : '(Nessun dato)',
        groupByText    : 'Raggruppa per questo campo',
        showGroupsText : 'Mostra nei gruppi'
      });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Nome",
          valueText  : "Valore",
          dateFormat : "j/m/Y"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Trascina per cambiare dimensioni.",
          collapsibleSplitTip : "Trascina per cambiare dimensioni. Doppio click per nascondere."
       });
    }

});


/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * German translation
 * 2007-Apr-07 update by schmidetzki and humpdi
 * 2007-Oct-31 update by wm003
 * 2009-Jul-10 update by Patrick Matsumura and Rupert Quaderer
 * 2010-Mar-10 update by Volker Grabsch
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Übertrage Daten ...</div>';
    }

    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} Zeile(n) ausgewählt";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Diesen Tab schließen";
    }

    if(Ext.form.Basic){
        Ext.form.Basic.prototype.waitTitle = "Bitte warten...";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Der Wert des Feldes ist nicht korrekt";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Übertrage Daten...";
    }

    if (Ext.Date) {
        Ext.Date.monthNames = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember"
        ];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
            Jan : 0,
            Feb : 1,
            "M\u00e4r" : 2,
            Apr : 3,
            Mai : 4,
            Jun : 5,
            Jul : 6,
            Aug : 7,
            Sep : 8,
            Okt : 9,
            Nov : 10,
            Dez : 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = [
        "Sonntag",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }
    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Abbrechen",
            yes    : "Ja",
            no     : "Nein"
        };
        
        // As of 4.0.4, setting the buttonText above does not take effect properly. This should be removable in 4.1.0
        // (see issue EXTJSIV-3909)
        Ext.MessageBox.msgButtons['ok'].text = Ext.MessageBox.buttonText.ok;
        Ext.MessageBox.msgButtons['cancel'].text = Ext.MessageBox.buttonText.cancel;
        Ext.MessageBox.msgButtons['yes'].text = Ext.MessageBox.buttonText.yes;
        Ext.MessageBox.msgButtons['no'].text = Ext.MessageBox.buttonText.no;
    }

    if(Ext.util.Format){
        Ext.util.Format.__number = Ext.util.Format.number;
        Ext.util.Format.number = function(v, format) {
            return Ext.util.Format.__number(v, format || "0.000,00/i");
        };

        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // German Euro
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Heute",
            minText           : "Dieses Datum liegt von dem erstmöglichen Datum",
            maxText           : "Dieses Datum liegt nach dem letztmöglichen Datum",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames        : Ext.Date.monthNames,
            dayNames          : Ext.Date.dayNames,
            nextText          : "Nächster Monat (Strg/Control + Rechts)",
            prevText          : "Vorheriger Monat (Strg/Control + Links)",
            monthYearText     : "Monat auswählen (Strg/Control + Hoch/Runter, um ein Jahr auszuwählen)",
            todayTip          : "Heute ({0}) (Leertaste)",
            format            : "d.m.Y",
            startDay          : 1
        });
    }

    if(Ext.picker.Month) {
        Ext.apply(Ext.picker.Month.prototype, {
            okText            : "&#160;OK&#160;",
            cancelText        : "Abbrechen"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Seite",
            afterPageText  : "von {0}",
            firstText      : "Erste Seite",
            prevText       : "vorherige Seite",
            nextText       : "nächste Seite",
            lastText       : "letzte Seite",
            refreshText    : "Aktualisieren",
            displayMsg     : "Anzeige Eintrag {0} - {1} von {2}",
            emptyMsg       : "Keine Daten vorhanden"
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Bitte geben Sie mindestens {0} Zeichen ein",
            maxLengthText : "Bitte geben Sie maximal {0} Zeichen ein",
            blankText     : "Dieses Feld darf nicht leer sein",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Der Mindestwert für dieses Feld ist {0}",
            maxText : "Der Maximalwert für dieses Feld ist {0}",
            nanText : "{0} ist keine Zahl",
            decimalSeparator : ","
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "nicht erlaubt",
            disabledDatesText : "nicht erlaubt",
            minText           : "Das Datum in diesem Feld muss nach dem {0} liegen",
            maxText           : "Das Datum in diesem Feld muss vor dem {0} liegen",
            invalidText       : "{0} ist kein gültiges Datum - es muss im Format {1} eingegeben werden",
            format            : "d.m.Y",
            altFormats        : "j.n.Y|j.n.y|j.n.|j.|j/n/Y|j/n/y|j-n-y|j-n-Y|j/n|j-n|dm|dmy|dmY|j|Y-n-j"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Lade Daten ..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Dieses Feld sollte eine E-Mail-Adresse enthalten. Format: "user@example.com"',
            urlText      : 'Dieses Feld sollte eine URL enthalten. Format: "http:/'+'/www.example.com"',
            alphaText    : 'Dieses Feld darf nur Buchstaben enthalten und _',
            alphanumText : 'Dieses Feld darf nur Buchstaben und Zahlen enthalten und _'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Bitte geben Sie die URL für den Link ein:',
            buttonTips : {
                bold : {
                    title: 'Fett (Ctrl+B)',
                    text: 'Erstellt den ausgewählten Text in Fettschrift.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: 'Kursiv (Ctrl+I)',
                    text: 'Erstellt den ausgewählten Text in Schrägschrift.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: 'Unterstrichen (Ctrl+U)',
                    text: 'Unterstreicht den ausgewählten Text.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'Text vergößern',
                    text: 'Erhöht die Schriftgröße.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'Text verkleinern',
                    text: 'Verringert die Schriftgröße.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'Text farblich hervorheben',
                    text: 'Hintergrundfarbe des ausgewählten Textes ändern.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'Schriftfarbe',
                    text: 'Farbe des ausgewählten Textes ändern.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft : {
                    title: 'Linksbündig',
                    text: 'Setzt den Text linksbündig.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter : {
                    title: 'Zentrieren',
                    text: 'Zentriert den Text in Editor.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright : {
                    title: 'Rechtsbündig',
                    text: 'Setzt den Text rechtsbündig.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'Aufzählungsliste',
                    text: 'Beginnt eine Aufzählungsliste mit Spiegelstrichen.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'Numerierte Liste',
                    text: 'Beginnt eine numerierte Liste.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'Hyperlink',
                    text: 'Erstellt einen Hyperlink aus dem ausgewählten text.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'Source bearbeiten',
                    text: 'Zur Bearbeitung des Quelltextes wechseln.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Aufsteigend sortieren",
            sortDescText : "Absteigend sortieren",
            lockText     : "Spalte sperren",
            unlockText   : "Spalte freigeben (entsperren)",
            columnsText  : "Spalten"
        });
    }

    if(Ext.grid.GroupingFeature){
        Ext.apply(Ext.grid.GroupingFeature.prototype, {
            emptyGroupText : '(Keine)',
            groupByText    : 'Dieses Feld gruppieren',
            showGroupsText : 'In Gruppen anzeigen'
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Name",
            valueText  : "Wert",
            dateFormat : "d.m.Y"
        });
    }

    if(Ext.grid.BooleanColumn){
        Ext.apply(Ext.grid.BooleanColumn.prototype, {
            trueText  : "wahr",
            falseText : "falsch"
        });
    }

    if(Ext.grid.NumberColumn){
        Ext.apply(Ext.grid.NumberColumn.prototype, {
            format : '0.000,00/i'
        });
    }

    if(Ext.grid.DateColumn){
        Ext.apply(Ext.grid.DateColumn.prototype, {
            format : 'd.m.Y'
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Ziehen, um Größe zu ändern.",
            collapsibleSplitTip : "Ziehen, um Größe zu ändern. Doppelklick um Panel auszublenden."
        });
    }

    if(Ext.form.field.Time){
        Ext.apply(Ext.form.field.Time.prototype, {
            minText : "Die Zeit muss gleich oder nach {0} liegen",
            maxText : "Die Zeit muss gleich oder vor {0} liegen",
            invalidText : "{0} ist keine gültige Zeit",
            format : "H:i"
        });
    }

    if(Ext.form.CheckboxGroup){
        Ext.apply(Ext.form.CheckboxGroup.prototype, {
            blankText : "Du mußt mehr als einen Eintrag aus der Gruppe auswählen"
        });
    }

    if(Ext.form.RadioGroup){
        Ext.apply(Ext.form.RadioGroup.prototype, {
            blankText : "Du mußt einen Eintrag aus der Gruppe auswählen"
        });
    }
});

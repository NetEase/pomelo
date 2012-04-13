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
 * Norwegian translation (Bokmål: no-NB)
 * By Tore Kjørsvik 21-January-2008
 *  
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Laster...</div>';
    }

    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} markert(e) rad(er)";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Lukk denne fanen";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Verdien i dette feltet er ugyldig";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Laster...";
    }

    if(Ext.Date){
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
        "Mandag",
        "Tirsdag",
        "Onsdag",
        "Torsdag",
        "Fredag",
        "Lørdag"
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
            minText           : "Denne datoen er før tidligste tillatte dato",
            maxText           : "Denne datoen er etter seneste tillatte dato",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	      : Ext.Date.monthNames,
            dayNames		      : Ext.Date.dayNames,
            nextText          : 'Neste måned (Control+Pil Høyre)',
            prevText          : 'Forrige måned (Control+Pil Venstre)',
            monthYearText     : 'Velg en måned (Control+Pil Opp/Ned for å skifte år)',
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
            firstText      : "Første side",
            prevText       : "Forrige side",
            nextText       : "Neste side",
            lastText       : "Siste side",
            refreshText    : "Oppdater",
            displayMsg     : "Viser {0} - {1} av {2}",
            emptyMsg       : 'Ingen data å vise'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Den minste lengden for dette feltet er {0}",
            maxLengthText : "Den største lengden for dette feltet er {0}",
            blankText     : "Dette feltet er påkrevd",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Den minste verdien for dette feltet er {0}",
            maxText : "Den største verdien for dette feltet er {0}",
            nanText : "{0} er ikke et gyldig nummer"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Deaktivert",
            disabledDatesText : "Deaktivert",
            minText           : "Datoen i dette feltet må være etter {0}",
            maxText           : "Datoen i dette feltet må være før {0}",
            invalidText       : "{0} er ikke en gyldig dato - den må være på formatet {1}",
            format            : "d.m.y",
            altFormats        : "d.m.Y|d/m/y|d/m/Y|d-m-y|d-m-Y|d.m|d/m|d-m|dm|dmy|dmY|Y-m-d|d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Laster..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Dette feltet skal være en epost adresse på formatet "bruker@domene.no"',
            urlText      : 'Dette feltet skal være en link (URL) på formatet "http:/'+'/www.domene.no"',
            alphaText    : 'Dette feltet skal kun inneholde bokstaver og _',
            alphanumText : 'Dette feltet skal kun inneholde bokstaver, tall og _'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Vennligst skriv inn URL for lenken:',
            buttonTips : {
                bold : {
                    title: 'Fet (Ctrl+B)',
                    text: 'Gjør den valgte teksten fet.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: 'Kursiv (Ctrl+I)',
                    text: 'Gjør den valgte teksten kursiv.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: 'Understrek (Ctrl+U)',
                    text: 'Understrek den valgte teksten.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'Forstørr tekst',
                    text: 'Gjør fontstørrelse større.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'Forminsk tekst',
                    text: 'Gjør fontstørrelse mindre.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'Tekst markeringsfarge',
                    text: 'Endre bakgrunnsfarge til den valgte teksten.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'Font farge',
                    text: 'Endre farge på den valgte teksten.',
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
                    title: 'Høyrejuster tekst',
                    text: 'Høyrejuster teksten.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'Punktliste',
                    text: 'Start en punktliste.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'Nummerert liste',
                    text: 'Start en nummerert liste.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'Lenke',
                    text: 'Gjør den valgte teksten til en lenke.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'Rediger kilde',
                    text: 'Bytt til kilderedigeringsvisning.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Sorter stigende",
            sortDescText : "Sorter synkende",
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
            nameText   : "Navn",
            valueText  : "Verdi",
            dateFormat : "d.m.Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Dra for å endre størrelse.",
            collapsibleSplitTip : "Dra for å endre størrelse. Dobbelklikk for å skjule."
        });
    }
});

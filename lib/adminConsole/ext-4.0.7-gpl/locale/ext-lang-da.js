/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Danish translation
 * By JohnF
 * 04-09-2007, 05:28 AM
 * 
 * Extended and modified by Karl Krukow, 
 * December, 2007.
 */
Ext.onReady(function() {
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Henter...</div>';
    }
    
    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} markerede rækker";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Luk denne fane";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Værdien i dette felt er ugyldig";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Henter...";
    }

    if (Ext.Date) {
        Ext.Date.monthNames = [
        "januar",
        "februar",
        "marts",
        "april",
        "maj",
        "juni",
        "juli",
        "august",
        "september",
        "oktober",
        "november",
        "december"
        ];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.monthNames[month].substring(0, 3);
        };

        Ext.Date.monthNumbers = {
            Jan : 0,
            Feb : 1,
            Mar : 2,
            Apr : 3,
            May : 4,
            Jun : 5,
            Jul : 6,
            Aug : 7,
            Sep : 8,
            Oct : 9,
            Nov : 10,
            Dec : 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
        };

        Ext.Date.dayNames = [
        "søndag",
        "mandag",
        "tirsdag",
        "onsdag",
        "torsdag",
        "fredag",
        "lørdag"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }

    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Fortryd",
            yes    : "Ja",
            no     : "Nej"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'kr',  // Danish Krone
            dateFormat: 'd/m/Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "I dag",
            minText           : "Denne dato er før den tidligst tilladte",
            maxText           : "Denne dato er senere end den senest tilladte",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames        : Ext.Date.monthNames,
            dayNames          : Ext.Date.dayNames,      
            nextText          : 'Næste måned (Ctrl + højre piltast)',
            prevText          : 'Forrige måned (Ctrl + venstre piltast)',
            monthYearText     : 'Vælg en måned (Ctrl + op/ned pil for at ændre årstal)',
            todayTip          : "{0} (mellemrum)",
            format            : "d/m/y",
            startDay          : 1
        });
    }

    if(Ext.picker.Month) {
        Ext.apply(Ext.picker.Month.prototype, {
            okText            : "&#160;OK&#160;",
            cancelText        : "Cancel"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Side",
            afterPageText  : "af {0}",
            firstText      : "Første side",
            prevText       : "Forrige side",
            nextText       : "Næste side",
            lastText       : "Sidste side",
            refreshText    : "Opfrisk",
            displayMsg     : "Viser {0} - {1} af {2}",
            emptyMsg       : 'Der er ingen data at vise'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Minimum længden for dette felt er {0}",
            maxLengthText : "Maksimum længden for dette felt er {0}",
            blankText     : "Dette felt skal udfyldes",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Mindste-værdien for dette felt er {0}",
            maxText : "Maksimum-værdien for dette felt er {0}",
            nanText : "{0} er ikke et tilladt nummer"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Inaktiveret",
            disabledDatesText : "Inaktiveret",
            minText           : "Datoen i dette felt skal være efter {0}",
            maxText           : "Datoen i dette felt skal være før {0}",
            invalidText       : "{0} er ikke en tilladt dato - datoer skal angives i formatet {1}",
            format            : "d/m/y",
            altFormats        : "d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Henter..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Dette felt skal være en email adresse i formatet "xxx@yyy.zzz"',
            urlText      : 'Dette felt skal være en URL i formatet "http:/'+'/xxx.yyy"',
            alphaText    : 'Dette felt kan kun indeholde bogstaver og "_" (understregning)',
            alphanumText : 'Dette felt kan kun indeholde bogstaver, tal og "_" (understregning)'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Indtast URL:',
            buttonTips : {
                bold : {
                    title: 'Fed (Ctrl+B)', //Can I change this to Ctrl+F?
                    text: 'Formater det markerede tekst med fed.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: 'Kursiv (Ctrl+I)',//Ctrl+K
                    text: 'Formater det markerede tekst med kursiv.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: 'Understreg (Ctrl+U)',
                    text: 'Understreg det markerede tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'Forstør tekst',
                    text: 'Forøg fontstørrelsen.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'Formindsk tekst',
                    text: 'Formindsk fontstørrelsen.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'Farve for tekstfremhævelse',
                    text: 'Skift baggrundsfarve for det markerede tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'Skriftfarve',
                    text: 'Skift skriftfarve for det markerede tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft : {
                    title: 'Juster venstre',
                    text: 'Venstrestil tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter : {
                    title: 'Centreret',
                    text: 'Centrer tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright : {
                    title: 'Juster højre',
                    text: 'Højrestil tekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'Punktopstilling',
                    text: 'Påbegynd punktopstilling.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'Nummereret opstilling',
                    text: 'Påbegynd nummereret opstilling.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'Hyperlink',
                    text: 'Lav det markerede test til et hyperlink.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'Kildetekstredigering',
                    text: 'Skift til redigering af kildetekst.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Sortér stigende",
            sortDescText : "Sortér faldende",
            lockText     : "Lås kolonne",
            unlockText   : "Fjern lås fra kolonne",
            columnsText  : "Kolonner"
        });
    }

    if(Ext.grid.GroupingFeature){
        Ext.apply(Ext.grid.GroupingFeature.prototype, {
            emptyGroupText : '(Ingen)',
            groupByText    : 'Gruppér efter dette felt',
            showGroupsText : 'Vis i grupper' //should this be sort in groups?
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Navn",
            valueText  : "Værdi",
            dateFormat : "j/m/Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Træk for at ændre størrelsen.",
            collapsibleSplitTip : "Træk for at ændre størrelsen. Dobbelt-klik for at skjule."
        });
    }

});

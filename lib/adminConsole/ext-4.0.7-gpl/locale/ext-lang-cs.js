/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Czech Translations
 * Translated by Tomáš Korčák (72)
 * 2008/02/08 18:02, Ext-2.0.1
 */
Ext.onReady(function() {
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Prosím čekejte...</div>';
    }

    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} vybraných řádků";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Zavřít záložku";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Hodnota v tomto poli je neplatná";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Prosím čekejte...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
        "Leden",
        "Únor",
        "Březen",
        "Duben",
        "Květen",
        "Červen",
        "Červenec",
        "Srpen",
        "Září",
        "Říjen",
        "Listopad",
        "Prosinec"
        ];

        Ext.Date.shortMonthNames = {
            "Leden"     : "Led",
            "Únor"      : "Úno",
            "Březen"    : "Bře",
            "Duben"     : "Dub",
            "Květen"    : "Kvě",
            "Červen"    : "Čer",
            "Červenec"  : "Čvc",
            "Srpen"     : "Srp",
            "Září"      : "Zář",
            "Říjen"     : "Říj",
            "Listopad"  : "Lis",
            "Prosinec"  : "Pro"
        };


        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.shortMonthNames[Ext.Date.monthNames[month]];
        };

        Ext.Date.monthNumbers = {
            "Leden"      : 0,
            "Únor"       : 1,
            "Březen"     : 2,
            "Duben"      : 3,
            "Květen"     : 4,
            "Červen"     : 5,
            "Červenec"   : 6,
            "Srpen"      : 7,
            "Září"       : 8,
            "Říjen"      : 9,
            "Listopad"   : 10,
            "Prosinec"   : 11
        };


        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase()];
        };

        Ext.Date.dayNames = [
        "Neděle",
        "Pondělí",
        "Úterý",
        "Středa",
        "Čtvrtek",
        "Pátek",
        "Sobota"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }
    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Storno",
            yes    : "Ano",
            no     : "Ne"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u004b\u010d', // Czech Koruny
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Dnes",
            minText           : "Datum nesmí být starší než je minimální",
            maxText           : "Datum nesmí být dřívější než je maximální",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	: Ext.Date.monthNames,
            dayNames		: Ext.Date.dayNames,
            nextText          : 'Následující měsíc (Control+Right)',
            prevText          : 'Předcházející měsíc (Control+Left)',
            monthYearText     : 'Zvolte měsíc (ke změně let použijte Control+Up/Down)',
            todayTip          : "{0} (Spacebar)",
            format            : "d.m.Y",
            startDay          : 1
        });
    }

    if(Ext.picker.Month) {
        Ext.apply(Ext.picker.Month.prototype, {
            okText            : "&#160;OK&#160;",
            cancelText        : "Storno"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Strana",
            afterPageText  : "z {0}",
            firstText      : "První strana",
            prevText       : "Přecházející strana",
            nextText       : "Následující strana",
            lastText       : "Poslední strana",
            refreshText    : "Aktualizovat",
            displayMsg     : "Zobrazeno {0} - {1} z celkových {2}",
            emptyMsg       : 'Žádné záznamy nebyly nalezeny'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Pole nesmí mít méně {0} znaků",
            maxLengthText : "Pole nesmí být delší než {0} znaků",
            blankText     : "This field is required",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Hodnota v tomto poli nesmí být menší než {0}",
            maxText : "Hodnota v tomto poli nesmí být větší než {0}",
            nanText : "{0} není platné číslo"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Neaktivní",
            disabledDatesText : "Neaktivní",
            minText           : "Datum v tomto poli nesmí být starší než {0}",
            maxText           : "Datum v tomto poli nesmí být novější než {0}",
            invalidText       : "{0} není platným datem - zkontrolujte zda-li je ve formátu {1}",
            format            : "d.m.Y",
            altFormats        : "d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Prosím čekejte..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'V tomto poli může být vyplněna pouze emailová adresa ve formátu "uživatel@doména.cz"',
            urlText      : 'V tomto poli může být vyplněna pouze URL (adresa internetové stránky) ve formátu "http:/'+'/www.doména.cz"',
            alphaText    : 'Toto pole může obsahovat pouze písmena abecedy a znak _',
            alphanumText : 'Toto pole může obsahovat pouze písmena abecedy, čísla a znak _'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Zadejte URL adresu odkazu:',
            buttonTips : {
                bold : {
                    title: 'Tučné (Ctrl+B)',
                    text: 'Označí vybraný text tučně.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: 'Kurzíva (Ctrl+I)',
                    text: 'Označí vybraný text kurzívou.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: 'Podtržení (Ctrl+U)',
                    text: 'Podtrhne vybraný text.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'Zvětšit písmo',
                    text: 'Zvětší velikost písma.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'Zúžit písmo',
                    text: 'Zmenší velikost písma.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'Barva zvýraznění textu',
                    text: 'Označí vybraný text tak, aby vypadal jako označený zvýrazňovačem.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'Barva písma',
                    text: 'Změní barvu textu.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft : {
                    title: 'Zarovnat text vlevo',
                    text: 'Zarovná text doleva.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter : {
                    title: 'Zarovnat na střed',
                    text: 'Zarovná text na střed.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright : {
                    title: 'Zarovnat text vpravo',
                    text: 'Zarovná text doprava.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'Odrážky',
                    text: 'Začne seznam s odrážkami.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'Číslování',
                    text: 'Začne číslovaný seznam.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'Internetový odkaz',
                    text: 'Z vybraného textu vytvoří internetový odkaz.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'Zdrojový kód',
                    text: 'Přepne do módu úpravy zdrojového kódu.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Řadit vzestupně",
            sortDescText : "Řadit sestupně",
            lockText     : "Ukotvit sloupec",
            unlockText   : "Uvolnit sloupec",
            columnsText  : "Sloupce"
        });
    }

    if(Ext.grid.GroupingFeature){
        Ext.apply(Ext.grid.GroupingFeature.prototype, {
            emptyGroupText : '(Žádná data)',
            groupByText    : 'Seskupit dle tohoto pole',
            showGroupsText : 'Zobrazit ve skupině'
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Název",
            valueText  : "Hodnota",
            dateFormat : "j.m.Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Tahem změnit velikost.",
            collapsibleSplitTip : "Tahem změnit velikost. Dvojklikem skrýt."
        });
    }
});

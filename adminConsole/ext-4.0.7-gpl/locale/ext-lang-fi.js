/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Finnish Translations
 * <tuomas.salo (at) iki.fi>
 * 'ä' should read as lowercase 'a' with two dots on top (&auml;)
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Ladataan...</div>';
    }
    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} rivi(ä) valittu";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Sulje tämä välilehti";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Ladataan...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
        "tammikuu",
        "helmikuu",
        "maaliskuu",
        "huhtikuu",
        "toukokuu",
        "kesäkuu",
        "heinäkuu",
        "elokuu",
        "syyskuu",
        "lokakuu",
        "marraskuu",
        "joulukuu"
        ];

        Ext.Date.getShortMonthName = function(month) {
            //return Ext.Date.monthNames[month].substring(0, 3);
            return (month+1) + ".";
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
            if(name.match(/^(1?\d)\./)) {
                return -1+RegExp.$1;
            } else {
                return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
            }
        };

        Ext.Date.dayNames = [
        "sunnuntai",
        "maanantai",
        "tiistai",
        "keskiviikko",
        "torstai",
        "perjantai",
        "lauantai"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 2);
        };
    }

    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Peruuta",
            yes    : "Kyllä",
            no     : "Ei"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // Finnish Euro
            dateFormat: 'j.n.Y'
        });
    }
    if(Ext.util.Format){
        Ext.util.Format.date = function(v, format){
            if(!v) return "";
            if(!(v instanceof Date)) v = new Date(Date.parse(v));
            return v.dateFormat(format || "j.n.Y");
        };
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Tänään",
            minText           : "Tämä päivämäärä on aikaisempi kuin ensimmäinen sallittu",
            maxText           : "Tämä päivämäärä on myöhäisempi kuin viimeinen sallittu",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames        : Ext.Date.monthNames,
            dayNames          : Ext.Date.dayNames,
            nextText          : 'Seuraava kuukausi (Control+oikealle)',
            prevText          : 'Edellinen kuukausi (Control+vasemmalle)',
            monthYearText     : 'Valitse kuukausi (vaihda vuotta painamalla Control+ylös/alas)',
            todayTip          : "{0} (välilyönti)",
            format            : "j.n.Y",
            startDay          : 1 // viikko alkaa maanantaista
        });
    }

    if(Ext.picker.Month) {
        Ext.apply(Ext.picker.Month.prototype, {
            okText            : "&#160;OK&#160;",
            cancelText        : "Peruuta"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Sivu",
            afterPageText  : "/ {0}",
            firstText      : "Ensimmäinen sivu",
            prevText       : "Edellinen sivu",
            nextText       : "Seuraava sivu",
            lastText       : "Viimeinen sivu",
            refreshText    : "Päivitä",
            displayMsg     : "Näytetään {0} - {1} / {2}",
            emptyMsg       : 'Ei tietoja'
        });
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "Tämän kentän arvo ei kelpaa";
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "Tämän kentän minimipituus on {0}",
            maxLengthText : "Tämän kentän maksimipituus on {0}",
            blankText     : "Tämä kenttä on pakollinen",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "Tämän kentän pienin sallittu arvo on {0}",
            maxText : "Tämän kentän suurin sallittu arvo on {0}",
            nanText : "{0} ei ole numero"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Ei käytössä",
            disabledDatesText : "Ei käytössä",
            minText           : "Tämän kentän päivämäärän tulee olla {0} jälkeen",
            maxText           : "Tämän kentän päivämäärän tulee olla ennen {0}",
            invalidText       : "Päivämäärä {0} ei ole oikeassa muodossa - kirjoita päivämäärä muodossa {1}",
            format            : "j.n.Y",
            altFormats        : "j.n.|d.m.|mdy|mdY|d|Y-m-d|Y/m/d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Ladataan..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Syötä tähän kenttään sähköpostiosoite, esim. "etunimi.sukunimi@osoite.fi"',
            urlText      : 'Syötä tähän kenttään URL-osoite, esim. "http:/'+'/www.osoite.fi"',
            alphaText    : 'Syötä tähän kenttään vain kirjaimia (a-z, A-Z) ja alaviivoja (_)',
            alphanumText : 'Syötä tähän kenttään vain kirjaimia (a-z, A-Z), numeroita (0-9) ja alaviivoja (_)'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Anna linkin URL-osoite:',
            buttonTips : {
                bold : {
                    title: 'Lihavoi (Ctrl+B)',
                    text: 'Lihavoi valittu teksti.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: 'Kursivoi (Ctrl+I)',
                    text: 'Kursivoi valittu teksti.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: 'Alleviivaa (Ctrl+U)',
                    text: 'Alleviivaa valittu teksti.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'Suurenna tekstiä',
                    text: 'Kasvata tekstin kirjasinkokoa.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'Pienennä tekstiä',
                    text: 'Pienennä tekstin kirjasinkokoa.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'Tekstin korostusväri',
                    text: 'Vaihda valitun tekstin taustaväriä.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'Tekstin väri',
                    text: 'Vaihda valitun tekstin väriä.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft : {
                    title: 'Tasaa vasemmalle',
                    text: 'Tasaa teksti vasempaan reunaan.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter : {
                    title: 'Keskitä',
                    text: 'Keskitä teksti.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright : {
                    title: 'Tasaa oikealle',
                    text: 'Tasaa teksti oikeaan reunaan.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'Luettelo',
                    text: 'Luo luettelo.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'Numeroitu luettelo',
                    text: 'Luo numeroitu luettelo.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'Linkki',
                    text: 'Tee valitusta tekstistä hyperlinkki.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'Lähdekoodin muokkaus',
                    text: 'Vaihda lähdekoodin muokkausnäkymään.',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.form.Basic){
        Ext.form.Basic.prototype.waitTitle = "Odota...";
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Järjestä A-Ö",
            sortDescText : "Järjestä Ö-A",
            lockText     : "Lukitse sarake",
            unlockText   : "Vapauta sarakkeen lukitus",
            columnsText  : "Sarakkeet"
        });
    }

    if(Ext.grid.GroupingFeature){
        Ext.apply(Ext.grid.GroupingFeature.prototype, {
            emptyGroupText : '(ei mitään)',
            groupByText    : 'Ryhmittele tämän kentän mukaan',
            showGroupsText : 'Näytä ryhmissä'
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Nimi",
            valueText  : "Arvo",
            dateFormat : "j.m.Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Muuta kokoa vetämällä.",
            collapsibleSplitTip : "Muuta kokoa vetämällä. Piilota kaksoisklikkauksella."
        });
    }
});

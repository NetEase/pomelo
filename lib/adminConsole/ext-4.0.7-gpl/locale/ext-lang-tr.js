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
 *
 * Turkish translation by Alper YAZGAN
 * 2008-01-24, 10:29 AM 
 * 
 * Updated to 2.2 by YargicX
 * 2008-10-05, 06:22 PM
 */
Ext.onReady(function() {

    if(Ext.Updater){
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Yükleniyor ...</div>';
    }

    if(Ext.view.View){
      Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Grid){
      Ext.grid.Grid.prototype.ddText = "Seçili satýr sayýsý : {0}";
    }

    if(Ext.TabPanelItem){
      Ext.TabPanelItem.prototype.closeText = "Sekmeyi kapat";
    }

    if(Ext.form.field.Base){
      Ext.form.field.Base.prototype.invalidText = "Bu alandaki deðer geçersiz";
    }

    if(Ext.LoadMask){
      Ext.LoadMask.prototype.msg = "Yükleniyor ...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
          "Ocak",
          "Þžubat",
          "Mart",
          "Nisan",
          "Mayýs",
          "Haziran",
          "Temmuz",
          "Aðustos",
          "Eylül",
          "Ekim",
          "Kasým",
          "Aralýk"
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
          "Pazar",
          "Pazartesi",
          "Salý",
          "Ç‡arþŸamba",
          "PerþŸembe",
          "Cuma",
          "Cumartesi"
        ];

        Ext.Date.shortDayNames = [
          "Paz",
          "Pzt",
          "Sal",
          "ÇrþŸ",
          "Prþ",
          "Cum",
          "Cmt"
        ];

        Ext.Date.getShortDayName = function(day) {
          return Ext.Date.shortDayNames[day];
        };
    }
    
    if(Ext.MessageBox){
      Ext.MessageBox.buttonText = {
        ok     : "Tamam",
        cancel : "Ä°ptal",
        yes    : "Evet",
        no     : "Hayýr"
      };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: 'TL',  // Turkish Lira
            dateFormat: 'd/m/Y'
        });
    }

    if(Ext.picker.Date){
      Ext.apply(Ext.picker.Date.prototype, {
        todayText         : "Bugün",
        minText           : "Bu tarih izin verilen en küçük tarihten daha önce",
        maxText           : "Bu tarih izin verilen en büyük tarihten daha sonra",
        disabledDaysText  : "",
        disabledDatesText : "",
        monthNames        : Ext.Date.monthNames,
        dayNames          : Ext.Date.dayNames,
        nextText          : 'Gelecek Ay (Control+Right)',
        prevText          : 'Ã–nceki Ay (Control+Left)',
        monthYearText     : 'Bir ay sŸeçiniz (Yýlý artýrmak/azaltmak için Control+Up/Down)',
        todayTip          : "{0} (BoþŸluk TuþŸu - Spacebar)",
        format            : "d/m/Y",
        startDay          : 1
      });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;Tamam&#160;",
          cancelText        : "Ä°ptal"
      });
    }


    if(Ext.toolbar.Paging){
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText : "Sayfa",
        afterPageText  : " / {0}",
        firstText      : "Ä°lk Sayfa",
        prevText       : "Ã–nceki Sayfa",
        nextText       : "Sonraki Sayfa",
        lastText       : "Son Sayfa",
        refreshText    : "Yenile",
        displayMsg     : "Gösterilen {0} - {1} / {2}",
        emptyMsg       : 'Gösterilebilecek veri yok'
      });
    }

    if(Ext.form.field.Text){
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText : "Girilen verinin uzunluðu en az {0} olabilir",
        maxLengthText : "Girilen verinin uzunluðu en fazla {0} olabilir",
        blankText     : "Bu alan boþŸ býrakýlamaz",
        regexText     : "",
        emptyText     : null
      });
    }

    if(Ext.form.field.Number){
      Ext.apply(Ext.form.field.Number.prototype, {
        minText : "En az {0} girilebilir",
        maxText : "En çok {0} girilebilir",
        nanText : "{0} geçersiz bir sayýdýr"
      });
    }

    if(Ext.form.field.Date){
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText  : "Disabled",
        disabledDatesText : "Disabled",
        minText           : "Bu tarih, {0} tarihinden daha sonra olmalýdýr", 
        maxText           : "Bu tarih, {0} tarihinden daha önce olmalýdýr",
        invalidText       : "{0} geçersiz bir tarihdir - tarih formatý {1} þŸeklinde olmalýdýr",
        format            : "d/m/Y",
        altFormats        : "d.m.y|d.m.Y|d/m/y|d-m-Y|d-m-y|d.m|d/m|d-m|dm|dmY|dmy|d|Y.m.d|Y-m-d|Y/m/d"
      });
    }

    if(Ext.form.field.ComboBox){
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText : undefined
      });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Yükleniyor ..."
        });
    }

    if(Ext.form.field.VTypes){
    	Ext.form.field.VTypes["emailText"]='Bu alan "user@example.com" þŸeklinde elektronik posta formatýnda olmalýdýr';
    	Ext.form.field.VTypes["urlText"]='Bu alan "http://www.example.com" þŸeklinde URL adres formatýnda olmalýdýr';
    	Ext.form.field.VTypes["alphaText"]='Bu alan sadece harf ve _ içermeli';
    	Ext.form.field.VTypes["alphanumText"]='Bu alan sadece harf, sayý ve _ içermeli';
    }

    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : 'Lütfen bu baðlantý için gerekli URL adresini giriniz:',
        buttonTips : {
          bold : {
            title: 'Kalýn(Bold) (Ctrl+B)',
            text: 'Þžeçili yazýyý kalýn yapar.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: 'Ä°talik(Italic) (Ctrl+I)',
            text: 'Þžeçili yazýyý italik yapar.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: 'Alt Ã‡izgi(Underline) (Ctrl+U)',
            text: 'Þžeçili yazýnýn altýný çizer.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: 'Fontu büyült',
            text: 'Yazý fontunu büyütür.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: 'Fontu küçült',
            text: 'Yazý fontunu küçültür.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: 'Arka Plan Rengi',
            text: 'Seçili yazýnýn arka plan rengini deðiþŸtir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: 'Yazý Rengi',
            text: 'Seçili yazýnýn rengini deðiþŸtir.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: 'Sola Daya',
            text: 'Yazýyý sola daya.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: 'Ortala',
            text: 'Yazýyý editörde ortala.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: 'Saða daya',
            text: 'Yazýyý saða daya.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: 'Noktalý Liste',
            text: 'Noktalý listeye baþŸla.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: 'Numaralý Liste',
            text: 'Numaralý lisyeye baþŸla.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: 'Web Adresi(Hyperlink)',
            text: 'Seçili yazýyý web adresi(hyperlink) yap.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: 'Kaynak kodu Düzenleme',
            text: 'Kaynak kodu düzenleme moduna geç.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }

    if(Ext.grid.header.Container){
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText  : "Artan sýrada sýrala",
        sortDescText : "Azalan sýrada sýrala",
        lockText     : "Kolonu kilitle",
        unlockText   : "Kolon kilidini kaldýr",
        columnsText  : "Kolonlar"
      });
    }

    if(Ext.grid.GroupingFeature){
      Ext.apply(Ext.grid.GroupingFeature.prototype, {
        emptyGroupText : '(Yok)',
        groupByText    : 'Bu Alana Göre Grupla',
        showGroupsText : 'Gruplar Halinde Göster'
      });
    }

    if(Ext.grid.PropertyColumnModel){
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText   : "Ad",
        valueText  : "Deðer",
        dateFormat : "d/m/Y"
      });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip            : "Yeniden boyutlandýrmak için sürükle.",
        collapsibleSplitTip : "Yeniden boyutlandýrmak için sürükle. Saklamak için çift týkla."
      });
    }
});

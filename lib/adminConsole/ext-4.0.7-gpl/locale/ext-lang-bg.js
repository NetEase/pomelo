/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Bulgarian Translation
 *
 * By Георги Костадинов, Калгари, Канада
 * 10 October 2007
 * By Nedko Penev 
 * 26 October 2007
 *
 * (utf-8 encoding)
 */
Ext.onReady(function() {
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Зареждане...</div>';
    }
    if(Ext.view.View){
      Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
      Ext.grid.Panel.prototype.ddText = "{0} избрани колони";
    }

    if(Ext.TabPanelItem){
      Ext.TabPanelItem.prototype.closeText = "Затвори таб";
    }

    if(Ext.form.field.Base){
      Ext.form.field.Base.prototype.invalidText = "Невалидна стойност на полето";
    }

    if(Ext.LoadMask){
      Ext.LoadMask.prototype.msg = "Зареждане...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
          "Януари",
          "Февруари",
          "Март",
          "Април",
          "Май",
          "Юни",
          "Юли",
          "Август",
          "Септември",
          "Октомври",
          "Ноември",
          "Декември"
        ];

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

        Ext.Date.dayNames = [
          "Неделя",
          "Понеделник",
          "Вторник",
          "Сряда",
          "Четвъртък",
          "Петък",
          "Събота"
        ];
    }
    if(Ext.MessageBox){
      Ext.MessageBox.buttonText = {
        ok     : "OK",
        cancel : "Отмени",
        yes    : "Да",
        no     : "Не"
      };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u043b\u0432',  // Bulgarian Leva
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
      Ext.apply(Ext.picker.Date.prototype, {
        todayText         : "Днес",
        minText           : "Тази дата е преди минималната",
        maxText           : "Тази дата е след максималната",
        disabledDaysText  : "",
        disabledDatesText : "",
        monthNames        : Ext.Date.monthNames,
        dayNames          : Ext.Date.dayNames,
        nextText          : 'Следващ месец (Control+Right)',
        prevText          : 'Предишен месец (Control+Left)',
        monthYearText     : 'Избери месец (Control+Up/Down за преместване по години)',
        todayTip          : "{0} (Spacebar)",
        format            : "d.m.y",
        startDay          : 1
      });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;OK&#160;",
          cancelText        : "Отмени"
      });
    }

    if(Ext.toolbar.Paging){
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText : "Страница",
        afterPageText  : "от {0}",
        firstText      : "Първа страница",
        prevText       : "Предишна страница",
        nextText       : "Следваща страница",
        lastText       : "Последна страница",
        refreshText    : "Презареди",
        displayMsg     : "Показвайки {0} - {1} от {2}",
        emptyMsg       : 'Няма данни за показване'
      });
    }

    if(Ext.form.field.Text){
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText : "Минималната дължина на това поле е {0}",
        maxLengthText : "Максималната дължина на това поле е {0}",
        blankText     : "Това поле е задължително",
        regexText     : "",
        emptyText     : null
      });
    }

    if(Ext.form.field.Number){
      Ext.apply(Ext.form.field.Number.prototype, {
        minText : "Минималната стойност за това поле е {0}",
        maxText : "Максималната стойност за това поле е {0}",
        nanText : "{0} не е валидно число"
      });
    }

    if(Ext.form.field.Date){
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText  : "Недостъпен",
        disabledDatesText : "Недостъпен",
        minText           : "Датата в това поле трябва да е след {0}",
        maxText           : "Датата в това поле трябва да е преди {0}",
        invalidText       : "{0} не е валидна дата - трябва да бъде във формат {1}",
        format            : "d.m.y",
        altFormats        : "d.m.y|d/m/Y|d-m-y|d-m-Y|d/m|d-m|dm|dmy|dmY|d|Y-m-d"
      });
    }

    if(Ext.form.field.ComboBox){
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText : undefined
      });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Зареждане..."
        });
    }

    if(Ext.form.field.VTypes){
      Ext.apply(Ext.form.field.VTypes, {
        emailText    : 'Това поле трябва да бъде емейл във формат "user@example.com"',
        urlText      : 'Това поле трябва да бъде URL във формат "http:/'+'/www.example.com"',
        alphaText    : 'Това поле трябва да съдържа само букви и _',
        alphanumText : 'Това поле трябва да съдържа само букви, цифри и _'
      });
    }

    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : 'Моля, въведете URL за връзката:',
        buttonTips : {
          bold : {
            title: 'Bold (Ctrl+B)',
            text: 'Удебелява избрания текст.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: 'Italic (Ctrl+I)',
            text: 'Прави избрания текст курсив.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: 'Underline (Ctrl+U)',
            text: 'Подчертава избрания текст.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: 'Уголеми текста',
            text: 'Уголемява размера на шрифта.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: 'Намали текста',
            text: 'Намалява размера на шрифта.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: 'Цвят на маркирания текст',
            text: 'Променя фоновия цвят на избрания текст.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: 'Цвят на шрифта',
            text: 'Променя цвета на избрания текст.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: 'Ляво подравняване',
            text: 'Подравнява текста на ляво.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: 'Центриране',
            text: 'Центрира текста.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: 'Дясно подравняване',
            text: 'Подравнява текста на дясно.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: 'Неномериран списък',
            text: 'Започва неномериран списък.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: 'Номериран списък',
            text: 'Започва номериран списък.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: 'Хипервръзка',
            text: 'Превръща избрания текст в хипервръзка.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: 'Редактиране на кода',
            text: 'Преминаване в режим на редактиране на кода.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }

    if(Ext.grid.header.Container){
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText  : "Подреди в нарастващ ред",
        sortDescText : "Подреди в намаляващ ред",
        lockText     : "Заключи колона",
        unlockText   : "Отключи колона",
        columnsText  : "Колони"
      });
    }

    if(Ext.grid.PropertyColumnModel){
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText   : "Име",
        valueText  : "Стойност",
        dateFormat : "d.m.Y"
      });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip            : "Влачете с мишката за да промените размера.",
        collapsibleSplitTip : "Влачете с мишката за да промените размера. Чукнете два пъти за да скриете."
      });
    }

});

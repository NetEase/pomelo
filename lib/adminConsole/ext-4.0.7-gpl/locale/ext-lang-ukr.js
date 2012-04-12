/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Ukrainian translations for ExtJS (UTF-8 encoding)
 *
 * Original translation by zlatko
 * 3 October 2007
 *
 * Updated by dev.ashevchuk@gmail.com
 * 01.09.2009
 */
Ext.onReady(function(){
    if(Ext.Updater){
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Завантаження...</div>';
    }
    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "<Порожньо>";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} обраних рядків";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Закрити цю вкладку";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "Хибне значення";
    }

    if(Ext.LoadMask){
       Ext.LoadMask.prototype.msg = "Завантаження...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
           "Січень",
           "Лютий",
           "Березень",
           "Квітень",
           "Травень",
           "Червень",
           "Липень",
           "Серпень",
           "Вересень",
           "Жовтень",
           "Листопад",
           "Грудень"
        ];

        Ext.Date.dayNames = [
           "Неділя",
           "Понеділок",
           "Вівторок",
           "Середа",
           "Четвер",
           "П’ятниця",
           "Субота"
        ];
    }

    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "OK",
          cancel : "Відміна",
          yes    : "Так",
          no     : "Ні"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20b4',  // Ukranian Hryvnia
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Сьогодні",
          minText           : "Ця дата меньша за мінімальну допустиму дату",
          maxText           : "Ця дата більша за максимальну допустиму дату",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames        : Ext.Date.monthNames,
          dayNames          : Ext.Date.dayNames,
          nextText          : 'Наступний місяць (Control+Вправо)',
          prevText          : 'Попередній місяць (Control+Вліво)',
          monthYearText     : 'Вибір місяця (Control+Вверх/Вниз для вибору року)',
          todayTip          : "{0} (Пробіл)",
          format            : "d.m.y",
          startDay          : 1
       });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;OK&#160;",
          cancelText        : "Відміна"
      });
    }

    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "Сторінка",
          afterPageText  : "з {0}",
          firstText      : "Перша сторінка",
          prevText       : "Попередня сторінка",
          nextText       : "Наступна сторінка",
          lastText       : "Остання сторінка",
          refreshText    : "Освіжити",
          displayMsg     : "Відображення записів з {0} по {1}, всього {2}",
          emptyMsg       : 'Дані для відображення відсутні'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "Мінімальна довжина цього поля {0}",
          maxLengthText : "Максимальна довжина цього поля {0}",
          blankText     : "Це поле є обов’язковим для заповнення",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "Значення у цьому полі не може бути меньше {0}",
          maxText : "Значення у цьому полі не може бути більше {0}",
          nanText : "{0} не є числом"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Не доступно",
          disabledDatesText : "Не доступно",
          minText           : "Дата у цьому полі повинна бути більша {0}",
          maxText           : "Дата у цьому полі повинна бути меньша {0}",
          invalidText       : "{0} хибна дата - дата повинна бути вказана у форматі {1}",
          format            : "d.m.y"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Завантаження..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Це поле повинно містити адресу електронної пошти у форматі "user@example.com"',
          urlText      : 'Це поле повинно містити URL у форматі "http:/'+'/www.example.com"',
          alphaText    : 'Це поле повинно містити виключно латинські літери та символ підкреслення "_"',
          alphanumText : 'Це поле повинно містити виключно латинські літери, цифри та символ підкреслення "_"'
       });
    }

    if(Ext.form.field.HtmlEditor){
       Ext.apply(Ext.form.field.HtmlEditor.prototype, {
         createLinkText : 'Будь-ласка введіть адресу:',
         buttonTips : {
                bold : {
                   title: 'Напівжирний (Ctrl+B)',
                   text: 'Зробити напівжирним виділений текст.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                   title: 'Курсив (Ctrl+I)',
                   text: 'Зробити курсивом виділений текст.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                   title: 'Підкреслений (Ctrl+U)',
                   text: 'Зробити підкресленим виділений текст.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               increasefontsize : {
                   title: 'Збільшити розмір',
                   text: 'Збільшити розмір шрифта.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               decreasefontsize : {
                   title: 'Зменьшити розмір',
                   text: 'Зменьшити розмір шрифта.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               backcolor : {
                   title: 'Заливка',
                   text: 'Змінити колір фону для виділеного тексту або абзацу.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               forecolor : {
                   title: 'Колір тексту',
                   text: 'Змінити колір виділеного тексту або абзацу.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifyleft : {
                   title: 'Вирівняти текст по лівому полю',
                   text: 'Вирівнювання тексту по лівому полю.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifycenter : {
                   title: 'Вирівняти текст по центру',
                   text: 'Вирівнювання тексту по центру.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifyright : {
                   title: 'Вирівняти текст по правому полю',
                   text: 'Вирівнювання тексту по правому полю.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               insertunorderedlist : {
                   title: 'Маркери',
                   text: 'Почати маркований список.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               insertorderedlist : {
                   title: 'Нумерація',
                   text: 'Почати нумернований список.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               createlink : {
                   title: 'Вставити гіперпосилання',
                   text: 'Створення посилання із виділеного тексту.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               sourceedit : {
                   title: 'Джерельний код',
                   text: 'Режим редагування джерельного коду.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               }
            }
       });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Сортувати по зростанню",
          sortDescText : "Сортувати по спаданню",
          lockText     : "Закріпити стовпець",
          unlockText   : "Відкріпити стовпець",
          columnsText  : "Стовпці"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Назва",
          valueText  : "Значення",
          dateFormat : "j.m.Y"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Тягніть для зміни розміру.",
          collapsibleSplitTip : "Тягніть для зміни розміру. Подвійний клік сховає панель."
       });
    }
});


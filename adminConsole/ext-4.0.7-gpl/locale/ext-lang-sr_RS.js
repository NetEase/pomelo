/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
﻿/**
 * Serbian Cyrillic Translation
 * by Čolovic Vladan (cyrillic, utf8 encoding)
 * sr_RS (ex: sr_CS, sr_YU)
 * 12 May 2007
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Учитавам...</div>';
    }

    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} изабраних редова";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Затвори ову »картицу«";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "Унешена вредност није правилна";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Учитавам...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
           "Јануар",
           "Фебруар",
           "Март",
           "Април",
           "Мај",
           "Јун",
           "Јул",
           "Август",
           "Септембар",
           "Октобар",
           "Новембар",
           "Децембар"
        ];

        Ext.Date.dayNames = [
           "Недеља",
           "Понедељак",
           "Уторак",
           "Среда",
           "Четвртак",
           "Петак",
           "Субота"
        ];
    }

    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "У реду",
          cancel : "Одустани",
          yes    : "Да",
          no     : "Не"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u0414\u0438\u043d\u002e',  // Serbian Dinar
            dateFormat: 'd.m.Y'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Данас",
          minText           : "Датум је испред најмањег дозвољеног датума",
          maxText           : "Датум је након највећег дозвољеног датума",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames	: Ext.Date.monthNames,
          dayNames		: Ext.Date.dayNames,
          nextText          : 'Следећи месец (Control+Десно)',
          prevText          : 'Претходни месец (Control+Лево)',
          monthYearText     : 'Изаберите месец (Control+Горе/Доле за избор године)',
          todayTip          : "{0} (Размакница)",
          format            : "d.m.y",
          startDay 		 : 1
       });
    }

    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "Страна",
          afterPageText  : "од {0}",
          firstText      : "Прва страна",
          prevText       : "Претходна страна",
          nextText       : "Следећа страна",
          lastText       : "Последња страна",
          refreshText    : "Освежи",
          displayMsg     : "Приказана {0} - {1} од {2}",
          emptyMsg       : 'Немам шта приказати'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "Минимална дужина овог поља је {0}",
          maxLengthText : "Максимална дужина овог поља је {0}",
          blankText     : "Поље је обавезно",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "Минимална вредност у пољу је {0}",
          maxText : "Максимална вредност у пољу је {0}",
          nanText : "{0} није правилан број"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Пасивно",
          disabledDatesText : "Пасивно",
          minText           : "Датум у овом пољу мора бити након {0}",
          maxText           : "Датум у овом пољу мора бити пре {0}",
          invalidText       : "{0} није правилан датум - захтевани облик је {1}",
          format            : "d.m.y"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Учитавам..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Ово поље прихвата e-mail адресу искључиво у облику "korisnik@domen.com"',
          urlText      : 'Ово поље прихвата URL адресу искључиво у облику "http:/'+'/www.domen.com"',
          alphaText    : 'Ово поље може садржати искључиво слова и знак _',
          alphanumText : 'Ово поље може садржати само слова, бројеве и знак _'
       });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Растући редослед",
          sortDescText : "Опадајући редослед",
          lockText     : "Закључај колону",
          unlockText   : "Откључај колону",
          columnsText  : "Колоне"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Назив",
          valueText  : "Вредност",
          dateFormat : "d.m.Y"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Повући за измену величине.",
          collapsibleSplitTip : "Повући за измену величине. Двоструки клик за сакривање."
       });
    }
});

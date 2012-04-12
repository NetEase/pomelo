/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Hebrew Translations
 * By spartacus (from forums) 06-12-2007
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">...טוען</div>';
    }
    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "שורות נבחרות {0}";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "סגור לשונית";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "הערך בשדה זה שגוי";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "...טוען";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר"
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
        "א",
        "ב",
        "ג",
        "ד",
        "ה",
        "ו",
        "ש"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }

    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "אישור",
            cancel : "ביטול",
            yes    : "כן",
            no     : "לא"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20aa',  // Iraeli Shekel
            dateFormat: 'd/m/Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "היום",
            minText           : ".תאריך זה חל קודם לתאריך ההתחלתי שנקבע",
            maxText           : ".תאריך זה חל לאחר התאריך הסופי שנקבע",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames        : Ext.Date.monthNames,
            dayNames          : Ext.Date.dayNames,
            nextText          : '(Control+Right) החודש הבא',
            prevText          : '(Control+Left) החודש הקודם',
            monthYearText     : '(לבחירת שנה Control+Up/Down) בחר חודש',
            todayTip          : "מקש רווח) {0})",
            format            : "d/m/Y",
            startDay          : 0
        });
    }

    if(Ext.picker.Month) {
        Ext.apply(Ext.picker.Month.prototype, {
            okText            : "&#160;אישור&#160;",
            cancelText        : "ביטול"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "עמוד",
            afterPageText  : "{0} מתוך",
            firstText      : "עמוד ראשון",
            prevText       : "עמוד קודם",
            nextText       : "עמוד הבא",
            lastText       : "עמוד אחרון",
            refreshText    : "רענן",
            displayMsg     : "מציג {0} - {1} מתוך {2}",
            emptyMsg       : 'אין מידע להצגה'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "{0} האורך המינימאלי לשדה זה הוא",
            maxLengthText : "{0} האורך המירבי לשדה זה הוא",
            blankText     : "שדה זה הכרחי",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "{0} הערך המינימאלי לשדה זה הוא",
            maxText : "{0} הערך המירבי לשדה זה הוא",
            nanText : "הוא לא מספר {0}"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "מנוטרל",
            disabledDatesText : "מנוטרל",
            minText           : "{0} התאריך בשדה זה חייב להיות לאחר",
            maxText           : "{0} התאריך בשדה זה חייב להיות לפני",
            invalidText       : "{1} הוא לא תאריך תקני - חייב להיות בפורמט {0}",
            format            : "m/d/y",
            altFormats        : "m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "...טוען"
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : '"user@example.com" שדה זה צריך להיות כתובת דואר אלקטרוני בפורמט',
            urlText      : '"http:/'+'/www.example.com" שדה זה צריך להיות כתובת אינטרנט בפורמט',
            alphaText    : '_שדה זה יכול להכיל רק אותיות ו',
            alphanumText : '_שדה זה יכול להכיל רק אותיות, מספרים ו'
        });
    }

    if(Ext.form.field.HtmlEditor){
        Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : ':אנא הקלד את כתובת האינטרנט עבור הקישור',
            buttonTips : {
                bold : {
                    title: '(Ctrl+B) מודגש',
                    text: '.הדגש את הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                    title: '(Ctrl+I) נטוי',
                    text: '.הטה את הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                    title: '(Ctrl+U) קו תחתי',
                    text: '.הוסף קן תחתי עבור הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                increasefontsize : {
                    title: 'הגדל טקסט',
                    text: '.הגדל גופן עבור הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                decreasefontsize : {
                    title: 'הקטן טקסט',
                    text: '.הקטן גופן עבור הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                backcolor : {
                    title: 'צבע רקע לטקסט',
                    text: '.שנה את צבע הרקע עבור הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                forecolor : {
                    title: 'צבע גופן',
                    text: '.שנה את צבע הגופן עבור הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyleft : {
                    title: 'ישור לשמאל',
                    text: '.ישר שמאלה את הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifycenter : {
                    title: 'ישור למרכז',
                    text: '.ישר למרכז את הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                justifyright : {
                    title: 'ישור לימין',
                    text: '.ישר ימינה את הטקסט הנבחר',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertunorderedlist : {
                    title: 'רשימת נקודות',
                    text: '.התחל רשימת נקודות',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                insertorderedlist : {
                    title: 'רשימה ממוספרת',
                    text: '.התחל רשימה ממוספרת',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                createlink : {
                    title: 'קישור',
                    text: '.הפוך את הטקסט הנבחר לקישור',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                sourceedit : {
                    title: 'עריכת קוד מקור',
                    text: '.הצג קוד מקור',
                    cls: Ext.baseCSSPrefix + 'html-editor-tip'
                }
            }
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "מיין בסדר עולה",
            sortDescText : "מיין בסדר יורד",
            lockText     : "נעל עמודה",
            unlockText   : "שחרר עמודה",
            columnsText  : "עמודות"
        });
    }

    if(Ext.grid.GroupingFeature){
        Ext.apply(Ext.grid.GroupingFeature.prototype, {
            emptyGroupText : '(ריק)',
            groupByText    : 'הצג בקבוצות לפי שדה זה',
            showGroupsText : 'הצג בקבוצות'
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "שם",
            valueText  : "ערך",
            dateFormat : "m/j/Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : ".משוך לשינוי גודל",
            collapsibleSplitTip : ".משוך לשינוי גודל. לחיצה כפולה להסתרה"
        });
    }
});

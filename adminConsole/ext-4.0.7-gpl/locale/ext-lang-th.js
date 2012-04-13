/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * List compiled by KillerNay on the extjs.com forums.
 * Thank you KillerNay!
 *
 * Thailand Translations
 */
Ext.onReady(function() {
if(Ext.Updater) {
    Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">¡ÓÅÑ§âËÅŽ...</div>';
}

if(Ext.view.View){
  Ext.view.View.prototype.emptyText = "";
}

if(Ext.grid.Panel){
  Ext.grid.Panel.prototype.ddText = "{0} àÅ×Í¡áÅéÇ·Ñé§ËÁŽá¶Ç";
}

if(Ext.TabPanelItem){
  Ext.TabPanelItem.prototype.closeText = "»ÔŽá·çº¹Õé";
}

if(Ext.form.field.Base){
  Ext.form.field.Base.prototype.invalidText = "€èÒ¢Í§ªèÍ§¹ÕéäÁè¶Ù¡µéÍ§";
}

if(Ext.LoadMask){
  Ext.LoadMask.prototype.msg = "¡ÓÅÑ§âËÅŽ...";
}

if(Ext.Date){
    Ext.Date.monthNames = [
      "Á¡ÃÒ€Á",
      "¡ØÁŸÒÓŸÑ¹žì",
      "ÁÕ¹Ò€Á",
      "àÁÉÒÂ¹",
      "ŸÄÉÀÒ€Á",
      "ÁÔ¶Ø¹ÒÂ¹",
      "¡Ä¡¯Ò€Á",
      "ÊÔ§ËÒ€Á",
      "¡Ñ¹ÂÒÂ¹",
      "µØÅÒ€Á",
      "ŸÄÈšÔ¡ÒÂ¹",
      "žÑ¹ÇÒ€Á"
    ];

    Ext.Date.getShortMonthName = function(month) {
      return Ext.Date.monthNames[month].substring(0, 3);
    };

    Ext.Date.monthNumbers = {
      "Á€" : 0,
      "¡Ÿ" : 1,
      "ÁÕ€" : 2,
      "àÁÂ" : 3,
      "Ÿ€" : 4,
      "ÁÔÂ" : 5,
      "¡€" : 6,
      "Ê€" : 7,
      "¡Â" : 8,
      "µ€" : 9,
      "ŸÂ" : 10,
      "ž€" : 11
    };

    Ext.Date.getMonthNumber = function(name) {
      return Ext.Date.monthNumbers[name.substring(0, 1).toUpperCase() + name.substring(1, 3).toLowerCase()];
    };

    Ext.Date.dayNames = [
      "ÍÒ·ÔµÂì",
      "šÑ¹·Ãì",
      "ÍÑ§€ÒÃ",
      "ŸØ×ž",
      "ŸÄËÑÊºŽÕ",
      "ÈØ¡Ãì",
      "àÊÒÃì"
    ];

    Ext.Date.getShortDayName = function(day) {
      return Ext.Date.dayNames[day].substring(0, 3);
    };
}
if(Ext.MessageBox){
  Ext.MessageBox.buttonText = {
    ok     : "µ¡Å§",
    cancel : "Â¡àÅÔ¡",
    yes    : "ãªè",
    no     : "äÁèãªè"
  };
}

if(Ext.util.Format){
    Ext.apply(Ext.util.Format, {
        thousandSeparator: '.',
        decimalSeparator: ',',
        currencySign: '\u0e3f',  // Thai Baht
        dateFormat: 'm/d/Y'
    });
}

if(Ext.picker.Date){
  Ext.apply(Ext.picker.Date.prototype, {
    todayText         : "ÇÑ¹¹Õé",
    minText           : "This date is before the minimum date",
    maxText           : "This date is after the maximum date",
    disabledDaysText  : "",
    disabledDatesText : "",
    monthNames        : Ext.Date.monthNames,
    dayNames          : Ext.Date.dayNames,
    nextText          : 'àŽ×Í¹¶ÑŽä» (Control+Right)',
    prevText          : 'àŽ×Í¹¡èÍ¹Ë¹éÒ (Control+Left)',
    monthYearText     : 'àÅ×Í¡àŽ×Í¹ (Control+Up/Down to move years)',
    todayTip          : "{0} (Spacebar)",
    format            : "m/d/y",
    startDay          : 0
  });
}

if(Ext.picker.Month) {
  Ext.apply(Ext.picker.Month.prototype, {
      okText            : "&#160;µ¡Å§&#160;",
      cancelText        : "Â¡àÅÔ¡"
  });
}

if(Ext.toolbar.Paging){
  Ext.apply(Ext.PagingToolbar.prototype, {
    beforePageText : "Ë¹éÒ",
    afterPageText  : "of {0}",
    firstText      : "Ë¹éÒáÃ¡",
    prevText       : "¡èÍ¹Ë¹éÒ",
    nextText       : "¶ÑŽä»",
    lastText       : "Ë¹éÒÊØŽ·éÒÂ",
    refreshText    : "ÃÕà¿Ãª",
    displayMsg     : "¡ÓÅÑ§áÊŽ§ {0} - {1} šÒ¡ {2}",
    emptyMsg       : 'äÁèÁÕ¢éÍÁÙÅáÊŽ§'
  });
}

if(Ext.form.field.Text){
  Ext.apply(Ext.form.field.Text.prototype, {
    minLengthText : "The minimum length for this field is {0}",
    maxLengthText : "The maximum length for this field is {0}",
    blankText     : "This field is required",
    regexText     : "",
    emptyText     : null
  });
}

if(Ext.form.field.Number){
  Ext.apply(Ext.form.field.Number.prototype, {
    minText : "The minimum value for this field is {0}",
    maxText : "The maximum value for this field is {0}",
    nanText : "{0} is not a valid number"
  });
}

if(Ext.form.field.Date){
  Ext.apply(Ext.form.field.Date.prototype, {
    disabledDaysText  : "»ÔŽ",
    disabledDatesText : "»ÔŽ",
    minText           : "The date in this field must be after {0}",
    maxText           : "The date in this field must be before {0}",
    invalidText       : "{0} is not a valid date - it must be in the format {1}",
    format            : "m/d/y",
    altFormats        : "m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d"
  });
}

if(Ext.form.field.ComboBox){
  Ext.apply(Ext.form.field.ComboBox.prototype, {
    valueNotFoundText : undefined
  });
    Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
        loadingText       : "¡ÓÅÑ§âËÅŽ..."
    });
}

if(Ext.form.field.VTypes){
  Ext.apply(Ext.form.field.VTypes, {
    emailText    : 'This field should be an e-mail address in the format "user@example.com"',
    urlText      : 'This field should be a URL in the format "http:/'+'/www.example.com"',
    alphaText    : 'This field should only contain letters and _',
    alphanumText : 'This field should only contain letters, numbers and _'
  });
}

if(Ext.form.field.HtmlEditor){
  Ext.apply(Ext.form.field.HtmlEditor.prototype, {
    createLinkText : 'Please enter the URL for the link:',
    buttonTips : {
      bold : {
        title: 'Bold (Ctrl+B)',
        text: 'Make the selected text bold.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      italic : {
        title: 'Italic (Ctrl+I)',
        text: 'Make the selected text italic.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      underline : {
        title: 'Underline (Ctrl+U)',
        text: 'Underline the selected text.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      increasefontsize : {
        title: 'Grow Text',
        text: 'Increase the font size.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      decreasefontsize : {
        title: 'Shrink Text',
        text: 'Decrease the font size.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      backcolor : {
        title: 'Text Highlight Color',
        text: 'Change the background color of the selected text.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      forecolor : {
        title: 'Font Color',
        text: 'Change the color of the selected text.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifyleft : {
        title: 'Align Text Left',
        text: 'Align text to the left.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifycenter : {
        title: 'Center Text',
        text: 'Center text in the editor.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      justifyright : {
        title: 'Align Text Right',
        text: 'Align text to the right.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      insertunorderedlist : {
        title: 'Bullet List',
        text: 'Start a bulleted list.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      insertorderedlist : {
        title: 'Numbered List',
        text: 'Start a numbered list.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      createlink : {
        title: 'Hyperlink',
        text: 'Make the selected text a hyperlink.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      },
      sourceedit : {
        title: 'Source Edit',
        text: 'Switch to source editing mode.',
        cls: Ext.baseCSSPrefix + 'html-editor-tip'
      }
    }
  });
}

if(Ext.grid.header.Container){
  Ext.apply(Ext.grid.header.Container.prototype, {
    sortAscText  : "Sort Ascending",
    sortDescText : "Sort Descending",
    lockText     : "Lock Column",
    unlockText   : "Unlock Column",
    columnsText  : "Columns"
  });
}

if(Ext.grid.GroupingFeature){
  Ext.apply(Ext.grid.GroupingFeature.prototype, {
    emptyGroupText : '(None)',
    groupByText    : 'Group By This Field',
    showGroupsText : 'Show in Groups'
  });
}

if(Ext.grid.PropertyColumnModel){
  Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
    nameText   : "Name",
    valueText  : "Value",
    dateFormat : "m/j/Y"
  });
}

if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
  Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
    splitTip            : "Drag to resize.",
    collapsibleSplitTip : "Drag to resize. Double click to hide."
  });
}

});

/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Japanese translation
 * By tyama
 * 04-08-2007, 05:49 AM
 *
 * update based on English Translations by Condor (8 Aug 2008)
 * By sakuro (30 Aug 2008)
 */
Ext.onReady(function() {
    if (Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">読み込み中...</div>';
    }

    if(Ext.view.View){
      Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
      Ext.grid.Panel.prototype.ddText = "{0} 行選択";
    }

    if(Ext.LoadMask){
      Ext.LoadMask.prototype.msg = "読み込み中...";
    }
    
    if(Ext.Date) {
        Ext.Date.monthNames = [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月'
        ];

        Ext.Date.getShortMonthName = function(month) {
          return "" + (month + 1);
        };

        Ext.Date.monthNumbers = {
          "1" : 0,
          "2" : 1,
          "3" : 2,
          "4" : 3,
          "5" : 4,
          "6" : 5,
          "7" : 6,
          "8" : 7,
          "9" : 8,
          "10" : 9,
          "11" : 10,
          "12" : 11
        };

        Ext.Date.getMonthNumber = function(name) {
          return Ext.Date.monthNumbers[name.substring(0, name.length - 1)];
          // or simply parseInt(name.substring(0, name.length - 1)) - 1
        };

        Ext.Date.dayNames = [
          "日曜日",
          "月曜日",
          "火曜日",
          "水曜日",
          "木曜日",
          "金曜日",
          "土曜日"
        ];

        Ext.Date.getShortDayName = function(day) {
          return Ext.Date.dayNames[day].substring(0, 1); // just remove "曜日" suffix
        };

        Ext.Date.formatCodes.a = "(this.getHours() < 12 ? '午前' : '午後')";
        Ext.Date.formatCodes.A = "(this.getHours() < 12 ? '午前' : '午後')"; // no case difference
    }
    
    if(Ext.MessageBox){
      Ext.MessageBox.buttonText = {
        ok     : "OK",
        cancel : "キャンセル",
        yes    : "はい",
        no     : "いいえ"
      };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: ',',
            decimalSeparator: '.',
            currencySign: '\u00a5',  // Japanese Yen
            dateFormat: 'Y/m/d'
        });
    }

    if(Ext.picker.Date){
      Ext.apply(Ext.picker.Date.prototype, {
        todayText         : "今日",
        minText           : "選択した日付は最小値以下です。",
        maxText           : "選択した日付は最大値以上です。",
        disabledDaysText  : "",
        disabledDatesText : "",
        monthNames        : Ext.Date.monthNames,
        dayNames          : Ext.Date.dayNames,
        nextText          : '次月へ (コントロール+右)',
        prevText          : '前月へ (コントロール+左)',
        monthYearText     : '月選択 (コントロール+上/下で年移動)',
        todayTip          : "{0} (スペースキー)",
        format            : "Y/m/d",
        startDay          : 0
      });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;OK&#160;",
          cancelText        : "キャンセル"
      });
    }

    if(Ext.toolbar.Paging){
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText : "ページ",
        afterPageText  : "/ {0}",
        firstText      : "最初のページ",
        prevText       : "前のページ",
        nextText       : "次のページ",
        lastText       : "最後のページ",
        refreshText    : "更新",
        displayMsg     : "{2} 件中 {0} - {1} を表示",
        emptyMsg       : '表示するデータがありません。'
      });
    }

    if(Ext.form.field.Base){
      Ext.form.field.Base.prototype.invalidText = "フィールドの値が不正です。";
    }

    if(Ext.form.field.Text){
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText : "このフィールドの最小値は {0} です。",
        maxLengthText : "このフィールドの最大値は {0} です。",
        blankText     : "必須項目です。",
        regexText     : "",
        emptyText     : null
      });
    }

    if(Ext.form.field.Number){
      Ext.apply(Ext.form.field.Number.prototype, {
        decimalSeparator : ".",
        decimalPrecision : 2,
        minText : "このフィールドの最小値は {0} です。",
        maxText : "このフィールドの最大値は {0} です。",
        nanText : "{0} は数値ではありません。"
      });
    }

    if(Ext.form.field.Date){
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText  : "無効",
        disabledDatesText : "無効",
        minText           : "このフィールドの日付は、 {0} 以降の日付に設定してください。",
        maxText           : "このフィールドの日付は、 {0} 以前の日付に設定してください。",
        invalidText       : "{0} は間違った日付入力です。 - 入力形式は「{1}」です。",
        format            : "Y/m/d",
        altFormats        : "y/m/d|m/d/y|m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d"
      });
    }

    if(Ext.form.field.ComboBox){
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText : undefined
      });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "読み込み中..."
        });
    }

    if(Ext.form.field.VTypes){
      Ext.apply(Ext.form.field.VTypes, {
        emailText    : 'メールアドレスを"user@example.com"の形式で入力してください。',
        urlText      : 'URLを"http:/'+'/www.example.com"の形式で入力してください。',
        alphaText    : '半角英字と"_"のみです。',
        alphanumText : '半角英数と"_"のみです。'
      });
    }

    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : 'リンクのURLを入力してください:',
        buttonTips : {
          bold : {
            title: '太字 (コントロール+B)',
            text: '選択テキストを太字にします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: '斜体 (コントロール+I)',
            text: '選択テキストを斜体にします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: '下線 (コントロール+U)',
            text: '選択テキストに下線を引きます。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: '文字を大きく',
            text: 'フォントサイズを大きくします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: '文字を小さく',
            text: 'フォントサイズを小さくします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: '文字のハイライト',
            text: '選択テキストの背景色を変更します。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: '文字の色',
            text: '選択テキストの色を変更します。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: '左揃え',
            text: 'テキストを左揃えにします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: '中央揃え',
            text: 'テキストを中央揃えにします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: '右揃え',
            text: 'テキストを右揃えにします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: '番号なし箇条書き',
            text: '番号なし箇条書きを開始します。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: '番号付き箇条書き',
            text: '番号付き箇条書きを開始します。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: 'ハイパーリンク',
            text: '選択テキストをハイパーリンクにします。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: 'ソース編集',
            text: 'ソース編集モードに切り替えます。',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }

    if(Ext.grid.header.Container){
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText  : "昇順",
        sortDescText : "降順",
        columnsText  : "カラム"
      });
    }

    if(Ext.grid.GroupingFeature){
      Ext.apply(Ext.grid.GroupingFeature.prototype, {
        emptyGroupText : '(なし)',
        groupByText    : 'このカラムでグルーピング',
        showGroupsText : 'グルーピング'
      });
    }

    if(Ext.grid.PropertyColumnModel){
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText   : "名称",
        valueText  : "値",
        dateFormat : "Y/m/d"
      });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip            : "ドラッグするとリサイズできます。",
        collapsibleSplitTip : "ドラッグでリサイズ。 ダブルクリックで隠す。"
      });
    }

    if(Ext.form.field.Time){
      Ext.apply(Ext.form.field.Time.prototype, {
        minText : "このフィールドの時刻は、 {0} 以降の時刻に設定してください。",
        maxText : "このフィールドの時刻は、 {0} 以前の時刻に設定してください。",
        invalidText : "{0} は間違った時刻入力です。",
        format : "g:i A",
        altFormats : "g:ia|g:iA|g:i a|g:i A|h:i|g:i|H:i|ga|ha|gA|h a|g a|g A|gi|hi|gia|hia|g|H"
      });
    }

    if(Ext.form.CheckboxGroup){
      Ext.apply(Ext.form.CheckboxGroup.prototype, {
        blankText : "このグループから最低１つのアイテムを選択しなければなりません。"
      });
    }

    if(Ext.form.RadioGroup){
      Ext.apply(Ext.form.RadioGroup.prototype, {
        blankText : "このグループから１つのアイテムを選択しなければなりません。"
      });
    }

});

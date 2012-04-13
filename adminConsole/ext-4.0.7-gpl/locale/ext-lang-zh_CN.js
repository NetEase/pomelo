/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Simplified Chinese translation
 * By DavidHu
 * 09 April 2007
 * 
 * update by andy_ghg
 * 2009-10-22 15:00:57
 */
Ext.onReady(function(){
    if(Ext.Updater){
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">加载中...</div>';
    }

    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "选择了 {0} 行";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "关闭此标签";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "输入值非法";
    }

    if (Ext.LoadMask) {
        Ext.LoadMask.prototype.msg = "读取中...";
    }

    if(Ext.Date){
        Ext.Date.monthNames = [
           "一月",
           "二月",
           "三月",
           "四月",
           "五月",
           "六月",
           "七月",
           "八月",
           "九月",
           "十月",
           "十一月",
           "十二月"
        ];

        Ext.Date.dayNames = [
           "日",
           "一",
           "二",
           "三",
           "四",
           "五",
           "六"
        ];

        Ext.Date.formatCodes.a = "(this.getHours() < 12 ? '上午' : '下午')";
        Ext.Date.formatCodes.A = "(this.getHours() < 12 ? '上午' : '下午')";
    }

    if(Ext.MessageBox){
       Ext.MessageBox.buttonText = {
          ok     : "确定",
          cancel : "取消",
          yes    : "是",
          no     : "否"
       };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u00a5',  // Chinese Yuan
            dateFormat: 'y年m月d日'
        });
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "今天",
          minText           : "日期必须大于最小允许日期",//update
          maxText           : "日期必须小于最大允许日期",//update
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames        : Ext.Date.monthNames,
          dayNames          : Ext.Date.dayNames,
          nextText          : '下个月 (Ctrl+Right)',
          prevText          : '上个月 (Ctrl+Left)',
          monthYearText     : '选择一个月 (Control+Up/Down 来改变年份)',//update
          todayTip          : "{0} (空格键选择)",
          format            : "y年m月d日"
       });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "确定",
          cancelText        : "取消"
      });
    }

    if(Ext.toolbar.Paging){
       Ext.apply(Ext.PagingToolbar.prototype, {
          beforePageText : "第",//update
          afterPageText  : "页,共 {0} 页",//update
          firstText      : "第一页",
          prevText       : "上一页",//update
          nextText       : "下一页",
          lastText       : "最后页",
          refreshText    : "刷新",
          displayMsg     : "显示 {0} - {1}条，共 {2} 条",//update
          emptyMsg       : '没有数据'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "该输入项的最小长度是 {0} 个字符",
          maxLengthText : "该输入项的最大长度是 {0} 个字符",
          blankText     : "该输入项为必输项",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "该输入项的最小值是 {0}",
          maxText : "该输入项的最大值是 {0}",
          nanText : "{0} 不是有效数值"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "禁用",
          disabledDatesText : "禁用",
          minText           : "该输入项的日期必须在 {0} 之后",
          maxText           : "该输入项的日期必须在 {0} 之前",
          invalidText       : "{0} 是无效的日期 - 必须符合格式： {1}",
          format            : "y年m月d日"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "加载中..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : '该输入项必须是电子邮件地址，格式如： "user@example.com"',
          urlText      : '该输入项必须是URL地址，格式如： "http:/'+'/www.example.com"',
          alphaText    : '该输入项只能包含半角字母和_',//update
          alphanumText : '该输入项只能包含半角字母,数字和_'//update
       });
    }
    //add HTMLEditor's tips by andy_ghg
    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : '添加超级链接:',
        buttonTips : {
          bold : {
            title: '粗体 (Ctrl+B)',
            text: '将选中的文字设置为粗体',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: '斜体 (Ctrl+I)',
            text: '将选中的文字设置为斜体',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: '下划线 (Ctrl+U)',
            text: '给所选文字加下划线',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: '增大字体',
            text: '增大字号',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: '缩小字体',
            text: '减小字号',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: '以不同颜色突出显示文本',
            text: '使文字看上去像是用荧光笔做了标记一样',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: '字体颜色',
            text: '更改字体颜色',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: '左对齐',
            text: '将文字左对齐',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: '居中',
            text: '将文字居中对齐',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: '右对齐',
            text: '将文字右对齐',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: '项目符号',
            text: '开始创建项目符号列表',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: '编号',
            text: '开始创建编号列表',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: '转成超级链接',
            text: '将所选文本转换成超级链接',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: '代码视图',
            text: '以代码的形式展现文本',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }


    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "正序",//update
          sortDescText : "倒序",//update
          lockText     : "锁定列",//update
          unlockText   : "解除锁定",//update
          columnsText  : "列"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "名称",
          valueText  : "值",
          dateFormat : "y年m月d日"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "拖动来改变尺寸.",
          collapsibleSplitTip : "拖动来改变尺寸. 双击隐藏."
       });
    }
});

/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Portuguese/Portugal (pt_PT) Translation
 * by Nuno Franco da Costa - francodacosta.com
 * translated from ext-lang-en.js
 */ 
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">A carregar...</div>';
    }

    if(Ext.view.View){
      Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
      Ext.grid.Panel.prototype.ddText = "{0} linha(s) seleccionada(s)";
    }

    if(Ext.TabPanelItem){
      Ext.TabPanelItem.prototype.closeText = "Fechar aba";
    }

    if(Ext.LoadMask){
      Ext.LoadMask.prototype.msg = "A carregar...";
    }

    if(Ext.Date) {
        Ext.Date.monthNames = [
          "Janeiro",
          "Fevereiro",
          "Mar&ccedil;o",
          "Abril",
          "Maio",
          "Junho",
          "Julho",
          "Agosto",
          "Setembro",
          "Outubro",
          "Novembro",
          "Dezembro"
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
          "Domingo",
          "Segunda",
          "Ter&ccedil;a",
          "Quarta",
          "Quinta",
          "Sexta",
          "Sabado"
        ];

        Ext.Date.getShortDayName = function(day) {
          return Ext.Date.dayNames[day].substring(0, 3);
        };
    }

    if(Ext.MessageBox){
      Ext.MessageBox.buttonText = {
        ok     : "OK",
        cancel : "Cancelar",
        yes    : "Sim",
        no     : "N&atilde;o"
      };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '\u20ac',  // Portugese Euro
            dateFormat: 'Y/m/d'
        });
    }

    if(Ext.picker.Date){
      Ext.apply(Ext.picker.Date.prototype, {
        todayText         : "Hoje",
        minText           : "A data &eacute; anterior ao m&iacute;nimo definido",
        maxText           : "A data &eacute; posterior ao m&aacute;ximo definido",
        disabledDaysText  : "",
        disabledDatesText : "",
        monthNames        : Ext.Date.monthNames,
        dayNames          : Ext.Date.dayNames,
        nextText          : 'M&ecirc;s Seguinte (Control+Right)',
        prevText          : 'M&ecirc;s Anterior (Control+Left)',
        monthYearText     : 'Escolha um m&ecirc;s (Control+Up/Down ava&ccedil;ar/recuar anos)',
        todayTip          : "{0} (barra de espa&ccedil;o)",
        format            : "y/m/d",
        startDay          : 0
      });
    }

    if(Ext.picker.Month) {
      Ext.apply(Ext.picker.Month.prototype, {
          okText            : "&#160;OK&#160;",
          cancelText        : "Cancelar"
      });
    }

    if(Ext.toolbar.Paging){
      Ext.apply(Ext.PagingToolbar.prototype, {
        beforePageText : "P&aacute;gina",
        afterPageText  : "de {0}",
        firstText      : "Primeira P&aacute;gina",
        prevText       : "P&aacute;gina Anterior",
        nextText       : "Pr%oacute;xima P&aacute;gina",
        lastText       : "&Uacute;ltima P&aacute;gina",
        refreshText    : "Recaregar",
        displayMsg     : "A mostrar {0} - {1} de {2}",
        emptyMsg       : 'Sem dados para mostrar'
      });
    }

    if(Ext.form.field.Base){
      Ext.form.field.Base.prototype.invalidText = "O valor deste campo &eacute; inv&aacute;lido";
    }

    if(Ext.form.field.Text){
      Ext.apply(Ext.form.field.Text.prototype, {
        minLengthText : "O comprimento m&iacute;nimo deste campo &eaute; {0}",
        maxLengthText : "O comprimento m&aacute;ximo deste campo &eaute; {0}",
        blankText     : "Este campo &eacute; de preenchimento obrigat&oacute;rio",
        regexText     : "",
        emptyText     : null
      });
    }

    if(Ext.form.field.Number){
      Ext.apply(Ext.form.field.Number.prototype, {
        minText : "O valor m&iacute;nimo deste campo &eaute; {0}",
        maxText : "O valor m&aacute;ximo deste campo &eaute; {0}",
        nanText : "{0} n&atilde;o &eacute; um numero"
      });
    }

    if(Ext.form.field.Date){
      Ext.apply(Ext.form.field.Date.prototype, {
        disabledDaysText  : "Desabilitado",
        disabledDatesText : "Desabilitado",
        minText           : "A data deste campo deve ser posterior a {0}",
        maxText           : "A data deste campo deve ser anterior a {0}",
        invalidText       : "{0} n&atilde;o &eacute; uma data v&aacute;lida - deve estar no seguinte formato{1}",
        format            : "y/m/d",
        altFormats        : "m/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d"
      });
    }

    if(Ext.form.field.ComboBox){
      Ext.apply(Ext.form.field.ComboBox.prototype, {
        valueNotFoundText : undefined
      });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "A Carregar..."
        });
    }

    if(Ext.form.field.VTypes){
      Ext.apply(Ext.form.field.VTypes, {
        emailText    : 'Este campo deve ser um endere&ccedil;o de email no formato "utilizador@dominio.com"',
        urlText      : 'Este campo deve ser um URL no formato "http:/'+'/www.dominio.com"',
        alphaText    : 'Este campo deve conter apenas letras e _',
        alphanumText : 'Este campo deve conter apenas letras, n&uacute;meros e _'
      });
    }

    if(Ext.form.field.HtmlEditor){
      Ext.apply(Ext.form.field.HtmlEditor.prototype, {
        createLinkText : 'Indique o endere&ccedil;o do link:',
        buttonTips : {
          bold : {
            title: 'Negrito (Ctrl+B)',
            text: 'Transforma o texto em Negrito.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          italic : {
            title: 'It&aacute;lico (Ctrl+I)',
            text: 'Transforma o texto em it&aacute;lico.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          underline : {
            title: 'Sublinhar (Ctrl+U)',
            text: 'Sublinha o texto.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          increasefontsize : {
            title: 'Aumentar texto',
            text: 'Aumenta o tamanho da fonte.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          decreasefontsize : {
            title: 'Encolher texto',
            text: 'Diminui o tamanho da fonte.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          backcolor : {
            title: 'C&ocirc;r de fundo do texto',
            text: 'Altera a c&ocirc;r de fundo do texto.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          forecolor : {
            title: 'C&ocirc;r do texo',
            text: 'Altera a a&ocirc;r do texo.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyleft : {
            title: 'ALinhar &agrave; esquerda',
            text: 'ALinha o texto &agrave; esquerda.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifycenter : {
            title: 'Centrar',
            text: 'Centra o texto.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          justifyright : {
            title: 'ALinhar &agrave; direita',
            text: 'ALinha o texto &agravce; direita.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertunorderedlist : {
            title: 'Lista',
            text: 'Inicia uma lista.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          insertorderedlist : {
            title: 'Lista Numerada',
            text: 'Inicia uma lista numerada.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          createlink : {
            title: 'Hyperlink',
            text: 'Transforma o texto num hyperlink.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          },
          sourceedit : {
            title: 'Editar c&oacute;digo',
            text: 'Alterar para o modo de edi&ccedil;&atilde;o de c&oacute;digo.',
            cls: Ext.baseCSSPrefix + 'html-editor-tip'
          }
        }
      });
    }

    if(Ext.form.Basic){
      Ext.form.Basic.prototype.waitTitle = "Por favor espere...";
    }

    if(Ext.grid.header.Container){
      Ext.apply(Ext.grid.header.Container.prototype, {
        sortAscText  : "Ordena&ccedil;&atilde;o Crescente",
        sortDescText : "Ordena&ccedil;&atilde;o Decrescente",
        lockText     : "Fixar Coluna",
        unlockText   : "Libertar Coluna",
        columnsText  : "Colunas"
      });
    }

    if(Ext.grid.GroupingFeature){
      Ext.apply(Ext.grid.GroupingFeature.prototype, {
        emptyGroupText : '(Nenhum)',
        groupByText    : 'Agrupar por este campo',
        showGroupsText : 'Mostrar nos Grupos'
      });
    }

    if(Ext.grid.PropertyColumnModel){
      Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
        nameText   : "Nome",
        valueText  : "Valor",
        dateFormat : "Y/j/m"
      });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
      Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
        splitTip            : "Arastar para redimensionar.",
        collapsibleSplitTip : "Arastar para redimensionar. DUplo clique para esconder"
      });
    }
});

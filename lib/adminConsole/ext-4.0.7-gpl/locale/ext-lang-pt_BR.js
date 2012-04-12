/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * Portuguese/Brazil Translation by Weber Souza
 * 08 April 2007
 * Updated by Allan Brazute Alves (EthraZa)
 * 06 September 2007
 * Updated by Leonardo Lima
 * 05 March 2008
 * Updated by Juliano Tarini (jtarini)
 * 22 April 2008
 */
Ext.onReady(function(){
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">Carregando...</div>';
    }

    if(Ext.view.View){
       Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
       Ext.grid.Panel.prototype.ddText = "{0} linha(s) selecionada(s)";
    }

    if(Ext.TabPanelItem){
       Ext.TabPanelItem.prototype.closeText = "Fechar";
    }

    if(Ext.form.field.Base){
       Ext.form.field.Base.prototype.invalidText = "O valor para este campo &eacute; inv&aacute;lido";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "Carregando...";
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
          Fev : 1,
          Mar : 2,
          Abr : 3,
          Mai : 4,
          Jun : 5,
          Jul : 6,
          Ago : 7,
          Set : 8,
          Out : 9,
          Nov : 10,
          Dez : 11
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
           "S&aacute;bado"
        ];
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
            thousandSeparator: ',',
            decimalSeparator: '.',
            currencySign: 'R$',  // Brazilian Real
            dateFormat: 'd/m/Y'
        });
        Ext.util.Format.brMoney = Ext.util.Format.currency;
    }

    if(Ext.picker.Date){
       Ext.apply(Ext.picker.Date.prototype, {
          todayText         : "Hoje",
          minText           : "Esta data &eacute; anterior a menor data",
          maxText           : "Esta data &eacute; posterior a maior data",
          disabledDaysText  : "",
          disabledDatesText : "",
          monthNames        : Ext.Date.monthNames,
          dayNames          : Ext.Date.dayNames,
          nextText          : 'Pr&oacute;ximo M&ecirc;s (Control+Direita)',
          prevText          : 'M&ecirc;s Anterior (Control+Esquerda)',
          monthYearText     : 'Escolha um M&ecirc;s (Control+Cima/Baixo para mover entre os anos)',
          todayTip          : "{0} (Espa&ccedil;o)",
          format            : "d/m/Y",
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
          nextText       : "Pr&oacute;xima P&aacute;gina",
          lastText       : "&Uacute;ltima P&aacute;gina",
          refreshText    : "Atualizar",
          displayMsg     : "<b>{0} &agrave; {1} de {2} registro(s)</b>",
          emptyMsg       : 'Sem registros para exibir'
       });
    }

    if(Ext.form.field.Text){
       Ext.apply(Ext.form.field.Text.prototype, {
          minLengthText : "O tamanho m&iacute;nimo para este campo &eacute; {0}",
          maxLengthText : "O tamanho m&aacute;ximo para este campo &eacute; {0}",
          blankText     : "Este campo &eacute; obrigat&oacute;rio.",
          regexText     : "",
          emptyText     : null
       });
    }

    if(Ext.form.field.Number){
       Ext.apply(Ext.form.field.Number.prototype, {
          minText : "O valor m&iacute;nimo para este campo &eacute; {0}",
          maxText : "O valor m&aacute;ximo para este campo &eacute; {0}",
          nanText : "{0} n&atilde;o &eacute; um n&uacute;mero v&aacute;lido"
       });
    }

    if(Ext.form.field.Date){
       Ext.apply(Ext.form.field.Date.prototype, {
          disabledDaysText  : "Desabilitado",
          disabledDatesText : "Desabilitado",
          minText           : "A data deste campo deve ser posterior a {0}",
          maxText           : "A data deste campo deve ser anterior a {0}",
          invalidText       : "{0} n&atilde;o &eacute; uma data v&aacute;lida - deve ser informado no formato {1}",
          format            : "d/m/Y"
       });
    }

    if(Ext.form.field.ComboBox){
       Ext.apply(Ext.form.field.ComboBox.prototype, {
          valueNotFoundText : undefined
       });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "Carregando..."
        });
    }

    if(Ext.form.field.VTypes){
       Ext.apply(Ext.form.field.VTypes, {
          emailText    : 'Este campo deve ser um endere&ccedil;o de e-mail v&aacute;lido, no formato "usuario@dominio.com.br"',
          urlText      : 'Este campo deve ser uma URL no formato "http:/'+'/www.dominio.com.br"',
          alphaText    : 'Este campo deve conter apenas letras e _',
          alphanumText : 'Este campo deve conter apenas letras, n&uacute;meros e _'
       });
    }

    if(Ext.form.field.HtmlEditor){
       Ext.apply(Ext.form.field.HtmlEditor.prototype, {
            createLinkText : 'Por favor, entre com a URL do link:',
            buttonTips : {
                bold : {
                   title: 'Negrito (Ctrl+B)',
                   text: 'Deixa o texto selecionado em negrito.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                italic : {
                   title: 'It&aacute;lico (Ctrl+I)',
                   text: 'Deixa o texto selecionado em it&aacute;lico.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
                },
                underline : {
                   title: 'Sublinhado (Ctrl+U)',
                   text: 'Sublinha o texto selecionado.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               increasefontsize : {
                   title: 'Aumentar Texto',
                   text: 'Aumenta o tamanho da fonte.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               decreasefontsize : {
                   title: 'Diminuir Texto',
                   text: 'Diminui o tamanho da fonte.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               backcolor : {
                   title: 'Cor de Fundo',
                   text: 'Muda a cor do fundo do texto selecionado.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               forecolor : {
                   title: 'Cor da Fonte',
                   text: 'Muda a cor do texto selecionado.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifyleft : {
                   title: 'Alinhar &agrave; Esquerda',
                   text: 'Alinha o texto &agrave; esquerda.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifycenter : {
                   title: 'Centralizar Texto',
                   text: 'Centraliza o texto no editor.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               justifyright : {
                   title: 'Alinhar &agrave; Direita',
                   text: 'Alinha o texto &agrave; direita.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               insertunorderedlist : {
                   title: 'Lista com Marcadores',
                   text: 'Inicia uma lista com marcadores.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               insertorderedlist : {
                   title: 'Lista Numerada',
                   text: 'Inicia uma lista numerada.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               createlink : {
                   title: 'Link',
                   text: 'Transforma o texto selecionado em um link.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               },
               sourceedit : {
                   title: 'Editar Fonte',
                   text: 'Troca para o modo de edi&ccedil;&atilde;o de c&oacute;digo fonte.',
                   cls: Ext.baseCSSPrefix + 'html-editor-tip'
               }
            }
       });
    }

    if(Ext.grid.header.Container){
       Ext.apply(Ext.grid.header.Container.prototype, {
          sortAscText  : "Ordem Ascendente",
          sortDescText : "Ordem Descendente",
          lockText     : "Bloquear Coluna",
          unlockText   : "Desbloquear Coluna",
          columnsText  : "Colunas"
       });
    }

    if(Ext.grid.PropertyColumnModel){
       Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
          nameText   : "Nome",
          valueText  : "Valor",
          dateFormat : "d/m/Y"
       });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
       Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
          splitTip            : "Arraste para redimensionar.",
          collapsibleSplitTip : "Arraste para redimensionar. Duplo clique para esconder."
       });
    }
});

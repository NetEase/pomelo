/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
﻿/**
 * France (Canadian) translation
 * By BernardChhun
 * 04-08-2007, 03:07 AM
 */
Ext.onReady(function() {
    if(Ext.Updater) {
        Ext.Updater.defaults.indicatorText = '<div class="loading-indicator">En cours de chargement...</div>';
    }

    if(Ext.view.View){
        Ext.view.View.prototype.emptyText = "";
    }

    if(Ext.grid.Panel){
        Ext.grid.Panel.prototype.ddText = "{0} ligne(s) sélectionné(s)";
    }

    if(Ext.TabPanelItem){
        Ext.TabPanelItem.prototype.closeText = "Fermer cette onglet";
    }

    if(Ext.form.field.Base){
        Ext.form.field.Base.prototype.invalidText = "La valeur de ce champ est invalide";
    }

    if(Ext.LoadMask){
        Ext.LoadMask.prototype.msg = "En cours de chargement...";
    }

    if(Ext.Date){
        Ext.Date.shortMonthNames = [
        "Janv",
        "Févr",
        "Mars",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Août",
        "Sept",
        "Oct",
        "Nov",
        "Déc"
        ];

        Ext.Date.getShortMonthName = function(month) {
            return Ext.Date.shortMonthNames[month];
        };

        Ext.Date.monthNames = [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Août",
        "Septembre",
        "Octobre",
        "Novembre",
        "Décembre"
        ];

        Ext.Date.monthNumbers = {
            "Janvier" : 0,
            "Février" : 1,
            "Mars" : 2,
            "Avril" : 3,
            "Mai" : 4,
            "Juin" : 5,
            "Juillet" : 6,
            "Août" : 7,
            "Septembre" : 8,
            "Octobre" : 9,
            "Novembre" : 10,
            "Décembre" : 11
        };

        Ext.Date.getMonthNumber = function(name) {
            return Ext.Date.monthNumbers[Ext.util.Format.capitalize(name)];
        };

        Ext.Date.dayNames = [
        "Dimanche",
        "Lundi",
        "Mardi",
        "Mercredi",
        "Jeudi",
        "Vendredi",
        "Samedi"
        ];

        Ext.Date.getShortDayName = function(day) {
            return Ext.Date.dayNames[day].substring(0, 3);
        };
    }
    if(Ext.MessageBox){
        Ext.MessageBox.buttonText = {
            ok     : "OK",
            cancel : "Annuler",
            yes    : "Oui",
            no     : "Non"
        };
    }

    if(Ext.util.Format){
        Ext.apply(Ext.util.Format, {
            thousandSeparator: '.',
            decimalSeparator: ',',
            currencySign: '$',  // Canadian Dollar
            dateFormat: 'd/m/Y'
        });
    }

    if(Ext.picker.Date){
        Ext.apply(Ext.picker.Date.prototype, {
            todayText         : "Aujourd'hui",
            minText           : "Cette date est plus petite que la date minimum",
            maxText           : "Cette date est plus grande que la date maximum",
            disabledDaysText  : "",
            disabledDatesText : "",
            monthNames	: Ext.Date.monthNames,
            dayNames		: Ext.Date.dayNames,
            nextText          : 'Prochain mois (CTRL+Fléche droite)',
            prevText          : 'Mois précédent (CTRL+Fléche gauche)',
            monthYearText     : 'Choissisez un mois (CTRL+Fléche haut ou bas pour changer d\'année.)',
            todayTip          : "{0} (Barre d'espace)",
            format            : "d/m/y"
        });
    }

    if(Ext.toolbar.Paging){
        Ext.apply(Ext.PagingToolbar.prototype, {
            beforePageText : "Page",
            afterPageText  : "de {0}",
            firstText      : "Première page",
            prevText       : "Page précédente",
            nextText       : "Prochaine page",
            lastText       : "Dernière page",
            refreshText    : "Recharger la page",
            displayMsg     : "Page courante {0} - {1} de {2}",
            emptyMsg       : 'Aucune donnée à afficher'
        });
    }

    if(Ext.form.field.Text){
        Ext.apply(Ext.form.field.Text.prototype, {
            minLengthText : "La longueur minimum de ce champ est de {0} caractères",
            maxLengthText : "La longueur maximum de ce champ est de {0} caractères",
            blankText     : "Ce champ est obligatoire",
            regexText     : "",
            emptyText     : null
        });
    }

    if(Ext.form.field.Number){
        Ext.apply(Ext.form.field.Number.prototype, {
            minText : "La valeur minimum de ce champ doit être de {0}",
            maxText : "La valeur maximum de ce champ doit être de {0}",
            nanText : "{0} n'est pas un nombre valide"
        });
    }

    if(Ext.form.field.Date){
        Ext.apply(Ext.form.field.Date.prototype, {
            disabledDaysText  : "Désactivé",
            disabledDatesText : "Désactivé",
            minText           : "La date de ce champ doit être avant le {0}",
            maxText           : "La date de ce champ doit être après le {0}",
            invalidText       : "{0} n'est pas une date valide - il doit être au format suivant: {1}",
            format            : "d/m/y"
        });
    }

    if(Ext.form.field.ComboBox){
        Ext.apply(Ext.form.field.ComboBox.prototype, {
            valueNotFoundText : undefined
        });
        Ext.apply(Ext.form.field.ComboBox.prototype.defaultListConfig, {
            loadingText       : "En cours de chargement..."
        });
    }

    if(Ext.form.field.VTypes){
        Ext.apply(Ext.form.field.VTypes, {
            emailText    : 'Ce champ doit contenir un courriel et doit être sous ce format: "usager@example.com"',
            urlText      : 'Ce champ doit contenir une URL sous le format suivant: "http:/'+'/www.example.com"',
            alphaText    : 'Ce champ ne peut contenir que des lettres et le caractère souligné (_)',
            alphanumText : 'Ce champ ne peut contenir que des caractères alphanumériques ainsi que le caractère souligné (_)'
        });
    }

    if(Ext.grid.header.Container){
        Ext.apply(Ext.grid.header.Container.prototype, {
            sortAscText  : "Tri ascendant",
            sortDescText : "Tri descendant",
            lockText     : "Verrouillé la colonne",
            unlockText   : "Déverrouillé la colonne",
            columnsText  : "Colonnes"
        });
    }

    if(Ext.grid.PropertyColumnModel){
        Ext.apply(Ext.grid.PropertyColumnModel.prototype, {
            nameText   : "Propriété",
            valueText  : "Valeur",
            dateFormat : "d/m/Y"
        });
    }

    if(Ext.layout.BorderLayout && Ext.layout.BorderLayout.SplitRegion){
        Ext.apply(Ext.layout.BorderLayout.SplitRegion.prototype, {
            splitTip            : "Cliquer et glisser pour redimensionner le panneau.",
            collapsibleSplitTip : "Cliquer et glisser pour redimensionner le panneau. Double-cliquer pour cacher le panneau."
        });
    }
});

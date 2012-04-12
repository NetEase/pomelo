Ext.generator.Controller.templates.ControllerSpec = new Ext.XTemplate(
    'describe("The {name} controller", function() {\n',
    '    var controller = Ext.ControllerManager.get("{name}");\n\n',
    '<tpl for="actions">',
    '    describe("the {.} action", function() {\n',
    '        beforeEach(function() {\n',
    '            \n',
    '        });\n\n\n',
    '    });\n\n',
    '</tpl>',
    '});\n'
);
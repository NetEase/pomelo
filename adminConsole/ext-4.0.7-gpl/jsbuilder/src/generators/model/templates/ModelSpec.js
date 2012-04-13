Ext.generator.Model.templates.ModelSpec = new Ext.XTemplate(
    'describe("A {name}", function() {\n',
    '    var {name} = Ext.ModelManager.getModel("{name}"),\n',
    '        instance;\n\n',
    '    beforeEach(function() {\n',
    '        instance = new {name}({});\n',
    '    });\n\n',
    '});'
);
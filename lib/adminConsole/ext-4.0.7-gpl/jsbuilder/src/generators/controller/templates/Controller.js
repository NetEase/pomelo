Ext.generator.Controller.templates.Controller = new Ext.XTemplate(
    'Ext.regController("{name}", {\n',
    '<tpl for="actions">',
    '    {.}: function() {\n',
    '        \n',
    '    }{[xindex != xcount ? ",\n\n" : ""]}',
    '</tpl>',    
    '\n});\n'
);
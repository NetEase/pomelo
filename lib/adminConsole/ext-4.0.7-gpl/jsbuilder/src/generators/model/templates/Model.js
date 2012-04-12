Ext.generator.Model.templates.Model = new Ext.XTemplate(
    'Ext.regModel("{name}", {\n',
    '    fields: [\n',
    '<tpl for="fields">',
    '        \{name: "{name}", type: "{type}"\}{[xindex != xcount ? "," : ""]}\n',
    '</tpl>',
    '    ]\n',
    '});'
);
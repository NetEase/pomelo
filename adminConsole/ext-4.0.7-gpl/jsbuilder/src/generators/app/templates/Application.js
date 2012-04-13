/**
 * This file sets application-wide settings and launches the application when everything has
 * been loaded onto the page. By default we just render the application\s Viewport inside the
 * launch method (see app/views/Viewport.js).
 */ 
{name} = new Ext.Application({
    defaultTarget: "viewport",
    name: "{name}",
    launch: function() {
        this.viewport = new {name}.Viewport();
    }
});
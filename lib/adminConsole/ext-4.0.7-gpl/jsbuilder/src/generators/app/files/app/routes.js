/**
 * The Router maps local urls to controller and action pairs. This is used primarily 
 * for providing history support without reloading the page. Example usage:
 * 
 * Connects http://myapp.com/#home to the index controller's overview action
 * map.connect("home", {controller: 'index', action: 'overview'});
 * 
 * Connects urls like "images/myImage.jpg" to the images controller's show action, passing
 * "myImage.jpg" as the "url" property of the options object each controller action receives
 * map.connect("images/:url", {controller: 'images', action: 'show'});
 */
Ext.Router.draw(function(map) {
    
    
    //These are default fallback routes and can be removed if not needed
    map.connect(':controller/:action');
    map.connect(':controller/:action/:id');
});
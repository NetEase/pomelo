/* Log.io UI logic
 * Instantiates WebClient(), binds document.ready()
 */

var MAX_SCREENS = 4;
var MAX_SCREEN_LINES = 10000;
var CLEANUP_INTERVAL = 10 * 1000; // 10 seconds
var RECONNECT_DELAY = 10 * 1000; // 10 seconds

// Instantiate WebClient

var web_client = new WebClient(io);

// Update statistics widget
setInterval(function() {
  var now = new Date();
  var elapsed = (now.getTime() - web_client.stats.start.getTime()) / 1000;
  var minutes = parseInt(elapsed / 60);
  var seconds = parseInt(elapsed % 60);
  var rate = web_client.stats.messages/elapsed;
  $("#stats")
    .find(".nodes b").html(web_client.stats.nodes).end()
    .find(".log_files b").html(web_client.stats.log_files).end()
    .find(".messages b").html(web_client.stats.messages).end()
    .find(".elapsed b").html(minutes + ":" + (seconds < 10 ? "0" : "") + seconds).end()
    .find(".rate b").html((rate).toFixed(2));
}, 1000);

// Terminal buffer cleanup
setInterval(function() {
  $(".screen .console").each(function() {
    $(this).children(":gt(" + MAX_SCREEN_LINES +")").remove();
  });
}, CLEANUP_INTERVAL);

// Event bindings, main method
$(document).ready(function() {
  var bottom_height = $(".stat:first").height();
  var bar_height = $(".bar:first").height();

  // Calculate individual screen size
  function calc_screen_size(scount) {
    if (!scount) { scount = $("#screens .screen").length; }
    var ssize = (($(window).height() - bottom_height - 20) / scount)
      - (bar_height + 53);
    return ssize;
  }
  
  // Resize screens
  web_client.resize = function(scount, resize_bottom) {
    if (!resize_bottom) { resize_bottom = true; }
    $("#controls2, #right").height($(window).height());
    $(".console").height(calc_screen_size(scount));
    var screen_width = $(window).width() - $("#controls2").width();
    $("#right" + (resize_bottom ? ", #bottom" : ""))
      .width(screen_width).css('max-width', screen_width);
  }
  $(window).resize(function() {
    web_client.resize();
  });



   // Add history screen
  $("#add-history-button").click(function() {
    if ($("#screens .screen").length == MAX_SCREENS) {
      alert("Sorry, no more than " + MAX_SCREENS + " screens allowed");
    } else {
      var scount = $("#screens .screen").length;
      web_client.add_history();
      web_client.resize(scount + 1, false);
    }
  }).click(); // load initial history
  // Add stream
  $("#add-stream-button").click(function() {
    if ($("#screens .screen").length == MAX_SCREENS) {
      alert("Sorry, no more than " + MAX_SCREENS + " screens allowed");
    } else {
      var scount = $("#screens .screen").length;
      web_client.add_stream();
      web_client.resize(scount + 1, false);
    }
  }).click(); // load initial stream
  $("#shut-down-button").click(function() {
  	if (confirm('请再次确认')) {
  		(web_client.socket.emit('quit'));
  	}
  });
});

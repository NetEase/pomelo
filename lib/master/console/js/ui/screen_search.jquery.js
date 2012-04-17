$.fn.regex_searcher = function(screen) {

  screen._searcher = this;
  var searcher = this;
  var dom = $(this);
  var result_count = dom.find(".result-count");
  var sconsole = dom.find(".console");
  var sinput = dom.find(".screen-search input");

  // Regex search widget
  sinput.focus(function() {
    if ($(this).val() == $(this).attr("title")) {
      $(this).removeClass("inactive").addClass("active").val("");
    }
  }).blur(function() {
    if ($(this).val().search(/\S+/g) < 0) {
      //$(this).prevAll(".result-count").html("");
      $(this).val($(this).attr("title")).removeClass("active").addClass("inactive");
    }
  }).keyup(function(e) {

    // Ignore non arrow keys
    if (e.which >= 37 && e.which <= 40) { return; }
    var poll_interval = 500;
    searcher.reset();

    // Wait until typing has stopped
    dom.data('last_change', new Date().getTime());
    setTimeout(function() {
      var now = new Date().getTime();
      var val = sinput.val();

      // Only highlight if typing has stopped and regex is valid
      if (((now - dom.data('last_change')) >= (poll_interval-10)) 
          && (val.search(/\S/ig) >= 0) && val != sinput.attr("title")) {
        try {
          searcher.find_matches();
        } catch(err) { dom.addClass("bad-regex"); return; }
        searcher.scroll_next();
      }
    }, poll_interval);
  });

  // Update match count
  this.update_match_count = function() {
    var len = screen.highlight_count;
    result_count.html("(" + (len > 999 ? ">999" : len) + ")");
  }

  // Scroll to first or next highlight
  this.scroll_next = function() {
    var active = sconsole.find(".active-match");
    var next;
    if (active.length && active.nextAll(".match:first").length) {
      next = active.nextAll(".match:first");
    } else {
      next = sconsole.find(".match:first");
    }
    if (next && next.length) {
      active.removeClass("active-match");
      next.addClass("active-match");
      sconsole.scrollTo(next);
    } else {
      sconsole.scrollTo(0);
    }
  }

  // Search/Highlight matches
  this.find_matches = function() {

    // Validate regex
    var val = sinput.val();
    var regex = new RegExp("("+val+")", "g");
    screen.add_highlight(regex);

    // Search for matches
    var html = sconsole.html();
    var matches = html.match(regex);
    if (matches) {
      //TODO: Find a way to do this without DOM traversal
      sconsole.children("p").each(function() {
        searcher.highlight($(this), regex);
      });
    } 
    searcher.update_match_count();
  }

  // Add highlight to markup, increment highlight_count
  this.highlight = function(dom_to_highlight) {
    var regex = screen.highlight;
    var html = dom_to_highlight.html();
    dom_to_highlight.html(html.replace(regex, '<span class="highlight">$1</span>'));
    if (html.length < dom_to_highlight.html().length) {
      screen.highlight_count += 1;
      dom_to_highlight.addClass('match');
      dom_to_highlight.data('orig_text', html);
    }
  }

  // Clear highlights
  this.reset = function() {
    dom.removeClass("bad-regex");
    screen.remove_highlight();
    result_count.html("");
    sconsole.find(".match").each(function() {
      $(this).removeClass('match').removeClass('active-match')
        .html($(this).data('orig_text'));
    });
  }

  // Click on the match count, go to next highligght
  result_count.click(function() {
    searcher.scroll_next();
  });

  return this;
}


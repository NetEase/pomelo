/* Log.io web client renderers
 * Defines render() & destroy() methods for Node, Stream, History
 */

Node.prototype.render = function() {
  var n = this;
  this._dom = $("#node_template").clone()
    .find(".node").html(n.label).end()
    .attr("id", "node_" + n.label)
    .data('label', n.label);

  // Add to control panel in alphabetical order
  if (!$("#controls2 .node").length || n.label > $("#controls2 .group:last").data('label')) {
    $("#controls2").append(n._dom);
  } else if (n.label < $("#controls2 .group:first").data('label')) {
    $("#controls2").prepend(n._dom);
  } else {
    $("#controls2 .group").each(function() {
      if (n.label < $(this).next().data('label') && n.label > $(this).data('label')) {
        $(this).after(n._dom);
        return false;
      }
    });
  }
  
  // Render LogFiles
  _(n.log_files).each(function(log_file, llabel) {
    log_file.render();
  });
}
Node.prototype.destroy = function() {
  this._dom.remove();
};

formatMsg = function(message){
	var msg = '';
	console.log(message);
  for (var key in message){
 		var val = message[key];
 		msg+=key + ':' + JSON.stringify(val) + '<br/>';
	}
	return msg;
};

LogFile.prototype.render = function() {
  var log_file = this;
  var dom = $("#log_file_template").clone()
    .find(".label").html(this.label).end()
    .attr("id", this.node.label + ":" + this.label)
    .data('label', this.label);
  if (this.color) {
    dom.find(".status").addClass("statuscolor" + this.color);
  }

  // Add stream checkboxes
  _(log_file.node.web_client.streams).each(function(stream, sid) {
    var input = $('<input type="radio" name="selectedserver" class="stream" value="' + sid + '"/>');
    if (log_file.streams[sid]) input.attr("checked","checked");
    dom.find(".screens").append(input);
    input.data('stream', stream);
  });
  
  // Bind enable/disable stream events
  dom.find(".screens .stream").click(function() {
    if ($(this).is(":checked")) {
      try {
        log_file.attach_stream($(this).data('stream'));
        var p =  dom.parent().parent().parent().find(".status");
        jQuery.each(p,function(i,elm){$(elm).removeClass('statuscolor1');});;
        dom.parent().parent().find(".status").removeClass('statuscolor1');
        dom.find(".status").addClass("statuscolor1");
        var serverId = $(this).parent().parent().attr('id').split(':')[1];
        log_file.node.web_client.socket.on('getSystem',function(data){$('#stream_template').find('.console').html(formatMsg(data));});
        log_file.node.web_client.socket.on('getApp',function(data){$('#history_template').find('.console').html(formatMsg(data));});
        log_file.node.web_client.socket.emit('message',{method:'getSystem',id:serverId});
        log_file.node.web_client.socket.emit('message',{method:'getApp',id:serverId});
      } catch(err) {
        $(this).attr("checked","");
        alert(err);
      }
    } else {
      var color = log_file.color;
      log_file.detach_stream($(this).data('stream'));
      if (!log_file._enabled) {
        dom.find(".status").removeClass("statuscolor" + color);
      }
    }
  });

  // Add history radio buttons
  _(log_file.node.web_client.histories).each(function(history, hid) {
    //var input = $('<input type="radio" class="history" name="history' + hid + '" value="' + hid + '"/>');
    //if (log_file.histories[hid]) input.attr("checked","checked");
    //dom.find(".screens").append(input);
    //input.data('history', history);  
  });
  
  // Bind view_history events
  dom.find(".screens .history").click(function() {
    var history = $(this).data('history');
    log_file.view_history(history);
    alert($(this).parent().parent().attr('id'));
    //history._dom.find(".screen-label").html(history.get_label());
  });

  if (!this._dom) {
    // Add to log file list in alphabetical order
    var group = this.node._dom.find(".group2");
    if (!group.children(":gt(0)").length || log_file.label > group.children(":last").data('label')) {
      dom.appendTo("#node_" + this.node.label + " .group2");
    } else if (log_file.label < group.children(":eq(1)").data('label')) {
      group.children(":first").after(dom);
    } else {
      group.children(":gt(0)").each(function() {
        if (log_file.label < $(this).next().data('label') && log_file.label > $(this).data('label')) {
          $(this).after(dom);
          return false;
        }
      });
    }
  } else {
    this._dom.replaceWith(dom);
  }
  this._dom = dom;
}
LogFile.prototype.ping = function() {
  var log_file = this;
  var _status = this._dom.find(".status");
  if (!this._enabled) {
    _status.addClass('ping');
    setTimeout(function() { _status.removeClass('ping'); }, 50);
  } else {
    _status.removeClass('statuscolor' + log_file.color);
    setTimeout(function() { _status.addClass('statuscolor' + log_file.color); }, 50);
  }
}


Stream.prototype.log = function(log_file, msg) {
  if (!this._paused) {
    msg = msg.replace(/</ig,"&lt;").replace(/>/ig,"&gt;");
    var html = $('<p><span class="label labelcolor'
    + log_file.color + '">' + log_file.node.label + ':'
    + log_file.label + '</span> ' + msg + '</p>');
    this._dom.find(".console").prepend(html);
  }
  // Apply highlights if enabled
  if (this._searcher && this.highlight) {
    this._searcher.highlight(html);
    this._searcher.update_match_count();
  }
}
Stream.prototype.render = function() {
  var stream = this;
  var scount = $("#screens .stream").length;
  this._dom = $("#stream_template").clone()
    //.find(".screen-label").html(stream.get_label()).end()
    //.attr("id", "stream-" + this._id)
    
    // Bind Stream action events
    .find(".close").click(function() {
      if ($("#screens .screen").length == 1) {
        alert("Sorry, you can't close the only screen.");
      } else {
        $(this).parents(".screen").remove();
        stream.close();
        stream.web_client.resize();

        // Rerender screen labels
        _(stream.web_client.streams).each(function(stream, sid) {
          //stream._dom.find(".screen-label").html(stream.get_label());
        });
      }
    }).end()
    .find(".clear").click(function() {
      $(this).parents(".screen").find(".console").html("");
      $(this).blur();
    }).end()
    .find(".pause").click(function() {
      stream.pause();
      $(this).hide().next().show();
    }).end()
    .find(".start").click(function() {
      stream.start();
      $(this).hide().prev().show();
    }).end()
    .regex_searcher(stream);

  if ($("#screens .stream").length) {
    $("#screens .stream:last").after(this._dom);
  } else {
    $("#screens").prepend(this._dom);
  }
}
Stream.prototype.destroy = function() {
  this._dom.remove();
}

History.prototype.render = function() {
  var history = this;
  var hcount = $("#screens .history").length;
  this._dom = $("#history_template").clone()
    //.find(".screen-label").html(history.get_label()).end()
    
    // Bind History action events
    .find(".close").click(function() {
      if ($("#screens .screen").length == 1) {
        alert("Sorry, you can't close the only screen.");
      } else {
        $(this).parents(".screen").remove();
        history.close();
        history.web_client.resize();

        // Rerender screen labels
        _(history.web_client.histories).each(function(history, hid) {
          //history._dom.find(".screen-label").html(history.get_label());
        });
      }
    }).end()
    .regex_searcher(history)
    .appendTo("#screens");
}

History.prototype.add_lines = function(lines) {
  var html = "";
  for (var i=0; i<lines.length; i++) {
    var line = lines[i].replace(/</ig,"&lt;").replace(/>/ig,"&gt;");
    html += "<p>" + line + "</p>";
  }
  this._dom.find(".console").html(html);
  // Apply highlights if enabled
  if (this._searcher && this.highlight) {
    this._searcher.reset();
    this._searcher.find_matches();
    this._searcher.scroll_next();
  }
}
History.prototype.destroy = function() {
  this._dom.remove();
}

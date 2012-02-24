var $ = require('jquery-browserify');
var dnode = require('dnode');

$(document).ready(function () {
    // Fetch the user's name before the main chat code fires
    $('form#name').submit(function (ev) {
        ev.preventDefault();
        var name = $('input[name="name"]').val();
        $('#messages').show();
        $('#prompt').hide();
        chat(name);
    });
});
    
function chat (name) {
    // Connect to the chat server now that we've got a name
    dnode(function () {
        this.name = name;
        
        this.joined = function (who) {
            addLine($('<div>')
                .addClass('join')
                .text(who + ' has joined')
            );
        };
        
        this.parted = function (who) {
            addLine($('<div>')
                .addClass('part')
                .text(who + ' has left')
            );
        };
        
        this.said = function (who,msg) {
            addLine($('<div>').append(
                $('<span>')
                    .addClass(who == name ? 'me' : 'who')
                    .text('<' + who + '>')
                ,
                $('<span>').addClass('msg').text(msg)
            ));
        };
    }).connect(function (remote) {
        $('form#post').submit(function (ev) {
            ev.preventDefault();
            remote.say(this.elements.msg.value);
            this.elements.msg.value = '';
        });
        
        // fetch a list of all the connected users
        remote.names(function (names) {
            addLine($('<div>')
                .addClass('users')
                .text('Users: ' + (
                    names.map(function (name) {
                        return '[ ' + name
                            .replace(/\\/g,'\\\\')
                            .replace(/\[/g,'\\[')
                            .replace(/\]/g,'\\]')
                        + ' ]'
                    }).join(' ')
                    || '(no users)'
                ))
            );
        });
    });
}

function addLine(elem) {
    var div = $('#messages');
    div.append(elem);
    div.animate({ scrollTop: div.attr('scrollHeight') }, 200);
}

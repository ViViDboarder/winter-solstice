/* Defined in: "Textual.app -> Contents -> Resources -> JavaScript -> API -> core.js" */

/* Room state from Equinox */
var rs                  = { // room state
  nick: {
    count: 1,
    delete: false,
    id: undefined,
    nick: undefined
  }
};

/* Taken from Equinox to determine if a message is visible */
function isMessageInViewport(elem) {
    'use strict';

    if (!elem.getBoundingClientRect) {
        return true;
    }

    // Have to use Math.floor() because sometimes the getBoundingClientRect().bottom is a fraction of a pixel (!!!)
    return (Math.floor(elem.getBoundingClientRect().bottom) <= Math.floor(document.documentElement.clientHeight));
}

Textual.viewBodyDidLoad = function()
{
    Textual.fadeOutLoadingScreen(1.00, 0.95);
}

/* Taken from Equinox to create history div */
Textual.viewInitiated = function () {
    'use strict';

    /* When the view is loaded, create a hidden history div which we display if there is scrollback */
    var body = document.getElementById('body_home'), div = document.createElement('div');
    div.id = 'scrolling_history';
    document.getElementsByTagName('body')[0].appendChild(div);
    rs.history = div;

    /* setup the scrolling event to display the hidden history if the bottom element isn't in the viewport
     also hide the topic bar when scrolling */
    window.onscroll = function () {
        var line, lines;
        var topic = document.getElementById('topic_bar');

        lines = body.getElementsByClassName('line');
        if (lines.length < 2) {
            return;
        }
        line = lines[lines.length - 1];

        if (isMessageInViewport(line) === false) {
            // scrollback
            rs.history.style.display = 'inline';
            if (topic) { topic.style.visibility = 'hidden'; }
        } else {
            // at the bottom
            rs.history.style.display = 'none';
            if (topic) { topic.style.visibility = 'visible'; }
        }
    };
};

Textual.newMessagePostedToView = function(line)
{
    'use strict';
    var message = document.getElementById("line-" + line);

    ConversationTracking.updateNicknameWithNewMessage(message);

    /* Added from Equinox for scroll window */
    var clone;
    // if it's a private message, colorize the nick and then track the state and fade away the nicks if needed
    if (message.getAttribute('ltype') === 'privmsg' || message.getAttribute('ltype') === 'action') {
        // Track the previous message's id
        rs.nick.id = message.getAttribute('id');

        // Copy the message into the hidden history
        clone = message.cloneNode(true);
        clone.removeAttribute('id');
        rs.history.appendChild(clone);

        // Remove old messages, if the history is longer than three messages
        if (rs.history.childElementCount > 2) {
            rs.history.removeChild(rs.history.childNodes[0]);

            // Hide the first nick in the hidden history, if it's the same as the second
            if ((rs.nick.count > 1) && (message.getAttribute('ltype') !== 'action')) {
                rs.history.getElementsByClassName('sender')[0].style.visibility = 'hidden';
            }
        }
    }
}

Textual.nicknameSingleClicked = function(e)
{
    ConversationTracking.nicknameSingleClickEventCallback(e);
}

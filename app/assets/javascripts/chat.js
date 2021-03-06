var chatboxFocus = [];
var chatBoxes = [];
var chatBox;
var width;
var minimizedChatBoxes;

var ready = function () {

    chatBox = {
        chatWith: function (conversation_id) {
            chatBox.createChatBox(conversation_id);
            $("#chatbox_" + conversation_id + " .chatboxtextarea").focus();
        },

        close: function (conversation_id) {
            $('#chatbox_' + conversation_id).css('display', 'none');
            chatBox.restructure();
        },

        notify: function () {
            var audio = $("audio")[1];
            audio.play();
        },

        restructure: function () {
            var align = 0;
            for (var x in chatBoxes) {
                var chatbox_id = chatBoxes[x];
                if ($("#chatbox_" + chatbox_id).css('display') !== 'none') {
                    if (align === 0) {
                        $("#chatbox_" + chatbox_id).css('right', '20px');
                    } else {
                        width = (align) * (280 + 7) + 20;
                        $("#chatbox_" + chatbox_id).css('right', width + 'px');
                    }
                    align++;
                }
            }

        },

        createChatBox: function (conversation_id, minimizeChatBox) {
            if ($("#chatbox_" + conversation_id).length > 0) {
                if ($("#chatbox_" + conversation_id).css('display') === 'none') {
                    $("#chatbox_" + conversation_id).css('display', 'block');
                    chatBox.restructure();
                }
                $("#chatbox_" + conversation_id + " .chatboxtextarea").focus();
                return;
            }

            $("body").append('<div id="chatbox_' + conversation_id + '" class="chatbox"></div>');

            $.get("/conversations/" + conversation_id, function (data) {
                $('#chatbox_' + conversation_id).html(data);
                $("#chatbox_" + conversation_id + " .chatboxcontent").scrollTop($("#chatbox_" + conversation_id + " .chatboxcontent")[0].scrollHeight);
            }, "html");

            $("#chatbox_" + conversation_id).css('bottom', '0px');

            var chatBoxeslength = 0;
            var width;

            for (var x in chatBoxes){
                if ($("#chatbox_" + chatBoxes[x]).css('display') !== 'none') {
                    chatBoxeslength++;
                }
            }
            if (chatBoxeslength === 0) {
                $("#chatbox_" + conversation_id).css('right', '20px');
            } else {
                width = (chatBoxeslength) * (280 + 7) + 20;
                $("#chatbox_" + conversation_id).css('right', width + 'px');
            }

            chatBoxes.push(conversation_id);

            if (minimizeChatBox === 1) {
                minimizedChatBoxes = [];
                }
                if ($.cookie('chatbox_minimized')) {
                    minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
                }
                var minimize = 0;
                for (var j = 0; j < minimizedChatBoxes.length; j++) {
                    if (minimizedChatBoxes[j] === conversation_id) {
                        minimize = 1;
                    }
                }

                if (minimize === 1) {
                    $('#chatbox_' + conversation_id + ' .chatboxcontent').css('display', 'none');
                    $('#chatbox_' + conversation_id + ' .chatboxinput').css('display', 'none');
                }
            }

            chatboxFocus[conversation_id] = false;

            $("#chatbox_" + conversation_id + " .chatboxtextarea").blur(function () {
                chatboxFocus[conversation_id] = false;
                $("#chatbox_" + conversation_id + " .chatboxtextarea").removeClass('chatboxtextareaselected');
            }).focus(function () {
                chatboxFocus[conversation_id] = true;
                $('#chatbox_' + conversation_id + ' .chatboxhead').removeClass('chatboxblink');
                $("#chatbox_" + conversation_id + " .chatboxtextarea").addClass('chatboxtextareaselected');
            });

            $("#chatbox_" + conversation_id).click(function () {
                if ($('#chatbox_' + conversation_id + ' .chatboxcontent').css('display') !== 'none') {
                    $("#chatbox_" + conversation_id + " .chatboxtextarea").focus();
                }
            });

            $("#chatbox_" + conversation_id).show();

        },

        checkInputKey: function (event, chatboxtextarea, conversation_id) {
            if (event.keyCode === 13 && event.shiftKey === 0) {
                event.preventDefault();
                var message = chatboxtextarea.val();
                $.post("/conversations/" + conversation_id + "/messages", { body: message, "conversation_id": conversation_id }, function (data) {
                  console.log(data);
                });

                var audio = $("audio")[0];
                audio.play();


                $(chatboxtextarea).val('');
                $(chatboxtextarea).focus();
                $(chatboxtextarea).css('height', '44px');
            }

            var adjustedHeight = chatboxtextarea.clientHeight;
            var maxHeight = 94;

            if (maxHeight > adjustedHeight) {
                adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
                if (maxHeight) {
                    adjustedHeight = Math.min(maxHeight, adjustedHeight);
                  }
                if (adjustedHeight > chatboxtextarea.clientHeight) {
                    $(chatboxtextarea).css('height', adjustedHeight + 8 + 'px');
                } else {
                $(chatboxtextarea).css('overflow', 'auto');
                }
            },

        sendButtonClick: function(chatboxtextarea, conversation_id) {

          var message = chatboxtextarea.val();

          $.post("/conversations/" + conversation_id + "/messages", { body: message, "conversation_id": conversation_id }, function (data) {
                  console.log(data);
          });
          $(chatboxtextarea).val('');
          $(chatboxtextarea).focus();
          $(chatboxtextarea).css('height','44px');


          var adjustedHeight = chatboxtextarea.clientHeight;
          var maxHeight = 94;

          if (maxHeight > adjustedHeight) {
            adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
            if (maxHeight) {
              adjustedHeight = Math.min(maxHeight, adjustedHeight);
              }
            if (adjustedHeight > chatboxtextarea.clientHeight) {
              $(chatboxtextarea).css('height', adjustedHeight + 8 + 'px');
              }
          else {
                $(chatboxtextarea).css('overflow', 'auto');
          }
        },

        toggleChatBoxGrowth: function (conversation_id) {
            if ($('#chatbox_' + conversation_id + ' .chatboxcontent').css('display') === 'none') {

                var minimizedChatBoxes = [];

                if ($.cookie('chatbox_minimized')) {
                    minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
                }

                var newCookie = '';

                for (var i = 0; i < minimizedChatBoxes.length; i++) {
                    if (minimizedChatBoxes[i] !== conversation_id) {
                        newCookie += conversation_id + '|';
                    }
                }
                newCookie = newCookie.slice(0, -1);

                $.cookie('chatbox_minimized', newCookie);
                $('#chatbox_' + conversation_id + ' .chatboxcontent').css('display', 'block');
                $('#chatbox_' + conversation_id + ' .chatboxinput').css('display', 'block');
                $("#chatbox_" + conversation_id + " .chatboxcontent").scrollTop($("#chatbox_" + conversation_id + " .chatboxcontent")[0].scrollHeight);
            } else {

                newCookie = conversation_id;
                if ($.cookie('chatbox_minimized')) {
                    newCookie += '|' + $.cookie('chatbox_minimized');
                }
                $.cookie('chatbox_minimized', newCookie);
                $('#chatbox_' + conversation_id + ' .chatboxcontent').css('display', 'none');
                $('#chatbox_' + conversation_id + ' .chatboxinput').css('display', 'none');
            }
        }
    };


    jQuery.cookie = function (name, value, options) {
        if (typeof value !== 'undefined') {
            options = options || {};
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires === 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires === 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString(); 
            }
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure' : '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else { 
            var cookieValue = null;
            if (document.cookie && document.cookie !== '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) === (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };


};

$(document).ready(ready);
$(document).on("page:load", ready);

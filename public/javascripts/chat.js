var myNickname = '';
var users = [];
var at = {};

var init = function () {
    $('#mask').addClass('mask');

    reset();

    alertify.prompt("快设置一个逗比的昵称吧!", function (e, str) {
        if (e) {
            myNickname = escape(str.trim());

            if (myNickname.length === 0) {
                alertify.error("昵称不能是空白字符!");
            }
            else {
                $('#mask').removeClass('mask');
                socket.emit('setNickname', {nickname: myNickname});
            }
        } else {
            $('#mask').removeClass('mask');
        }
    }, "");
}

init();

$('#sendBtn').click(function () {
    if (myNickname.length === 0) {
        init();
        return;
    }
    var message = $('#myText').val().trim();
    message = escape(message);
    if (message.length === 0) {
        alertify.error("不说点什么可不行啊...");
    }
    else {
        socket.emit('newMessage', {message: message});
        $('#myText').val('');
    }
});

function reset () {
    $("#toggleCSS").attr("href", "css/alertify.default.css");
    alertify.set({
        labels : {
            ok     : "确定",
            cancel : "取消"
        },
        delay : 5000,
        buttonReverse : false,
        buttonFocus   : "ok"
    });
}

var socket = io('http://192.168.1.211:8081');

socket.on('connected', function (data) {

});

//刷新成员列表
socket.on('refreshUsers', function (data) {
    users = data.users;
    var usersStr = '';
    users.forEach(function(user, index){
        if (user.nickname === myNickname) {
            usersStr = '<div class="membersList-member-me" id="member_' + index + '" onclick=atMember(this)>' + user.nickname + '</div>' + usersStr;
        }
        else {
            usersStr += '<div class="membersList-member-other" id="member_' + index + '" onclick=atMember(this)>' + user.nickname + '</div>';
        }
    });
    showMemberList(usersStr);
});

//新消息
socket.on('newMessage', function (data) {
    var message = data.message;
    var sender = data.sender;
    var isMe = sender === myNickname;
    var type = data.type;
    var panel = $('#panel');
    var oriHTML = panel.html();
    var appendHTML = '';

    if (type === 'message') {
        var senderName = isMe ? '我' : sender;
        if (isMe) {
            appendHTML = '<div class="message-me">'
                +'<div style="max-width:80%;float:right;clear:right;word-break:break-all;max-width:80%;background-color:#89C35C;display:inline-block;border-radius: 8px; padding: 8px;">' + message + '</div>'
                +'</div>'
                +'<div style="clear:right"><br /></div>';
        }
        else {
            appendHTML = '<div class="message-other">'
                +'<div style="float:left;clear:left;width:auto;margin-top:3px;">'+senderName+':&nbsp;&nbsp;'+'</div>'
                +'<div style="max-width:80%;word-break:break-all;display:inline-block;background-color:#79BAEC; border-radius: 8px; padding: 8px;margin-top:-5px;">' + message + '</div>'
                +'</div>'
                +'<div style="clear:left;"><br /></div>';

            showNoticeInTitle();
        }
    }
    else if (type === 'sysInfo') {
        appendHTML = '<div class="message-sys">'
            +'<div style="display:inline-block;word-break:break-all;background-color:#FFA62F; border-radius: 8px; padding: 5px">' + message + '</div>'
            +'</div>'
            +'<div style="clear:left;"><br /></div>';
    }
    else if (type === 'error') {
        alertify.error(data.message);
        init();
    }

    panel.html(oriHTML + appendHTML);
    panel.scrollTop(panel[0].scrollHeight);
});

var showMemberList = function(str) {
    var oriHTML = '<div class="membersList-title">成员</div>';
    var html = '<div class="membersList-title-row">'
        +str
        +'</div>';
    $('#membersList').html(oriHTML + html);
}

var escape = function(str) {
    var res = str.replace(/</g, '&lt;');
    res = res.replace(/>/g, '&gt;');
    res = res.replace(/\s/g, '&nbsp;');
    res = res.replace(/"/g, '\"');
    res = res.replace(/'/g, "\'");

    return res;
}

var atMember = function (element) {
    var index = element.id.split('_')[1];
    var user = users[index];
    if (user.nickname === myNickname) {
        return;
    }
    var atSomeOneText = '@' + users[index].nickname + ' ';
    $('#myText').val(atSomeOneText);
}

//Enter提交
$(document).keypress(function(e){
    if((e.ctrlKey && e.which === 13 || e.which === 10 || e.which === 13)
        &&
        document.activeElement.id === 'myText') {
        $('#sendBtn').click();
        e.preventDefault();
        $('#myText').val('');
    }
});

var defaultTitle = '逗比聊天室';
document.title = defaultTitle;
var titleFlag = true;

var timeIntervalIDForTitle;

var showNoticeInTitle = function () {
    clearInterval(timeIntervalIDForTitle);
    var titleForShow = '【新消息】' + defaultTitle;
    var titleForHide = '【New Message】' + defaultTitle;
    timeIntervalIDForTitle = setInterval(function(){
        document.title = titleFlag? titleForShow : titleForHide;
        titleFlag = !titleFlag;
    }, 500);
}

document.onmousemove = function(){
    clearInterval(timeIntervalIDForTitle);
    document.title = defaultTitle;
}
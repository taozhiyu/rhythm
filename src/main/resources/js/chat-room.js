/*
 * Rhythm - A modern community (forum/BBS/SNS/blog) platform written in Java.
 * Modified version from Symphony, Thanks Symphony :)
 * Copyright (C) 2012-present, b3log.org
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * @fileoverview 聊天室
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 1.3.0.2, Apr 30, 2020
 */

/**
 * @description Add comment function.
 * @static
 */
var el;
var ctx;
var isDrawing = false;
var x = 0;
var y = 0;
var isClick = true;
var ChatRoom = {
    init: function () {
        // 聊天窗口高度设置
        /* if ($.ua.device.type !== 'mobile') {
          $('.list').
            height($('.side').height() -
              $('.chat-room .module:first').outerHeight() - 20)
        } else {
          $('.list').height($(window).height() - 173)
        } */

        // 没有登录就不需要编辑器初始化了
        if ($('#chatContent').length === 0) {
            return false
        }

        ChatRoom.editor = Util.newVditor({
            id: 'chatContent',
            cache: true,
            preview: {
                mode: 'editor',
            },
            resize: {
                enable: true,
                position: 'bottom',
            },
            toolbar: [
                'emoji',
                'headings',
                'bold',
                'italic',
                '|',
                'link',
                'upload',
                '|',
                'undo',
                'redo',
                '|',
                'edit-mode',
                'fullscreen',
                {
                    name: 'more',
                    toolbar: [
                        'table',
                        'list',
                        'ordered-list',
                        'check',
                        'outdent',
                        'indent',
                        'quote',
                        'code',
                        'insert-before',
                        'insert-after',
                        // 'fullscreen',
                        // 'both',
                        // 'preview',
                        // 'outline',
                        // 'content-theme',
                        // 'code-theme',
                        // 'devtools',
                        'info',
                        'help',
                    ],
                }],
            height: 150,
            placeholder: '说点什么吧！',
            ctrlEnter: function () {
                ChatRoom.send()
            },
        })

        // img preview
        // $('.chat-room').on('click', '.vditor-reset img', function () {
        //   if ($(this).hasClass('emoji')) {
        //     return;
        //   }
        //   window.open($(this).attr('src'));
        // });

        // 表情包初始化
        // 加载表情
        ChatRoom.listenUploadEmojis();
        ChatRoom.loadEmojis();
        // 监听按钮

        (()=>{
            let time_out=new Date().getTime(),timeoutId=0
            const closeEmoji=function () {
                if(timeoutId!==0){
                    clearTimeout(timeoutId)
                    timeoutId=0
                }
                time_out=new Date().getTime()
                timeoutId=setTimeout(()=>{
                    new Date().getTime()-time_out<=700&&$("#emojiList").removeClass("showList")
                },navigator.userAgent.match(/(phone|pad|pod|ios|Android|Mobile|BlackBerry|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian)/i)!==null?0:600)
            }
            $("#emojiBtn").hover(function (){
                if(timeoutId!==0){
                    clearTimeout(timeoutId)
                    timeoutId=0
                }
                time_out=new Date().getTime()
                setTimeout(()=>0!==$("#emojiBtn:hover").length&&$("#emojiList").addClass("showList"),300)
            },closeEmoji)
            $("#emojiList").hover(function () {
                if(timeoutId!==0){
                    clearTimeout(timeoutId)
                    timeoutId=0
                }
                time_out=new Date().getTime()
            },closeEmoji)
        })()

        // 红包初始化
        $("#redPacketBtn").on('click', function () {
            Util.alert("" +
                "<div class=\"form fn__flex-column\">\n" +
                "<label>\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">红包类型</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <select id=\"redPacketType\">\n" +
                "  <option value=\"random\" selected>拼手气红包</option>" +
                "  <option value=\"average\">普通红包</option>" +
                "  <option value=\"specify\">专属红包</option>" +
                "  <option value=\"heartbeat\">心跳红包</option>" +
                "  <option value=\"rockPaperScissors\">猜拳红包</option>" +
                "  </select>\n" +
                "</label>\n" +
                "<label id=\"gesture\" style=\"display:none;\">\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">出拳</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <select id=\"gestureType\">\n" +
                "  <option value=\"0\" selected>石头</option>" +
                "  <option value=\"1\">剪刀</option>" +
                "  <option value=\"2\">布</option>" +
                "  </select>\n" +
                "</label>\n" +
                "<label id = \"who\" style=\"display:none;\">\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">发给谁</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <div id=\"recivers\" class=\"chats__users\">\n" +
                "                            </div> \n" +
                "  <select id=\"userOption\" multiple=\"multiple\" style='height: 150px; left: 50px'>\n" +
                "  </select>\n" +
                "  <div id=\"chatUsernameSelectedPanel\" class=\"completed-panel\"\n" +
                "                             style=\"height:170px;display:none;left:auto;top:auto;cursor:pointer;\"></div> \n" +
                "</label>\n" +
                "<label id='redPacketMoneyLabel'>\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">积分</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <input type=\"number\" min=\"32\" max=\"20000\" required=\"\" value=\"32\" id=\"redPacketMoney\" onkeypress=\"return(/[\\d]/.test(String.fromCharCode(event.keyCode)))\">\n" +
                "</label>\n" +
                "<label id='redPacketCountLabel'>\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\" id=\"countx\">个数</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <input type=\"number\" min=\"1\" max=\"1000\" required=\"\" value=\"2\" id=\"redPacketCount\" onkeypress=\"return(/[\\d]/.test(String.fromCharCode(event.keyCode)))\">\n" +
                "</label>\n" +
                "<label>\n" +
                "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">留言</div>\n" +
                "  <div class=\"fn-hr5 fn__5\"></div>\n" +
                "  <input type=\"text\" id=\"redPacketMsg\" placeholder=\"摸鱼者，事竟成！\" maxlength=\"20\">\n" +
                "</label>\n" +
                "<div class=\"fn-hr5\"></div>\n" +
                "<div class=\"fn__flex\" style=\"margin-top: 15px\">\n" +
                "  <div id='totalAmount' class=\"fn__flex-1 fn__flex-center\" style=\"text-align: left;\">总计：<span id=\"redPacketAmount\">32</span> 积分</div>\n" +
                "  <button class=\"btn btn--confirm\" id=\"redPacketConfirm\">发送</button>\n" +
                "</div>\n" +
                "</div>" +
                "", "发红包");

            $("#userOption").on('change', function () {
                var users = $("#userOption").val()
                var userInfos = []
                for (index in users) {
                    userInfos.push(onelineUsers.get(users[index]))
                }
                $("#recivers").html("");
                $("#redPacketCount").val(userInfos.length);
                for (var userInfo in userInfos) {
                    $("#recivers").append("<a target=\"_blank\" data-name=\"" + userInfos[userInfo].userName + "\"\n" +
                        "href=\"" + userInfos[userInfo].homePage + "\">\n" +
                        "<img style='margin-bottom: 10px' class=\"avatar avatar-small\" aria-label=\"" + userInfos[userInfo].userName + "\"\n" +
                        "src=\"" + userInfos[userInfo].userAvatarURL + "\">\n" +
                        "</a>");
                }
            });

            var onelineUsers = new Map();
            $("#redPacketType").on('change',function () {
                let type = $("#redPacketType").val();
                if (type === 'specify') {
                    $('#who').removeAttr("style");
                    $("#redPacketCount").val("1");
                    $('#redPacketCount').attr("readOnly","true");
                    $.ajax({
                        url: Label.servePath + '/chat-room/online-users',
                        type: 'GET',
                        cache: false,
                        success: function (result) {
                            // console.log(result)
                            if (0 == result.code) {
                                $("#userOption").html("");
                                for (var userIndex in result.data.users) {
                                    var user = result.data.users[userIndex]
                                    onelineUsers.set(user.userName,user)
                                    $("#userOption").append("<option value=\""+user.userName+"\">"+user.userName+"</option>\n");
                                }
                            } else {
                                // console.log("获取聊天室在线成员信息失败")
                            }
                        },
                        error: function (result) {
                            // console.log("获取聊天室在线成员信息失败")
                        }
                    })
                } else {
                    $('#who').css('display','none')
                    $('#gesture').css('display','none')
                    $('#redPacketCount').removeAttr("readOnly");
                    $('#redPacketMoneyLabel').removeAttr("style");
                    $('#totalAmount').css('display','inline')
                    $("#countx").text("个数");
                    $("#redPacketCount").val("1");
                }
                if (type === 'heartbeat') {
                    $("#countx").text("个数（最少5个）");
                    $("#redPacketCount").val("5");
                }
                if (type === 'rockPaperScissors') {
                    $('#gesture').removeAttr("style");
                    $("#redPacketCount").val("1");
                    $('#redPacketCount').attr("readOnly","true");
                }
                if (type === 'dice') {
                    $('#redPacketMoneyLabel').css('display','none')
                    $('#totalAmount').css('display','none')
                    $("#countx").text("开盘人数");
                    $("#redPacketCount").val("3");
                }
            });

            $("#redPacketMoney").unbind();
            $("#redPacketCount").unbind();

            $("#redPacketMoney").on('change', function () {
                if ($("#redPacketMoney").val() === "") {
                    $("#redPacketMoney").val("32");
                }
                if ($("#redPacketMoney").val() < 32) {
                    $("#redPacketMoney").val("32");
                }
                $("#redPacketAmount").text($("#redPacketMoney").val());
            });

            $('#redPacketMoney,#redPacketCount').bind('input propertychange', function() {
                let type = $("#redPacketType").val();
                if (type === 'average') {
                    $("#redPacketAmount").text($("#redPacketMoney").val() * $("#redPacketCount").val());
                    $("#redPacketMsg").val("平分红包，人人有份！");
                } else if (type === 'random') {
                    $("#redPacketAmount").text($("#redPacketMoney").val());
                    $("#redPacketMsg").val("摸鱼者，事竟成！");
                } else if (type === 'specify') {
                    $("#redPacketAmount").text($("#redPacketMoney").val() * $("#redPacketCount").val());
                    $("#redPacketMsg").val("试试看，这是给你的红包吗？");
                } else if (type === 'heartbeat') {
                    $("#redPacketAmount").text($("#redPacketMoney").val());
                    $("#redPacketMsg").val("玩的就是心跳！");
                } else if (type === 'rockPaperScissors') {
                    $("#redPacketAmount").text($("#redPacketMoney").val());
                }
            });

            $("#redPacketType").on('change', function () {
                let type = $("#redPacketType").val();
                if (type === 'average') {
                    $("#redPacketAmount").text($("#redPacketMoney").val() * $("#redPacketCount").val());
                    $("#redPacketMsg").val("平分红包，人人有份！");
                } else if (type === 'random') {
                    $("#redPacketAmount").text($("#redPacketMoney").val());
                    $("#redPacketMsg").val("摸鱼者，事竟成！");
                } else if (type === 'specify') {
                    $("#redPacketAmount").text($("#redPacketMoney").val() * $("#redPacketCount").val());
                    $("#redPacketMsg").val("试试看，这是给你的红包吗？");
                } else if (type === 'heartbeat') {
                    $("#redPacketAmount").text($("#redPacketMoney").val());
                    $("#redPacketMsg").val("玩的就是心跳！");
                } else if (type === 'rockPaperScissors') {
                    $("#redPacketMsg").val("石头剪刀布！");
                } else if (type === 'dice') {
                    $("#redPacketMsg").val("买定离手！");
                }
            });

            $("#redPacketCount").on('change', function () {
                let type = $("#redPacketType").val();
                if (type === 'dice') {
                    if ($("#redPacketCount").val() > 15) {
                        $("#redPacketCount").val("15");
                    }
                    if ($("#redPacketCount").val() < 3) {
                        $("#redPacketCount").val("3");
                    }
                }

                if (type === 'heartbeat') {
                    if ($("#redPacketCount").val() < 5) {
                        $("#redPacketCount").val("5");
                    }
                }

                if (Number($("#redPacketCount").val()) > Number($("#redPacketMoney").val())) {
                    $("#redPacketCount").val($("#redPacketMoney").val());
                } else {
                    if ($("#redPacketCount").val() > 100) {
                        $("#redPacketCount").val("100");
                    }
                    if ($("#redPacketCount").val() <= 0) {
                        $("#redPacketCount").val("1");
                    }
                }
            });

            $("#redPacketConfirm").on('click', function () {
                let type = $("#redPacketType").val();
                let money = $("#redPacketMoney").val();
                let count = $("#redPacketCount").val();
                let msg = $("#redPacketMsg").val();
                let recivers = $("#userOption").val();
                let gesture = $("#gestureType").val();
                if (type === '' || type === null || type === undefined) {
                    type = "random";
                }
                if (recivers === undefined) {
                    recivers = []
                }
                if(recivers.length == 0 && type === 'specify') {
                    $('#chatContentTip').
                    addClass('error').
                    html('<ul><li>请选择红包发送对象</li></ul>')
                }
                if (msg === '') {
                    msg = '摸鱼者，事竟成！';
                }
                let content;
                if (type !== "rockPaperScissors") {
                    content = {
                        type:  type,
                        money: money,
                        count: count,
                        msg: msg,
                        recivers: recivers
                    }
                } else {
                    content = {
                        type:  type,
                        money: money,
                        count: count,
                        msg: msg,
                        recivers: recivers,
                        gesture: gesture
                    }
                }
                let requestJSONObject = {
                    content: "[redpacket]" + JSON.stringify(content) + "[/redpacket]",
                }
                $.ajax({
                    url: Label.servePath + '/chat-room/send',
                    type: 'POST',
                    cache: false,
                    data: JSON.stringify(requestJSONObject),
                    success: function (result) {
                        if (0 !== result.code) {
                            $('#chatContentTip').
                            addClass('error').
                            html('<ul><li>' + result.msg + '</li></ul>')
                        }
                    },
                    error: function (result) {
                        $('#chatContentTip').
                        addClass('error').
                        html('<ul><li>' + result.statusText + '</li></ul>')
                    }
                })
                Util.closeAlert();
            })
        });

        // 加载挂件
        ChatRoom.loadAvatarPendant();
        // 加载小冰游戏
        ChatRoom.loadXiaoIceGame();
        // 加载画图
        ChatRoom.charInit('paintCanvas');
        // 监听画图按钮
        $("#paintBtn").on('click', function () {
            if ($("#paintContent").css("display") === 'none') {
                $("#paintContent").slideDown(1000);
            } else {
                $("#paintContent").slideUp(1000);
            }
        });
        // 监听修改颜色
        $('#selectColor').cxColor();
        $("#selectColor").bind("change", function () {
            ChatRoom.changeColor(this.value);
        });
        $("#selectWidth").bind("change", function () {
            let width = $("#selectWidth").val();
            ChatRoom.changeWidth(width);
        });
    },
    /**
     * 提交写好字的图片.
     *
     * @param {string} id canvas id.
     */
    submitCharacter: function (id) {
        if (linesArray.length !== 0) {
            var canvas = document.getElementById(id);
            let dataURL = canvas.toDataURL();
            let blob = dataURLToBlob(dataURL);
            var formData = new FormData();
            formData.append("file[]", blob);
            $.ajax({
                url: Label.servePath + '/upload',
                type: 'POST',
                cache: false,
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    let url = data.data.succMap.blob;
                    ChatRoom.editor.setValue(ChatRoom.editor.getValue() + '![涂鸦](' + url + ')');
                    ChatRoom.editor.focus();
                    ChatRoom.clearCharacter("paintCanvas");
                    $("#paintContent").slideUp(500);
                },
                error: function (err) {
                }
            });

            function dataURLToBlob(dataurl) {
                var arr = dataurl.split(',');
                var mime = arr[0].match(/:(.*?);/)[1];
                var bstr = atob(arr[1]);
                var n = bstr.length;
                var u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], {type: mime});
            }

            linesArray = [];
            $(window).scrollTop(0);
        } else {
            alert("画布为空，无法提交！")
        }
    },
    /**
     * clear canvas
     *
     * @param {string} id canvas id.
     */
    clearCharacter: function (id) {
        var canvas = document.getElementById(id),
            ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        linesArray = [];
    },
    revokeChatacter: function (id) {
        // 存储点集的数组
        if (linesArray.length > 0) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            // 删掉上一次操作
            linesArray.pop();

            // 遍历历史记录重新绘制
            linesArray.forEach(arr=>{
                ChatRoom.changeColor(arr.color);
                ChatRoom.changeWidth(arr.width);
                ctx.beginPath();
                ctx.moveTo(arr.point[0].x,arr.point[0].y);
                for(let i = 1; i < arr.point.length; i++){
                    ctx.lineTo(arr.point[i].x,arr.point[i].y);
                }
                ctx.stroke();
            })
        }
    },
    /**
     * paint brush
     * @param {string} id canvas id.
     * @returns {undefined}
     */
    changeColor: function(color) {
        ctx.fillStyle = ctx.strokeStyle = ctx.shadowColor = color;
    },
    changeWidth: function (width) {
        ctx.lineWidth = width;
    },
    charInit: function (id) {
        el = document.getElementById(id);
        ctx = el.getContext('2d');
        ctx.fillStyle = ctx.strokeStyle = ctx.shadowColor = '#000';
        ctx.lineWidth = 3;
        ctx.lineJoin = 'miter';
        ctx.lineCap = 'round';
        ctx.shadowBlur = 2;

        el.onmousedown = function (e) {
            pointsArray = [];
            isDrawing = true;
            isClick = true;
            ctx.beginPath();
            x = e.clientX - e.target.offsetLeft + $(window).scrollLeft();
            y = e.clientY - e.target.offsetTop + $(window).scrollTop();
            pointsArray.push({x:x,y:y});
            ctx.moveTo(x, y);
        };

        el.onmousemove = function (e) {
            if (!isDrawing) {
                return;
            }
            isClick = false;

            x = e.clientX - e.target.offsetLeft + $(window).scrollLeft();
            y = e.clientY - e.target.offsetTop + $(window).scrollTop();
            pointsArray.push({x:x,y:y});
            ctx.lineTo(x, y);
            ctx.stroke();
        };

        el.onmouseup = function () {
            linesArray.push({
                point: pointsArray,
                color: ctx.fillStyle,
                width: ctx.lineWidth
            });
            if (isClick) {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            isDrawing = false;
        };

        el.addEventListener("touchstart", function (e) {
            isClick = true;
            pointsArray = [];
            ctx.beginPath();
            x = e.changedTouches[0].pageX - e.target.offsetLeft;
            y = e.changedTouches[0].pageY - e.target.offsetTop;
            pointsArray.push({x:x,y:y});
            ctx.moveTo(x, y);

        }, false);

        el.addEventListener("touchmove", function (e) {
            isClick = false;
            e.preventDefault();
            x = e.changedTouches[0].pageX - e.target.offsetLeft;
            y = e.changedTouches[0].pageY - e.target.offsetTop;
            pointsArray.push({x:x,y:y});
            ctx.lineTo(x, y);
            ctx.stroke();
        }, false);

        el.addEventListener("touchend", function (e) {
            if (isClick) {
                ctx.lineTo(x, y);
                ctx.stroke();
            }
            linesArray.push({
                point: pointsArray,
                color: ctx.fillStyle,
                width: ctx.lineWidth
            });
        }, false);
    },
    /**
     * 设置话题
     */
    setDiscuss: function () {
        Util.alert("" +
            "<div class=\"form fn__flex-column\">\n" +
            "<label>\n" +
            "  <div class=\"ft__smaller\" style=\"float: left\">修改话题需要16积分，将自动从账户中扣除；<br>最大长度16字符，不合法字符将被自动过滤。</div>\n" +
            "  <div class=\"fn-hr5 fn__5\"></div>\n" +
            "  <input type=\"text\" id=\"discuss-new-title\">\n" +
            "</label>\n" +
            "<div class=\"fn-hr5\"></div>\n" +
            "<div class=\"fn__flex\" style=\"margin-top: 15px; justify-content: flex-end;\">\n" +
            "  <button class=\"btn btn--confirm\" onclick='ChatRoom.updateDiscussData($(\"#discuss-new-title\").val());Util.closeAlert();'>设置 <span class='count'><svg style='vertical-align: -2px;'><use xlink:href=\"#iconPoints\"></use></svg> 16</span></button>\n" +
            "</div>\n" +
            "</div>" +
            "", "设置话题");
    },
    /**
     * 设置话题
     */
    updateDiscussData: function (discuss) {
        let requestJSONObject = {
            content: "[setdiscuss]" + discuss + "[/setdiscuss]",
        }
        $.ajax({
            url: Label.servePath + '/chat-room/send',
            type: 'POST',
            cache: false,
            data: JSON.stringify(requestJSONObject),
            success: function (result) {
                if (0 !== result.code) {
                    Util.notice("danger", 3000, result.msg);
                } else {
                    Util.notice("success", 3000, "话题修改成功，所有人可见。<br>16积分已扣除。");
                }
            },
            error: function (result) {
                Util.notice("danger", 3000, result.statusText);
            }
        })
    },
    /**
     * 引用话题
     */
    useDiscuss: function () {
        let history = ChatRoom.editor.getValue();
        ChatRoom.editor.setValue("*`# " + $("#discuss-title").html() + " #`*  ");
        ChatRoom.editor.insertValue( history, 0);
        ChatRoom.editor.focus();
    },
    /**
     * 切换显示/隐藏在线人数头像
     */
    toggleOnlineAvatar: function () {
        if ($("#chatRoomOnlineCnt").css("display") === 'none') {
            $("#chatRoomOnlineCnt").html(Label.onlineAvatarData);
            setTimeout(function () {
                $("#toggleAvatarBtn").html('<use xlink:href="#showLess"></use>');
                $("#chatRoomOnlineCnt").slideDown(200);
                setTimeout(function () {
                    Util.listenUserCard();
                }, 200);
            }, 100);
        } else {
            $("#toggleAvatarBtn").html('<use xlink:href="#showMore"></use>');
            $("#chatRoomOnlineCnt").slideUp(200);
        }
    },
    /**
     * 删除表情包
     * @param url
     */
    confirmed: false,
    delEmoji: function (url) {
        if (ChatRoom.confirmed === true || confirm("确定要删除该表情包吗？")) {
            ChatRoom.confirmed = true;
            let emojis = ChatRoom.getEmojis();
            for (let i = 0; i < emojis.length; i++) {
                if (emojis[i] === url) {
                    emojis.splice(i, 1);
                }
            }
            emojis.reverse();
            $.ajax({
                url: Label.servePath + "/api/cloud/sync",
                method: "POST",
                data: JSON.stringify({
                    gameId: "emojis",
                    data: emojis
                }),
                headers: {'csrfToken': Label.csrfToken},
                async: false,
                success: function (result) {
                    if (result.code === 0) {
                        Util.notice("success", 1500, "表情包删除成功。");
                        ChatRoom.loadEmojis();
                        setTimeout(function () {
                            $("#emojiBtn").click();
                        }, 50)
                    } else {
                        Util.notice("warning", 1500, "表情包删除失败：" + result.msg);
                    }
                }
            });
        }
    },
    /**
     * 加载表情
     */
    loadEmojis: function () {
        let emojis = ChatRoom.getEmojis(),html="";
        for (let i = 0; i < emojis.length; i++) {
            html+=`<button onclick="ChatRoom.editor.setValue(ChatRoom.editor.getValue() + '![图片表情](${emojis[i]})')">
    <div class="divX"><svg onclick='ChatRoom.delEmoji("${emojis[i]}");event.cancelBubble =true;' style="width: 15px; height: 15px;"><use xlink:href="#delIcon"></use></svg></div>
    <img style='max-height: 50px' class="vditor-emojis__icon" src="${emojis[i]}">
</button>`;
        }
        $("#emojis").html(html);
    },
    /**
     * 上传表情
     */
    listenUploadEmojis: function () {
        $('#uploadEmoji').fileupload({
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            maxFileSize: 5242880,
            multipart: true,
            pasteZone: null,
            dropZone: null,
            url: Label.servePath + '/upload',
            paramName: 'file[]',
            add: function (e, data) {
                ext = data.files[0].type.split('/')[1]

                if (window.File && window.FileReader && window.FileList &&
                    window.Blob) {
                    var reader = new FileReader()
                    reader.readAsArrayBuffer(data.files[0])
                    reader.onload = function (evt) {
                        var fileBuf = new Uint8Array(evt.target.result.slice(0, 11))
                        var isImg = isImage(fileBuf)

                        if (!isImg) {
                            Util.alert('只允许上传图片!')

                            return
                        }

                        if (evt.target.result.byteLength > 1024 * 1024 * 5) {
                            Util.alert('图片过大 (最大限制 5M)')

                            return
                        }

                        data.submit()
                    }
                } else {
                    data.submit()
                }
            },
            formData: function (form) {
                var data = form.serializeArray()
                return data
            },
            submit: function (e, data) {
            },
            done: function (e, data) {
                var result = {
                    result: {
                        key: data.result.data.succMap[Object.keys(data.result.data.succMap)[0]]
                    }
                }
                ChatRoom.addEmoji(result.result.key);
            },
            fail: function (e, data) {
                Util.alert('Upload error: ' + data.errorThrown)
            },
        })
    },
    // 从URL导入表情包
    fromURL: function () {
        Util.alert("" +
            "<div class=\"form fn__flex-column\">\n" +
            "<label>\n" +
            "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">请输入图片的URL</div>\n" +
            "  <div class=\"fn-hr5 fn__5\"></div>\n" +
            "  <input type=\"text\" id=\"fromURL\">\n" +
            "</label>\n" +
            "<div class=\"fn-hr5\"></div>\n" +
            "<div class=\"fn__flex\" style=\"margin-top: 15px; justify-content: flex-end;\">\n" +
            "  <button class=\"btn btn--confirm\" onclick='ChatRoom.addEmoji($(\"#fromURL\").val());Util.closeAlert();'>导入</button>\n" +
            "</div>\n" +
            "</div>" +
            "", "从URL导入表情包");
        $("#fromURL").focus();
        $("#fromURL").unbind();
        $("#fromURL").bind('keypress',function(event){
            if (event.keyCode == "13") {
                ChatRoom.addEmoji($("#fromURL").val());
                Util.closeAlert();
            }
        });
    },
    addEmoji: function () {
        for (let i = 0; i < arguments.length; i++) {
            let url = arguments[i];
            let emojis = ChatRoom.getEmojis();
            emojis.reverse();
            for (let i = 0; i < emojis.length; i++) {
                if (emojis[i] === url) {
                    emojis.splice(i, 1);
                }
            }
            emojis.push(url);
            $.ajax({
                url: Label.servePath + "/api/cloud/sync",
                method: "POST",
                data: JSON.stringify({
                    gameId: "emojis",
                    data: emojis
                }),
                headers: {'csrfToken': Label.csrfToken},
                async: false,
                success: function (result) {
                    if (result.code !== 0) {
                        Util.notice("warning", 1500, "表情包上传失败：" + result.msg);
                    }
                }
            });
        }
        Util.notice("success", 1500, "表情包上传成功。");
        $("details[open]").removeAttr("open");
        ChatRoom.loadEmojis();
    },
    /**
     * 获取表情包
     */
    getEmojis: function () {
        let ret;
        $.ajax({
            url: Label.servePath + "/api/cloud/get",
            method: "POST",
            data: JSON.stringify({
                gameId: "emojis",
            }),
            headers: {'csrfToken': Label.csrfToken},
            async: false,
            success: function (result) {
                if (result.code === 0 && result.data !== "") {
                    ret = Util.parseArray(result.data);
                } else {
                    ret = [];
                }
            },
        });
        ret.reverse();
        return ret;
    },
    /**
     * 发送聊天内容
     * @returns {undefined}
     */
    isSend:false,
    send: function () {
        if (ChatRoom.isSend) {
            return;
        }
        ChatRoom.isSend = true;
        var content = ChatRoom.editor.getValue()
        var requestJSONObject = {
            content: content,
        }
        ChatRoom.editor.setValue('')
        $.ajax({
            url: Label.servePath + '/chat-room/send',
            type: 'POST',
            cache: false,
            data: JSON.stringify(requestJSONObject),
            beforeSend: function () {
                $('.form button.red').attr('disabled', 'disabled').css('opacity', '0.3')
            },
            success: function (result) {
                if (0 === result.code) {
                    $('#chatContentTip').removeClass('error succ').html('')
                } else {
                    $('#chatContentTip').addClass('error').html('<ul><li>' + result.msg + '</li></ul>')
                    ChatRoom.editor.setValue(content)
                }
            },
            error: function (result) {
                $('#chatContentTip').addClass('error').html('<ul><li>' + result.statusText + '</li></ul>')
                ChatRoom.editor.setValue(content)
            },
            complete: function (jqXHR, textStatus) {
                ChatRoom.isSend = false;
                $('.form button.red').removeAttr('disabled').css('opacity', '1')
            },
        })
    },
    /**
     * 获取更多内容
     * @returns {undefined}
     */
    more: function () {
        NProgress.start();
        setTimeout(function () {
            page++;
            let chatMessageLatestOId;
            if (page !== 1) {
                let chatMessages = $(".chats__item");
                let chatMessageLatest = chatMessages[chatMessages.length - 1];
                chatMessageLatestOId = $(chatMessageLatest).attr('id').replace('chatroom', '');
            }
            if (Label.hasMore) {
                if (page === 1) {
                    $.ajax({
                        url: Label.servePath + '/chat-room/more?page=' + page,
                        type: 'GET',
                        cache: false,
                        async: false,
                        success: function (result) {
                            if (result.data.length !== 0) {
                                for (let i in result.data) {
                                    let data = result.data[i];
                                    if ($("#chatroom" + data.oId).length === 0) {
                                        ChatRoom.renderMsg(data, 'more');
                                    }
                                    ChatRoom.resetMoreBtnListen();
                                }
                                Util.listenUserCard();
                                ChatRoom.imageViewer()
                            } else {
                                alert("没有更多聊天消息了！");
                                Label.hasMore = false;
                            }
                        }
                    });
                } else {
                    $.ajax({
                        url: Label.servePath + '/chat-room/getMessage?size=25&mode=1&oId=' + chatMessageLatestOId,
                        type: 'GET',
                        cache: false,
                        async: false,
                        success: function (result) {
                            if (result.data.length !== 0) {
                                for (let i in result.data) {
                                    let data = result.data[i];
                                    if ($("#chatroom" + data.oId).length === 0) {
                                        ChatRoom.renderMsg(data, 'more');
                                    }
                                    ChatRoom.resetMoreBtnListen();
                                }
                                Util.listenUserCard();
                                ChatRoom.imageViewer()
                            } else {
                                alert("没有更多聊天消息了！");
                                Label.hasMore = false;
                            }
                        }
                    });
                }
            }
            NProgress.done();
        }, 0);
    },
    /**
     * 监听点击更多按钮关闭事件
     */
    resetMoreBtnListen: function () {
        $("body").unbind();
        $('body').click(function (event) {
            if ($(event.target).closest('a').attr('id') !== 'aPersonListPanel' &&
                $(event.target).closest('.module').attr('id') !== 'personListPanel') {
                $('#personListPanel').hide()
            }
        })
        $("body").click(function() {
            $("details[open]").removeAttr("open");
        });
    },
    /**
     * 开始批量撤回聊天室消息
     */
    groupRevokeProcess: false,
    startGroupRevoke: function () {
        $("#groupRevoke").attr("onclick", "ChatRoom.stopGroupRevoke()");
        $("#groupRevoke").html("<svg style=\"vertical-align: -2px;\"><use xlink:href=\"#administration\"></use></svg>\n" +
            "关闭批量撤回");
        Util.notice("warning", 6000, "批量撤回已启动，已在消息中添加便捷撤回按钮。<br>使用完成后请记得关闭此功能。");
        ChatRoom.groupRevokeProcess = true;
        let groupRevokeInterval = setInterval(function () {
            if (!ChatRoom.groupRevokeProcess) {
                $('#chats').empty();
                page = 0;
                ChatRoom.more();
                clearInterval(groupRevokeInterval);
            }
            $(".chats__item").each(function () {
                if ($(this).find(".button").length === 0) {
                    $(this).find(".date-bar").css("float", "left");
                    $(this).find(".date-bar").html("<button class='button' onclick='ChatRoom.adminRevoke(\"" + $(this).attr("id").replace("chatroom", "") + "\")'>撤回</button>");
                }
            });
        }, 500);
    },
    /**
     * 停止批量撤回聊天室消息
     */
    stopGroupRevoke: function () {
        $("#groupRevoke").attr("onclick", "ChatRoom.startGroupRevoke()");
        $("#groupRevoke").html("<svg style=\"vertical-align: -2px;\"><use xlink:href=\"#administration\"></use></svg>\n" +
            "批量撤回");
        Util.notice("success", 1500, "批量撤回已关闭。");
        ChatRoom.groupRevokeProcess = false;
    },
    /**
     * 管理员撤回聊天室消息，无提示
     * @param oId
     */
    adminRevoke: function (oId) {
        $.ajax({
            url: Label.servePath + '/chat-room/revoke/' + oId,
            type: 'DELETE',
            cache: false,
            success: function(result) {
                if (0 === result.code) {
                } else {
                    Util.notice("danger", 1500, result.msg);
                }
            }
        });
    },
    /**
     * 撤回聊天室消息
     * @param oId
     */
    revoke: function (oId) {
        if (confirm("确定要撤回吗？")) {
            $.ajax({
                url: Label.servePath + '/chat-room/revoke/' + oId,
                type: 'DELETE',
                cache: false,
                success: function(result) {
                    if (0 === result.code) {
                        Util.notice("success", 1500, result.msg);
                    } else {
                        Util.notice("danger", 1500, result.msg);
                    }
                }
            });
        }
    },
    /**
     * 复读机
     */
    repeat: function (id) {
        let md = '';
        $.ajax({
            url: Label.servePath + '/cr/raw/' + id,
            method: 'get',
            async: false,
            success: function (result) {
                md = result.replace(/(<!--).*/g, "");
            }
        });
        ChatRoom.editor.setValue(md);
        ChatRoom.send();
        $(window).scrollTop(0);
    },
    /**
     * 一键举报
     * @param id
     */
    report: function (id) {
      var res = confirm("确定举报吗？");
      if(res){
        $.ajax({
          url: Label.servePath + '/report',
          type: 'POST',
          cache: false,
          data: JSON.stringify({
              reportDataId: id,
              reportDataType: 3,
              reportType: 49,
              reportMemo: '',
          }),
          complete: function (result) {
              if (result.responseJSON.code === 0) {
                  Util.alert('一键举报成功，感谢你的帮助！<br>管理员将进行审核，如情况属实系统会为举报人发放积分奖励，并对违规者进行相应处罚。');
              } else {
                  Util.alert(result.responseJSON.msg);
              }
          },
      })
      }
    },
    /**
     * 艾特某个人
     */
    at: function (userName, id, justAt) {
        ChatRoom.editor.focus();
        if (justAt === true) {
            ChatRoom.editor.insertValue("@" + userName + "  \n", !1);
        } else {
            let md = '';
            $.ajax({
                url: Label.servePath + '/cr/raw/' + id,
                method: 'get',
                async: false,
                success: function (result) {
                    md = result.replace(/(<!--).*/g, "");
                    md = md.replace(/\n/g, "\n> ");
                }
            });
            ChatRoom.editor.insertValue("\n##### 引用 @" + userName + "  \n> " + md + "\n", !1);
        }
        $(window).scrollTop(0);
    },
    /**
     * 渲染抢到红包的人的列表
     *
     * @param who
     */
    renderRedPacket: function (usersJSON, count, got, recivers, diceRet, packMaster) {
        let hasGot = false;
        let highest = -1;
        let winner
        let diceParticles
        if (diceRet !== undefined) {
            winner = diceRet.winnerResult;
            diceParticles = diceRet.diceParticles
        }
        if (count === got) {
            for (let i = 0; i < usersJSON.length; i++) {
                let current = usersJSON[i];
                if (current.userMoney > highest) {
                    highest = current.userMoney;
                }
            }
        }
        for (let i = 0; i < usersJSON.length; i++) {
            let current = usersJSON[i];
            let currentUserMoney = current.userMoney;
            let dice = current.dice
            let currentUserName = current.userName;
            if (currentUserName === Label.currentUser) {
                if (currentUserMoney !== undefined) {
                    if (currentUserMoney > 0) {
                        $("#redPacketIGot").text("抢到了 " + currentUserMoney + " 积分");
                    } else if (currentUserMoney == 0) {
                        $("#redPacketIGot").text("恭喜你，抢了个寂寞");
                    } else {
                        $("#redPacketIGot").text("什么运气，你竟然被反向抢红包了");
                    }
                } else {
                    if (dice !== undefined) {
                        $("#redPacketIGot").text("押注 " + dice.chips + " 积分");
                    }
                }
                hasGot = true;
            }
            let bet = '';
            if (dice !== undefined) {
                bet = dice.bet;
            }
            let userNameInfo = currentUserName
            switch (bet) {
                case 'big':
                    userNameInfo = currentUserName + " (" + "押大" +")";
                    break
                case 'small':
                    userNameInfo = currentUserName + " (" + "押小" +")";
                    break
                case 'leopard':
                    userNameInfo = currentUserName + " (" + "豹子" +")";
                    break
            }
            let currentUserTime = current.time;
            let currentUserAvatar = "";
            if (current.avatar !== undefined) currentUserAvatar = `<img class="avatar avatar--mid" style="margin-right: 10px; background-image: none; background-color: transparent;" src="${current.avatar}">`;
            let html = `<li class="fn__flex menu__item">${currentUserAvatar}
<div class="fn__flex-1" style="text-align: left !important;">
<h2 class="list__user"><a href="${Label.servePath}/member/${currentUserName}">${userNameInfo}</a>
</h2>`;
            if (currentUserMoney > 0 && currentUserMoney === highest) {
                highest = -1;
                html += "<span class='green small btn'>来自老王的认可</span><br>\n";
            } else if (currentUserMoney === 0) {
                html += "<span class='red small btn'>0溢事件</span><br>\n";
            } else if (currentUserMoney < 0) {
                html += "<span class='yellow small btn'>抢红包有风险</span><br>\n";
            }
            if (winner !== undefined) {
                if (winner === dice.bet) {
                    html += "<span class='green small btn'>运气好而已</span><br>\n";
                } else {
                    html += "<span class='red small btn'>别玩了</span><br>\n";
                }
            }

            let money;
            if (currentUserMoney === undefined && dice !== undefined) {
                money = dice.chips
            } else {
                money = currentUserMoney
            }
            html += `<span class="ft__fade ft__smaller">${currentUserTime}</span>
    </div>
    <div class="fn__flex-center">${money} 积分</div>
</li>
`;
            $("#redPacketList").append(html);
        }
        if (!hasGot) {
            $("#redPacketIGot").text(Label.currentUser===packMaster?"金主来了":"你错过了这个红包");
        }

        if (undefined !== recivers) {
            // console.log(recivers)
            if (recivers.length > 0) {
                index = recivers.indexOf(Label.currentUser);
                // console.log(index)
                if (index === -1) {
                    $("#msg").text("这个红包属于 " + recivers)
                    $("#redPacketIGot").text(Label.currentUser===packMaster?"金主来了":"这个红包不属于你");
                }
            }
        }

        if (undefined !== winner) {
            let content = " "
            let sum = 0
            for (key in diceParticles) {
                sum += diceParticles[key]
            }
            switch (winner) {
                case "big":
                    content += sum +"点大"
                    break
                case "small":
                    content += sum +"点小"
                    break
                case "leopard":
                    content += "豹子通杀"
                    break
            }
            $("#redPacketIGot").text(diceParticles + content);
        }
    },

    bet: function (oId) {
        Util.alert("<div class=\"form fn__flex-column\">\n" +
            "<label id=\"betRadio\">\n" +
            "  <input type=\"radio\" name=\"bet\" value=\"big\" checked>大\n" +
            "  <input type=\"radio\" name=\"bet\" value=\"small\">小\n" +
            "  <input type=\"radio\" name=\"bet\" value=\"leopard\">豹子\n" +
            "  <div class=\"ft__smaller ft__fade\" style=\"float: left\">筹码</div>\n" +
            "  <div class=\"fn-hr5 fn__5\"></div>\n" +
            "  <input type=\"number\" min=\"32\" max=\"100\" required=\"\" value=\"32\" id=\"chipsLabel\" name='chips' onkeypress=\"return(/[\\d]/.test(String.fromCharCode(event.keyCode)))\">\n" +
            "</label>\n" +
            "<div class=\"fn__flex\" style=\"margin-top: 15px\">\n" +
            "  <button class=\"btn btn--confirm\" onclick=\"ChatRoom.unpackRedPacket(" + oId + ")\;Util.clearAlert()\">押注</button>\n" +
            "</div>\n" +
            "</div>", '买定离手');

        $("#chipsLabel").on('change', function () {
            if ($("#chipsLabel").val() > 100) {
                $("#chipsLabel").val("100");
            }
            if ($("#chipsLabel").val() <= 32) {
                $("#chipsLabel").val("32");
            }
        });
    },


    selectGesture: function (oId) {
        Util.alert(`<div class="form fn__flex-column select-center">
<div>
<label class="gestureRadio">
  <input type="radio" name="gesture" value="0" checked>石头
</label>
<label class="gestureRadio">
  <input type="radio" name="gesture" value="1">剪刀
</label>
<label class="gestureRadio">
  <input type="radio" name="gesture" value="2">布
</label>
</div>
<div class="fn__flex" style="margin-top: 15px">
  <button class="btn btn--confirm" onclick="ChatRoom.unpackRedPacket(${oId});Util.clearAlert()">出拳</button>
</div>
</div>`, '出拳');
    },
    /**
     * 拆开红包
     */
    unpackRedPacket: function (oId) {
        $.ajax({
            url: Label.servePath + "/chat-room/red-packet/open",
            method: "POST",
            data: JSON.stringify({
                oId: oId,
                gesture: $(".gestureRadio>input[name=gesture]:checked").val(),
                dice: {
                    bet: $("#betRadio>input[name=bet]:checked").val(),
                    chips: $("#betRadio>input[name=chips]").val()
                }
            }),
            success: function (result) {
                if (result.code !== -1) {
                    let iGot = "抢红包人数较多，加载中...";
                    let gesture = "";
                    if (result.info.gesture !== undefined) {
                        gesture = (Label.currentUser===result.info.userName?"你":result.info.userName) + "出拳:  "+["石头","剪刀","布"][result.info.gesture]
                    }
                    Util.alert(`<style>.dialog-header-bg {border-radius: 4px 4px 0 0; background-color: rgb(210, 63, 49); color: rgb(255, 255, 255);}.dialog-main {height: 456px;overflow: auto;}</style><div class="fn-hr5"></div>
<div class="ft__center">
    <div class="fn__flex-inline">
        <img class="avatar avatar--small" src="${result.info.userAvatarURL48}" style="background-image: none; background-color: transparent; width: 20px; height: 20px; margin-right: 0;">
        <div class="fn__space5"></div>
        <a href="${Label.servePath}/member/${result.info.userName}">${result.info.userName}</a>'s 红包
    </div>
    <div class="fn-hr5"></div>
${gesture ? `<div class="ft__smaller ft__fade">${gesture}</div>` : ""}    <div id = "msg" class="ft__smaller ft__fade">
${result.info.msg}
    </div>
    <div class="hongbao__count" id='redPacketIGot'>${iGot}</div>
    <div class="ft__smaller ft__fade">总计 ${result.info.got}/${result.info.count}</div>
</div>
<div class="list"><ul id="redPacketList">
</ul></div>`, "红包");
                    ChatRoom.renderRedPacket(result.who, result.info.count, result.info.got, result.recivers, result.diceRet, result.info.userName)
                    if (result.info.count === result.info.got) {
                        $("#chatroom" + oId).find(".hongbao__item").css("opacity", ".36").attr('onclick', "ChatRoom.unpackRedPacket(" + oId + ")");
                        if (result.dice === true) {
                            $("#chatroom" + oId).find(".redPacketDesc").html("已开盘");
                        } else {
                            $("#chatroom" + oId).find(".redPacketDesc").html("已经被抢光啦");
                        }
                    }
                } else {
                    Util.alert(result.msg);
                }
            },
            error: function (result) {
                Util.alert(result.msg);
            }
        });
    },
    /**
     * 消息+1
     */
    plusOne: function () {
        ChatRoom.editor.setValue(Label.latestMessage);
        ChatRoom.send();
    },
    /**
     * 渲染聊天室消息
     */
    renderMsg: function (data, more) {
        let isRedPacket = false;
        let isPlusOne = Label.latestMessage === data.md;
        try {
            let msgJSON = $.parseJSON(data.content.replace("<p>", "").replace("</p>", ""));
            if (msgJSON.msgType === "redPacket") {
                isRedPacket = true;
                let type = "未知类型红包";
                let onclick = 'ChatRoom.unpackRedPacket(\'' + data.oId + '\')';
                switch (msgJSON.type) {
                    case "random":
                        type = "拼手气红包";
                        break;
                    case "average":
                        type = "普通红包";
                        break;
                    case "specify":
                        type = "专属红包";
                        break;
                    case "heartbeat":
                        type = "心跳红包 (慎抢)";
                        break;
                    case "rockPaperScissors":
                        type = "石头剪刀布红包";
                        if (msgJSON.senderId != Label.currentUserId) {
                            onclick = 'ChatRoom.selectGesture(\'' + data.oId + '\')';
                        }
                        break;
                    case "dice":
                        type = "摇骰子";
                        if (msgJSON.senderId !== Label.currentUserId) {
                            let dup = false
                            for (idx in msgJSON.who){
                                if (msgJSON.who[idx].userId === Label.currentUserId) {
                                    dup = true
                                    break
                                }
                            }
                            if (!dup) {
                                onclick = 'ChatRoom.bet(\'' + data.oId + '\')';
                            }
                        }
                        break
                }
                if (Number(msgJSON.count) === Number(msgJSON.got)) {
                    let content = "已经被抢光啦"
                    if (msgJSON.type === 'dice') {
                        content = "已开盘"
                    }
                    data.content = '' +
                        '<div style="opacity: .36;" class="hongbao__item fn__flex-inline" onclick="ChatRoom.unpackRedPacket(\'' + data.oId + '\')">\n' +
                        '    <svg class="ft__red hongbao__icon">\n' +
                        '        <use xlink:href="#redPacketIcon"></use>\n' +
                        '    </svg>\n' +
                        '    <div>\n' +
                        '        <div>' + msgJSON.msg + '<br><b>' + type + '</b></div>\n' +
                        '        <div class="ft__smaller ft__fade redPacketDesc">\n' +
                        content + '\n' +
                        '        </div>\n' +
                        '    </div>\n' +
                        '</div>';
                } else {
                    data.content = '' +
                        '<div class="hongbao__item fn__flex-inline" onclick="' + onclick + '">\n' +
                        '    <svg class="ft__red hongbao__icon">\n' +
                        '        <use xlink:href="#redPacketIcon"></use>\n' +
                        '    </svg>\n' +
                        '    <div>\n' +
                        '        <div>' + msgJSON.msg + '<br><b>' + type + '</b></div>\n' +
                        '        <div class="ft__smaller ft__fade redPacketDesc">\n' +
                        '        </div>\n' +
                        '    </div>\n' +
                        '</div>';
                }
            }
        } catch (err) {}
        let meTag1 = "";
        let meTag2 = "";
        if (data.userNickname !== undefined && data.userNickname !== "") {
            data.userNickname = data.userNickname + " (" + data.userName + ")"
        } else {
            data.userNickname = data.userName;
        }
        if (Label.currentUser === data.userName) {
            meTag1 = " chats__item--me";
            meTag2 = "<a onclick=\"ChatRoom.revoke(" + data.oId + ")\" class=\"item\">撤回</a>\n";
        }
        // isAdmin
        if (Label.level3Permitted) {
            meTag2 = "<a onclick=\"ChatRoom.revoke(" + data.oId + ")\" class=\"item\"><svg><use xlink:href=\"#administration\"></use></svg> 撤回</a>\n";
        }
        try {
            // 判断是否可以收藏为表情包
            let emojiContent = data.content.replace("<p>", "").replace("</p>", "");
            let emojiDom = Util.parseDom(emojiContent);
            let canCollect = false;
            let srcs = "";
            let count = 0;
            for (let i = 0; i < emojiDom.length; i++) {
                let cur = emojiDom.item(i);
                if (cur.src !== undefined) {
                    canCollect = true;
                    if (count !== 0) {
                        srcs += ",";
                    }
                    srcs += "\'" + cur.src + "\'";
                    count++;
                }
            }
            if (canCollect) {
                meTag2 += "<a onclick=\"ChatRoom.addEmoji(" + srcs + ")\" class=\"item\">一键收藏表情</a>";
            }
        } catch (err) {}
        let newHTML = '<div class="fn-none">';
        newHTML += '<div id="chatroom' + data.oId + '" class="fn__flex chats__item' + meTag1 + '">\n' +
            '    <a href="/member/' + data.userName + '" style="height: 38px">\n' +
            '        <div class="avatar tooltipped__user" aria-label="' + data.userName + '" style="background-image: url(\'' + data.userAvatarURL + '\');"></div>\n' +
            '    </a>\n' +
            '    <div class="chats__content">\n' +
            '        <div class="chats__arrow"></div>\n';

        let display = Label.currentUser === data.userName && !isPlusOne ? 'display: none;' : ''
        newHTML += '<div id="userName" class="ft__fade ft__smaller" style="' + display + 'padding-bottom: 3px;border-bottom: 1px solid #eee">\n' +
            '    <span class="ft-gray">' + data.userNickname + '</span>&nbsp;\n';
        if (data.sysMetal !== undefined && data.sysMetal !== "") {
            let list = JSON.parse(data.sysMetal).list;
            if (list !== undefined) {
                for (let i = 0; i < list.length; i++) {
                    let m = list[i];
                    newHTML += "<img title='" + m.name + " - " + m.description + "' src='" + Util.genMiniMetal(m.attr) + "'/>";
                }
            }
        }
        newHTML += '</div>';

        newHTML += '        <div class="vditor-reset ft__smaller ' + Label.chatRoomPictureStatus + '">\n' +
            '            ' + data.content + '\n' +
            '        </div>\n' +
            '        <div class="ft__smaller ft__fade fn__right date-bar">\n' +
            '            ' + data.time + '\n' +
            '                <span class="fn__space5"></span>\n';
        if (!isRedPacket) {
            newHTML += '                <details class="details action__item fn__flex-center">\n' +
                '                    <summary>\n' +
                '                        ···\n' +
                '                    </summary>\n' +
                '                    <details-menu class="fn__layer">\n' +
                '                        <a onclick=\"ChatRoom.at(\'' + data.userName + '\', \'' + data.oId + '\', true)\" class="item">@' + data.userName + '</a>\n' +
                '                        <a onclick=\"ChatRoom.at(\'' + data.userName + '\', \'' + data.oId + '\', false)\" class="item">引用</a>\n' +
                '                        <a onclick=\"ChatRoom.repeat(\'' + data.oId + '\')\" class="item">复读机</a>\n' +
                '                        <a onclick=\"ChatRoom.report(\'' + data.oId + '\')\" class="item"><svg><use xlink:href="#icon-report"></use></svg> 一键举报</a>\n' +
                meTag2 +
                '                    </details-menu>\n' +
                '                </details>\n';
        } else {
            newHTML += '                <details class="details action__item fn__flex-center">\n' +
                '                    <summary>\n' +
                '                        ···\n' +
                '                    </summary>\n' +
                '                    <details-menu class="fn__layer">\n' +
                '                        <a onclick=\"ChatRoom.at(\'' + data.userName + '\', \'' + data.oId + '\', true)\" class="item">@' + data.userName + '</a>\n' +
                '                        <a onclick=\"ChatRoom.report(\'' + data.oId + '\')\" class="item"><svg><use xlink:href="#icon-report"></use></svg> 一键举报</a>\n' +
                '                    </details-menu>\n' +
                '                </details>\n';
        }
        newHTML += '        </div>\n' +
            '    </div>\n' +
            '</div></div>';
        if (more) {
            $('#chats').append(newHTML);
            let $fn = $('#chats>div.fn-none');
            $fn.show();
            $fn.removeClass("fn-none");
        }
        // 堆叠复读机消息
        else if (isPlusOne) {
            let plusN = ++Label.plusN;
            if (plusN === 1) {
                let stackedHtml = "<div id='stacked' class='fn__flex' style='position:relative;display:none;'>" +
                    "<span id='plusOne' onclick='ChatRoom.plusOne()' style='display:block;margin-left: 20px'><svg style='width: 30px; height: 20px; cursor: pointer;'><use xlink:href='#plusOneIcon'></use></svg></span>" +
                    "</div>"
                $('#chats').prepend(stackedHtml);
                let latest = $('#chats>div.latest');
                $('#stacked').prepend(latest);
                latest.find('#userName').show();
                latest.removeClass('latest');
            }
            let $stacked = $('#stacked');
            if (plusN !== 1) {
                $stacked.fadeOut(100);
            }
            setTimeout(function () {
                $stacked.append(newHTML);
                $stacked.height($stacked.height() + 27 + 'px')

                let $fn = $('#stacked>div.fn-none');
                $fn.show();
                $fn.css('left', plusN * 9 + 'px');
                $fn.css('top', plusN * 27 + 'px');
                $fn.css('position', 'absolute');
                $fn.find('.chats__content').css('background-color', plusN % 2 === 0 ? 'rgb(240 245 254)' : 'rgb(245 245 245)');
                $fn.removeClass("fn-none");

                $stacked.fadeIn(200);
            }, 100);
        } else {
            $('#plusOne').remove();
            if (data.md) {
                Label.latestMessage = data.md;
                Label.plusN = 0;
            }
            let $chats = $('#chats');
            $chats.find('.latest').removeClass('latest');
            $chats.prepend(newHTML);
            let $fn = $('#chats>div.fn-none');
            $fn.slideDown(200);
            $fn.addClass("latest");
            $fn.removeClass("fn-none");
        }
    },
    /**
     * 看图插件dom
     */
    imgViewer: null,
    /**
     * 看图插件等待更新状态
     */
    imgWaitting: false,
    /**
     * 全屏看图插件渲染
     */
    imageViewer: function () {
        // console.log("新消息")
        //没有新图片就不重载
        if (this.imgViewer && $("div.vditor-reset.ft__smaller img:not(.ft__smaller,.emoji,.ext-emoji,*[src*='shield'],*[src*='/gen?'])").length === this.imgViewer.length)
            return
        // console.log("包含图片")
        this.imgViewer = this.imgViewer || new Viewer(document.querySelector('#chats'), {
            inline: false,
            className: "PWLimgViwer",
            filter: (img) => !img.parentElement.classList.contains("ft__smaller") && !img.parentElement.classList.contains("ext-emoji") && !img.classList.contains("emoji") && img.src.indexOf("shield") < 0 && img.src.indexOf("/gen?") < 0,
            title() {
                let ele = this.images[$(".PWLimgViwer .viewer-active").attr("data-index")];
                while (ele = ele.parentElement,
                    !ele.querySelector(".avatar")) ;
                return "From @" + ele.querySelector(".avatar").getAttribute("aria-label")
            }
        });
        const delayshow = function () {
            setTimeout(() => {
                    if (!ChatRoom.imgViewer.isShown) {
                        ChatRoom.imgWaitting = false;
                        // console.log("重载")
                        ChatRoom.imgViewer.update()
                    } else {
                        // console.log("等待")
                        delayshow()
                    }
                }
                , 1000)
            return true
        }
        // console.log("前", this.imgWaitting)
        this.imgWaitting = this.imgWaitting || delayshow()
        // console.log("后", this.imgWaitting)
    },
    /**
     * xiaoIce Game
     * */
    iceWs: "",
    IceGameCK : localStorage.getItem("IceGameCK") || null,
    loadXiaoIceGame: function(){
        // 连接游戏服务器
        iceWs = new WebSocket('wss://game.yuis.cc/wss');
        let iceWsHeart = null;
        iceWs.onopen = function(){
            iceWs.send(JSON.stringify({
                type:'setUser',
                user:Label.currentUser,
                ck:ChatRoom.IceGameCK,
                uid:Label.currentUserId
            }))
            iceWsHeart = setInterval(()=>{
                iceWs.send(JSON.stringify({type:'hb'}))
            },15000)
        }
        iceWs.onclose = function(){
            let html = `<div class="ice-msg-item">
                    <div class="ice-msg-content">小冰网络失去连接</div>
                  </div>`
            $('#iceMsgList').prepend(html);
        }
        iceWs.onerror = function(err){
            let html = `<div class="ice-msg-item">
                    <div class="ice-msg-content">小冰网络维护中...</div>
                  </div>`
            $('#iceMsgList').prepend(html);
        }
        // 收到消息
        iceWs.onmessage = function (e){
            let data = JSON.parse(e.data);
            if(data.user === "all" || data.user === Label.currentUser){
                let html = `<div class="ice-msg-item">
                    <div class="ice-msg-content">${data.msg}</div>
                  </div>`
                $('#iceMsgList').prepend(html);
            }
            if(data.type === "setCK"){
                ChatRoom.IceGameCK = data.ck;
                localStorage.setItem("IceGameCK",data.ck);
            }
        }
        // 打开游戏界面
        $('#xiaoIceGameBtn').click(function(){
            $("#xiaoIceGameBox").show(200);
            $('#xiaoIceGameBtn').hide(200);
            setTimeout(()=>{
                $("#xiaoIceGameBox").addClass('active');
            },220)
        })
        // 关闭游戏界面
        $('#iceClose').click(function(){
            const gameBox=$("#xiaoIceGameBox")
            setTimeout(()=>{
                $('.ice-chat-input').val("");
                $("#xiaoIceGameBox").hide(200);
                $('#xiaoIceGameBtn').show(200);
            },gameBox.hasClass('active')?420:1)
            gameBox.removeClass('active');
        })
        // 最小化切换
        $('#iceMinimize').click(function(){
            $("#xiaoIceGameBox").toggleClass('active');
        })
        // 发送指令
        $('#iceSendMsg').click(ChatRoom.sendIceMsg);
        $('.ice-chat-input').bind('keypress', function(event) {
            if (event.keyCode === 13) {
                event.preventDefault();
                ChatRoom.sendIceMsg();
            }
        });
    },

    sendIceMsg: function () {
        let msg = $('.ice-chat-input').val();
        $('.ice-chat-input').val("");
        let uMsg = `<div class="ice-msg-item me">
                    <div class="ice-msg-content">${msg}</div>
                  </div>`
        $('#iceMsgList').prepend(uMsg);
        let type = "gameMsg";
        console.log(/(登录)/.test(msg))
        if(/(登录)/.test(msg)){
            type = "login"
        }
        iceWs.send(JSON.stringify({
            type: type,
            ck: ChatRoom.IceGameCK,
            msg: msg
        }));
    },

    /**
     * 按时间加载头像挂件
     * */
    loadAvatarPendant: function(){
        let year = new Date().getFullYear();
        let month = new Date().getMonth() + 1;
        let day = new Date().getDate();
        let formatDate = `${year}-${month}-${day}`;
        let SpringFestivalDateList = {
            2021:["2021-02-11","2021-02-17"],
            2022:["2022-01-31","2022-02-06"],
            2023:["2023-01-21","2023-01-07"],
            2024:["2024-02-09","2024-02-15"],
            2025:["2025-01-28","2025-02-03"],
            2026:["2026-02-16","2026-01-22"],
        }
        let MidAutumnFestivalDateList = {
            2021:["2021-09-19","2021-09-21"],
            2022:["2022-09-10","2022-09-12"],
            2023:["2023-09-29","2023-10-01"],
            2024:["2024-09-17","2024-09-19"],
            2025:["2025-10-06","2025-10-09"],
            2026:["2026-09-25","2026-09-27"],
        }
        //  国庆头像挂件
        let chatRoom = document.querySelector('body')
        if(month === 10 && day <= 7){
            chatRoom.classList.add('NationalDay')
            return;
        }
        //  圣诞节头像挂件
        if((month === 12 && day >= 24) && (month === 12 && day <= 25)){
            chatRoom.classList.add('Christmas')
            return;
        }
        //  中秋头像挂件
        if(new Date(MidAutumnFestivalDateList[year][0]) <= new Date(formatDate) && new Date(MidAutumnFestivalDateList[year][1]) >= new Date(formatDate)){
            chatRoom.classList.add('MidAutumnFestival')
            return;
        }
        //  春节头像挂件
        if(new Date(SpringFestivalDateList[year][0]) <= new Date(formatDate) && new Date(SpringFestivalDateList[year][1]) >= new Date(formatDate)){
            chatRoom.classList.add('SpringFestival')
        }
    }
}



module.exports.handleAudio = function (event, isPassenger) {

    var userID = event.source.userId;

    var self = this;

    const message = event.message;
    const messageId = message.id;
    const replyToken = event.replyToken;

    var userType = "";
    if(isPassenger === true) userType = "passenger";
    else                    userType = "driver";

    var options = { 
        method: 'GET',
        url: 'https://17-vr-live.wonliao.com/go-go-taxi/convert.php',
        qs: { type: userType, message_id: message.id } 
    };

    request(options, function (error, response, body) {
        
        var data = JSON.parse(body);
        // console.log("won test ==> data");
        // console.dir(data);

        if(data.length <= 0)    return;

        var file_url = data.file_url;

        console.log("won test ==> file_url("+file_url+")");

        
        getDuration(file_url).then( function ( audioDuration ) {

            console.log("won test 2 ==> audioDuration("+audioDuration+")");
            var duration = audioDuration * 1000;

            if(isPassenger === true) {

                console.log("won test ==> test 3");
                self.sendAudioToDriver(event, file_url, duration);
            } else {

                self.sendAudioToPassenger(event, file_url, duration);
            }

            return;
        }).catch(function(e){

            console.log("won test getDuration ==> error("+e+")");
        });
    });
}

// 乘客 準備聯絡司機
module.exports.prepareTalkToDriver = function (event) {

    var userID = event.source.userId;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    console.log("won test ==> ticketId("+ticketId+")");


    if(typeof ticketId !== 'undefined') {

        // 司機
        {
            // 找出司機
            firebase.database().ref('/ticket/' + ticketId).once("value", function(snapshot) {

                var ticketID = snapshot.key;
                var driverUserID = snapshot.val().driverUserID;

                // Action 改為 TalkToPassenger
                firebase.database().ref('/driver/'+ driverUserID).update({"Action": "TalkToPassenger"});

                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu7);

                var echo = { type: 'text', text: "乘客與你對話中\n你可以傳送文字訊息給乘客" };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){});
            });
        }

        // 乘客
        {
            // RichMenu 改成 語音對談
            richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu6);

            untils.passengerSetActionAndReplayMessage(event, "TalkToDriver", "與司機對話中\n你可以傳送文字訊息給司機");
        }
    } else {

        // 司機
        {
            // 找出司機
            firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

                snapshot.forEach(function(data) {

                    var ticketID = data.key;
                    var driverUserID = data.val().driverUserID;

                    // Action 改為 TalkToPassenger
                    firebase.database().ref('/driver/'+ driverUserID).update({"Action": "TalkToPassenger"});

                    // RichMenu 改成 語音對談
                    richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu7);

                    var echo = { type: 'text', text: "乘客與你對話中\n你可以傳送文字訊息給乘客" };
                    driverClient.pushMessage(driverUserID, echo).catch(function(e){});
                });
            });
        }

        // 乘客
        {
            // RichMenu 改成 語音對談
            richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu6);

            untils.passengerSetActionAndReplayMessage(event, "TalkToDriver", "與司機對話中\n你可以傳送文字訊息給司機");
        }
    }
}

// 乘客關閉語音對談
module.exports.passengerCancelTalk = function (event) {

    var userID = event.source.userId;

    // 檢查任務狀態
    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;

            var passengerRichMenuID = "";
            var driverRichMenuID = "";

            var status = data.val().status;
            //console.log("won test ==> status("+status+")");
            if(status === "等車中") {

                passengerRichMenuID = config.passengerConfig.richmenu2;     // 叫車成功
                driverRichMenuID = config.driverConfig.richmenu4;           // 司機前往中
            } else if(status === "乘車中") {

                passengerRichMenuID = config.passengerConfig.richmenu3;     // 行程中
                driverRichMenuID = config.driverConfig.richmenu5;           // 司機行程中
            }

            // 司機
            {
                var driverUserID = data.val().driverUserID;

                // Action 改為 TalkToPassenger
                firebase.database().ref('/driver/'+ driverUserID).update({"Action": "none"});

                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToDriver(driverUserID, driverRichMenuID);

                var echo = { type: 'text', text: "乘客結束與你對話" };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){})
            }

            // 乘客
            {
                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToPassenger(userID, passengerRichMenuID);

                untils.passengerSetActionAndReplayMessage(event, "none", "結束與司機對話");
            }
        });
    });
}

// 司機 準備聯絡乘客
module.exports.prepareTalkToPassenger = function (event) {

    var userID = event.source.userId;

    // 乘客
    {
        // 找出乘客
        firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

            snapshot.forEach(function(data) {

                var ticketID = data.key;
                var passengerUserID = data.val().passengerUserID;

                // Action 改為 TalkToDriver
                firebase.database().ref('/passenger/'+ passengerUserID).update({"Action": "TalkToDriver"});

                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu6);

                var echo = { type: 'text', text: "司機與你對話中\n你可以傳送文字訊息給司機" };
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
            });
        });
    }

    // 司機
    {
        // RichMenu 改成 語音對談
        richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu7);

        untils.driverSetActionAndReplayMessage(event, "TalkToPassenger", "與乘客對話中\n你可以傳送文字訊息給乘客");
    }
}

// 司機關閉語音對談
module.exports.driverCancelTalk = function (event) {

    var userID = event.source.userId;

    // 檢查任務狀態
    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;

            var passengerRichMenuID = "";
            var driverRichMenuID = "";

            var status = data.val().status;
            //console.log("won test ==> status("+status+")");
            if(status === "等車中") {

                passengerRichMenuID = config.passengerConfig.richmenu2;     // 叫車成功
                driverRichMenuID = config.driverConfig.richmenu4;           // 司機前往中
            } else if(status === "乘車中") {

                passengerRichMenuID = config.passengerConfig.richmenu3;     // 行程中
                driverRichMenuID = config.driverConfig.richmenu5;           // 司機行程中
            }

            // 乘客
            {
                var passengerUserID = data.val().passengerUserID;

                // Action 改為 TalkToPassenger
                firebase.database().ref('/passenger/'+ passengerUserID).update({"Action": "none"});

                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToPassenger(passengerUserID, passengerRichMenuID);

                var echo = { type: 'text', text: "司機結束與你對話" };
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
            }

            // 司機
            {
                // RichMenu 改成 語音對談
                richMenus.linkRichMenuToDriver(userID, driverRichMenuID);

                untils.driverSetActionAndReplayMessage(event, "none", "結束與乘客對話");
            }
        });
    });
}

// 乘客 與司機交談
module.exports.talkToDriver = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var driverUserID = data.val().driverUserID;
            var name = data.val().name;

            // 通知司機
            {
                var message = "乘客\"" + name + "\"說：\n" + event.message.text;
                var echo = { type: 'text', text: message };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){});
            }

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = event.message.text;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);
        });
    });
}

// 司機 與乘客交談
module.exports.talkToPassenger = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var passengerUserID = data.val().passengerUserID;
            var driverName = data.val().driverName;

            // 通知乘客
            {
                var message = "司機\"" + driverName + "\"說：\n" + event.message.text;
                var echo = { type: 'text', text: message };
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
            }

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = event.message.text;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);
        });
    });
}

// 乘客 傳送語音給司機
module.exports.sendAudioToDriver = function (event, file_url, duration) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var driverUserID = data.val().driverUserID;
            var name = data.val().name;
            console.log("won test ==> ticketID("+ticketID+") driverUserID("+driverUserID+")");

            // 通知司機
            {
                var echo = [
                    { 
                        type: 'text', 
                        text: "乘客\"" + name + "\"傳送語音訊息："
                    },
                    {
                        "type": "audio",
                        "originalContentUrl": file_url,
                        "duration": duration
                    }
                ];

                driverClient.pushMessage(driverUserID, echo).catch(function(e){});
            }

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = file_url;//event.message.text;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);
        });
    });
}

// 司機 傳送語音給乘客
module.exports.sendAudioToPassenger = function (event, file_url, duration) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var passengerUserID = data.val().passengerUserID;
            var driverName = data.val().driverName;

            // 通知乘客
            {
                var echo = [
                    { 
                        type: 'text', 
                        text: "司機\"" + driverName + "\"傳送語音訊息："
                    },
                    {
                        "type": "audio",
                        "originalContentUrl": file_url,
                        "duration": duration
                    }
                ];
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
            }

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = file_url; //event.message.text;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);
        });
    });
}

// 乘客 向司機打開語音對談
module.exports.openPassengerWebRTC = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var webRtcUrl = config.passengerConfig.webRtcUrl + "?ticketID="+ticketID;
            //console.log(`won test ==> webRtcUrl(${webRtcUrl})`);

            // 司機
            {
                var driverUserID = data.val().driverUserID;
                var echo = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "打開語音對談視窗",
                                "uri": webRtcUrl
                            }
                        ],
                        "text": "乘客想要與你語音對談"
                    }
                };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){});
            }

            // 乘客
            {
                var echo2 = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "打開語音對談視窗",
                                "uri": webRtcUrl
                            }
                        ],
                        "text": "與司機語音對談"
                    }
                };
                passengerClient.replyMessage(event.replyToken, echo2).catch(function(e){});
            }
        });
    });
}

// 司機 向乘客打開語音對談
module.exports.openDriverWebRTC = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var webRtcUrl = config.passengerConfig.webRtcUrl + "?ticketID="+ticketID;
            //console.log(`won test ==> webRtcUrl(${webRtcUrl})`);

            // 乘客
            {
                var passengerUserID = data.val().passengerUserID;
                var echo = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "打開語音對談視窗",
                                "uri": webRtcUrl
                            }
                        ],
                        "text": "司機想要與你語音對談"
                    }
                };
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
            }

            // 司機
            {
                var echo2 = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "打開語音對談視窗",
                                "uri": webRtcUrl
                            }
                        ],
                        "text": "與乘客語音對談"
                    }
                };
                return driverClient.replyMessage(event.replyToken, echo2).catch(function(e){});
            }
        });
    });
}

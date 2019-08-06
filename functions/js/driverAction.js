
module.exports.handleEvent = function (event) {

    // this.startTime = process.hrtime();
    // console.log("won test ==> diff_time("+process.hrtime(this.startTime)+")");

    var userID = event.source.userId;

    if(userID === "Udeadbeefdeadbeefdeadbeefdeadbeef")  return Promise.resolve(null);

    // 訊息
    if (event.type === 'message') {

        // 文字
        if(event.message.type === 'text') {

            return this.handleTextEvent(event);
        // 語音
        } else if(event.message.type === 'audio') {
   
            var isPassenger = false;
            return talks.handleAudio(event, isPassenger);
        }
    // 指令
    }  else if (event.type === 'postback') {

        // 處理 postback 指令相關
        return this.handlePostbackEvent(event);
    // 新加入
    } else if (event.type === 'follow') {

        return this.createDriver(event);
    }

    return Promise.resolve(null);
}

// 司機用指令
module.exports.handleTextEvent = function (event) {

    var userID = event.source.userId;
    var message = event.message.text;
    var self = this;

    console.log("won test handleTextEvent ==> message("+message+") userID("+userID+")");

    // 處理 Action
    firebase.database().ref('/driver/'+ userID).once("value", snapshot => {

        // 乘客 Data
        self.driverData = snapshot;

        console.dir("won test driverProcess ==> message("+message+")");

        if(message.indexOf("承接任務") === 0) {

            callCars.takeMission(event);
        } else if(message.indexOf("輸入車資") === 0) {
            
            callCars.prepareEnteTheFare(event);
        } else if(message.indexOf("開啟功能選單") === 0) {

            // 開啟功能選單
            untils.showDriverDefaultMessage(event, self.driverData);
        } else if(message.indexOf("載客紀錄") === 0) {
            
            return untils.openDriverLog(event);
        } else if(message.indexOf("設定名稱") === 0) {
            
            return self.prepareSetting(event, "名稱");
        } else if(message.indexOf("設定車號") === 0) {
            
            return self.prepareSetting(event, "車號");
        } else if(message.indexOf("設定車型") === 0) {
            
            return self.prepareSetting(event, "車型");
        } else if(message.indexOf("設定手機") === 0) {
            
            return self.prepareSetting(event, "手機");
        } else if(message.indexOf("設定") === 0) {
            
            return self.showSettingMenu(event);
        } else if(message.indexOf("登入載客") === 0) {
            
            return self.setDriverStatus(event, "login");
        } else if(message.indexOf("登出載客") === 0) {
            
            return self.setDriverStatus(event, "logout");
        } else if(message.indexOf("預約任務") === 0) {

            return self.showSchedule(event);
        } else {

            return self.driverDoAction(event);
        } 
    });
}

module.exports.driverDoAction = function (event) {

    var userID = event.source.userId;
    var Action = this.driverData.val().Action;
    
    console.log("won test driverDoAction ==> Action("+Action+")");

    // 輸入車資
    if(Action === "輸入車資") {

        callCars.EnteTheFare(event);
    // 與乘客交談
    } else if(Action === "TalkToPassenger") {

        talks.talkToPassenger(event);
    } else if(Action === "輸入名稱") {

        this.setDriverData(event, "名稱");
    } else if(Action === "輸入車號") {

        this.setDriverData(event, "車號");
    } else if(Action === "輸入車型") {

        this.setDriverData(event, "車型");
    } else if(Action === "輸入手機") {

        this.setDriverData(event, "手機");
    // 一般對話
    } else {

        // 開啟功能選單
        untils.showDriverDefaultMessage(event, this.driverData);
    }
}

module.exports.handlePostbackEvent = function (event) {

    var userID = event.source.userId;
    var self = this;

    var data = event.postback.data;
    // console.log(`won test postback data ==>`);
    // console.dir(data);

    var querystring = require('querystring');
    var parsedstring = querystring.parse(data);
    var action = parsedstring.action;

    console.log("won test handlePostbackEvent ==> action("+action+") userID("+userID+")");

    if(action.indexOf("聯絡乘客") === 0) {

        talks.prepareTalkToPassenger(event);
    } else if(action.indexOf("司機語音對談") === 0) {

        talks.openDriverWebRTC(event);
    } else if(action.indexOf("司機關閉語音對談") === 0) {

        talks.driverCancelTalk(event);
    } else if(action.indexOf("取消載客") === 0) {

        callCars.driverCancelCar(event);
    } else if(action.indexOf("導航至上車地點") === 0) {

        untils.navigateToPickUp(event);
    } else if(action.indexOf("導航至下車地點") === 0) {

        untils.navigateToDropOff(event);
    } else if(action.indexOf("抵達") === 0) {

        callCars.driverArrival(event);
    } else if(action.indexOf("結束任務") === 0) {

        callCars.prepareFinishMission(event);
    } else if(action.indexOf("確認結束任務") === 0) {

        callCars.finishMission(event);
    } else if(action.indexOf("輸入車資") === 0) {

        callCars.prepareEnteTheFare(event);
    } else if(action.indexOf("司機語音對談") === 0) {

        talks.openDriverWebRTC(event);
    } else if(action.indexOf("司機關閉語音對談") === 0) {

        talks.driverCancelTalk(event);
    } else if(action.indexOf("預約任務Detail") === 0) {

        self.showBookingDetail(event);
    } else if(action.indexOf("取消叫車") === 0) {

        callCars.driverPrepareCancelCar(event);
    } else if(action.indexOf("確認取消叫車") === 0) {

        callCars.driverCancelCar(event);
    }
}


/***************************************************************************/
/***************************************************************************/
/***************************************************************************/

// 創建帳號
module.exports.createDriver = function (event) {

    var userID = event.source.userId;

    return driverClient.getProfile(userID).then((profile) => {

        var data = {
            "name": profile.displayName, 
            "pictureUrl": profile.pictureUrl
        };
        firebase.database().ref('/driver/'+ userID).update(data);

        // RichMenu 改成 功能選單
        richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu0);

        var echo = { type: 'text', text: "歡迎加入" };
        return driverClient.replyMessage(event.replyToken, echo);
    });
}

// 設定選單
module.exports.showSettingMenu = function (event) {

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "message",
                    "label": "設定名稱",
                    "text": "設定名稱"
                },
                {
                    "type": "message",
                    "label": "設定車號",
                    "text": "設定車號"
                },
                {
                    "type": "message",
                    "label": "設定車型",
                    "text": "設定車型"
                },
                {
                    "type": "message",
                    "label": "設定手機",
                    "text": "設定手機"
                },
            ],
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "text": "設定"
        }
    };
    driverClient.replyMessage(event.replyToken, echo);
}

// 司機 準備輸入車資
module.exports.prepareSetting = function (event, command) {

    // var userID = event.source.userId;
    
    var echo = { type: 'text', text: "請輸入" + command };
    untils.driverSetActionAndReplayEcho(event, "輸入" + command, echo);
}

module.exports.setDriverData = function (event, type) {

    var userID = event.source.userId;
    var message = event.message.text;

    console.log("won test ==> message("+message+") type("+type+")");

    if(type === "名稱")       firebase.database().ref('/driver/'+ userID).update({name: message});
    else if(type === "車號")  firebase.database().ref('/driver/'+ userID).update({carNo: message});
    else if(type === "車型")  firebase.database().ref('/driver/'+ userID).update({carType: message});
    else if(type === "手機")  firebase.database().ref('/driver/'+ userID).update({phone: message});

    var echo = { type: 'text', text: "設定成功" };
    untils.driverSetActionAndReplayEcho(event, "none", echo);
}

module.exports.setDriverStatus = function (event, status) {

    var userID = event.source.userId;

    var echo = "";

    // 登入
    if(status === "login") {

        firebase.database().ref('/driver/'+ userID).update({loginStatus: true});
        echo = { type: 'text', text: "登入成功\n開始接收乘客叫車訊息。"};
    // 登出
    } else {

        firebase.database().ref('/driver/'+ userID).update({loginStatus: false});
        echo = { type: 'text', text: "登出成功\n關閉接收乘客叫車訊息。"};
    }

    driverClient.replyMessage(event.replyToken, echo);

    // 開啟功能選單
    // untils.showDriverDefaultMessage(event, this.driverData);
}

// 預約叫車
module.exports.showSchedule = function (event, index) {

    var userID = event.source.userId;
    
    firebase.database().ref('/booking/').orderByChild('driverUserID').equalTo(userID).limitToLast(100).once("value", function(snapshot) {

        if(snapshot.numChildren() > 0) {

            var actions = [];
            snapshot.forEach(function(data) {

                var ticketId = data.key;
                var passengerUserID = data.val().passengerUserID;
                var driverUserID = data.val().driverUserID;
                var bookingTime = data.val().bookingTime;
                var status = data.val().status;

                var timeString = bookingTime.split(" ");


                if(status === "等車中") {

                    var action = {
                        "type": "postback",
                        "label": timeString[0],
                        "data": "action=預約任務Detail&ticketId=" + ticketId
                    };
                    actions.push(action);
                } else {

                    var action = {
                        "type": "postback",
                        "label": timeString[0] + " ("+status+")",
                        "data": "action=預約任務Detail&ticketId=" + ticketId
                    };
                    actions.push(action);
                }
                
            });

            var echo = {
                "type": "template",
                "altText": "this is a buttons template",
                "template": {
                    "type": "buttons",
                    "actions": actions,
                    "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                    "text": "預約任務列表"
                }
            };
            driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
        } else {

            echo = { "type": "text", "text": "目前沒有預約任務" };
            driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
        }
    });
}

module.exports.showBookingDetail = function (event) {

    var userID = event.source.userId;
    var self = this;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    console.log("won test ==> ticketId("+ticketId+")");

    firebase.database().ref('/ticket/' + ticketId).once("value", function(snapshot) {

        var text = "";
        // text += snapshot.val().categoryName + "\n";
        // text += "司機：" + snapshot.val().driverName + "\n";
        text += "預約時間：" + snapshot.val().bookingTime + "\n";
        text += "上車地址：" + snapshot.val().addressOn.addresss + "\n";
        // text += "下車地址：" + snapshot.val().addressOff.addresss + "\n";
        
        var passengerUserID = snapshot.val().passengerUserID;

        firebase.database().ref('/passenger/' + passengerUserID).once("value", function(snapshot2) {

            var phone = snapshot2.val().phone;

            console.log("won test ==> phone("+phone+")");

            var actions = [];
            if(snapshot.val().status === "等車中") {

                var action1 = {
                    // "type": "postback",
                    // "label": "聯絡司機 -" + snapshot.val().driverName ,
                    // "data": "action=聯絡司機&ticketId=" + ticketId
                    "type": "uri",
                    "label": "聯絡乘客 -" + snapshot.val().name,
                    "uri": "tel:" + phone
                };
                actions.push(action1);

                var action2 = {
                    "type": "postback",
                    "label": "取消預約",
                    "data": "action=取消叫車&ticketId=" + ticketId
                };
                actions.push(action2);
            }

            var action3 = {
                "type": "message",
                "label": "返回預約任務",
                "text": "預約任務"
            };
            actions.push(action3);


            var echo = {
                "type": "template",
                "altText": "this is a buttons template",
                "template": {
                    "type": "buttons",
                    "actions": actions,
                    "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                    "text": text
                }
            };
            driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
        });
    });
}

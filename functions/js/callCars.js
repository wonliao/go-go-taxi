// 準備叫車
module.exports.prepareCallCar = function (event) {

    var userID = event.source.userId;
    var self = this;

    console.log("won test ==> prepareCallCar");

    firebase.database().ref('/passenger/'+ userID).once("value", function(snapshot) {

        self.passengerData = snapshot;

        // 沒有上車地點
        if(!snapshot.hasChild("TempAddress")) {

            var echo = {
              "type": "template",
              "altText": "this is a buttons template",
              "template": {
                "type": "buttons",
                "actions": [
                  {
                    "type": "uri",
                    "label": "開啟地圖",
                    "uri": "line://nv/location"
                  }
                ],
                "text": "請先選擇上車地點"
              }
            };

            return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
        }


        // 將 TempAddress 複製到 addressOn
        var addresss = self.passengerData.child("TempAddress/addresss").val();
        var shortAddress = self.passengerData.child("TempAddress/shortAddress").val();
        var latitude = self.passengerData.child("TempAddress/latitude").val();
        var longitude = self.passengerData.child("TempAddress/longitude").val();
        var bookingTime = "";
        if(self.passengerData.hasChild("TempAddress/bookingTime")) {
            bookingTime = self.passengerData.child("TempAddress/bookingTime").val();
        }

        var AddressOn = {
            'title':    "上車地點",
            'addresss': addresss,
            'shortAddress': shortAddress,
            'latitude': latitude,
            'longitude': longitude,
            'bookingTime': bookingTime
        }
        firebase.database().ref('/passenger/'+ userID).update({'addressOn': AddressOn});

        self.callCar(event);
    });
}

// 叫車
module.exports.callCar = function (event) {

    var userID = event.source.userId;
    var self = this;

    firebase.database().ref('/passenger/'+ userID).once("value", function(snapshot) {

        self.passengerData = snapshot;

        // 沒有上車地點
        if(!snapshot.hasChild("addressOn")) {

            var echo = {
              "type": "template",
              "altText": "this is a buttons template",
              "template": {
                "type": "buttons",
                "actions": [
                  {
                    "type": "uri",
                    "label": "開啟地圖",
                    "uri": "line://nv/location"
                  }
                ],
                "text": "請先選擇上車地點"
              }
            };

            return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});

        // 開始叫車
        } else {

            var name = event.source.userId;
            if(snapshot.hasChild("name")) {
                name = snapshot.val().name;
            }

            var addressOn = snapshot.val().addressOn;       // 上車資訊
            var addressOff = "";
            if(snapshot.hasChild("addressOff")) {
                addressOff = snapshot.val().addressOff;     // 下車資訊
            }

            // 建立任務
            var ticketID = self.createMission(event, addressOn, addressOff);
            console.log(`won test 222 ==> ticketID(${ticketID})`);


            var categoryName = "即時叫車";
            var bookingTime = "";
            if(addressOn.bookingTime !== "") {

                categoryName = "預約叫車";

                var date = new Date(addressOn.bookingTime);
                // date.setHours(date.getHours() - 8);
                var timeString = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);

                bookingTime = "\n預約時間：" + timeString;
            }

            // 廣播叫車
            var message = categoryName + bookingTime + `\n乘客：${name}\n${addressOn.title}\n${addressOn.addresss}\n(${addressOn.latitude},${addressOn.longitude})\n`;
            var echo2 = [
                {
                    "type": "location",
                    "title": addressOn.title,
                    "address": addressOn.addresss,
                    "latitude": addressOn.latitude,
                    "longitude": addressOn.longitude
                },
                {
                  "type": "template",
                  "altText": "this is a buttons template",
                  "template": {
                    "type": "buttons",
                    "actions": [
                      {
                        "type": "message",
                        "label": "承接任務",
                        "text":"承接任務 ID="+ticketID,
                      }
                    ],
                    "text": message
                  }
                }
            ];
            untils.BroadcastReplayMessage(event, echo2);

            // RichMenu 改成 等車中
            richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu1);

            // 搜車時間
            setTimeout(function() {

                console.log("檢查搜車時間 ==> ticketID("+ticketID+")");

                // 檢查是否已被承接
                firebase.database().ref('/ticket/'+ ticketID).once("value", function(snapshot2) {

                    var driverUserID = snapshot2.val().driverUserID;
                    var status = snapshot2.val().status;
                    console.log(`won test 4 ==> userID(${userID}) status(${status}) driverUserID(${driverUserID})`);

                    // 任務尚未被承接
                    if(status === "搜車中" && driverUserID === "") {

                        firebase.database().ref('/ticket/'+ ticketID).update({"status": "搜無車"});
                        firebase.database().ref('/passenger/'+ userID).update({"Action": "none"});

                        // RichMenu 改成 功能選單
                        richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);

                        // 回應乘客訊息
                        var echo4 = {
                          "type": "template",
                          "altText": "this is a buttons template",
                          "template": {
                            "type": "buttons",
                            "actions": [
                              {
                                "type": "message",
                                "label": "重新叫車",
                                "text": "重新叫車"
                              },
                              {
                                "type": "message",
                                "label": "取消",
                                "text": "取消"
                              }
                            ],
                            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                            "title": "很抱歉，附近可能沒有車輛，或是司機正在忙碌中。",
                            "text": "是否重新叫車?"
                          }
                        };
                        passengerClient.pushMessage(userID, echo4).catch(function(e){});
                    }
                });
            }, 10000);


            firebase.database().ref('/passenger/'+ userID ).update({'Action': "搜車中"});

            // 回應乘客訊息
            var echo3 = { type: 'text', text: "為你派車中，請稍候" };
            return passengerClient.replyMessage(event.replyToken, echo3).catch(function(e){});
        }
    });
}

// 司機承接任務
module.exports.takeMission = function (event) {

    var userID = event.source.userId;
    var message = event.message.text;

    var querystring = require('querystring');
    var parsedString = querystring.parse(message);
    var ticketID = parsedString['承接任務 ID'];
    console.log("won test ==> ticketID("+ticketID+")");

    // 檢查是否已被承接
    firebase.database().ref('/ticket/'+ ticketID).once("value", function(snapshot) {

        var driverUserID = snapshot.val().driverUserID;
        var status = snapshot.val().status;
        console.log(`won test 4 ==> userID(${userID}) status(${status}) driverUserID(${driverUserID})`);

        // 任務尚未被承接
        if(status === "搜車中" && (driverUserID === "" || driverUserID === userID)) {

            // 預約叫車
            if(snapshot.val().categoryName === "預約叫車") {

                var passengerUserID = snapshot.val().passengerUserID;

                var bookingUpdates = {};
                bookingUpdates['/booking/' + driverUserID + '/' + ticketID] = {driverUserID: userID, passengerUserID: passengerUserID, bookingTime: snapshot.val().bookingTime, status: '等車中'};
                firebase.database().ref().update(bookingUpdates);

                // 回應司機
                {
                    untils.driverSetReplayMessage(event, "承接任務成功!!\n請記得於約定時間至上車地點載客。\n並點選「功能選單」->「預約任務」->「開始任務」");

                    // RichMenu 改成 司機前往中
                    // richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu4);
                }
                
                // 回應乘客
                // var passengerUserID = snapshot.val().passengerUserID;
                if(passengerUserID !== "") {

                    // 取得司機資料
                    firebase.database().ref('/driver/'+ userID).once("value", function(snapshot2) {

                        var driverName = "";
                        var carNo = "";
                        var carType = "計程車";
                        // var waitingTime = 6;

                        if(snapshot2.hasChild("name"))      driverName = snapshot2.val().name;
                        if(snapshot2.hasChild("carNo"))     carNo = snapshot2.val().carNo;
                        if(snapshot2.hasChild("carType"))   carType = snapshot2.val().carType;

                        // 回應乘客
                        var message = `為你派遣車輛：${carType}\n車號：${carNo}\n司機：${driverName}。\n點選「功能選單」->「預約任務」查看詳細資訊。`;
                        var echo = { type: 'text', text: message };
                        passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});

                        // 更新任務狀態為 等車中
                        firebase.database().ref('/ticket/'+ ticketID).update({"driverUserID": userID, "driverName": driverName, 'status': "等車中"});

                        // 更新 ticket
                        var d = new Date();
                        var current_datetime = d.toLocaleString();
                        var content = `為你派遣：${carType}<br />車號：${carNo}<br />司機：${driverName}`;
                        var updates = {};
                        updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
                        firebase.database().ref().update(updates);

                        // RichMenu 改成 功能選單
                        richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu0);
                    });
                }
            // 即時叫車
            } else {

                // 回應司機
                {
                    untils.driverSetReplayMessage(event, "承接任務成功");

                    // RichMenu 改成 司機前往中
                    richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu4);
                }
                
                // 回應乘客
                var passengerUserID = snapshot.val().passengerUserID;
                if(passengerUserID !== "") {

                    // 取得司機資料
                    firebase.database().ref('/driver/'+ userID).once("value", function(snapshot2) {

                        var driverName = "";
                        var carNo = "";
                        var carType = "計程車";
                        var waitingTime = 6;

                        if(snapshot2.hasChild("name"))      driverName = snapshot2.val().name;
                        if(snapshot2.hasChild("carNo"))     carNo = snapshot2.val().carNo;
                        if(snapshot2.hasChild("carType"))   carType = snapshot2.val().carType;

                        // 回應乘客
                        var message = `為你派遣：${carType}\n車號：${carNo}\n司機：${driverName}\n預計${waitingTime}分鐘後抵達`;
                        var echo = { type: 'text', text: message };
                        passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});

                        // 更新任務狀態為 等車中
                        firebase.database().ref('/ticket/'+ ticketID).update({"driverUserID": userID, "driverName": driverName, 'status': "等車中"});

                        // 更新 ticket
                        var d = new Date();
                        var current_datetime = d.toLocaleString();
                        var content = `為你派遣：${carType}<br />車號：${carNo}<br />司機：${driverName}<br />預計${waitingTime}分鐘後抵達`;
                        var updates = {};
                        updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
                        firebase.database().ref().update(updates);

                        // RichMenu 改成 叫車成功
                        richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu2);
                    });
                }
            }
        // 任務逾時
        } else if(status === "搜無車") {

            // 回應司機
            untils.driverSetReplayMessage(event, `任務已結束`);
        // 任務已被承接
        } else {

            // 回應司機
            untils.driverSetReplayMessage(event, `任務已被承接`);
        }
    });
}

// 司機 準備結束任務
module.exports.prepareFinishMission = function (event) {

    var userID = event.source.userId;

    var echo = {
        "type": "template",
        "altText": "this is a confirm template",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "postback",
                    "label": "是",
                    "data": "action=確認結束任務"
                },
                {
                    "type": "postback",
                    "label": "否",
                    "data": "action=none"
                }
            ],
            "text": "任務結束之前請記得輸入車資，並請乘客使用LINE Pay付款。\n\n確認是否結束任務?"
        }
    }
    driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機 結束任務
module.exports.finishMission = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var passengerUserID = data.val().passengerUserID;

            // 更新任務狀態為 任務結束
            firebase.database().ref('/ticket/'+ ticketID).update({"status": "任務結束"});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = `任務結束`;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // 司機
            {
                // 回應司機
                untils.driverSetReplayMessage(event, "任務結束!!");

                // RichMenu 改成 預設
                richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu0);
            }

            // 乘客
            {
                // 回應乘客
                var message = "任務結束!!";
                var echo = { type: 'text', text: message };
                passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});

                // RichMenu 改成 預設
                richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu0);
            }
        });
    });
}

// 司機 結束任務
module.exports.finishMissionByDriverID = function (userID) {

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var passengerUserID = data.val().passengerUserID;

            // 更新任務狀態為 任務結束
            firebase.database().ref('/ticket/'+ ticketID).update({"status": "任務結束"});


            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = `任務結束`;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // 司機
            {
                // 回應司機
                var message = "任務結束!!";
                var echo = { type: 'text', text: message };
                untils.driverPushEcho(userID, echo);

                // RichMenu 改成 預設
                richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu0);
            }

            // 乘客
            {
                // 回應乘客
                var message2 = "任務結束!!";
                var echo2 = { type: 'text', text: message2 };
                untils.passengerPushEcho(passengerUserID, echo2);

                // RichMenu 改成 預設
                richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu0);
            }
        });
    });
}

// 司機 準備輸入車資
module.exports.prepareEnteTheFare = function (event) {

    // var userID = event.source.userId;
    
    var echo = { type: 'text', text: "請輸入車資" };
    untils.driverSetActionAndReplayEcho(event, "輸入車資", echo);
}


// 司機 輸入車資
module.exports.EnteTheFare = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketId = data.key;
            var passengerUserID = data.val().passengerUserID;
            var driverId = userID;
            var linePayUUID = data.val().linePayUUID;

            var amount = event.message.text;
            console.log("won test ==> amount("+amount+") linePayUUID("+linePayUUID+")");

            // 檢查金額是否為整數
            if (isNaN(amount)) {
                return untils.passengerSetActionAndReplayMessage (event, "EnteTheFare", "車資請輸入整數，勿輸入中英文或特殊符號。");
            }

            // 設定車資
            firebase.database().ref('/ticket/'+ ticketId).update({"amount": amount});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = `司機輸入車資：${amount}元`;
            var updates = {};
            updates['/ticket/' + ticketId + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // 司機
            {
                // 回應司機
                untils.driverSetActionAndReplayMessage(event, "輸入車資", `本趟車資：共 ${amount} 元`);
            }

            // 乘客
            {
                var orderId = "";
                if(typeof linePayUUID === 'undefined') {

                    const uuid = require("uuid/v4");
                    orderId = uuid();
                    firebase.database().ref('/ticket/'+ ticketId).update({"linePayUUID": orderId});
                } else {
                    
                    orderId = linePayUUID;
                }
                
                var purchaseUrl = `${config.linePay.linePayUrl}?passengerId=${encodeURIComponent(passengerUserID)}&driverId=${encodeURIComponent(driverId)}&amount=${amount}&orderId=${orderId}&ticketId=${ticketId}`;
                console.log(`won test ==> purchaseUrl(${purchaseUrl})`);

                var echo = {
                    type: "template",
                    altText: "支付車資",
                    template: {
                        type: "buttons",
                        text: `車資總金額：${amount}元\n\n請選擇支付方式`,
                        actions: [
                            {type: "uri", label: "LINE Pay", uri: purchaseUrl }
                        ]
                    }
                };

                passengerClient.pushMessage(passengerUserID, echo).then((response) =>
                    {
                        // cache.put(event.source.userId, {
                        //     //subscription: "inactive"
                        //     inputAmount: amount
                        // });

                        return;
                    }
                ).catch(function(e){});
            }
        });
    });
}

// 乘客 準備取消叫車
module.exports.prepareCancelCar = function(event) {

    var userID = event.source.userId;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    if(typeof ticketId === "undefined") ticketId = "";
    console.log("won test prepareCancelCar ==> ticketId("+ticketId+")");


    firebase.database().ref('/passenger/'+ userID).update({"Action": "CancelCar"});

    var echo = {
        "type": "template",
        "altText": "this is a confirm template",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "postback",
                    "label": "是",
                    "data": "action=確認取消叫車&ticketId="+ticketId
                },
                {
                    "type": "message",
                    "label": "否",
                    "text": "預約任務"
                }
            ],
            "text": "確定要取消叫車嗎?"
        }
    }
    passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 乘客 取消叫車
module.exports.cancelCar = function (event) {

    var userID = event.source.userId;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    if(typeof ticketId === "undefined") ticketId = "";
    console.log("won test cancelCar ==> ticketId("+ticketId+")");

    if(ticketId !== "") {

        firebase.database().ref('/ticket/' + ticketId).once("value", function(snapshot) {

            var driverUserID = snapshot.val().driverUserID;
            var categoryName = snapshot.val().categoryName;
            console.log("won test ==> categoryName("+categoryName+") driverUserID("+driverUserID+")");

            // 更新 ticket
            firebase.database().ref('/ticket/'+ ticketId).update({"status": "取消叫車"});


            // 刪除上下車地址
//            firebase.database().ref('/passenger/'+ userID).update({'addressOn': null});
            firebase.database().ref('/passenger/'+ userID).update({'addressOff': null});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = "乘客取消叫車";
            var updates = {};
            updates['/ticket/' + ticketId + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            if(categoryName === "預約叫車") {

                firebase.database().ref('/booking/'+ ticketId).update({'status': "取消叫車"});

                // 乘客
                {   
                    untils.passengerSetActionAndReplayMessage(event, "none", "取消預約叫車成功");
                }
                
                // 司機
                {

                    var text = "取消叫車\n乘客："+snapshot.val().name+"\n日期："+snapshot.val().bookingTime;
                    console.log("won test ==> text("+text+")");
                    var echo = {
                        "type": "template",
                        "altText": "this is a buttons template",
                        "template": {
                            "type": "buttons",
                            "actions": [
                                {
                                    "type": "message",
                                    "label": "查看預約任務",
                                    "text": "查看預約任務"
                                }
                            ],
                            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                            "text": text
                        }
                    };
                    driverClient.pushMessage(driverUserID, echo).catch(function(e){});
                }
            } else {

                // 乘客
                {
                    // RichMenu 改成 功能選單
                    richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);
                    
                    untils.passengerSetActionAndReplayMessage(event, "none", "取消叫車成功");
                }
                
                // 司機
                if(driverUserID !== "") {

                    richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu0);

                    var echo = { type: 'text', text: "乘客取消叫車" };
                    driverClient.pushMessage(driverUserID, echo).catch(function(e){});
                }
            }
        });
    } else {

        firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

            snapshot.forEach(function(data) {

                var ticketID = data.key;
                var driverUserID = data.val().driverUserID;

                // 更新 ticket
                firebase.database().ref('/ticket/'+ ticketID).update({"status": "取消叫車"});

                // 刪除上下車地址
    //            firebase.database().ref('/passenger/'+ userID).update({'addressOn': null});
                firebase.database().ref('/passenger/'+ userID).update({'addressOff': null});

                // 更新 ticket
                var d = new Date();
                var current_datetime = d.toLocaleString();
                var content = "乘客取消叫車";
                var updates = {};
                updates['/ticket/' + ticketID + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
                firebase.database().ref().update(updates);

                // RichMenu 改成 功能選單
                richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);
                if(driverUserID !== "")    richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu0);

                untils.passengerSetActionAndReplayMessage(event, "none", "取消叫車成功");

                // 通知司機取消叫車
                if(driverUserID !== "") {

                    var echo = { type: 'text', text: "乘客取消叫車" };
                    driverClient.pushMessage(driverUserID, echo).catch(function(e){});
                }
            });
        });
    }
}

// 乘客 準備取消叫車
module.exports.driverPrepareCancelCar = function(event) {

    var userID = event.source.userId;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    if(typeof ticketId === "undefined") ticketId = "";
    console.log("won test driverPrepareCancelCar ==> ticketId("+ticketId+")");


    firebase.database().ref('/driver/'+ userID).update({"Action": "CancelCar"});

    var echo = {
        "type": "template",
        "altText": "this is a confirm template",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "postback",
                    "label": "是",
                    "data": "action=確認取消叫車&ticketId="+ticketId
                },
                {
                    "type": "message",
                    "label": "否",
                    "text": "預約任務"
                }
            ],
            "text": "確定要取消載客嗎?"
        }
    }
    driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機 取消載客
module.exports.driverCancelCar = function (event) {

    var userID = event.source.userId;

    var data = event.postback.data;
    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var ticketId = dataString.ticketId;
    if(typeof ticketId === "undefined") ticketId = "";
    console.log("won test cancelCar ==> ticketId("+ticketId+")");

    if(ticketId !== "") {

        firebase.database().ref('/ticket/' + ticketId).once("value", function(snapshot) {

            var passengerUserID = snapshot.val().passengerUserID;
            var categoryName = snapshot.val().categoryName;
            console.log("won test ==> categoryName("+categoryName+") passengerUserID("+passengerUserID+")");

            // 更新 ticket
            firebase.database().ref('/ticket/'+ ticketId).update({"status": "取消叫車"});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = "司機取消叫車";
            var updates = {};
            updates['/ticket/' + ticketId + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            if(categoryName === "預約叫車") {

                firebase.database().ref('/booking/'+ ticketId).update({'status': "取消叫車"});

                // 司機
                {   
                    untils.driverSetActionAndReplayMessage(event, "none", "取消預約成功");
                }
                
                // 乘客
                {

                    var text = "取消叫車\n司機："+snapshot.val().driverName+"\n日期："+snapshot.val().bookingTime;
                    console.log("won test ==> text("+text+")");
                    var echo = {
                        "type": "template",
                        "altText": "this is a buttons template",
                        "template": {
                            "type": "buttons",
                            "actions": [
                                {
                                    "type": "message",
                                    "label": "查看預約任務",
                                    "text": "查看預約任務"
                                }
                            ],
                            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                            "text": text
                        }
                    };
                    passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
                }
            } else {

                // 乘客
                {
                    // RichMenu 改成 功能選單
                    richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);
                    
                    untils.passengerSetActionAndReplayMessage(event, "none", "取消叫車成功");
                }
                
                // 司機
                if(driverUserID !== "") {

                    richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu0);

                    var echo = { type: 'text', text: "乘客取消叫車" };
                    driverClient.pushMessage(driverUserID, echo).catch(function(e){});
                }
            }
        });
    } else {

        firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

            snapshot.forEach(function(data) {

                var ticketID = data.key;
                var passengerUserID = data.val().passengerUserID;
    //            //console.log(`won test ==> passengerUserID(${passengerUserID})`);

                // 更新任務狀態 取消叫車
                firebase.database().ref('/ticket/'+ ticketID).update({"status": "取消叫車"});

                // 更新 ticket
                var d = new Date();
                var current_datetime = d.toLocaleString();
                var content = "司機取消叫車";
                var updates = {};
                updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
                firebase.database().ref().update(updates);

                // RichMenu 改成 預設
                richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu0);
                if(passengerUserID !== "")    richMenus.linkRichMenuToPassenger(passengerUserID, config.passengerConfig.richmenu0);

                // 回應司機
                untils.driverSetActionAndReplayMessage(event, "none", "取消載客成功");

                // 回應乘客
                if(passengerUserID !== "") {

                    // var echo = { type: 'text', text: "司機取消載客\n請重新叫車" };
                    var echo = {
                      "type": "template",
                      "altText": "this is a buttons template",
                      "template": {
                        "type": "buttons",
                        "actions": [
                          {
                            "type": "message",
                            "label": "重新叫車",
                            "text": "重新叫車"
                          },
                          {
                            "type": "message",
                            "label": "取消",
                            "text": "取消"
                          }
                        ],
                        "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
                        "title": "司機取消載客",
                        "text": "是否重新叫車?"
                      }
                    };

                    passengerClient.pushMessage(passengerUserID, echo).catch(function(e){});
                }
            });
        });
    }
}

// 乘客 建立任務
module.exports.createMission = function (event, addressOn, addressOff) {

    var ticketID = Date.now();
    var userID = event.source.userId;

    var name = "";
    var email = "";
    var categoryName = "";
    if(this.passengerData.hasChild("name"))   name = this.passengerData.val().name;
    if(this.passengerData.hasChild("email"))  email = this.passengerData.val().email;

    var categoryName = "即時叫車";
    if(addressOn.bookingTime !== "") {
        categoryName = "預約叫車";
    }

    var d = new Date();
    var ticketData = {
        'categoryName':     categoryName,
        'content':          "無",
        'createdDate':      d.toLocaleString(),
        'bookingTime':      addressOn.bookingTime, 
        'email':            email,
        'name':             name,
        'status':           "搜車中",
        'subject':          addressOn.addresss,
        'ticketpostImage':  "",
        'passengerUserID':  userID,
        'driverUserID':     "",
        'addressOn':        addressOn,
        'addressOff':       addressOff
    }
    firebase.database().ref('/ticket/'+ ticketID).update(ticketData);


    return ticketID;
}

// 乘客 查看司機資料
module.exports.showDriverInfo = function(event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;

            var driverUserID = data.val().driverUserID;

            // 取得司機資料
            firebase.database().ref('/driver/'+ driverUserID).once("value", function(snapshot2) {

                var name = "";
                var carNo = "";
                var carType = "一般小黃";
                var email = "未輸入";
                var createdDate = "民國108年";
                var phone = "未輸入";

                if(snapshot2.hasChild("name"))          name = snapshot2.val().name;
                if(snapshot2.hasChild("carNo"))         carNo = snapshot2.val().carNo;
                if(snapshot2.hasChild("phone"))         carNo = snapshot2.val().phone;
                if(snapshot2.hasChild("carType"))       carType = snapshot2.val().carType;
                if(snapshot2.hasChild("createdDate"))  createdDate = snapshot2.val().createdDate;

                var message = "司機資料\n司機："+name+"\n車號："+carNo+"\n車型："+carType+"\n手機："+phone;

                // 回應乘客
                var echo = { type: 'text', text: message };
                passengerClient.pushMessage(userID, echo).catch(function(e){});
            });
        });
    });
}

// 乘客 換一輛車
module.exports.cancelAndRecallCar = function(event) {

    var self = this;

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var driverUserID = data.val().driverUserID;

            // 更新 ticket
            firebase.database().ref('/ticket/'+ ticketID).update({"status": "取消叫車"});

            // 刪除上下車地址
//            firebase.database().ref('/passenger/'+ userID).update({'addressOn': null});
            // firebase.database().ref('/passenger/'+ userID).update({'addressOff': null});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = "乘客取消叫車";
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // RichMenu 改成 功能選單
            richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);
            if(driverUserID !== "")    richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu0);
            // untils.passengerSetActionAndReplayMessage(event, "none", "取消叫車成功");

            // 通知司機取消叫車
            if(driverUserID !== "") {

                var echo = { type: 'text', text: "乘客取消叫車" };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){});
            }

            self.callCar(event);
        });
    });
}

// 司機 抵達
module.exports.driverArrival = function(event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;

            var passengerUserID = data.val().passengerUserID;
            var addressOn = data.val().addressOn;       // 上車資訊
            var address = addressOn.addresss;

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = `司機已抵達上車地址：${address}`;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'driver', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // 司機
            var echo = { type: 'text', text: "已通知乘客抵達上車地點"};
            driverClient.replyMessage(event.replyToken, echo).catch(function(e){});


            // 通知乘客
            var echo2 = {
                "type": "template",
                "altText": "this is a confirm template",
                "template": {
                    "type": "confirm",
                    "actions": [
                        {
                            "type": "postback",
                            "label": "是",
                            "data": "action=乘客上車"
                        },
                        {
                            "type": "postback",
                            "label": "否",
                            "data": "action=none"
                        }
                    ],
                    "text": `司機已抵達!!\n上車地址：${address}\n請問是否已上車?`
                }
            }
            passengerClient.pushMessage(passengerUserID, echo2).catch(function(e){});
        });
    });
}

// 乘客 上車
module.exports.passengerGetCar = function(event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('passengerUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var ticketID = data.key;
            var driverUserID = data.val().driverUserID;
            var addressOn = data.val().addressOn;       // 上車資訊
            var address = addressOn.addresss;

            // 更新任務狀態為 乘車中
            firebase.database().ref('/ticket/'+ ticketID).update({"status": "乘車中"});

            // 更新 ticket
            var d = new Date();
            var current_datetime = d.toLocaleString();
            var content = `乘客上車`;
            var updates = {};
            updates['/ticket/' + ticketID + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
            firebase.database().ref().update(updates);

            // 乘客
            {
                // 回應乘客
                untils.passengerSetReplayMessage(event, "任務開始!!\n祝你有個愉快的旅程。\n\n下車時記得請司機輸入車資，使用LinePay付款。");

                // RichMenu 改成 行程中
                richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu3);
            }

            // 司機
            {
                // 回應司機
                var message = `任務開始!!\n乘客下車地點：${address}\n\n請注意行車安全，並記得乘客下車前輸入車資，請乘客使用LinePay付款。`;
                var echo = { type: 'text', text: message };
                driverClient.pushMessage(driverUserID, echo).catch(function(e){});

                // RichMenu 改成 行程中
                richMenus.linkRichMenuToDriver(driverUserID, config.driverConfig.richmenu5);
            }
        });
    });
}





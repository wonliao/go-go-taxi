
// module.exports.init = function (config, firebase, passengerClient, driverClient) {

//     this.config = config;
//     this.firebase = firebase;
//     this.passengerClient = passengerClient;
//     this.driverClient = driverClient;
// }


module.exports.replay2Echo = function (event, echo, echo2) {

    var userID = event.source.userId;

    passengerClient.pushMessage(userID, echo).then((response) => {

        passengerClient.replyMessage(event.replyToken, echo2).catch(function(e){});
        return;
    }).catch(function(e){});
}

// 選擇地點
module.exports.prepareShowLoacation = function (event) {

    var userID = event.source.userId;

    var echo = { type: 'text', text: "請選擇上下車地點" };

    var echo2 = {
      "type": "imagemap",
      "baseUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
      "altText": "This is an imagemap",
      "baseSize": {
        "width": 1040,
        "height": 132
      },
      "actions": [
        {
          "type": "message",
          "area": {
            "x": 17,
            "y": 12,
            "width": 326,
            "height": 108
          },
          "text": "選擇上車地點"
        },
        {
          "type": "uri",
          "area": {
            "x": 354,
            "y": 9,
            "width": 332,
            "height": 109
          },
          "linkUri": "line://nv/location"
        }
      ]
    }

    this.replay2Echo(event, echo, echo2);
}

// 選擇下車地點
module.exports.prepareSetDropOff = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).update({"Action": "SetDropOff"});

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "uri",
                    "label": "打開地圖",
                    "uri": "line://nv/location"
                }
            ],
            "text": "請選擇下車地點"
        }
    };
    return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 乘客
module.exports.passengerSetActionAndReplayMessage = function (event, action, message) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).update({"Action": action});

    var echo = { type: 'text', text: message };
    return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機
module.exports.driverSetActionAndReplayMessage = function (event, action, message) {

    var userID = event.source.userId;

    firebase.database().ref('/driver/'+ userID).update({"Action": action});

    var echo = { type: 'text', text: message };
    return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 乘客
module.exports.passengerPushEcho = function (userID, echo) {

    passengerClient.pushMessage(userID, echo).catch(function(e){});        
}

// 司機
module.exports.driverPushEcho = function (userID, echo) {

    driverClient.pushMessage(userID, echo).catch(function(e){});        
}

// 乘客
module.exports.passengerSetActionAndReplayEcho = function (event, action, echo) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).update({"Action": action});

    console.log("won test ==> event.replyToken("+event.replyToken+")");
    if(typeof(event.replyToken) === 'undefined') {

        passengerClient.pushMessage(userID, echo).catch(function(e){});
    } else {
        passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
    }
        
}

// 司機
module.exports.driverSetActionAndReplayEcho = function (event, action, echo) {

    var userID = event.source.userId;
    
    firebase.database().ref('/driver/'+ userID).update({"Action": action});
    return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機
module.exports.BroadcastReplayMessage = function (event, echo) {

    console.log("won test ==> BroadcastReplayMessage");
    var passengerID = event.source.userId;

    firebase.database().ref('/driver/').once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var driverID = data.key;
            if(driverID !== passengerID && data.val().loginStatus === true) {

                driverClient.pushMessage(driverID, echo).catch(function(e){});
            }
        });
    });
}

// 乘客
module.exports.passengerSetReplayMessage = function (event, message) {

    var userID = event.source.userId;

    var echo = { type: 'text', text: message };
    return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機
module.exports.driverSetReplayMessage = function (event, message) {

    var userID = event.source.userId;

    var echo = { type: 'text', text: message };
    return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機
module.exports.driverSetReplayEcho = function (event, echo) {

    var userID = event.source.userId;

    return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 乘客 打開乘車紀錄
module.exports.openLog = function (event) {

    var userID = event.source.userId;

    var logUrl = config.passengerConfig.logUrl + "?userID="+userID;
    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "uri",
                    "label": "打開乘車紀錄",
                    "uri": logUrl
                }
            ],
            "text": "目前乘車紀錄"
        }
    };

    return passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機 打開載客紀錄
module.exports.openDriverLog = function (event) {

    var userID = event.source.userId;

    var logUrl = config.driverConfig.logUrl + "?userID="+userID;
    var incomeUrl = config.driverConfig.incomeUrl + "?userID="+userID;

    // 本日
    var date = new Date();
    var today = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    // 本週
    var _sWeekDate = new Date();
    _sWeekDate.setDate(date.getDate() - date.getDay());
    var sWeek = _sWeekDate.getFullYear() + '-' + (_sWeekDate.getMonth() + 1) + '-' + _sWeekDate.getDate();

    var _eWeekDate = new Date();
    _eWeekDate.setDate(date.getDate() +  6 - date.getDay());
    var eWeek = _eWeekDate.getFullYear() + '-' + (_eWeekDate.getMonth() + 1) + '-' + _eWeekDate.getDate();

    // 本月
    var sMonth = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + '01';

    var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0);
    var eMonth = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + lastDayOfMonth.getDate();


    console.log("won test ==> sMonth("+sMonth+") eMonth("+eMonth+")");

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "uri",
                    "label": "打開載客紀錄",
                    "uri": logUrl
                },
                {
                    "type": "uri",
                    "label": "本日收入",
                    "uri": incomeUrl+"&sDate="+today+"&eDate="+today
                },
                {
                    "type": "uri",
                    "label": "本週收入",
                    "uri": incomeUrl+"&sDate="+sWeek+"&eDate="+eWeek
                },
                {
                    "type": "uri",
                    "label": "本月收入",
                    "uri": incomeUrl+"&sDate="+sMonth+"&eDate="+eMonth
                }
            ],
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "text": "載客紀錄"
        }
    };

    return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
}

// 司機 導航至上車地點
module.exports.navigateToPickUp = function (event) {

    //console.log("won test ==> navigateToPickUp");
    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var echo;
            if(data.hasChild("addressOn")) {

                var addressOn = data.val().addressOn;
                var addresss = addressOn.addresss;

                var uri = "https://www.google.com/maps/dir/?api=1&destination=" + addresss
                //console.log("won test ==> uri("+uri+")");

                echo = {
                    "type": "template",
                    "altText": "this is a buttons template",
                    "template": {
                        "type": "buttons",
                        "actions": [
                            {
                                "type": "uri",
                                "label": "打開導航",
                                "uri": uri
                            }
                        ],
                        "text": `乘客上車地點：${addresss}`
                    }
                };
            } else {

                echo = {
                    "type": "text",
                    "text": "乘客未輸入上車地址"
                };
            }

            return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
        });
    });
}

// 司機 導航至下車地點
module.exports.navigateToDropOff = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/ticket/').orderByChild('driverUserID').equalTo(userID).limitToLast(1).once("value", function(snapshot) {

        snapshot.forEach(function(data) {

            var echo;
            if(data.hasChild("addressOff")) {

                var addressOff = data.val().addressOff;
                var addresss = addressOff.addresss;

                if(addresss !== 'undefined' && addresss !== "") {

                    var uri = "https://www.google.com/maps/dir/?api=1&destination=" + addresss
                    //console.log("won test ==> addressOff("+addressOff+")");

                    echo = {
                        "type": "template",
                        "altText": "this is a buttons template",
                        "template": {
                            "type": "buttons",
                            "actions": [
                                {
                                    "type": "uri",
                                    "label": "打開導航",
                                    "uri": uri
                                }
                            ],
                            "text": `乘客下車地點：${addresss}`
                        }
                    };
                } else {

                    echo = {
                        "type": "text",
                        "text": "乘客未輸入下車地址"
                    };
                }
            } else {

                echo = {
                    "type": "text",
                    "text": "乘客未輸入下車地址"
                };
            }

            return driverClient.replyMessage(event.replyToken, echo).catch(function(e){});
        });
    });
}

module.exports.driverSetImageMap = function(event, message) {

    var userID = event.source.userId;

    var echo = { type: 'text', text: message };

    var echo2 = {
      "type": "imagemap",
      "baseUrl": "PROVIDE_URL_FROM_YOUR_SERVER",
      "altText": "This is an imagemap",
      "baseSize": {
        "width": 1040,
        "height": 138
      },
      "actions": [
        {
          "type": "message",
          "area": {
            "x": 12,
            "y": 15,
            "width": 330,
            "height": 107
          },
          "text": "導航至上車地點"
        },
        {
          "type": "message",
          "area": {
            "x": 359,
            "y": 15,
            "width": 327,
            "height": 110
          },
          "text": "聯絡乘客"
        },
        {
          "type": "message",
          "area": {
            "x": 702,
            "y": 14,
            "width": 328,
            "height": 111
          },
          "text": "取消載客"
        }
      ]
    };

    this.replay2Echo(event, echo, echo2);
}

module.exports.showDefaultMessage = function (event, passengerData) {

    var userID = event.source.userId;

    var name = passengerData.child("name").val();
    // console.log("won test showDefaultMessage ==> name("+name+")");

    var date = new Date();
    var nowTime = date.getFullYear() + '-' + ("0" + (date.getMonth()+1)).slice(-2)+ '-' + ("0" + date.getDate()).slice(-2) + 't' + ("0" + date.getHours()).slice(-2) + ':' + ("0" + date.getMinutes()).slice(-2);
  
    var date2 = new Date();
    date2.setDate(date.getDate()+3);    // 三天後
    var maxTime = date2.getFullYear() + '-' + ("0" + (date2.getMonth()+1)).slice(-2)+ '-' + ("0" + date2.getDate()).slice(-2) + 't' + ("0" + date2.getHours()).slice(-2) + ':' + ("0" + date2.getMinutes()).slice(-2);
    // console.log("won test ==> nowTime("+nowTime+") maxTime("+maxTime+")")

    var messages = {
      "type": "template",
      "altText": "this is a carousel template",
      "template": {
        "type": "carousel",
        "actions": [],
        "columns": [
          {
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "title": name + " 您好!",
            "text": "歡迎使用GoGoTaxi叫車服務\n請選擇以下的服務",
            "actions": [
                {
                    "type": "message",
                    "label": "常用地址叫車",
                    "text": "常用地址叫車"
                },
                {
                    "type": "uri",
                    "label": "即時叫車地圖",
                    "uri": config.passengerConfig.mapUrl + "?userID=" + userID + "&common=0&isSchedule=0"
                },
                {  
                   "type":"datetimepicker",
                   "label":"預約叫車",
                   "data":"storeId=12345",
                   "mode":"datetime",
                   "initial": nowTime, //"2018-08-25t00:00",
                   "max": maxTime, //"2018-09-01t23:59",
                   "min": nowTime //"2018-08-25t00:00"
                }
            ]
          },
          {
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "title": "設定",
            "text": "請選擇以下的服務",
            "actions": [
                {
                    "type": "message",
                    "label": "預約任務",
                    "text": "預約任務"
                },
                {
                    "type": "message",
                    "label": "設定常用地址",
                    "text": "設定常用地址"
                },
                {
                    "type": "message",
                    "label": "歷史行程",
                    "text": "歷史行程"
                }
            ]
          }
        ]
      }
    };
    
    // RichMenu 改成 功能選單
    richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);

    firebase.database().ref('/passenger/'+ userID).update({"Action": "none"});

    passengerClient.replyMessage(event.replyToken, messages);

    return Promise.resolve(null);
}

module.exports.showDriverDefaultMessage = function (event, driverData) {

    var userID = event.source.userId;

    var name = driverData.child("name").val();
    // console.log("won test showDriverDefaultMessage ==> name("+name+")");

    var loginStatusText = "";
    var loginStatusBtn = "";
    if(driverData.hasChild("loginStatus")) {

        if(driverData.val().loginStatus === true) {
            loginStatusText = "登入狀態：已登入";
            loginStatusBtn = "登出載客";
        } else {
            loginStatusText = "登入狀態：未登入";
            loginStatusBtn = "登入載客";
        }
    } else {
        loginStatusText += "登入狀態：未登入";
        loginStatusBtn = "登入載客";
    }

    var baseDataText = "";
    if(driverData.hasChild("carNo")) {
        baseDataText += "車號：" + driverData.val().carNo + "\n";
    } else {
        baseDataText += "車號：未設定"+ "\n";
    }

    if(driverData.hasChild("carType")) {
        baseDataText += "車型：" + driverData.val().carType + "\n";
    } else {
        baseDataText += "車型：：未設定"+ "\n";
    }

    if(driverData.hasChild("phone")) {
        baseDataText += "手機：" + driverData.val().phone;
    } else {
        baseDataText += "手機：未設定";
    }

    var messages = {
      "type": "template",
      "altText": "this is a carousel template",
      "template": {
        "type": "carousel",
        "actions": [],
        "columns": [
          {
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "title": name + " 您好!",
            "text": loginStatusText,// + "\n歡迎使用GoGoTaxi司機服務請選擇以下的服務",
            "actions": [
              {
                "type": "message",
                "label": loginStatusBtn,
                "text": loginStatusBtn
              },
              {
                "type": "message",
                "label": "預約任務",
                "text": "預約任務"
              }
            ]
          },
          {
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "title": "基本資料",
            "text": baseDataText,
            "actions": [
              {
                "type": "message",
                "label": "設定",
                "text": "設定"
              },
              {
                "type": "message",
                "label": "載客紀錄",
                "text": "載客紀錄"
              }
            ]
          }
        ]
      }
    };
    
    // RichMenu 改成 功能選單
    richMenus.linkRichMenuToDriver(userID, config.driverConfig.richmenu0);

    firebase.database().ref('/driver/'+ userID).update({"Action": "none"});

    driverClient.replyMessage(event.replyToken, messages);

    // return Promise.resolve(null);
}


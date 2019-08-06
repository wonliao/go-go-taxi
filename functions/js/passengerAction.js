
module.exports.handleEvent = function (event) {

    // this.startTime = process.hrtime();
    // console.log("won test ==> diff_time("+process.hrtime(this.startTime)+")");

    // console.dir(event);

    var userID = event.source.userId;

    if(userID === "Udeadbeefdeadbeefdeadbeefdeadbeef")  return Promise.resolve(null);

    // 訊息
    if (event.type === 'message') {

        // 文字
        if(event.message.type === 'text') {

        	return this.handleTextEvent(event);
        // 語音
        } else if(event.message.type === 'audio') {
   
            var isPassenger = true;
            return talks.handleAudio(event, isPassenger);
        }
    // 指令
    }  else if (event.type === 'postback') {

        // 處理 postback 指令相關
        return this.handlePostbackEvent(event);
    // 新加入
    } else if (event.type === 'follow') {

        return this.createPassenger(event);
    }

    return Promise.resolve(null);
}

// 乘客用指令
module.exports.handleTextEvent = function (event) {

    var userID = event.source.userId;
    var message = event.message.text;
    var self = this;

    console.log("won test handleTextEvent ==> message("+message+") userID("+userID+")");

    // 處理 Action
    firebase.database().ref('/passenger/'+ userID).once("value", snapshot => {

        // 乘客 Data
        self.passengerData = snapshot;

        if(message.indexOf("設定常用地址一") === 0) {
            
            return self.showSettingCommonAddressSubMenu(event, 1);
        } else if(message.indexOf("設定常用地址二") === 0) {

            return self.showSettingCommonAddressSubMenu(event, 2);
        } else if(message.indexOf("設定常用地址三") === 0) {

            return self.showSettingCommonAddressSubMenu(event, 3);
        } else if(message.indexOf("設定常用地址") === 0) {

            return self.showSettingCommonAddressMenu(event);
        } else if(message.indexOf("文字輸入常用地址一") === 0) {
            
            return self.prepareTextInputAddress(event, 1);
        } else if(message.indexOf("文字輸入常用地址二") === 0) {
        
            return self.prepareTextInputAddress(event, 2);
        } else if(message.indexOf("文字輸入常用地址三") === 0) {
        
            return self.prepareTextInputAddress(event, 3);
        } else if(message.indexOf("文字輸入上車地址") === 0) {
            
            return self.prepareTextInputAddress(event, 0);
        } else if(message.indexOf("常用地址叫車") === 0) {
            
            return self.showCommonAddressCallCarMenu(event);
        } else if(message.indexOf("常用地址一叫車") === 0) {
            
            return self.CallCarByAddress(event, 1);
        } else if(message.indexOf("常用地址二叫車") === 0) {
            
            return self.CallCarByAddress(event, 2);
        } else if(message.indexOf("常用地址三叫車") === 0) {
            
            return self.CallCarByAddress(event, 3);
        } else if(message.indexOf("歷史行程") === 0) {

            return untils.openLog(event);
        } else if(message.indexOf("重新叫車") === 0) {

            return callCars.callCar(event);
        } else if(message.indexOf("我的優惠") === 0) {

            return self.showCoupon(event);
        } else if(message.indexOf("預約任務") === 0) {

            return self.showSchedule(event);
        } else if(message.indexOf("開啟功能選單") === 0) {

            // 開啟功能選單
            return untils.showDefaultMessage(event, self.passengerData);


        } else {

            // 處理乘客儲存 Action 動作    
            return self.handleActionEvent(event);
        }
    });
}

// 處理乘客儲存 Action 動作 
module.exports.handleActionEvent = function (event) {

    var Action = this.passengerData.val().Action;
    console.log("won test ==>  Action("+Action+")");

    // 設定常用地址一
    if(Action === "設定常用地址一") {

        return this.SetAddress(event, 1);
    } else if(Action === "設定常用地址二") {

        return this.SetAddress(event, 2);
    } else if(Action === "設定常用地址三") {

        return this.SetAddress(event, 3);
    } else if(Action === "設定上車地點") {

        return this.SetAddress(event, 0);
    } else if(Action === "文字輸入常用地址一") {

        return this.TextInputAddress(event, 1);
    } else if(Action === "文字輸入常用地址二") {

        return this.TextInputAddress(event, 2);
    } else if(Action === "文字輸入常用地址三") {

        return this.TextInputAddress(event, 3);
    } else if(Action === "文字輸入上車地址") {

        return this.TextInputAddress(event, 0);
    } else if(Action === "CallCarByAddress") {

        return this.CallCarByAddress(event, 0);
    // 與司機交談
    } else if(Action === "TalkToDriver") {

        return talks.talkToDriver(event);
    } else {

        // 開啟功能選單
        return untils.showDefaultMessage(event, this.passengerData);
    }
}


module.exports.handlePostbackEvent = function (event) {

    var userID = event.source.userId;
    var self = this;

    var data = event.postback.data;
    // console.log(`won test postback data ==>`);
    // console.dir(data);

    var querystring = require('querystring');
    var dataString = querystring.parse(data);
    var action = dataString.action;
    var storeId = dataString.storeId;

    // console.dir(dataString);
    // console.log("won test parsedstring ==> parsedstring("+parsedstring+")");
    // console.log("won test handlePostbackEvent ==> action("+action+") storeId("+storeId+")");

    firebase.database().ref('/passenger/'+ userID).once("value", snapshot => {

        // 乘客 Data
        self.passengerData = snapshot;

        // 處理 Action
        if(typeof action !== "undefined") {

            if(action.indexOf("設定上車地點") === 0) {

                return self.SetAddress(event, 0);
            } else if(action.indexOf("設定常用地址一") === 0) {
                
                return self.SetAddress(event, 1);
            } else if(action.indexOf("設定常用地址二") === 0) {
                
                return self.SetAddress(event, 2);
            } else if(action.indexOf("設定常用地址三") === 0) {
                
                return self.SetAddress(event, 2);
            } else if(action.indexOf("確定叫車") === 0) {

                return callCars.prepareCallCar(event);
            } else if(action.indexOf("乘客上車") === 0) {

                callCars.passengerGetCar(event);
            } else if(action.indexOf("查看司機資料") === 0) {

                callCars.showDriverInfo(event);
            } else if(action.indexOf("取消叫車") === 0) {

                callCars.prepareCancelCar(event);
            } else if(action.indexOf("確認取消叫車") === 0) {

                callCars.cancelCar(event);
            } else if(action.indexOf("換一輛車") === 0) {

                callCars.cancelAndRecallCar(event);
            } else if(action.indexOf("聯絡司機") === 0) {

                talks.prepareTalkToDriver(event);
            } else if(action.indexOf("乘客語音對談") === 0) {

                talks.openPassengerWebRTC(event);
            } else if(action.indexOf("乘客關閉語音對談") === 0) {

                talks.passengerCancelTalk(event);
            } else if(action.indexOf("預約任務Detail") === 0) {

                self.showBookingDetail(event);
            }
        } else if(typeof action !== "storeId") {

            var params = event.postback.params;
            var datetime = params.datetime;
            // console.dir(params);
            console.log("won test  ==> datetime("+datetime+")");

            firebase.database().ref('/booking/').orderByChild('passengerUserID').equalTo(userID).once("value", function(snapshot) {

                if(snapshot.numChildren() > 0) {

                    var count = 0;
                    snapshot.forEach(function(data) {

                        var status = data.val().status;

                        if(typeof status === 'undefined')   status = "等車中";

                        if(status === "等車中") {

                            count++;
                        }
                    });

                    console.log("won test ==> count("+count+")");

                    if(count < 4) {

                        var d = new Date(datetime);
                        d.setHours(d.getHours() - 8);
                        datetime = d.toLocaleString();

                        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'bookingTime': datetime});

                        var date = new Date(datetime);
                        // date.setHours(date.getHours() - 8);
                        var dateString = "";
                        dateString += "日期：" + date.getFullYear() + '/' + ("0" + (date.getMonth()+1)).slice(-2)+ '/' + ("0" + date.getDate()).slice(-2) + '\n';
                        dateString += "時間：" + date.getHours() + ':' + date.getMinutes();
                    
                        self.showScheduleAddressCallCarMenu(event, dateString);
                    } else {

                        var echo = { "type": "text", "text": "同時只能有最多4個預約任務，目前無法再預約叫車。" };
                        passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
                    }
                }
            });
        }
    });
}

/***************************************************************************/
/***************************************************************************/
/***************************************************************************/


// 創建帳號
module.exports.createPassenger = function (event) {

    var userID = event.source.userId;

    return passengerClient.getProfile(userID).then((profile) => {

        var data = {
            "name": profile.displayName, 
            "pictureUrl": profile.pictureUrl,
            "Action": "建立帳號0"
        };
        firebase.database().ref('/passenger/'+ userID).update(data);

        // RichMenu 改成 功能選單
        richMenus.linkRichMenuToPassenger(userID, "");//config.passengerConfig.richmenu0);


        var counter = 1;
        var j = schedule.scheduleJob('*/2 * * * * *', function(){
            
            console.log('定时器触发次数：' + counter);
            counter++;

            intro.createPassengerAccount(event);
        });


        setTimeout(function() {

            console.log('定时器取消 ==>' + counter);
            j.cancel();   
        }, 18000);



        // var echo = { type: 'text', text: "歡迎加入" };
        // return passengerClient.replyMessage(event.replyToken, echo);
    });
}

// 常用地址叫車 Menu
module.exports.showCommonAddressCallCarMenu = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID + '/TempAddress/bookingTime').remove();

    var shortAddress1 = this.passengerData.child("CommonAddress1/shortAddress").val();
    var shortAddress2 = this.passengerData.child("CommonAddress2/shortAddress").val();
    var shortAddress3 = this.passengerData.child("CommonAddress3/shortAddress").val();
    // console.log("won test ==> shortAddress1("+shortAddress1+") shortAddress2("+shortAddress2+") shortAddress3("+shortAddress3+")");

    var label1 = "設定常用地址一";
    var text1 = label1;
    if(shortAddress1 !== null) {
        label1 = shortAddress1;
        text1 = "常用地址一叫車";
    } 
    
    var label2 = "設定常用地址二";
    var text2 = label2;
    if(shortAddress2 !== null) {
        label2 = shortAddress2;
        text2 = "常用地址二叫車";
    }
    
    var label3 = "設定常用地址三";
    var text3 = label3;
    if(shortAddress3 !== null) {
        label3 = shortAddress3;
        text3 = "常用地址三叫車";
    }

    var messages = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
        "type": "buttons",
        "actions": [
          {
            "type": "message",
            "label": label1,
            "text": text1
          },
          {
            "type": "message",
            "label": label2,
            "text": text2
          },
          {
            "type": "message",
            "label": label3,
            "text": text3
          },
          {
            "type": "message",
            "label": "歷史行程",
            "text": "歷史行程"
          }
        ],
        "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
        "title": "請輸入您的上車地點",
        "text": "選擇常用地址，或使用文字輸入及分享位置的功能輸入地址"
      }
    };
    return passengerClient.replyMessage(event.replyToken, messages);
}

// 常用地址叫車 Menu
module.exports.showScheduleAddressCallCarMenu = function (event, dateString) {

    var userID = event.source.userId;

    var shortAddress1 = this.passengerData.child("CommonAddress1/shortAddress").val();
    var shortAddress2 = this.passengerData.child("CommonAddress2/shortAddress").val();
    var shortAddress3 = this.passengerData.child("CommonAddress3/shortAddress").val();
    // console.log("won test ==> shortAddress1("+shortAddress1+") shortAddress2("+shortAddress2+") shortAddress3("+shortAddress3+")");

    var label1 = "設定常用地址一";
    var text1 = label1;
    if(shortAddress1 !== null) {
        label1 = shortAddress1;
        text1 = "常用地址一叫車";
    } 
    
    var label2 = "設定常用地址二";
    var text2 = label2;
    if(shortAddress2 !== null) {
        label2 = shortAddress2;
        text2 = "常用地址二叫車";
    }
    
    var label3 = "設定常用地址三";
    var text3 = label3;
    if(shortAddress3 !== null) {
        label3 = shortAddress3;
        text3 = "常用地址三叫車";
    }

    var messages = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
        "type": "buttons",
        "actions": [
            {
                "type": "message",
                "label": label1,
                "text": text1
            },
            {
                "type": "message",
                "label": label2,
                "text": text2
            },
            {
                "type": "message",
                "label": label3,
                "text": text3
            },
            {
                "type": "uri",
                "label": "叫車地圖",
                "uri": config.passengerConfig.mapUrl + "?userID=" + userID + "&common=0&isSchedule=1"
            }
        ],
        "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
        "title": "預約叫車，請輸入您的上車地點",
        "text": dateString //"選擇常用地址，或使用文字輸入及分享位置的功能輸入地址"
      }
    };
    return passengerClient.replyMessage(event.replyToken, messages);
}

// 設定常用地址一、二、三
module.exports.showSettingCommonAddressSubMenu = function (event, index) {

    var userID = event.source.userId;

    var indexText = "";
    if(index === 1)       indexText = "一";
    else if(index === 2)  indexText = "二";
    else if(index === 3)  indexText = "三";

    var messages = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
        "type": "buttons",
        "actions": [
          {
            "type": "uri",
            "label": "即時叫車地圖",
            "uri": config.passengerConfig.mapUrl + "?userID=" + userID + "&common=" + index + "&isSchedule=0"
          },
          {
            "type": "message",
            "label": "文字輸入",
            "text": "文字輸入常用地址" + indexText
          },
          {
            "type": "message",
            "label": "取消",
            "text": "取消"
          }
        ],
        "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
        "title": "請輸入常用地址" + indexText,
        "text": "使用文字輸入或開啟即時叫車地圖的功能輸入地址"
      }
    };
    return passengerClient.replyMessage(event.replyToken, messages);
}

module.exports.SetAddress = function (event, common) {

    var userID = event.source.userId;

    var message = event.message.text;
    if(message === "取消") {
        
        firebase.database().ref('/passenger/'+ userID + '/TempAddress/bookingTime').remove();
        return untils.showDefaultMessage(event, this.passengerData);
    }

    var addresss = this.passengerData.child("TempAddress/addresss").val();
    var shortAddress = this.passengerData.child("TempAddress/shortAddress").val();
    var latitude = this.passengerData.child("TempAddress/latitude").val();
    var longitude = this.passengerData.child("TempAddress/longitude").val();

    var bookingTime = "";
    if(this.passengerData.hasChild("TempAddress/bookingTime")) {
        bookingTime = this.passengerData.child("TempAddress/bookingTime").val();
    }

    console.log("won test SetAddress ==> addresss("+addresss+")");
    if(addresss !== null && shortAddress !== null && latitude !== null && longitude !== null) {

        var AddressOn = {
            'title':    "上車地點",
            'addresss': addresss,
            'shortAddress': shortAddress,
            'latitude': latitude,
            'longitude': longitude,
            'bookingTime': bookingTime
        }

        // 上車地址
        if(common === 0) {

            firebase.database().ref('/passenger/'+ userID).update({'addressOn': AddressOn});
        // 常用地址一
        } else if(common === 1) {

            firebase.database().ref('/passenger/'+ userID).update({'CommonAddress1': AddressOn});
        // 常用地址二
        } else if(common === 2) {

            firebase.database().ref('/passenger/'+ userID).update({'CommonAddress2': AddressOn});
        // 常用地址三
        } else if(common === 3) {

            firebase.database().ref('/passenger/'+ userID).update({'CommonAddress3': AddressOn});
        }

        firebase.database().ref('/passenger/'+ userID).update({"Action": "none"});


        // 即時叫車地圖
        if(common === 0) {

            callCars.callCar(event);
        } else {

            var echo = { type: 'text', text: "設定成功" };
            passengerClient.pushMessage(userID, echo)

            return untils.showDefaultMessage(event, this.passengerData);
        }
	}
}

// 設定常用地址
module.exports.showSettingCommonAddressMenu = function (event) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).once("value", function(snapshot) {

        var label1 = "設定常用地址一";
        if(snapshot.hasChild("CommonAddress1")) label1 = snapshot.val().CommonAddress1.shortAddress;
        
        var label2 = "設定常用地址二";
        if(snapshot.hasChild("CommonAddress2")) label2 = snapshot.val().CommonAddress2.shortAddress;
        
        var label3 = "設定常用地址三";
        if(snapshot.hasChild("CommonAddress3")) label3 = snapshot.val().CommonAddress3.shortAddress;
 
        var echo = {
          "type": "template",
          "altText": "this is a buttons template",
          "template": {
            "type": "buttons",
            "actions": [
              {
                "type": "message",
                "label": label1,
                "text": "設定常用地址一"
              },
              {
                "type": "message",
                "label": label2,
                "text": "設定常用地址二"
              },
              {
                "type": "message",
                "label": label3,
                "text": "設定常用地址三"
              },
              {
                "type": "message",
                "label": "回主目錄",
                "text": "回主目錄"
              }
            ],
            "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
            "title": "設定常用地址",
            "text": "請選擇以下項目"
          }
        };
        untils.passengerSetActionAndReplayEcho(event, "none", echo);
    });
}

// 設定常用地址一、二、三
module.exports.showSettingCommonAddressSubMenu = function (event, index) {

    var userID = event.source.userId;

    var indexText = "";
    if(index === 1)       indexText = "一";
    else if(index === 2)  indexText = "二";
    else if(index === 3)  indexText = "三";

    var echo = {
      "type": "template",
      "altText": "this is a buttons template",
      "template": {
        "type": "buttons",
        "actions": [
          {
            "type": "uri",
            "label": "即時叫車地圖",
            "uri": config.passengerConfig.mapUrl + "?userID=" + userID + "&common=" + index + "&isSchedule=0"
          },
          {
            "type": "message",
            "label": "文字輸入",
            "text": "文字輸入常用地址" + indexText
          },
          {
            "type": "message",
            "label": "取消",
            "text": "取消"
          }
        ],
        "thumbnailImageUrl": "http://pngimg.com/uploads/taxi/taxi_PNG19.png",
        "title": "請輸入常用地址" + indexText,
        "text": "使用文字輸入或開啟即時叫車地圖的功能輸入地址"
      }
    };

    untils.passengerSetActionAndReplayEcho(event, "none", echo);
}

// 乘客 設定姓名
module.exports.setName = function (event) {

    var userID = event.source.userId;

    var untils = this.untils;
    var firebase = this.firebase;

    firebase.database().ref('/passenger/'+ userID).update({"name": event.message.text});

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "postback",
                    "label": "繼續",
                    "data":"action=選單",
                }
            ],
            "text": `已將你的姓名設定為：\n${event.message.text}`
        }
    };

    untils.passengerSetActionAndReplayEcho(event, "none", echo);
}

// 乘客 設定手機號碼
module.exports.setPhone = function (event) {

    var userID = event.source.userId;

    var untils = this.untils;
    var firebase = this.firebase;

    firebase.database().ref('/passenger/'+ userID).update({"phone": event.message.text});

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "postback",
                    "label": "繼續",
                    "data":"action=選單",
                }
            ],
            "text": `已將你的手機號碼設定為：\n${event.message.text}`
        }
    };

    untils.passengerSetActionAndReplayEcho(event, "none", echo);
}

// 乘客 設定E-Mail
module.exports.setEmail = function (event) {

    var userID = event.source.userId;

    var untils = this.untils;
    var firebase = this.firebase;

    firebase.database().ref('/passenger/'+ userID).update({"email": event.message.text});

    var echo = {
        "type": "template",
        "altText": "this is a buttons template",
        "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "postback",
                    "label": "繼續",
                    "data":"action=選單",
                }
            ],
            "text": `已將你的E-Mail設定為：\n${event.message.text}`
        }
    };

    untils.passengerSetActionAndReplayEcho(event, "none", echo);
}

module.exports.updateProfile = function (event, profile) {

    var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).update({"name": profile.displayName});
    firebase.database().ref('/passenger/'+ userID).update({"pictureUrl": profile.pictureUrl});
}

// 準備文字輸入
module.exports.prepareTextInputAddress = function (event, index) {

    var userID = event.source.userId;
    var common = index;

    var Action = "";
    if(common === 0) {

        Action = "文字輸入上車地址";
    // 常用地址一
    } else if(common === 1) {

        Action = "文字輸入常用地址一";
    // 常用地址二
    } else if(common === 2) {

        Action = "文字輸入常用地址二";
    // 常用地址三
    } else if(common === 3) {

        Action = "文字輸入常用地址三";
    }
    untils.passengerSetActionAndReplayMessage(event, Action, "請輸入您要設定的地址。\n例：台北市中山區長安東路二段162號");
}


module.exports.TextInputAddress = function (event, index) {

    var userID = event.source.userId;
    var common = index;
    // console.log("won test ==> common("+common+")");

    var address = event.message.text; //"台北市中山區長安東路二段162號";

    var options = { 
        method: 'GET',
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        qs: { 
            address: address,
            language: "zh-TW",
            key: 'AIzaSyCTUH0mRUru3xXuYSwoydKoOh_uO-AGPYA' 
        } 
    };
    
    request(options, function (error, response, body) {
    
        // if (error) throw new Error(error);
        // console.log(body);

        var data = JSON.parse(body);
        if(data.results.length <= 0)    return;
        
    
        var formatted_address = data.results[0].formatted_address;

        var latitude = data.results[0].geometry.location.lat;
        var longitude = data.results[0].geometry.location.lng;
        // console.log("won test ==> latitude("+latitude+") longitude("+longitude+")");

        var street_number = "";
        var route = "";
        for(var key in data.results[0].address_components) {

            var component = data.results[0].address_components[key];
            // console.dir(component);
            if(component.types[0] === "street_number")    street_number = component.long_name;
            if(component.types[0] === "route")            route = component.long_name;
        }
        var short_address = route + street_number + "號";
        // console.log("won test ==> short_address("+short_address+")");

        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'title': "上車地點"});
        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'addresss': formatted_address});
        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'shortAddress': short_address});
        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'latitude': latitude});
        firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'longitude': longitude});
        
        var title = "";
        if(common === 0) {
            
            title = "設定上車地點";
        } else if(common === 1) {
            
            title = "設定常用地址一";
        } else if(common === 2) {
            
            title = "設定常用地址二";
        } else if(common === 3) {

            title = "設定常用地址三";
        }
        // console.log("won test ==> title("+title+")");

        firebase.database().ref('/passenger/'+ userID).update({"Action": title});

        var url = "https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=300x200&maptype=roadmap&key=AIzaSyCTUH0mRUru3xXuYSwoydKoOh_uO-AGPYA";
        url += `&center=${latitude},${longitude}&markers=${latitude},${longitude}`;
        // console.log("won test ==> url("+url+")");
        var echo = {
          "type": "template",
          "altText": "this is a buttons template",
          "template": {
            "type": "buttons",
            "actions": [
                {
                    "type": "postback",
                    "label": "設定",
                    "data": "action="+title
                },
                {
                    "type": "message",
                    "label": "重新輸入",
                    "text": "文字輸入常用地址一"
                }
            ],
            "thumbnailImageUrl": url,
            "title": title,
            "text": "這裡完整的地址為：" + formatted_address
          }
        };
        passengerClient.pushMessage(userID, echo).catch(function(e){});
    });
}

module.exports.CallCarByAddress = function (event, index) {

    var userID = event.source.userId;
    var common = index;

    var query = "";
    if(common === 1) {
        
        query = "CommonAddress1";
    } else if(common === 2) {
        
        query = "CommonAddress2";
    } else if(common === 3) {

        query = "CommonAddress3";
    }

    firebase.database().ref('/passenger/'+ userID + '/' + query).once("value", function(snapshot) {

        if(snapshot.hasChild("addresss")) {

            var addresss = snapshot.val().addresss;
            var shortAddress = snapshot.val().shortAddress;
            var latitude = snapshot.val().latitude;
            var longitude = snapshot.val().longitude;

            // var AddressOn = {
            //     'title':    "上車地點",
            //     'addresss': addresss,
            //     'shortAddress': shortAddress,
            //     'latitude': latitude,
            //     'longitude': longitude
            // }
            // firebase.database().ref('/passenger/'+ userID).update({'TempAddress': AddressOn});
            firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'title': "上車地點"});
            firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'addresss': addresss});
            firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'shortAddress': shortAddress});
            firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'latitude': latitude});
            firebase.database().ref('/passenger/'+ userID + '/TempAddress').update({'longitude': longitude});

            var url = "https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=300x200&maptype=roadmap&key=AIzaSyCTUH0mRUru3xXuYSwoydKoOh_uO-AGPYA";
            url += `&center=${latitude},${longitude}&markers=${latitude},${longitude}`;
            // console.log("won test ==> url("+url+")");
            var echo = {
                "type": "template",
                "altText": "this is a buttons template",
                "template": {
                    "type": "buttons",
                    "actions": [
                        {
                            "type": "postback",
                            "label": "確定叫車",
                            "data": "action=確定叫車"
                        },
                        {
                            "type": "message",
                            "label": "取消",
                            "text": "取消"
                        }
                    ],
                    "thumbnailImageUrl": url,
                    "title": "上車地點",
                    "text": "這裡完整的地址為：" + addresss
                }
            }
            untils.passengerSetActionAndReplayEcho(event, "設定上車地點", echo);
        }
    });
}

// 我的優惠
module.exports.showCoupon = function (event, index) {

    var echo = { type: 'text', text: "「我的優惠」即將開放!" };
    return passengerClient.replyMessage(event.replyToken, echo);
}

// 預約叫車
module.exports.showSchedule = function (event, index) {

    var userID = event.source.userId;

    firebase.database().ref('/booking/').orderByChild('passengerUserID').equalTo(userID).once("value", function(snapshot) {

        if(snapshot.numChildren() > 0) {

            var count = 0;
            var actions = [];
            snapshot.forEach(function(data) {

                var ticketId = data.key;
                var passengerUserID = data.val().passengerUserID;
                var driverUserID = data.val().driverUserID;
                var bookingTime = data.val().bookingTime;
                var status = data.val().status;
                var timeString = bookingTime.split(" ");

                if(typeof status === 'undefined')   status = "等車中";

                if(status === "等車中" && count < 4) {

                    var action = {
                        "type": "postback",
                        "label": timeString[0],
                        "data": "action=預約任務Detail&ticketId=" + ticketId
                    };
                    actions.push(action);

                    count++;
                } 
                // else {

                //     var action = {
                //         "type": "postback",
                //         "label": timeString[0] + " ("+status+")",
                //         "data": "action=預約任務Detail&ticketId=" + ticketId
                //     };
                //     actions.push(action);
                // }
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
            passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
        } else {

            var echo = { "type": "text", "text": "目前沒有預約任務" };
            passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
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
        
        var driverUserID = snapshot.val().driverUserID;

        firebase.database().ref('/driver/' + driverUserID).once("value", function(snapshot2) {

            var phone = snapshot2.val().phone;

            var actions = [];
            if(snapshot.val().status === "等車中") {

                var action1 = {
                    // "type": "postback",
                    // "label": "聯絡司機 -" + snapshot.val().driverName ,
                    // "data": "action=聯絡司機&ticketId=" + ticketId
                    "type": "uri",
                    "label": "聯絡司機 -" + snapshot.val().driverName ,
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
            passengerClient.replyMessage(event.replyToken, echo).catch(function(e){});
        });
    });
}


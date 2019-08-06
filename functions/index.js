'use strict';

global.isRelease = false;
if(isRelease === true) {
    global.config = require("./js/releaseConfig");
} else {
    global.config = require("./js/debugConfig");
}


const line = require('@line/bot-sdk');
const functions = require('firebase-functions');
global.request = require("request");



global.passengerClient = new line.Client(config.passengerConfig);
global.driverClient = new line.Client(config.driverConfig);


// Firebase 初始化
global.firebase = require("firebase");
const firebaseConfig = require("./js/firebaseConfig");
firebase.initializeApp(firebaseConfig);


global.getDuration = require('get-audio-duration');

global.schedule = require('node-schedule');




/***************************************************************************/
/***************************************************************************/
/***************************************************************************/


// RichMenu
global.richMenus = require("./js/richMenus");

// 工具類
global.untils = require("./js/untils");

// 對話類
global.talks = require("./js/talks");

// 叫車類
global.callCars = require("./js/callCars");

//
global.intro = require("./js/intro");


/***************************************************************************/
/***************************************************************************/
/***************************************************************************/

// 接收來自 乘客LINE 的訊息
exports.PassengerLineAPI = functions.https.onRequest((req, res) => {

    req.body.events.map(handlePassengerEvent);
    res.status(200).end();
});

// 接收來自 司機LINE 的訊息
exports.DriverLineAPI = functions.https.onRequest((req, res) => {

    req.body.events.map(handleDriverEvent);
    res.status(200).end();
});

// 乘客 event handler
function handlePassengerEvent(event) {

    const passengerAction = require("./js/passengerAction");
    return passengerAction.handleEvent(event);
}

// 司機 event handler
function handleDriverEvent(event) {

    const driverAction = require("./js/driverAction");
    return driverAction.handleEvent(event);
}


/***************************************************************************/
/***************************************************************************/
/***************************************************************************/

// // 接收來自 即時叫車地圖 的上車地點
const express = require('express');
const cors = require('cors')({origin: true});

const app = express();
app.use(cors);
app.post('/', (req, res) => {

    var userId = req.body.userID;
    var address = req.body.address;
    var common = req.body.common;

    console.log("won test ==> userId("+userId+") common("+common+") address("+address+")");
    
    var self = this;

    // firebase.database().ref('/passenger/'+ userId + '/TempAddress').once("value", function(snapshot) {
    firebase.database().ref('/passenger/'+ userId + '/TempAddress').once("value", snapshot => {

        if(snapshot.hasChild("addresss")) {

            var addresss = snapshot.val().addresss;
            var latitude = snapshot.val().latitude;
            var longitude = snapshot.val().longitude;

            var title = "";
            if(common === "0") {
                
                title = "上車地點";
            } else if(common === "1") {
                
                title = "常用地址一";
            } else if(common === "2") {
                
                title = "常用地址二";
            } else if(common === "3") {

                title = "常用地址三";
            }
            
            firebase.database().ref('/passenger/'+ userId).update({"Action": "設定" + title});

            var url = "https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=300x200&maptype=roadmap&key=AIzaSyCTUH0mRUru3xXuYSwoydKoOh_uO-AGPYA";
            url += `&center=${latitude},${longitude}&markers=${latitude},${longitude}`;
            console.log("won test ==> url("+url+")");
            var echo = {
              "type": "template",
              "altText": "this is a buttons template",
              "template": {
                "type": "buttons",
                "actions": [
                  {
                    "type": "message",
                    "label": "確定叫車",
                    "text": "確定叫車"
                  },
                  {
                    "type": "message",
                    "label": "重新輸入",
                    "text": "重新輸入"
                  }
                ],
                "thumbnailImageUrl": url,
                "title": title,
                "text": "這裡完整的地址為：" + addresss
              }
            };
            passengerClient.pushMessage(userId, echo);//.catch(function(e){console.log(e);});

        }

        res.status(200).end();
        return;
    });
});
exports.MapAPI = functions.https.onRequest(app);




/***************************************************************************/
/***************************************************************************/
/***************************************************************************/

// 接收來自 LINE Pay
const uuid = require("uuid/v4");
const session = require("express-session");
const line_pay = require("line-pay");

const pay = new line_pay({
    channelId: config.linePay.channelID,
    channelSecret: config.linePay.channelSecret,
    isSandbox: true
});

const app2 = express();
app2.use(cors);
app2.use(session({
   secret: config.linePay.channelSecret,
   resave: false,
   saveUninitialized: false
}));

var payConfig = {};
app2.use("/pay", (req, res, next) => {

    // console.dir(req.query);
    if (req.query.passengerId) req.session.passengerId = req.query.passengerId;
    if (req.query.driverId) req.session.driverId = req.query.driverId;
    if (req.query.ticketId) req.session.ticketId = req.query.ticketId;
    if (req.query.orderId) req.session.orderId = req.query.orderId;
    if (req.query.amount) req.session.amount = req.query.amount;
    
    console.log("won test line pay 1 ==> passengerId("+req.session.passengerId+") driverId("+req.session.driverId+") ticketId("+req.session.ticketId+") orderId("+req.session.orderId+") amount("+req.session.amount+")");

    payConfig.productName = "GoGoTaxi 車資";
    payConfig.amount = req.session.amount;
    payConfig.currency = "TWD";
    payConfig.confirmUrl = config.linePay.confirmURL;
    payConfig.orderId = req.session.orderId; //uuid();

    next();
}, pay.middleware(payConfig), (req, res, next) => {

    console.log("won test line pay 2 ==> passengerId("+req.session.passengerId+") driverId("+req.session.driverId+") orderId("+req.session.orderId+") amount("+req.session.amount+")");

    var passengerId = req.session.passengerId;
    var driverId = req.session.driverId;
    var orderId = req.session.orderId;
    var ticketId = req.session.ticketId;
    var amount = req.session.amount;

    // 付款金額
    console.log("won test ==> ticketId("+ticketId+")");
    firebase.database().ref('/ticket/'+ ticketId).update({"charge": amount});

    // 更新 ticket
    var d = new Date();
    var current_datetime = d.toLocaleString();
    var content = `乘客支付車資${amount}元`;
    var updates = {};
    updates['/ticket/' + ticketId + '/' + d] = {who: 'passenger', content: content, reply_date: current_datetime};
    firebase.database().ref().update(updates);

    // 新增 income
    var updates2 = {};
    updates2['/income/' + driverId + '/' + ticketId] = {charge: amount,  passengerUserID: passengerId, pay_date: current_datetime};
    firebase.database().ref().update(updates2);

    // 司機
    {
        var echo = {
           type: "text",
           text: "乘客付款完成\n\n支付方式：LINE Pay\n\n車資總金額：" + amount + "元"
        };
        driverClient.pushMessage(driverId, echo);
        callCars.finishMissionByDriverID(driverId);
    }

    // 乘客
    {
        var echo2 = {
           type: "text",
           text: "付款完成\n\n支付方式：LINE Pay\n\n車資總金額：" + amount + "元"
        };
        passengerClient.pushMessage(passengerId, echo2).then((response => {

            res.redirect("line://oaMessage/"+config.passengerConfig.officialID+"/?");
            return
        })).catch((exception) => {

           res.status(500).send("Failed to execute payment.");
           return;
        });
    }
});
exports.LinePayAPI = functions.https.onRequest(app2);




// const app3 = express();
// app3.use(cors);
// app3.get('/', (req, res) => {

//     var counter = 1;
//     var j = schedule.scheduleJob('* * * * * *', function(){
        
//         // console.log('定时器触发次数：' + counter);
//         counter++;
//     });

    
//     setTimeout(function() {

//         console.log('定时器取消 ==>' + counter);
//         j.cancel();   
//     }, 20000);

//     res.status(200).end();
// });
// exports.ScheduleAPI = functions.https.onRequest(app3);


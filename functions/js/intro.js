
module.exports.createPassengerAccount = function (event) {

	var userID = event.source.userId;

    firebase.database().ref('/passenger/'+ userID).once("value", function(snapshot) {

    	var echo = "";
    	var nextAction = "";

    	var Action = snapshot.val().Action;
    	if(Action === "建立帳號0") {
    		echo = {type: "text", text: "您好，歡迎來到 Go Go Taxi"};
    		nextAction = "建立帳號1";
    	} else if(Action === "建立帳號1") {
    		echo = {type: "text", text: "Go Go Taxi, 尖端科技的結晶, 是一個人性化的萬能叫車服務."};
    		nextAction = "建立帳號2";
    	} else if(Action === "建立帳號2") {
    		echo = {type: "text", text: "出現在我們這個無奇不有的世界上, 隨Call隨到, 無所不能."};
    		nextAction = "建立帳號3";
    	} else if(Action === "建立帳號3") {
    		echo = {type: "text", text: "Go Go Taxi司機, 個個都是盡職守法的好駕駛."};
    		nextAction = "建立帳號4";
    	} else if(Action === "建立帳號4") {
    		echo = {type: "text", text: "他們以無比的熱情, 專業的服務, 平安載送乘客至目的地."};
    		nextAction = "建立帳號5";
    	} else if(Action === "建立帳號5") {

			echo = {type: "text", text: "請點擊下方『功能選單』開始使用 Go Go Taxi 叫車服務!"};
    		nextAction = "none";

    		// RichMenu 改成 功能選單
    		richMenus.linkRichMenuToPassenger(userID, config.passengerConfig.richmenu0);
    	}

    	console.log("won test ==> nextAction("+nextAction+")");
        if(nextAction !== "") {

        	firebase.database().ref('/passenger/'+ userID).update({"Action": nextAction});

	    	untils.passengerPushEcho(userID, echo);
        }
    });
}
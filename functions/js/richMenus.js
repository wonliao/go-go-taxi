
module.exports.linkRichMenuToPassenger = function(userID, richmenuID) {

    var url;
    var options;

    // RichMenu 改成 預設
    if(richmenuID === "") {

        url = 'https://api.line.me/v2/bot/user/' + userID + '/richmenu';
        options = {
            'method': 'DELETE',
            'url': url,
            'headers': {
                'authorization': "Bearer " + config.passengerConfig.channelAccessToken
            }
        };
        request(options);
    } else {

        url = 'https://api.line.me/v2/bot/user/' + userID + '/richmenu/' + richmenuID;
        options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'authorization': "Bearer " + config.passengerConfig.channelAccessToken
            }
        };
        request(options);
    }
}

module.exports.linkRichMenuToDriver = function(userID, richmenuID) {

    var url;
    var options;

    // RichMenu 改成 預設
    if(richmenuID === "") {

        url = 'https://api.line.me/v2/bot/user/' + userID + '/richmenu';
        //console.log("won test DELETE RichMenu url ==>" + url);
        options = {
            'method': 'DELETE',
            'url': url,
            'headers': {
                'authorization': "Bearer " + config.driverConfig.channelAccessToken
            }
        };
        request(options, function (error, response, body) {});
    } else {

        url = 'https://api.line.me/v2/bot/user/' + userID + '/richmenu/' + richmenuID;
        //console.log("won test POST RichMenu url ==>" + url);
        options = {
            'method': 'POST',
            'url': url,
            'headers': {
                'authorization': "Bearer " + config.driverConfig.channelAccessToken
            }
        };
        request(options, function (error, response, body) {});
    }
}



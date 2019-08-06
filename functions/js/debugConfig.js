
// create LINE SDK config from env variables
module.exports.passengerConfig = {
    officialID: "@xxxxxxxxxxx",
    channelAccessToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    channelSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    mapUrl: "line://app/xxxxxxxxxx-xxxxxxxx",
    logUrl: "line://app/xxxxxxxxxx-xxxxxxxx",
    webRtcUrl: "https://xxx.xxx.xxx",
    richmenu0: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 功能選單
    richmenu1: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 搜車中
    richmenu2: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 叫車成功
    richmenu3: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 行程中
    richmenu4: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機前往中
    richmenu5: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機行程中
    richmenu6: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 乘客語音對談
    richmenu7: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機語音對談
}

module.exports.driverConfig = {
    officialID: "@xxxxxxxxxxx",
    channelAccessToken: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    channelSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    mapUrl: "line://app/xxxxxxxxxx-xxxxxxxx"
    logUrl: "line://app/xxxxxxxxxx-xxxxxxxx",
    incomeUrl: "line://app/xxxxxxxxxx-xxxxxxxx",
    webRtcUrl: "https://xxx.xxx.xxx",
    richmenu0: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 功能選單
    richmenu1: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 搜車中
    richmenu2: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 叫車成功
    richmenu3: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 行程中
    richmenu4: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機前往中
    richmenu5: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機行程中
    richmenu6: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 乘客語音對談
    richmenu7: "richmenu-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",     // 司機語音對談
}

module.exports.linePay = {
    channelID: "xxxxxxxxxxx",
    channelSecret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    linePayUrl: "line://app/xxxxxxxxxx-xxxxxxxx",
    confirmURL: "https://xxx.xxx.xxx",
}
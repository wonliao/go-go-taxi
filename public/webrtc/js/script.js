//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
   apiKey: "AIzaSyC0CpPdeAVRcdQl3HH3k2rwuwVUOCr1I3M",
    authDomain: "line-taxi-60d32.firebaseapp.com",
    databaseURL: "https://line-taxi-60d32.firebaseio.com",
    projectId: "line-taxi-60d32",
    storageBucket: "line-taxi-60d32.appspot.com",
    messagingSenderId: "548974371886"
};
firebase.initializeApp(config);


//var ticketID = "1528209948538";
var ticketID = getParameterByName('ticketID');
//console.log("ticketID("+ticketID+")");


var database = firebase.database().ref('ticket/' + ticketID);
var yourVideo = document.getElementById("yourVideo");
var friendsVideo = document.getElementById("friendsVideo");

var yourId = Math.floor(Math.random()*1000000000);
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
// var servers = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'stun:stun1.l.google.com:19302'}, {'urls': 'stun:stun2.l.google.com:19302'}, {'urls': 'stun:stun3.l.google.com:19302'}, {'urls': 'stun:stun4.l.google.com:19302'}]};
var servers = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'a11111111','username': 'wonliao1117@gmail.com'}]};
//var servers = {iceServers: [{urls: 'stun:stun.services.mozilla.com'}, {urls: 'stun:stun.l.google.com:19302'},  {urls: "turn:numb.viagenie.ca", username: "wonliao1117@gmail.com", "credential": "a11111111"}]};


var pc = new RTCPeerConnection(servers);

pc.onicecandidate  = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );

pc.onaddstream = (event => friendsVideo.srcObject = event.stream);

function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {

//    console.log("data.val ==>" + data.val() + ")");
    if(data.val() === null) return;
    if(data.val().message === undefined) return;
    if(data.val().sender === null) return;

    console.log("message ==> ("+data.val().message+")");

    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {

        if (msg.ice != undefined) {

            console.log("ice ==>");
            console.dir(msg);

            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        } else if (msg.sdp.type == "offer") {

            console.log("offer ==>");
            console.dir(msg);

            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc.createAnswer())
              .then(answer => pc.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        } else if (msg.sdp.type == "answer") {

            console.log("answer ==>");
            console.dir(msg);

            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
        }
    }
};

database.on('child_added', readMessage);

function showMyFace() {

  navigator.mediaDevices.getUserMedia({audio:false, video:true})
    .then(stream => yourVideo.srcObject = stream)
    .then(stream => pc.addStream(stream));
}

function showFriendsFace() {

  console.log(pc.localDescription);

  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}

function getParameterByName(name, url) {

    if (!url)	url = window.location.href;

    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            	results = regex.exec(url);

    if (!results)	return null;

    if (!results[2])	return '';

    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

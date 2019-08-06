// Replace your code below
var config = {
    apiKey: "AIzaSyC0CpPdeAVRcdQl3HH3k2rwuwVUOCr1I3M",
    authDomain: "line-taxi-60d32.firebaseapp.com",
    databaseURL: "https://line-taxi-60d32.firebaseio.com",
    projectId: "line-taxi-60d32",
    storageBucket: "line-taxi-60d32.appspot.com",
    messagingSenderId: "548974371886"
};
// Replace your code above
firebase.initializeApp(config);

function loginNotify(from, align) {
    type = ['info','success'];

    color = Math.floor((Math.random() * 4) + 1);

    $.notify({
        icon: "ti-face-smile",
        message: "You are successfully Login. We will redirect you in Dashboard...!"

    }, {
        type: type[color],
        timer: 1000,
        placement: {
            from: from,
            align: align
        }
    });
}
function logoutNotify(from, align) {
    type = ['info','success','warning','danger'];

    color = Math.floor((Math.random() * 4) + 1);

    $.notify({
        icon: "ti-face-sad",
        message: "You are Logout shortly. Thanks for using Dashboard...!"

    }, {
        type: type[color],
        timer: 1000,
        placement: {
            from: from,
            align: align
        }
    });
}
function fetchingNotify(from, align) {
    type = ['info','success','warning','danger'];

    color = Math.floor((Math.random() * 4) + 1);

    $.notify({
        icon: "ti-face-smile",
        message: "We are fetching data...!"

    }, {
        type: type[1],//type[color],
        timer: 1000,
        placement: {
            from: from,
            align: align
        }
    });
}

function loginNotifyError(from, align) {
    type = ['warning','danger'];

    color = Math.floor((Math.random() * 2) + 1);

    $.notify({
        icon: "ti-face-sad",
        message: "Oops there is something wrong. Please try again...!"

    }, {
        type: type[color],
        timer: 1000,
        placement: {
            from: from,
            align: align
        }
    });
}

$(document).ready(function () {
    
    
     
   
    $('#btnLogin').click(function (e) {


        firebase.auth().signInWithEmailAndPassword($('#username').val(), $('#password').val())
                .then(
                        function (data) {
                            loginNotify('top', 'right');

                            window.setTimeout(function () {
                                window.location.replace("manage_ticket.html");

                            }, 1000);
                        }
                )
                .catch(function (error) {
                    // Handle Errors here.
                    var errorCode = error.code;
                    var errorMessage = error.message;
                    console.log(errorCode+'---'+errorMessage);
                    loginNotifyError('top', 'right');
                });

    });
    $("body").delegate("#logout", "click", function (event) {

    logoutNotify();
    window.setTimeout(function () {
        firebase.auth().signOut().then(function () {

        }, function (error) {
            console.error('Sign Out Error', error);
        });

    }, 1000);

});
});

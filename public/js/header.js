function callFunctionFromScript (brand) {

   $("head").append('<meta charset="utf-8" />');
   $("head").append('<link rel="apple-touch-icon" sizes="76x76" href="admin_files/assets/img/apple-icon.png">');
   $("head").append('<link rel="icon" type="image/png" sizes="96x96" href="admin_files/assets/img/favicon.png">');
   $("head").append('<meta http-equiv="X-UA-Compatible" content="IE=edge" />');
   $("head").append('<title>Go Go Taxi</title>');
   $("head").append('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
   $("head").append('<link href="admin_files/assets/css/bootstrap.min.css" rel="stylesheet" />');
   $("head").append('<link href="admin_files/assets/css/paper-dashboard.css?v=1.2.1" rel="stylesheet"/>');
   $("head").append('<link href="admin_files/assets/css/demo.css" rel="stylesheet" />');
   $("head").append('<link href="https://maxcdn.bootstrapcdn.com/font-awesome/latest/css/font-awesome.min.css" rel="stylesheet">');
   $("head").append('<link href="https://fonts.googleapis.com/css?family=Muli:400,300" rel="stylesheet" type="text/css">');
   $("head").append('<link href="admin_files/assets/css/themify-icons.css" rel="stylesheet">');


   $("head").append('<script src="admin_files/assets/js/jquery-ui.min.js" type="text/javascript"></script>');
   $("head").append('<script src="admin_files/assets/js/perfect-scrollbar.min.js" type="text/javascript"></script>');
   $("head").append('<script src="admin_files/assets/js/bootstrap.min.js" type="text/javascript"></script>');
   $("head").append('<script src="admin_files/assets/js/jquery.validate.min.js"></script>');
   $("head").append('<script src="admin_files/assets/js/es6-promise-auto.min.js"></script>');
   $("head").append('<script src="admin_files/assets/js/moment.min.js"></script>');
   $("head").append('<script src="admin_files/assets/js/bootstrap-selectpicker.js"></script>');
   $("head").append('<script src="admin_files/assets/js/bootstrap-switch-tags.js"></script>');
   $("head").append('<script src="admin_files/assets/js/bootstrap-notify.js"></script>');
   $("head").append('<script src="admin_files/assets/js/sweetalert2.js"></script>');
   $("head").append('<script src="admin_files/assets/js/bootstrap-table.js"></script>');
   $("head").append('<script src="admin_files/assets/js/jquery.datatables.js"></script>');
   $("head").append('<script src="admin_files/assets/js/fullcalendar.min.js"></script>');
   $("head").append('<script src="admin_files/assets/js/paper-dashboard.js?v=1.2.1"></script>');
   $("head").append('<script src="admin_files/assets/js/demo.js"></script>');
   $("head").append('<script src="js/firebase_core.js"></script>');
   $("head").append('<script src="js/firebase.js"></script>');


   var str = "";
   str += '<div class="logo">';
      str += '<a href="#" class="simple-text logo-mini">';
      str += 'Ticket';
      str += '</a>';
      str += '<a href="#" class="simple-text logo-normal">';
      str += 'Firebase Ticket';
      str += '</a>';
   str += '</div>';
   str += '<div class="sidebar-wrapper">';
      str += '<div class="user">';
         str += '<div class="photo">';
            str += '<img src="admin_files/assets/img/faces/face-0.jpg" />';
         str += '</div>';
         str += '<div class="info">';
            str += '<a data-toggle="collapse" href="#collapseExample" class="collapsed">';
            str += '<span class="agent_email">';
            str += '</span>';
            str += '</a>';
            str += '<div class="clearfix"></div>';
         str += '</div>';
      str += '</div>';
      str += '<ul class="nav">';
         str += '<li>';
            str += '<a href="dashboard.html">';
               str += '<i class="ti-bar-chart-alt"></i>';
               str += '<p>Dashboard</p>';
            str += '</a>';
         str += '</li>';
         str += '<hr />';
         str += '<li>';
            str += '<a href="manage_ticket.html">';
               str += '<i class="ti-support"></i>';
               str += '<p>Manage Ticket</p>';
            str += '</a>';
         str += '</li>';
         str += '<hr />';
         str += '<li>';
            str += '<a href="manage_driver.html">';
               str += '<i class="ti-id-badge"></i>';
               str += '<p>Manage Driver</p>';
            str += '</a>';
         str += '</li>';
         str += '<li>';
            str += '<a href="manage_passenger.html">';
               str += '<i class="ti-user"></i>';
               str += '<p>Manage Passenger</p>';
            str += '</a>';
         str += '</li>';
         str += '<hr />';
         str += '<li>';
            str += '<a href="manage_category.html">';
               str += '<i class="ti-pin-alt"></i>';
               str += '<p>Manage Category</p>';
            str += '</a>';
         str += '</li>';
      str += '</ul>';
   str += '</div>';
   $(".sidebar").append(str);


   str = "";
   str += '<div class="container-fluid">';
         str += '<div class="navbar-minimize">';
            str += '<button id="minimizeSidebar" class="btn btn-fill btn-icon"><i class="ti-more-alt"></i></button>';
         str += '</div>';
         str += '<div class="navbar-header">';
            str += '<button type="button" class="navbar-toggle">';
            str += '<span class="sr-only">Toggle navigation</span>';
            str += '<span class="icon-bar bar1"></span>';
            str += '<span class="icon-bar bar2"></span>';
            str += '<span class="icon-bar bar3"></span>';
            str += '</button>';
            str += `<a class="navbar-brand" href="#">${brand}</a>`;
         str += '</div>';
         str += '<div class="collapse navbar-collapse">';
            str += '<ul class="nav navbar-nav navbar-right">';
               str += '<li>';
                  str += '<a href="#" id="logout" class="btn-rotate">';
                  str += '<i class="ti-settings"></i>';
                  str += 'Logout';
                  str += '</a>';
               str += '</li>';
            str += '</ul>';
         str += '</div>';
   str += '</div>';
   $("#navbar").append(str);


   str = "";
   str += '<div class="container-fluid">';
         str += '<div class="copyright pull-right">';
            str += '&copy; 2018, made with <i class="fa fa-heart heart"></i> by <a href="#">GO-GO-TAXI</a>';
         str += '</div>';
   str += '</div>';
   $(".footer").append(str);

   $("body").show('slow');

}

function checkAccount() {

   $(document).ready(function () {

      firebase.auth().onAuthStateChanged(function (user) {
         if (user) {
            // alert('yes');
            $(".agent_email").html(user.email);
         } else {
            window.location = "login.html";
         }
      });

      fetchingNotify('top', 'right');
   });
}



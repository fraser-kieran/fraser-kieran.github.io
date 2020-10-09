var notificationString = '<div class="card" style="width: 100%; margin-bottom: 10px">'+
      '<div class="card-body" style="padding: 10px;">'+
        '<div class="container-fluid" style="width: 100%; margin: 0px; padding: 0px;">'+
            '<p style="text-align: right; font-size: small; margin: 0px;">{{:delivered}}</p>'+
            '<div class="row">'+
                '<div class="col-md-1">'+
                    '<img src="{{:icon}}" alt=" " style="height: 35px; padding: 5px; border-radius: 50%; border-radius: 50%;border: solid;border-width: thin;    border-color: black;">'+
                '</div>'+
                '<div class="col-md-10">'+
                    '<h5 class="card-title" style="font-size: small;">{{:title}}</h5>'+
                    '<p class="card-text" style="font-size: small;">{{:body}}</p>'+
                '</div>'  +
                '<div class="col-md-10">'+
                '</div>'+
            '</div>'+
        '</div>'  +
        '<div style="text-align: right; margin: 0px; padding: 0px;">'  +
            '<div class="btn-group btn-group-toggle" data-toggle="buttons">'  +
              '<label class="btn btn-danger" name="enticing" id="{{:id}}">'  +
                '<input type="radio" autocomplete="off">Enticing'  +
              '</label>'  +
              '<label class="btn btn-primary" name="neutral" id="{{:id}}">'  +
                '<input type="radio" autocomplete="off">Neutral'  +
              '</label>'  +
            '</div>'  +
        '</div>'  +
      '</div>'+
    '</div>'
var notificationTemplate = $.templates(notificationString);

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyAQu435FNTmXIcFigctYMdRO8sPLX78HI0",
    authDomain: "pushdexp.firebaseapp.com",
    databaseURL: "https://pushdexp.firebaseio.com",
    projectId: "pushdexp",
    storageBucket: "pushdexp.appspot.com",
    messagingSenderId: "84430156157",
    appId: "1:84430156157:web:b4fc89624448507bb05c14"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {} else {
        firebase.auth().signInAnonymously().catch(function(error) {
            $.alert({
                title: 'Oops!',
                type: 'red',
                content: 'Something went wrong. Please try again later.',
            });

        });
    }
});

function submitAnswers(){
    $('#submitBtn').prop('disabled', true);
    $('#submitBtn').attr('disabled', true);
    var scores = $('.btn-likert').map(function() { 
        if(!this.classList.contains("disabled") && this.classList.contains("active")) 
            return this.innerText
    }).get();
    var numPush = $('#numPush').val()
    var openedPush = $('#openedPush').val()
    var topics = $('#topics').val()
    var npsReason = $('#npsReason').val()
    if(scores.length < 5 || numPush == null || openedPush == null || topics == null || npsReason == null){
       $.confirm({
            title: 'Oops',
            type: 'orange',
            content: 'You have missed some answers. Are you sure you want to submit without answering them?',
            buttons: {
                confirm: function () {
                },
                cancel: function () {
                }
            }
        });
    }
}
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
    if (!user) {
        firebase.auth().signInAnonymously().catch(function(error) {
            $.alert({
                title: 'Oops!',
                type: 'red',
                content: 'Something went wrong. Please try again later.',
            });
        });
    }
});


var notificationString = '<div class="card" style="width: 100%; margin-bottom: 10px">'+
      '<div class="card-body" style="padding: 10px;">'+
        '<div class="container-fluid" style="width: 100%; margin: 0px; padding: 0px;">'+
            '<div class="row">'+
                '<div class="col-md-2">'+
                    '<img src="https://{{:domain}}/favicon.ico" alt=" " style="height: 35px; padding: 5px; border-radius: 50%; border-radius: 50%;border: solid;border-width: thin;    border-color: black;">'+
                '</div>'+
                '<div class="col-md-10">'+
                    '<h5 class="card-title" style="padding: 10px;">{{:title}}</h5>'+
                '</div>'  +
            '</div>'+
        '</div>'  +
        /*'<p class="card-text">{{:ticker}}</p>'+*/
        '<div style="text-align: center; margin: 0px; padding: 0px;">'+
            '<div class="btn-group btn-group-toggle" data-toggle="buttons">'+
              '<label class="btn btn-secondary" name="open" id="{{:id}}">'+
                '<input type="radio" autocomplete="off">Open'+
              '</label>'+
              '<label class="btn btn-secondary" name="dismiss" id="{{:id}}">'+
                '<input type="radio" autocomplete="off">Dismiss'+
              '</label>'+
            '</div>'+
        '</div>'+
        '<p style="text-align: right; font-size: small; margin: 0px;">{{:domain}}</p>'+
      '</div>'+
    '</div>'
var notificationTemplate = $.templates(notificationString);

var notificationList = []
var mindfulScores = []
var curiosityScores = []
var prolificURL = ''

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        getAllNotifications()
        getProlificURLS()
    }
});

function launchQuestionnaire(){
    var prolificId = ''
    try{
        // get userId from the p parameter!
        const urlParams = new URLSearchParams(window.location.search);
        prolificId = urlParams.get('PROLIFIC_PID');
    }catch(e){}
    
    if(prolificId && prolificId!=''){
        $('#exampleModal').modal({
          backdrop: 'static',
          keyboard: false
      })
    }
    else{
        $.alert({
            title: 'Hmm hang on!',
            type: 'orange',
            content: 'You must use the link provided on the Prolific Academic page for this study, as we need to record your Prolific Id. Return to the Prolific webpage for this study and use the link provided.<br><br> Thank you :)',
        });
    }
    
}

function mindfulModal(){
    $('#mindfulModal').modal('show')
} 

function closeMindfulModal(){
    $('#mindfulModal').modal('hide')
}

function saveMindfulModal(){
    mindfulScores = []
    $('#mindfulError').hide()
    var scores = $('#mindfulModal .btn-likert').map(function() { 
        if(!this.classList.contains("disabled") && this.classList.contains("active")) 
            return this.innerText
    }).get();
    if(scores.length == 15){
        mindfulScores = scores
        $('#mindfulModal').modal('hide')
        $('#mindfulError').hide()
        $('#mindfulScaleButton').removeClass('btn-primary').addClass('btn-success')
    }
    else{
        $('#mindfulError').show()
    }
}

function curiosityModal(){
    $('#curiosityModal').modal('show')
}

function closeCuriosityModal(){
    $('#curiosityModal').modal('hide')
}

function saveCuriosityModal(){
    curiosityScores = []
    $('#curiosityError').hide()
    var scores = $('#curiosityModal .btn-likert').map(function() { 
        if(!this.classList.contains("disabled") && this.classList.contains("active")) 
            return this.innerText
    }).get();
    if(scores.length == 10){
        curiosityScores = scores
        $('#curiosityModal').modal('hide')
        $('#curiosityError').hide()
        $('#curiosityInventoryButton').removeClass('btn-primary').addClass('btn-success')
    }
    else{
        $('#curiosityError').show()
    }
}

function savePrefs(){

    var prolificId = ''
    try{
        // get userId from the p parameter!
        const urlParams = new URLSearchParams(window.location.search);
        prolificId = urlParams.get('PROLIFIC_PID');
    }catch(e){}


    //prolificId = $('#prolificId').val()
    gender = $('#gender').val()
    ages = $('#ages').val()
    settings = $('#settings').val()
    emoji = $('#emoji').val()
    sub = $('#ps_sub').val()
    use = $('#use').val()
    entic = $('#entic').val()
    topics = $('#topicPrefs').val()
    posWeb = $('#posWebPrefs').val()
    negWeb = $('#negWebPrefs').val()

    opened = []
    dismissed = []

    $("#notificationFeed .active").each(function() {
        var name = $(this).attr('name');
        var id = $(this).attr('id');
        if(name=='open')
            opened.push(id)
        else
            dismissed.push(id)
    });

    if(topics.length<2|posWeb.length<2|negWeb.length<2|(opened.length+dismissed.length)<5){
        $.alert({
            title: 'Wait!',
            type: 'orange',
            content: 'You must select at least 2 topics<br><strong>and</strong> at least 4 websites (2 positive and 2 negative)<br><strong>and</strong> open or dismiss at least 5 generated notifications...',
        });
        return
    }

    if((mindfulScores<15 && mindfulScores>0) || (curiosityScores>0 && curiosityScores<10)){
        $.alert({
            title: 'Wait!',
            type: 'orange',
            content: 'You\'re almost finished! Please complete the Mindful Scale and Curiosity Inventory...',
        });
        return
    }

    if(prolificId && prolificId!=''){
        $.confirm({
            title: 'Finished',
            type: 'green',
            content: 'Submission received. Your task now is to engage with incoming notifications as normal over the next 12 days. You will receive a short (max 30 seconds) questionnaire every night via notification which we ask you to complete. This part of the study is finished. You will shortly receive an invitation for the next part. Pleasea tap on the button below to confirm your submission on Prolific Academic.',
            buttons: {
                confirm: function () {
                    $('#exampleModal').modal('hide')
                }
            }
        });
    } 

}



function generateTestNotifications(){
    posWeb = $('#posWebPrefs').val()
    negWeb = $('#negWebPrefs').val()

    notifications = []
    websites = posWeb.concat(negWeb)
    for(notification of notificationList){
        if(websites.some(website => notification.domain.includes(website)))
            notifications.push({title: notification.summary, ticker: notification.summary,
                              id: notification.id, domain: notification.domain})
    }

    var html = notificationTemplate.render(getRandom(notifications, notifications.length<=10?notifications.length : 10));
    $( "#notificationFeed" ).empty()
    $( "#feedInstructions" ).show()
    $( "#notificationFeed" ).append(html)

}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function getAllNotifications(){
    var pushRef = database.ref('web_notifications/')
    .once('value')
    .then(function(snapshot) {

        notificationList = []
        if(snapshot.val()!=null){
            snapshot.forEach((notification)=> {
                notificationList.push(notification.val())
            });
        }
    });
}

function getProlificURLS(){
    var pushRef = database.ref('prolific_urls/start')
    .once('value')
    .then(function(snapshot) {
        if(snapshot && snapshot.val()!=null){
            prolificURL = snapshot.val()
        }
    });
}
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
var prolificURL = null
var userId = null
var mySynth = null
var myReal = null
var isSynth = 'unk'


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        getProlificURLS()
        setUp()
    } else {
        firebase.auth().signInAnonymously().catch(function(error) {
            $.alert({
                title: 'Oops!',
                type: 'red',
                content: 'Something went wrong. Please try again later.',
            });

        });
    }
});

function setUp(){

    var prolificId = ''
    try{
        const urlParams = new URLSearchParams(window.location.search);
        prolificId = urlParams.get('PROLIFIC_PID');
    }catch(e){}
    if(prolificId && prolificId!=''){
        try{

            $('#completeButton').show()
            $('#postQuestionnaire').show()

        }catch(e){
            $.alert({
                title: 'Error!',
                type: 'red',
                content: 'There was an error submitting. Please contact the lead researcher.',
            });
            return
        }
    }
    else{
        // no prolific id.. get user id.. 
        try{
            // get userId from the p parameter!
            const urlParams = new URLSearchParams(window.location.search);
            userId = urlParams.get('u');

            database.ref('participant/'+userId)
            .once('value')
            .then(function(snapshot) {
                if(snapshot && snapshot.val()!=null){
                    var user = snapshot.val()

                    var size = 0
                    var answers = 0
                    var daysLeft = 0
                    var alreadyCompleted = false
                    var prolificId = null

                    if(user.hasOwnProperty('notifications'))
                        size = Object.keys(user.notifications).length
                    if(user.hasOwnProperty('midstudy'))
                        answers = Object.keys(user.midstudy).length
                    if(user.hasOwnProperty('timeCompleted'))
                        alreadyCompleted = true
                    try{
                        if(user.hasOwnProperty('prolificId') && user.prolificId && user.prolificId!=null
                          && user.prolificId!='')
                            prolificId = user.prolificId
                    }catch(e){}

                    var phase = user.phase

                    $("#delivered").html(size);
                    $("#answered").html(answers);

                    if(prolificId!=null){
                        console.log(prolificId)
                        var timeDiff = (new Date()).getTime() - (new Date(user.signedUp)).getTime();
                        var daysLeft = timeDiff / (1000 * 3600 * 24);
                        daysLeft = 9 - Math.round(daysLeft)
                        if(daysLeft < 0)
                            daysLeft = 0
                        $("#daysLeft").html(daysLeft);
                        $('#studyStats').show()

                        if(phase && phase==4 && !alreadyCompleted){
                            // show checkboxes
                            $('#completeCheckboxes').show()
                            getMetrics();
                        } 
                        else if (alreadyCompleted){
                            $('#alreadyCompleteMessage').show()
                        }
                        else{
                            $('#notCompleteMessage').show()
                        }
                    }
                    else{
                        $("#daysLeftContainer").hide();
                        $('#studyStats').show()
                        if(phase && phase==4 && !alreadyCompleted){
                            // show checkboxes
                            $('#completeCheckboxes').show()
                            getMetrics();
                        }
                        else if (alreadyCompleted){
                            $('#alreadyCompleteMessage').show()
                        }
                    }
                }
                else{
                    $.alert({
                        title: 'Error!',
                        type: 'red',
                        content: 'There was an error. Please contact the lead researcher.',
                    });
                }
            });

        } catch(e){
            $.alert({
                title: 'Error!',
                type: 'red',
                content: 'There was an error. Please contact the lead researcher.',
            });
        }
    }

}


// Get the notifications..
// Top topics opened
// Top domains opened
// Hours most receptive
// Days of week most receptive
function getMetrics(){}

function goToProlific(){

    $('#completeButton').prop('disabled', true);
    $('#completeButton').attr('disabled', true);
    if(userId!=null && prolificURL!=null){


        // get questionnaire results
        topics = $('#topics').val()
        domains = $('#domains').val()
        days = $('#days').val()
        times = $('#times').val()
        formatInformative = $('#formatInformative').val()
        formatDecision = $('#formatDecision').val()
        formatPrivacy = $('#formatPrivacy').val()
        formatConsent = $('#formatConsent').val()
        emojiEnticing = $('#emojiEnticing').val()
        emojiUse = $('#emojiUse').val()
        emojiRelevant = $('#emojiRelevant').val()

        if(topics!=null && domains!=null && days!=null && 
          times!=null && formatInformative!=null && formatDecision!=null && 
          formatPrivacy!=null && formatConsent!=null && emojiEnticing!=null && emojiUse!=null &&
          emojiRelevant!=null){
            
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
    else{
        $.alert({
            title: 'Error!',
            type: 'red',
            content: 'There was an error submitting. Please contact the lead researcher.',
        });
        return
    }
}

function getProlificURLS(){
    
}

function completed(){
    $('#completeButton').prop('disabled', true);
    $('#completeButton').attr('disabled', true);

    // get questionnaire results
    topics = $('#topics').val()
    domains = $('#domains').val()
    days = $('#days').val()
    times = $('#times').val()
    emailForDraw = $('#emailForDraw').val()
    formatInformative = $('#formatInformative').val()
    formatDecision = $('#formatDecision').val()
    formatPrivacy = $('#formatPrivacy').val()
    formatConsent = $('#formatConsent').val()
    emojiEnticing = $('#emojiEnticing').val()
    emojiUse = $('#emojiUse').val()
    emojiRelevant = $('#emojiRelevant').val()

    if(topics==null || domains==null || days==null || 
      times==null || formatInformative==null || formatDecision==null || 
      formatPrivacy==null || formatConsent==null || emojiEnticing==null || emojiUse==null ||
      emojiRelevant==null){

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

function checkboxCalc(){
    if($("#cb-yesProlific").prop('checked')){
        $('#completeButton').show()
        $('#completeButtonAlt').hide()
        $('#emailDraw').hide()
        $("#cb-noProlific").prop('checked', false)
    }
    else{
        $('#completeButton').hide()
    }
    if($("#cb-noProlific").prop('checked')){
        $('#completeButtonAlt').show()
        $('#completeButton').hide()
        $('#emailDraw').show()
        $("#cb-yesProlific").prop('checked', false)
    }
    else{
        $('#completeButtonAlt').hide()
        $('#emailDraw').hide()
    }
}
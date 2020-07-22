var prolificURL = ''
var pushAttempts = 0

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        var isAnonymous = user.isAnonymous;
        var uid = user.uid;
        getProlificURLS()
    }
});

contactFormInit()

initSubscribe()

function contactFormInit(){
    try{
        var uId = document.cookie.split('=')[1]
        if(uId.charAt(0) == '-'){
            $('#uId').val(uId)
        }
    }
    catch(e){}
}

function checkChrome(){
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;

    if(
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      vendorName === "Google Inc." &&
      isOpera === false &&
      isIEedge === false
    ) {
       if($("#cb-info").prop('checked') && $("#cb-consent").prop('checked')){
            $("#checkbox-message").hide();
            subButtonClick()
        }
        else{
            $("#checkbox-message").show();
        }
    } else { 
       $.confirm({
            title: "<h2 style='text-transform: capitalize; letter-spacing: normal; line-spacing: normal;'>Chrome not Detected</h2>",
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>We have detected that you may not be using the <strong>Chrome</strong> web browser when signing up. This experiment only supports participation through Google Chrome web browser. If you are sure you are using Google Chrome, please proceed. Otherwise, please install and navigate to this page using <a href='https://play.google.com/store/apps/details?id=com.android.chrome' target='_blank'>Chrome</a>.</h5>",
            type: 'orange',
            useBootstrap: true,
            typeAnimated: true,
            buttons: {
                grant: {
                    text: 'I am using Chrome',
                    btnClass: 'btn-green',
                    action: function(){
                        if($("#cb-info").prop('checked') && $("#cb-consent").prop('checked')){
                            $("#checkbox-message").hide();
                            subButtonClick()
                        }
                        else{
                            $("#checkbox-message").show();
                        }
                    }
                },
                deny: {
                    text: 'Cancel Participation',
                    btnClass: 'btn-red',
                    action: function(){
                        return;
                    }
                }
            },
            draggable: false,
        }); 
    }
}

function checkAndroid() { 
    var userAgent = navigator.userAgent.toLowerCase(); 
    var isAndroid = userAgent.indexOf("android") > -1; 

    if(isAndroid) { 
        checkChrome()
    } 
    else{
        $.confirm({
            title: "<h2 style='text-transform: capitalize; letter-spacing: normal; line-spacing: normal;'>Android not Detected</h2>",
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>We have detected that you may not be using an <strong>Android</strong> mobile device when signing up. This experiment only supports participation through Android mobile devices. If you are sure this is an Android device, please proceed. Otherwise, please navigate to this page using an Android mobile device and the Google Chrome web browser!</h5>",
            type: 'orange',
            useBootstrap: true,
            typeAnimated: true,
            buttons: {
                grant: {
                    text: 'I am using Android',
                    btnClass: 'btn-green',
                    action: function(){
                        checkChrome();
                    }
                },
                deny: {
                    text: 'Cancel Participation',
                    btnClass: 'btn-red',
                    action: function(){
                        return;
                    }
                }
            },
            draggable: false,
        });
    }
} 

function prescreenNoti(){
    if (Notification.permission === 'denied') {
        $('#subButton').prop('disabled', true);

        $.confirm({
            title: "<h2 style='text-transform: capitalize; letter-spacing: normal; line-spacing: normal;'>Notification Permissions</h2>",
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>To receive <strong style='text-transform: capitalize;'>Pushd</strong> notifications from the content creators on this platform, you must grant push-notification permission to <strong style='text-transform: capitalize;'>Pushd</strong>.</h5>",
            type: 'blue',
            useBootstrap: true,
            typeAnimated: true,
            buttons: {
                grant: {
                    text: 'Grant',
                    btnClass: 'btn-white',
                    action: function(){
                        askPermission()
                    }
                },
                deny: {
                    text: 'Deny',
                    btnClass: 'btn-white',
                    action: function(){
                        return;
                    }
                }
            },
            draggable: false,
        });
    }
    else{
        checkAndroid()
    }
}

function savePrefs(){

    var prolificId = ''
    try{
        // get userId from the p parameter!
        const urlParams = new URLSearchParams(window.location.search);
        prolificId = urlParams.get('PROLIFIC_PID');
    }catch(e){}


    if(prolificId && prolificId!=''){
        
        userId = document.cookie.split('=')[1]
        if(userId.charAt(0) == '-'){
            database.ref('participant/'+userId).update({
                prolificId: prolificId,
                prescreenComplete: Math.round((new Date()).getTime())
            });
        }
        
        $.confirm({
            title: 'Finished',
            type: 'green',
            content: 'You are now set up. Simply engage with incoming notifications as normal over the next three weeks. You will receive a short (max 30 seconds) questionnaire every night via notification which we ask you to complete. Part 1 of this study is now complete - click the button below to confirm your submission on Prolific Academic.',
            buttons: {
                confirm: function () {
                    $('#exampleModal').modal('hide')
                    window.location.replace(prolificURL);
                }
            }
        });
    } 
}

function getProlificURLS(){
    var pushRef = database.ref('prolific_urls/prescreen')
    .once('value')
    .then(function(snapshot) {
        if(snapshot && snapshot.val()!=null){
            prolificURL = snapshot.val()
        }
    });
}

function goToProlific(){
    if(prolificURL!='')
        window.location.replace(prolificURL);
}
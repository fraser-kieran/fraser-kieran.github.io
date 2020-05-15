// Useful - https://developers.google.com/web/fundamentals/codelabs/push-notifications

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

const messaging = firebase.messaging();
messaging.usePublicVapidKey("BFEbzP7FmcXf3RrZ2c7UnYt7wQIbTL2vEkNj6sbEVL6BRpuZfQsDF2-fUyvrdjBQowasSKVLBrmi_s1oYetKaBQ");

var isSubscribed = false;

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

/*
First function called. Checks if service worker and push active or possible.
todo - print message to user if not eligible
*/
function initSubscribe(){
    
   
    /* Check if service workers and push messaging is supported by the browser */
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      initializeUI();
    } else {
      console.warn('Push messaging is not supported');
    }
}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

// [START receive_message]
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage((payload) => {
    console.log('Message received foreground. ', payload);
    // [START_EXCLUDE]
    // Update the UI to include the received message.
    //appendMessage(payload);
    // [END_EXCLUDE]
});
// [END receive_message]

/* 
Set button text depending if user subbed or not 
*/
function initializeUI() {
    var uId = document.cookie.split('=')[1]
    if(uId && uId.charAt(0) && uId.charAt(0) == '-'){
        console.log('userId present - therefore subscribed.. lets update token')
        $('#cb-info').prop('checked', true)
        $('#cb-consent').prop('checked', true)
        isSubscribed = true
        
        messaging.getToken().then((currentToken) => {
            $("#subId").html(currentToken)
            database.ref('participant/'+uId).update({
                    token: currentToken
            }, function(error) {});
        }).catch((err) => {
          $("#subId").html('Error retrieving Instance ID token. '+err.toString())
        });
    }
    else{
       console.log('Not subscribed')
    }
    updateBtn();
}

/*
Updates the button depending on Notification permission preferences set.
*/
function updateBtn() {
    
  if (Notification.permission === 'denied') {
    $('#subButton').prop('disabled', true);
    
    updateSubscriptionOnServer(null);
    
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
      
    return;
  }
  else if(Notification.permission === 'granted'){      
      if (isSubscribed) {
          $('#subButton').html('Unsubscribe');
      } else {
          $('#subButton').html('Lets Start');
      }

      $('#subButton').prop('disabled', false);
  }
  else {
      $.confirm({
            title: "<h2 style='text-transform: capitalize; letter-spacing: normal; line-spacing: normal;'>Notification Permissions</h2>",
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>In order to participate in this Research Experiment, you must enable push-notification permissions for this page.</h5>",
            type: 'green',
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
}

/*
Returns a promise for when user acts upon Notification push permission
*/
function askPermission() {
  return new Promise(function(resolve, reject) {
        const permissionResult = Notification.requestPermission(function(result) {
            if(result==='granted'){
                if (isSubscribed) {
                  $('#subButton').html('Unsubscribe');
                } else {
                  $('#subButton').html('Lets Start');
                }

                $('#subButton').prop('disabled', false);
            }
        });
  })
}

/*
The lets-start/unsub button is clicked, subscribe or unsubscribe logic begins
*/
function subButtonClick(){
    $('#subButton').prop('disabled', true);

    if (isSubscribed) {
       areYouSure()
    } else {
      subscribeUser();
    }
}

function areYouSure(){
     $.confirm({
            title: "<h2 style='text-transform: capitalize; letter-spacing: normal; line-spacing: normal;'>Exit Experiment</h2>",
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>If you unsubscribe you will be removed from the <strong>Pushd</strong> experiment and all data collected on your engagements will be deleted. Are you sure you wish to unsubscribe?</h5>",
            type: 'red',
            useBootstrap: true,
            typeAnimated: true,
            buttons: {
                grant: {
                    text: 'Yes, unsubscribe',
                    btnClass: 'btn-white',
                    action: function(){
                        unsubscribeUser();
                    }
                },
                deny: {
                    text: 'No, stay subscribed',
                    btnClass: 'btn-white',
                    action: function(){
                        return;
                    }
                }
            },
            draggable: false,
      });
}

/*
Unsubs the user and removes data from the server
*/
function unsubscribeUser() {
    
    messaging.getToken().then((currentToken) => {
      messaging.deleteToken(currentToken).then(() => {
        console.log('Token deleted.');
        setTokenSentToServer(false);
        // [START_EXCLUDE]
        // Once token is deleted update UI.
          try{
                userId = document.cookie.split('=')[1]

                database.ref('participant/'+userId).once('value').then(function(snapshot) {
                    if(snapshot.val()!=null){
                        try{
                            week1Group = snapshot.val()['weekone']
                            week2Group = snapshot.val()['weektwo']
                            week3Group = snapshot.val()['weekthree']

                            database.ref('groups/weekone/'+week1Group+'/'+userId).remove();
                            database.ref('groups/weektwo/'+week2Group+'/'+userId).remove();
                            database.ref('groups/weekthree/'+week3Group+'/'+userId).remove();

                            database.ref('participant/'+userId).remove();

                            if($('#curiosityInventoryButton').hasClass('btn-success'))
                                $('#curiosityInventoryButton').removeClass('btn-success').addClass('btn-primary')
                            if($('#mindfulScaleButton').hasClass('btn-success'))
                                $('#mindfulScaleButton').removeClass('btn-success').addClass('btn-primary')
                        }
                        catch(err){
                            $.alert({
                                title: 'Error!',
                                type: 'red',
                                content: 'There was a problem unsubscribing you for this study. Please contact lead researcher!',
                            });
                        }
                    }
                });
          } catch(e){}
          
        console.log('User is unsubscribed.');
        document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        $('#cb-info').prop('checked', false)
        $('#cb-consent').prop('checked', false)
        $('#exampleModal').modal('hide')
        isSubscribed = false;

        updateBtn();
        // [END_EXCLUDE]
      }).catch((err) => {
        console.log('Unable to delete token. ', err);
      });
      // [END delete_token]
    }).catch((err) => {
      console.log('Error retrieving Instance ID token. ', err);
    });
}

/*
Subscribes the user and updates the server and button
*/
function subscribeUser() {
  
    messaging.getToken().then((currentToken) => {
        if (currentToken) {
          console.log('Got the token for subscribing');
          // sendTokenToServer(currentToken);
          // updateUIForPushEnabled(currentToken);
            
          console.log('User is subscribed.');
      
          updateSubscriptionOnServer(currentToken);
          isSubscribed = true;

          $('#exampleModal').modal({
              backdrop: 'static',
              keyboard: false
          })
        } else {
            setTokenSentToServer(false);
            // Show permission request.
            console.log('No Instance ID token available. Request permission to generate one.');
            // Show permission UI.
            // check if userId present.. if so, refresh subscription
            try{
                var uId = document.cookie.split('=')[1]
                if(uId.charAt(0) == '-'){
                    $("#subId").html($("#subId").html()+"userIdPresent")
                    $("#subId").html($("#subId").html()+" "+uId)
                    // userId present - update subscription
                }
            }
            catch(e){console.log("Could not update user subscription")}
        }        
        updateBtn();
    }).catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
        setTokenSentToServer(false);
        
        updateBtn();
    });
}

function generateID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

function updateSubscriptionOnServer(token) {
  // TODO: Send subscription to application server

  if (!isTokenSentToServer()) {
      console.log("Updating the subscription on the server")
      
      subNewParticipant(token)
      
  } else {
    console.log('subscription was null')
  }
}

function subNewParticipant(token) {
    
    var userId = database.ref('participant/').push().key;
    
    var expiration_date = new Date();
    var cookie_string = "userId="+userId+";";
    expiration_date.setFullYear(expiration_date.getFullYear() + 1);
    cookie_string = cookie_string+"max-age=31536000";
    document.cookie = cookie_string;
    
    var subInfo = JSON.stringify({
        "token": token            
    })
    
    // Assign to groups..
    // get groups
    var chosenGroups = {weekone: null, weektwo: null, weekthree: null}
    
    database.ref('groups/').once('value').then(function(snapshot) {
        if(snapshot.val()!=null){
            var weeks = snapshot.val()
            for(week in weeks){
                var groups = weeks[week]
                var smallest = 999999
                var chosenGroup = null
                for(group in groups){
                    if(getGroupSize(groups[group]) < smallest){
                        chosenGroup = group
                        smallest = getGroupSize(groups[group])
                    }
                }
                chosenGroups[week] = chosenGroup
            }
            if(chosenGroups['weekone']!=null && chosenGroups['weektwo']!=null && chosenGroups['weekthree']!=null){
                console.log('Saving user details..')
                database.ref('participant/'+userId).set({
                    id: userId,
                    token: token,
                    phase: 1,
                    signedUp: Math.round((new Date()).getTime()),
                    weekone: chosenGroups['weekone'],
                    weektwo: chosenGroups['weektwo'],
                    weekthree: chosenGroups['weekthree']
                }, function(error) {
                    if (error) {
                      $.alert({
                            title: 'Error!',
                            type: 'red',
                            content: 'There was a problem registering you for this study. Please contact lead researcher!',
                        });
                        unsubscribeUser()
                    } else {
                        
                        setTokenSentToServer(true);
                        console.log('Updating groups...')
                        for(week in chosenGroups)
                            if(chosenGroups[week] != null)
                                database.ref('groups/'+week+'/'+chosenGroups[week]+'/'+userId).set({userId})
                    }
                });
            }
        }
    });
    
    
}

function getGroupSize(group){
    var counter = 0
    for(key in group)
        counter++
    return counter
}

  


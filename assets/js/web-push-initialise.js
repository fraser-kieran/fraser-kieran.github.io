// Useful - https://developers.google.com/web/fundamentals/codelabs/push-notifications

var db = null;
var swRegistration = null;
var isSubscribed = false;
const applicationServerPublicKey = 
      'BJ-qALtORweP7IZtnNMoY-8gwsFsPSPXlrAYU6dBulwYcv6CPrIIr8-t57PgUPfGMqsg0DfVPre_thVyWqBPaZo';

//var applicationServerPublicKey = null;

/*
First function called. Checks if service worker and push active or possible.
todo - print message to user if not eligible
*/
function initSubscribe(){
    
    // applicationServerPublicKey = serverKey;
    
    
    /* Check if service workers and push messaging is supported by the browser */
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      //console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('/web-push-sw.js', {scope: '/pushd.html'})
      .then(function(swReg) {
        //console.log('Service Worker is registered', swReg);

        swRegistration = swReg;
        initializeUI();

      })
      .catch(function(error) {
        console.error('Service Worker Error', error);
      });
    } else {
      console.warn('Push messaging is not supported');
    }
}

/* 
Set button text depending if user subbed or not 
*/
function initializeUI() {
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (isSubscribed) {
        
      console.log('User IS subscribed.');
      // check both boxes
      $('#cb-info').prop('checked', true)
      $('#cb-consent').prop('checked', true)
    } else {
      console.log('User is NOT subscribed.');
        // check if userId present.. if so, refresh subscription
        var uId = document.cookie.split('=')[1]
        if(uId.charAt(0) == '-'){
            // userId present - update subscription
            const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
            swRegistration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: applicationServerKey
            })
            .then(function(subscription) {
                console.log('User refreshed subscribed.');
                if(subscription){
                    refreshSub(subscription, uId);
                    isSubscribed = true;
                    updateBtn()
                }
            })
        }
    }

    updateBtn();
  });
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
    if(applicationServerPublicKey!=null){
        $('#subButton').prop('disabled', true);

        if (isSubscribed) {
           areYouSure()
        } else {
          subscribeUser();
        }
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
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
      
    const params = new URLSearchParams(window.location.search); 
      
      
    if (subscription) {
        // unsub api call using subscription object to search for applicable sub
        
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
                    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                    $('#cb-info').prop('checked', false)
                    $('#cb-consent').prop('checked', false)
                    $('#exampleModal').modal('hide')

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
            else{
                $.alert({
                    title: 'Error!',
                    type: 'red',
                    content: 'There was a problem unsubscribing you for this study. Please contact lead researcher!',
                });
            }
        });
        
        return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    //updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

/*
Subscribes the user and updates the server and button
*/
function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');
      
    updateSubscriptionOnServer(subscription);
    isSubscribed = true;
    
    $('#exampleModal').modal({
        backdrop: 'static',
        keyboard: false
    })

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function generateID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
};

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  if (subscription) {
      console.log("Updating the subscription on the server")
      
      subNewParticipant(subscription)
    /*const params = new URLSearchParams(window.location.search);  
    var subId = params.get("p");
    var subInfo = subscription

    var subUrl = "https://autoempushy.herokuapp.com/v1/sub";

    var formData = JSON.stringify({
        "userId": null,
        "subId": subId,
        "subInfo": subInfo            
    })

    $.ajax ({
        url: subUrl,
        type: "POST",
        data: formData,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        crossDomain: true,
        success: function(data) {
            try{
               
            }
            catch(err){}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) { 
            
        } 
    });*/
      
  } else {
    console.log('subscription was null')
  }
}

function subNewParticipant(subscription) {
    
    var userId = database.ref('participant/').push().key;
    
    var expiration_date = new Date();
    var cookie_string = "userId="+userId+";";
    expiration_date.setFullYear(expiration_date.getFullYear() + 1);
    cookie_string = cookie_string+"max-age=31536000";
    document.cookie = cookie_string;
    
    var subInfo = JSON.stringify({
        "subInfo": subscription            
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
                    subInfo: subInfo,
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

function refreshSub(subscription, uid) {
    
    var subInfo = JSON.stringify({
        "subInfo": subscription            
    })
    
    database.ref('participant/'+uid).update({
        subInfo: subInfo,
        subBrowserUpdate: true
    }, function(error) {
        if (error) {
          $.alert({
                title: 'Error!',
                type: 'red',
                content: 'Your push subscription is out of date. Please contact lead researcher!',
            });
        }
    });
}

function getGroupSize(group){
    var counter = 0
    for(key in group)
        counter++
    return counter
}

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/*function displayNotification() {
    if(Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(function(registration) {
            registration.showNotification('Vibration Sample', {
              body: 'Buzz! Buzz!',
              badge: './images/favicon.png',
              vibrate: [200, 100, 200, 100, 200, 100, 200],
              tag: 'vibration-sample'
            });
        });
    }
    else{
        console.log('not granted')
    }
}*/

  


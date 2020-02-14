// Useful - https://developers.google.com/web/fundamentals/codelabs/push-notifications

var db = null;
var swRegistration = null;
var isSubscribed = false;
const applicationServerPublicKey = 'BJEmLHcgkIMhmtM1RvtUtpg01ue_ZJUrWxY42_IlR5KgNMjKHH8DT9bM4xP8w9CJOJpyf2_dVpORdS99vPoFnSQ';
//var applicationServerPublicKey = null;

/*
First function called. Checks if service worker and push active or possible.
todo - print message to user if not eligible
*/
function initSubscribe(){
    
    // applicationServerPublicKey = serverKey;
    
    
    /* Check if service workers and push messaging is supported by the browser */
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('Service Worker and Push is supported');

      navigator.serviceWorker.register('web-push-sw.js', {scope: '/pushd.html'})
      .then(function(swReg) {
        console.log('Service Worker is registered', swReg);

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
        type: 'purple',
        boxWidth: '30%',
        useBootstrap: false,
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
            content: "<h5 style='text-transform: none; letter-spacing: normal; line-spacing: normal;'>To receive <strong style='text-transform: capitalize;'>Pushd</strong> notifications from the content creators on this platform, you must grant push-notification permission to <strong style='text-transform: capitalize;'>Pushd</strong>.</h5>",
            type: 'purple',
            boxWidth: '30%',
            useBootstrap: false,
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
          unsubscribeUser();
        } else {
          subscribeUser();
        }
    }
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
        console.log("Clear all user data on the server")
        /*var subUrl = "https://autoempushy.herokuapp.com/v1/unsub";

        var formData = JSON.stringify({
            "userId": null,
            "subId": subId,
            "subInfo": subscription            
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
        $('#cb-info').prop('checked', false)
        $('#cb-consent').prop('checked', false)
        
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
    
    $('#exampleModal').modal('show')

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  if (subscription) {
      console.log("Updating the subscription on the server")
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

  


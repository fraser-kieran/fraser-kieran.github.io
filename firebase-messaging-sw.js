// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.2/firebase-messaging.js');
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

const messaging = firebase.messaging();

/**
 * Here is is the code snippet to initialize Firebase Messaging in the Service
 * Worker when your app is not hosted on Firebase Hosting.
 // [START initialize_firebase_in_sw]
 // Give the service worker access to Firebase Messaging.
 // Note that you can only use Firebase Messaging here, other Firebase libraries
 // are not available in the service worker.
 importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js');
 importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-messaging.js');
 // Initialize the Firebase app in the service worker by passing in
 // your app's Firebase config object.
 // https://firebase.google.com/docs/web/setup#config-object
 firebase.initializeApp({
   apiKey: 'api-key',
   authDomain: 'project-id.firebaseapp.com',
   databaseURL: 'https://project-id.firebaseio.com',
   projectId: 'project-id',
   storageBucket: 'project-id.appspot.com',
   messagingSenderId: 'sender-id',
   appId: 'app-id',
   measurementId: 'G-measurement-id',
 });
 // Retrieve an instance of Firebase Messaging so that it can handle background
 // messages.
 const messaging = firebase.messaging();
 // [END initialize_firebase_in_sw]
 **/


// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
    
    try{
        if(payload && payload.data && payload.data.notification){
    
            notification = JSON.parse(payload.data.notification)

            if(notification.hasOwnProperty('midstudy')){
                options = {
                    body: 'Nightly Survey',
                    badge: '/images/badge.png',
                    icon: '/images/favicon.png',
                    data: {
                        notificationId: null,
                        userId: notification.user,
                        url: notification.url,
                        midstudy: true
                    },

                };
                event.waitUntil(self.registration.showNotification('Pushd Study Alert', options));
            }
            else if(notification.hasOwnProperty('closing')){
                options = {
                    body: 'You have finished the study. Click to confirm submission.',
                    badge: '/images/badge.png',
                    icon: '/images/favicon.png',
                    data: {
                        notificationId: null,
                        userId: notification.user,
                        url: notification.url,
                        closing: true
                    },

                };
                event.waitUntil(self.registration.showNotification('Pushd Study Alert', options));
            }
            else{

                var notification_data = { notification: { data: { notificationId: notification.id,
                                                              userId: notification.user,
                                                              engagement: 'delivered' } } }
                update_engagement(notification_data, 'delivered')

                var options = {}

                switch(notification.template){
                    case 'control':
                        title = "1"+notification.domain
                        options = {
                            body: notification.summary,
                            badge: '/images/badge.png',
                            icon: 'https://'+notification.domain+'/favicon.ico',
                            data: {
                                notificationId: notification.id,
                                userId: notification.user,
                                url: notification.url,
                                topic: notification.topic,
                                sentiment: notification.sentiment,
                                enticement: notification.enticement,
                                keywords: notification.keywords,
                                emojis: notification.emoji_key
                            }
                        };
                        event.waitUntil(self.registration.showNotification(title, options));
                        break;
                    case 'emojikey':
                        title = "1"+notification.domain
                        options = {
                            body: summary_to_keywords(notification),
                            badge: '/images/badge.png',
                            icon: 'https://'+notification.domain+'/favicon.ico',
                            data: {
                                notificationId: notification.id,
                                userId: notification.user,
                                url: notification.url,
                                topic: notification.topic,
                                sentiment: notification.sentiment,
                                enticement: notification.enticement,
                                keywords: notification.keywords,
                                emojis: notification.emoji_key
                            }
                        };
                        event.waitUntil(self.registration.showNotification(title, options));
                        break;
                    case 'emojisen':
                        title = "1"+notification['emoji_sen']+'\n - '+notification.domain
                        options = {
                            body: notification.summary,
                            badge: '/images/badge.png',
                            icon: 'https://'+notification.domain+'/favicon.ico',
                            data: {
                                notificationId: notification.id,
                                userId: notification.user,
                                url: notification.url,
                                topic: notification.topic,
                                sentiment: notification.sentiment,
                                enticement: notification.enticement,
                                keywords: notification.keywords,
                                emojis: notification.emoji_key
                            }
                        };
                        event.waitUntil(self.registration.showNotification(title, options));
                        break;
                    case 'empathetic':

                        title = "1"+empathetic_title(notification)
                        options = {
                            body: empathetic_summary(notification),
                            badge: empathetic_badge(notification), // sentiment badge
                            icon: 'https://'+notification.domain+'/favicon.ico',
                            data: {
                                notificationId: notification.id,
                                userId: notification.user,
                                url: notification.url,
                                topic: notification.topic,
                                sentiment: notification.sentiment,
                                enticement: notification.enticement,
                                keywords: notification.keywords,
                                emojis: notification.emoji_key
                            }
                        };
                        event.waitUntil(self.registration.showNotification(title, options));
                        break;
                }

            }
        }
    }catch(e){}
});

function summary_to_keywords(notification){
    summary = notification['summary'].replace(', ', ' ').toLowerCase()
    emojis = notification['emoji_key'].split(', ')
    keywords = notification['keywords'].split(', ')
    for(var i=0; i<keywords.length; i++)
        summary = summary.replace(keywords[i], keywords[i]+' '+emojis[i])
    return capitalizeFirstLetter(summary)
}

function summary_to_emoji(notification){
    emojis = notification['emoji_sen']
    summary = emojis + '\n' + notification.summary
    return summary
}

// Put sentiment here based on the value
function empathetic_title(notification){
    if(notification.hasOwnProperty('inf_topic'))
        notification.topic = notification.inf_topic
    return capitalizeFirstLetter(notification.topic.split(':')[0] + ' message from '+notification.domain)
}

function empathetic_badge(notification){
    if(notification.sentiment=='positive')
        return '/images/pos_badge.png'
    else if(notification.sentiment=='negative')
        return '/images/neg_badge.png'
    else
        return '/images/badge.png'
}

function empathetic_summary(notification){
    const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }
    if(notification.hasOwnProperty('inf_enticement'))
        notification.enticement = notification.inf_enticement
    switch(notification.enticement){
        case 'low':
            return notification.summary
        case 'medium':
            keywords = []
            emojis = []
            for(var i=0; i<notification.keywords.split(', ').length; i++){
                try{
                    keywords.push(notification.keywords.split(', ')[i])
                    emojis.push(notification.emoji_key.split(', ')[i])
                }catch(err){}
            }
            return emojis.filter(unique).join()+'\n'+
                keywords.filter(unique).join()
        case 'high':
            keywords = []
            emojis = []
            for(var i=0; i<notification.keywords.split(', ').length; i++){
                try{
                    keywords.push(notification.keywords.split(', ')[i])
                    emojis.push(notification.emoji_key.split(', ')[i])
                }catch(err){}
            }
            return emojis.filter(unique).join()+'\n'+
                keywords.filter(unique).join()
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

self.addEventListener('notificationclick', function(event) {
    try{
        event.notification.close();

        if(event.notification.data.notificationId==null){
            if (clients.openWindow) {
                event.waitUntil(clients.openWindow(event.notification.data.url+event.notification.data.userId))
            }
            return
        }
        else{
            if (!event.action) {
                // Was a normal notification click
                update_engagement(event, 'opened')
                if (clients.openWindow) {
                    event.waitUntil(clients.openWindow(event.notification.data.url+'?source=pushd'))
                }
                return;
            }
            update_engagement(event, 'unknown')
        }    
    }catch(e){}
    
    
});

self.addEventListener('notificationclose', function(event) {
    try{
        if(event.notification.data.notificationId!=null){
            update_engagement(event, 'dismissed')
        }
    }catch(e){}
});

function update_engagement(event, engagement){

    var engageUrl = "https://empushy.azurewebsites.net/v1/pushd/engagement";

    var formData = JSON.stringify({
        "userId": event.notification.data.userId,
        "notificationId": event.notification.data.notificationId,
        "engagement": engagement
    })
    
    fetch(engageUrl, {
        method: 'post',
        headers: {
          "Content-type": "application/json; charset=utf-8"
        },
        body: formData
    })
}

self.addEventListener('push', function(event) {
    
    // applicationServerKey: 
    // BJ-qALtORweP7IZtnNMoY-8gwsFsPSPXlrAYU6dBulwYcv6CPrIIr8-t57PgUPfGMqsg0DfVPre_thVyWqBPaZo
    
    try{
        notification = event.data.json()

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
    }catch(e){}
});

// https://developers.google.com/web/updates/2016/09/options-of-a-pushsubscription
/*self.addEventListener('pushsubscriptionchange', e => {  
    try{
        var oldsub = e.oldSubscription
        e.waitUntil(registration.pushManager.subscribe(e.oldSubscription.options)  
        .then(subscription => {  

            var resubURL = "https://empushy.azurewebsites.net/v1/pushd/resubscribe";

            var formData = JSON.stringify({
                "oldsub": oldsub,
                "newsub": subscription
            })

            fetch(resubURL, {
                method: 'post',
                headers: {
                  "Content-type": "application/json; charset=utf-8"
                },
                body: formData
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log("Updated subscription")
            })
        })); 
    }catch(e){}
});*/

// https://pushpad.xyz/service-worker.js
self.addEventListener('pushsubscriptionchange', function(event) {
  event.waitUntil(
    fetch('https://empushy.azurewebsites.net/v1/pushd/resubscribe', {
      method: 'post',
      headers: { "Content-type": 'application/json; charset=utf-8' },
      body: JSON.stringify({
        "oldsub": event.oldSubscription,
        "newsub": event.newSubscription
      })
    })
  );
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

/*
function multipleEmpatheticTitle(notifications){
    const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }
    topics = []
    for(var i=0; i<notifications.length; i++){
        if(notifications[i].data && notifications[i].data.topic)
            topics.push(notifications[i].data.topic)
    }
    return 'Messages on '+topics.filter(unique).join()
}

function multipleEmpatheticBody(notifications){
    const unique = (value, index, self) => {
      return self.indexOf(value) === index
    }
    keywords = []
    emojis = []
    for(var i=0; i<notifications.length; i++){
        if(notifications[i].data && notifications[i].data.keywords && notifications[i].data.emojis){
            try{
                for(var j=0; j<notifications[i].data.keywords.split(', ').length; j++){
                    keywords.push(notifications[i].data.keywords.split(', ')[j])
                    emojis.push(notifications[i].data.emojis.split(', ')[j])
                }
            }catch(err){}
        }
    }
    return emojis.filter(unique).join()+'\n'+keywords.filter(unique).join()
}
*/

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
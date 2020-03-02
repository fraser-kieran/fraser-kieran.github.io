
self.addEventListener('push', function(event) {
    
    // applicationServerKey: 
    // BJ-qALtORweP7IZtnNMoY-8gwsFsPSPXlrAYU6dBulwYcv6CPrIIr8-t57PgUPfGMqsg0DfVPre_thVyWqBPaZo
    
    console.log('[Service Worker] Push Received.');
    //console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

    notification = event.data.json()
    console.log(notification)
    
    if(notification.hasOwnProperty('midstudy')){
        options = {
            body: 'Nightly Survey',
            badge: '/images/badge.png',
            icon: '/images/favicon.png',
            data: {
                notificationId: null,
                userId: notification.user,
                url: notification.url
            },

        };
        event.waitUntil(self.registration.showNotification('Pushd Study Alert', options));
    }
    else{
        
        notification_data = { notification: { data: { notificationId: notification.id,
                                                      userId: notification.userId,
                                                      engagement: 'delivered' } } }
        update_engagement(notification_data, 'delivered')
        
        var options = {}
        
        switch(notification.template){
            case 'control':
                title = notification.domain
                options = {
                    body: notification.summary,
                    badge: '/images/badge.png',
                    icon: notification.domain+'/favicon.ico',
                    data: {
                        notificationId: notification.id,
                        userId: notification.user,
                        url: notification.url
                    }
                };
                event.waitUntil(self.registration.showNotification(title, options));
                break;
            case 'emojikey':
                title = notification.domain
                options = {
                    body: summary_to_keywords(notification),
                    badge: '/images/badge.png',
                    icon: notification.domain+'/favicon.ico',
                    data: {
                        notificationId: notification.id,
                        userId: notification.user,
                        url: notification.url
                    }
                };
                event.waitUntil(self.registration.showNotification(title, options));
                break;
            case 'emojisen':
                title = notification.domain
                options = {
                    body: summary_to_emoji(notification),
                    badge: '/images/badge.png',
                    icon: notification.domain+'/favicon.ico',
                    data: {
                        notificationId: notification.id,
                        userId: notification.user,
                        url: notification.url
                    }
                };
                event.waitUntil(self.registration.showNotification(title, options));
                break;
            case 'empathetic':
                title = empathetic_title(notification)
                options = {
                    body: empathetic_summary(notification),
                    badge: '/images/badge.png', // sentiment badge
                    icon: notification.domain+'/favicon.ico',
                    data: {
                        notificationId: notification.id,
                        userId: notification.user,
                        url: notification.url
                    }
                };
                event.waitUntil(self.registration.showNotification(title, options));
                break;
        }
        
    }
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
    summary = emojis + '\n' + summary
    return summary
}

// Put sentiment here based on the value
function empathetic_title(notification){
    if(notification.hasOwnProperty('inf_topic'))
        notification.topic = notification.inf_topic
    return 'A ' + notification.topic.split(':')[0] + ' message from '+notification.domain
}

function empathetic_badge(notification){
    
}

function empathetic_summary(notification){
    if(notification.hasOwnProperty('inf_enticement'))
        notification.enticement = notification.inf_enticement
    switch(notification.enticement){
        case 'low':
            return notification.summary
        case 'medium':
            return 'Brief:\n' + notification.keywords
        case 'high':
            return 'Brief:\n' + notification.keywords
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

self.addEventListener('notificationclick', function(event) {
    
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
            console.log('Notification opened');

            update_engagement(event, 'opened')
            if (clients.openWindow) {
                event.waitUntil(clients.openWindow(event.notification.data.url+'?source=pushd'))
            }
            return;
        }
        console.log(`Unknown action clicked: '${event.action}'`);
        update_engagement(event, 'unknown')

        /*switch (event.action) {
        case 'read-later':
            console.log('deliver notification later');
            update_engagement(event, 'later')
            break;
        case 'liked':
            console.log('Update like metrics for this notification');
            update_engagement(event, 'liked')
            break;
        case 'dismissed':
            console.log('Update dismiss metrics for this notification');
            update_engagement(event, 'dismissed')
            break;
        default:
            console.log(`Unknown action clicked: '${event.action}'`);
            update_engagement(event, 'unknown')
            break;
        }*/
    }
    
    
});

self.addEventListener('notificationclose', function(event) {
    console.log('Notification dismissed')
    if(event.notification.data.notificationId!=null){
        update_engagement(event, 'dismissed')
    }
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
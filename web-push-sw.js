
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
                userId: notification.user
            },

        };
        event.waitUntil(self.registration.showNotification('Pushd Study Alert', options));
    }
    else{
        const title = notification.domain.replace('https://', '').replace('http://', '');
    
        //notification_data = { notification: { data: { notificationId: notification.id, userId: notification.userId } } }
        //update_engagement(notification_data, 'delivered')

        var options = {}

        //if(notification.imageURL!=''){
        options = {
            body: notification.summary,
            badge: '/images/badge.png',
            icon: 'https://'+notification.domain+'/favicon.ico',
            //image: notification.imageURL,
            data: {
                notificationId: notification.id,
                userId: notification.user,
                url: notification.url
            },
            /*actions: [
                {
                  action: 'read-later',
                  title: '💾 Later',
                  icon: 'https://pushdweb.github.io/images/ic_later.png'
                },
                {
                  action: 'liked',
                  title: '👍 Like',
                  icon: 'https://pushdweb.github.io/images/ic_like.png'
                },  
                {
                  action: 'dismissed',
                  title: 'Remove',
                  icon: 'https://pushdweb.github.io/images/ic_like.png'
                }            
            ]*/
        };
        /*}
        else {
            options = {
                body: notification.message,
                badge: '/images/badge.png',
                icon: notification.icon,
                data: {
                    notificationId: notification.id,
                    userId: notification.userId
                },
                actions: [
                    {
                      action: 'read-later',
                      title: '💾 Later',
                      icon: 'https://pushdweb.github.io/images/ic_later.png'
                    },
                    {
                      action: 'liked',
                      title: '👍 Like',
                      icon: 'https://pushdweb.github.io/images/ic_like.png'
                    },  
                    {
                      action: 'dismissed',
                      title: 'Remove',
                      icon: 'https://pushdweb.github.io/images/ic_like.png'
                    }
                ]
            };  
        }*/

        event.waitUntil(self.registration.showNotification(title, options));
    }
});

self.addEventListener('notificationclick', function(event) {
    
    event.notification.close();
    
    if(event.notification.data.notificationId==null){
        if (clients.openWindow) {
            event.waitUntil(clients.openWindow('https://fraserkieran.com/pushd-insight.html?u='+event.notification.data.userId))
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
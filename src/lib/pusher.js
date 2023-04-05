import Pusher from 'pusher-js';

const pusher = new Pusher("31a0a5860ffb163ae87a", {
    cluster: 'us2',
    authEndpoint: '/api/auth/pusher',
    // auth: {
    //     headers: {
    //         'Cookie': `user=${{}}`
    //     }
    // }
});

export default pusher;
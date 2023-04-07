import Pusher from 'pusher-js';

const pusher = new Pusher("227d14e2b7408912423b", {
    cluster: 'us2',
    authEndpoint: '/api/auth/pusher',
    // auth: {
    //     headers: {
    //         'Cookie': `user=${{}}`
    //     }
    // }
});

export default pusher;
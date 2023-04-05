import Pusher from 'pusher-js';

console.log("PUSHER KEY:", process.env.PUSHER_KEY)
const pusher = new Pusher("31a0a5860ffb163ae87a", {
    cluster: 'us2',
});

export default pusher;
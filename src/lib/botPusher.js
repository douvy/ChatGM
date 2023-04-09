import Pusher, { Channel } from 'pusher-js';
import pusher from '../lib/pusher';

const botPusher = {
    channel: null,
}

pusher.connection.bind('connected', async () => {
    subscribeToBotChannel();
});

pusher.connection.bind('error', (error) => {
    console.log('Pusher subscription failed:', error);
});

const subscribeToBotChannel = async () => {
    if (botPusher.channel) {
        botPusher.channel.unsubscribe();
    }

    let channelName = `private-chatgoodmorning-bot`;
    botPusher.channel = pusher.subscribe(channelName);
}

export default botPusher;
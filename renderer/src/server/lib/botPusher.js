import Pusher from 'pusher';
import pusher from './pusher';

export const botPusher = {
    channel: null,
}

export const botSubscription = new Promise((resolve, reject) => {
    // // Do some asynchronous work
    // pusher.connection.bind('connected', async () => {
    //     subscribeToBotChannel();
    // });

    // pusher.connection.bind('error', (error) => {
    //     console.log('Pusher subscription failed:', error);
    // });

    // const subscribeToBotChannel = async () => {
    //     if (botPusher.channel) {
    //         botPusher.channel.unsubscribe();
    //     }

    //     let channelName = `chatgoodmorning-bot`;
    //     botPusher.channel = pusher.subscribe(channelName);
    //     resolve(botPusher);
    // }
});
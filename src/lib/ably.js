import Ably from "ably/promises";

// const ably = new Ably.Realtime.Promise(process.env.ABLY_API_KEY);
console.log("creating ably from token...");
export const ably = new Ably.Realtime.Promise({ authUrl: '/api/auth/createAblyToken' })

export const subscribeToChannel = (channelName, callback) => {
    const channel = ably.channels.get(channelName);

    channel.subscribe((message) => {
        callback(message.data);
    });
};
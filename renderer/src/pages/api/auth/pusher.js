import pusher from '../../../server/lib/pusher';

export default async function handler(req, res) {
    const channel = req.body.channel_name;
    const socketId = req.body.socket_id;

    const auth = pusher.authorizeChannel(socketId, channel);

    res.status(200).json(auth);
}

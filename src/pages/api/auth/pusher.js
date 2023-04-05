import pusher from '../../../server/lib/pusher';
// import cookie from 'cookie';

export default async function handler(req, res) {
    // console.log(req.body);
    //   const cookies = cookie.parse(req.headers.cookie || '');
    //   const user = cookies.user;

    //   if (!user) {
    //     res.status(401).end('Unauthorized');
    //     return;
    //   }

    const channel = req.body.channel_name;
    const socketId = req.body.socket_id;

    const auth = pusher.authenticate(socketId, channel, {
        user_id: 1,
    });

    res.status(200).json(auth);
}

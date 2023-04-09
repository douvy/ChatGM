import botPusher from '../../lib/botPusher';

export default function handler(req, res) {
    botPusher.channel?.trigger('client-message', {
        message: 'Good morning!',
        userId: '515763629',
    });
    res.status(200).end('Hello Cron!');
}
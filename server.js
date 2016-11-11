/* eslint no-console: 0 */
const path		= require('path');
const express 	= require('express');
const Redis 	= require('ioredis');
const Twit		= require('twit');
const config	= require('./twitter.json');

const app 		= express();
const redis 	= new Redis();
const sub 		= new Redis();
const twitter 	= new Twit(config);

const server 	= require('http').createServer(app);
const io 		= require('socket.io')(server);

const port = 1337;
server.listen(port);
console.log(`server started on port ${port}`);

redis.on('error', error => console.error('Redis error: ', error.toString()));

// Serve static files
app.use(express.static(path.join(__dirname, 'static/')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/index.html'));
});

function filterUserData(user) {
	return {
		id: user.id_str,
		name: user.screen_name,
	};
}

app.get('/api/users/search', (req, res) => {
	twitter.get('users/search', { q: req.query.q, count: 10 })
		.then(response => response.data)
		.then(data => data.map(filterUserData))
		.then(data => res.json(data))
		.catch(error => res.status(500).json(error));
});

app.get('/api/users/lookup', (req, res) => {
	twitter.get('users/lookup', { user_id: req.query.user_id })
		.then(response => response.data)
		.then(data => data.map(filterUserData))
		.then(data => res.json(data))
		.catch(error => res.status(500).json(error));
});

function getSettings() {
	return redis.pipeline()
		.smembers('settings:blacklist:words')
		.smembers('settings:blacklist:users')
		.smembers('settings:filter:track')
		.smembers('settings:filter:follow')
		.exec()
		.then(result => ({
			blacklist: {
				words: result[0][1],
				users: result[1][1],
			},
			filter: {
				track: result[2][1],
				follow: result[3][1],
			},
		}));
}

function updateSetting(setting, value) {
	switch (setting) {
	case 'add:blacklist:word':
		redis.sadd('settings:blacklist:words', value);
		break;
	case 'add:blacklist:user':
		redis.sadd('settings:blacklist:users', value);
		break;
	case 'add:filter:track':
		redis.sadd('settings:filter:track', value);
		break;
	case 'add:filter:follow':
		redis.sadd('settings:filter:follow', value);
		break;
	case 'remove:blacklist:word':
		redis.srem('settings:blacklist:words', value);
		break;
	case 'remove:blacklist:user':
		redis.srem('settings:blacklist:users', value);
		break;
	case 'remove:filter:track':
		redis.srem('settings:filter:track', value);
		break;
	case 'remove:filter:follow':
		redis.srem('settings:filter:follow', value);
		break;
	default:
		console.error('Attempting to update unknown setting:', setting);
		return;
	}
	redis.publish('update-cache', 'all');
}

// Communicate with clients
io.on('connect', (socket) => {
	getSettings().then((settings) => {
		socket.emit('update-settings', settings);
	});
	socket.on('alter-setting', data => updateSetting(data.setting, data.value));
	socket.on('update-filter', () => redis.publish('update-filter', 'all'));
});

sub.subscribe('update-cache');
sub.on('message', (channel, message) => {
	console.log(channel, message);
	switch (channel) {
	case 'update-cache':
		getSettings().then((settings) => {
			io.sockets.emit('update-settings', settings);
		});
		break;
	default:
		return;
	}
});


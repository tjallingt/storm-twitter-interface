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

app.get('/api/users/show', (req, res) => {
	console.log('user/show');
	twitter.get('users/show', { screen_name: req.query.screen_name })
		.then(response => response.data)
		.then(data => filterUserData(data))
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
		.smembers('settings:status:languages')
		.getbit('settings:status:retweets', 0)
		.getbit('settings:status:sensitive', 0)
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
			status: {
				languages: result[4][1],
				retweets: !!result[5][1],
				sensitive: !!result[6][1],
			},
		}));
}

function getData() {
	return redis.pipeline()
		.lrange('data:tweets:removed', 0, -1)
		.smembers('data:analysis:keywords')
		.exec()
		.then(result => ({
			removed: result[0][1].map(JSON.parse),
			keywords: result[1][1],
		}));
}

function updateSetting(key, action, value) {
	switch (key) {
	case 'settings:blacklist:words':
	case 'settings:blacklist:users':
	case 'settings:filter:track':
	case 'settings:filter:follow':
	case 'settings:status:languages':
		if (action === 'add') {
			redis.sadd(key, value);
		} else if (action === 'remove') {
			redis.srem(key, value);
		} else {
			console.error('Unknown action.', 'key', key, 'action', action, 'value', value);
		}
		break;
	case 'settings:status:retweets':
	case 'settings:status:sensitive':
		if (action === 'set') {
			redis.setbit(key, 0, value ? 1 : 0);
		} else {
			console.error('Unknown action.', 'key', key, 'action', action, 'value', value);
		}
		break;
	default:
		console.error('Unknown key.', 'key', key, 'action', action, 'value', value);
		return;
	}
	redis.publish('update-cache', 'all');
}

function updateData(key, action, value) {
	switch (key) {
	case 'data:analysis:keywords':
		if (action === 'remove') {
			redis.srem(key, value);
		} else {
			console.error('Unknown action.', 'key', key, 'action', action, 'value', value);
		}
		break;
	default:
		console.error('Unknown key.', 'key', key, 'action', action, 'value', value);
		return;
	}
	getData().then(data => io.sockets.emit('update-data', data));
}

// Communicate with clients
io.on('connect', (socket) => {
	getSettings().then(settings => socket.emit('update-settings', settings));
	socket.on('alter-setting', data => updateSetting(data.key, data.action, data.value));
	socket.on('alter-data', data => updateData(data.key, data.action, data.value));
	socket.on('update-filter', () => redis.publish('update-filter', 'all'));
	getData().then(data => socket.emit('update-data', data));
	setInterval(() => {
		getData().then(data => socket.emit('update-data', data));
	}, 5000);
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


const WebSocket = require('ws');
const port = new WebSocket.Server({ port: 1337 });
var clients = [];
var players = [];
var updatedPlayers = [];

port.on('connection', function(ws) {
	clients.push(ws);

	players.push(new Player());

	ws.on('message', function(e) {
		var message = JSON.parse(e);
		// if (message.type == 'move') {
		// 	players[message.info.id].moves = message.info.moves;
		// 	updatedPlayers.push(message.info.id);
		// }
		if (message.type == 'playerUpdate') {
			players[message.info.id].moves = message.info.moves;
			players[message.info.id].updated = true;
		}

	});

	//Send new player array of current players
	for (var i=0; i<players.length; i++) {
		ws.send(JSON.stringify({
			type: 'initPlayers',
			info: players[i],
		}));

		ws.send(JSON.stringify({
			type: 'receiveId',
			id: players[players.length-1].id
		}));
	}

	//Send other players new player data
	for (var i=0; i<clients.length-1; i++) {
		clients[i].send(JSON.stringify({
			type: 'newPlayer',
			info: players[players.length-1],
		}));
	}
});


//Run game physics
setInterval(function() {
	for (var i=0; i<players.length; i++) {
		players[i].update();

		clients[i].send(JSON.stringify({
			type: 'playersUpdate',
			players: players
		}));
	}
},30);


function Player() {
	this.x = 200;
	this.velX = Math.random()*2;
	this.y = 200;
	this.velY = Math.random()*2;
	this.id = clients.length-1;
	this.moves = [false, false, false, false];
	this.updated = false;
};

Player.prototype.update = function() {
	this.x += this.velX;
	this.y += this.velY;
	this.velX *= .97;
	this.velY *= .97;

	//Movement
	if (this.moves[0]) {
		this.velY -= 1;
	}
	else if (this.moves[2]) {
		this.velY += 1;
	}
	if (this.moves[1]) {
		this.velX += 1;
	}
	else if (this.moves[3]) {
		this.velX -= 1;
	}

	//Collisions
	if (this.x+20>400 || this.x-20<0) {
		this.velX = -this.velX*1.1;
	}
	if (this.y+20>400 || this.y-20<0) {
		this.velY = -this.velY*1.1;
	}
};






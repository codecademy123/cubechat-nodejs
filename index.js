var msgs = ["<b>Use WASD to move around and chat with your friends!</b>"];
var express = require("express");
var app = express();
var serv = app.listen(process.env.PORT, "0.0.0.0");
var io = require("socket.io").listen(serv);
app.get("/",function(req, res) {
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));
console.log("Server started");
function getRandomColor() {
	var letters = "0123456789ABCDEF";
	var color = "#";
	for(var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
function makeid() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	for (var i = 0; i < 6; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var Player = function(id,username){
	var self = {
		x: 250,
		y: 250,
		width: 50,
		height: 50,
		id: id,
		color: getRandomColor(),
		username: username,
		pressingRight: false,
		pressingLeft: false,
		pressingUp: false,
		pressingDown: false,
		maxSpd: 10
	};
	self.updatePosition = function(){
		if(self.pressingRight)
			self.x += self.maxSpd;
		if(self.pressingLeft)
			self.x -= self.maxSpd;
		if(self.pressingUp)
			self.y -= self.maxSpd;
		if(self.pressingDown)
			self.y += self.maxSpd;
		if(self.x + self.width > 800){
			self.x = 800 - self.width;
		}
		if(self.x < 0){
			self.x = 0;
		}
		if(self.y + self.height > 500){
			self.y = 500 - self.height;
		}
		if(self.y < 0){
			self.y = 0;
		}
	};
	return self;
}
io.sockets.on("connection", function(socket) {
	socket.on("start", function(data) {
		socket.emit("connected", {});
		socket.id = makeid();
		SOCKET_LIST[socket.id] = socket;
		var player = Player(socket.id, data.user);
		PLAYER_LIST[socket.id] = player;
		msgs.push("<b style='color: " + player.color + "'>" + player.username + "(ID: " + player.id + ")</b> has joined");
		socket.emit("playerInfo", {username: player.username, id: player.id, color: player.color});
		socket.on("disconnect", function() {
			msgs.push("<b style='color: " + player.color + "'>" + player.username + "(ID: " + player.id + ")</b> left");
			delete SOCKET_LIST[socket.id];
			delete PLAYER_LIST[socket.id];
		});
		socket.on("keyPress", function(data) {
			if(data.inputId === "left") {
				player.pressingLeft = data.state;
			}
			else if(data.inputId === "right") {
				player.pressingRight = data.state;
			}
			else if(data.inputId === "up") {
				player.pressingUp = data.state;
			}
			else if(data.inputId === "down") {
				player.pressingDown = data.state;
			}
			});
		socket.on("addMsg", function(data) {
			msgs.push(data.comment);
		});
	});
});
setInterval(function() {
	var pack = [];
	for(var i in PLAYER_LIST) {
		var player = PLAYER_LIST[i];
		player.updatePosition();
		pack.push({
			x: player.x,
			y: player.y,
			color: player.color
		});
	}
	for(var n in SOCKET_LIST) {
		var socket = SOCKET_LIST[n];
		socket.emit("newPositions", pack);
		if(msgs.length > 100) {
			msgs.splice(0, msgs.length - 100);
			socket.emit("newMsgs", msgs);
		} else {
			socket.emit("newMsgs", msgs);
		}
	}
}, 25);

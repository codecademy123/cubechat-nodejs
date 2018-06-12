var user, id, color;
var focused = false;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
canvas.height = 500;
canvas.width = 800;
ctx.fillStyle = "red";
var socket = io();
socket.on("newPositions", function(data) {
	ctx.clearRect(0, 0, 800, 500);
	for(var i = 0; i < data.length; i++){
		ctx.fillStyle = data[i].color;
		ctx.fillRect(data[i].x, data[i].y, 50, 50);
	}
});
socket.on("newMsgs", function(data) {
	var text = "";
	for(var i = 0; i < data.length; i++) {
		text = text + data[i] + "<br />";
	}
	document.getElementById("messageBox").innerHTML = text;
});
socket.on("playerInfo", function(data) {
	user = data.username;
	id = data.id;
	color = data.color;
});
document.getElementById("login").onsubmit = function(e) {
	e.preventDefault();
	var username = document.getElementById("username").value;
	socket.emit('start', {user: username});
	document.getElementsByTagName("center")[0].removeChild(document.getElementById("login"));
	var br = document.createElement("br");
	var input = document.createElement("input");
	input.id = "comment";
	input.setAttribute("placeholder", " Enter your comment...");
	input.setAttribute("required", "required");
	input.addEventListener("focus", function() {
		focused = true;
	});
	input.addEventListener("blur", function() {
		focused = false;
	});
	var button = document.createElement("input");
	button.setAttribute("type", "submit");
	button.value = "Comment";
	document.getElementById("post").appendChild(br);
	document.getElementById("post").appendChild(input);
	document.getElementById("post").appendChild(button);
}
document.getElementById("post").onsubmit = function(e) {
	e.preventDefault();
	var text = "<b style='color:" + color + "'>" + user + "(ID: " + id + "):</b> " + document.getElementById("comment").value;
	socket.emit('addMsg', {comment: text});
	document.getElementById("comment").value = "";
}
document.onkeydown = function(event) {
	if(event.keyCode === 68 && !focused) {
		socket.emit('keyPress', {inputId: "right", state: true});
	}
	else if(event.keyCode === 83 && !focused) {
		socket.emit('keyPress', {inputId: "down", state: true});
	}
	else if(event.keyCode === 65 && !focused) {
		socket.emit('keyPress', {inputId: "left", state: true});
	}
	else if(event.keyCode === 87 && !focused) {
		socket.emit('keyPress', {inputId: "up", state: true});
	}
};
document.onkeyup = function(event){
	if(event.keyCode === 68 && !focused) {
		socket.emit('keyPress', {inputId: "right", state: false});
	}
	else if(event.keyCode === 83 && !focused) {
		socket.emit('keyPress', {inputId: "down", state: false});
	}
	else if(event.keyCode === 65 && !focused) {
		socket.emit('keyPress', {inputId: "left", state: false});
	}
	else if(event.keyCode === 87 && !focused) {
		socket.emit('keyPress', {inputId: "up", state: false});
	}
};
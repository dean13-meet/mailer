/**
 * New node file
 */
var http = require("http");
var url = require("url");

function start(route, handle) {
	function onRequest(request, response) {
		var postData = "";
		var pathname = url.parse(request.url).pathname;
		console.log("Request for " + pathname + " received.");
		//request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log("Received POST data chunk '"+
					postDataChunk + "'.");
		});
		request.addListener("end", function() {
			//JSON parse:
			var stringConstructor = "test".constructor;
			if(postData && postData.constructor===stringConstructor)
			{
				console.log("Parsing postdata");
				try{postData = JSON.parse(postData);}catch(e){console.log("Error parsing: " +e)}
			}
			route(handle, pathname, response, postData);
		});
	}
	server = http.createServer(onRequest).listen(process.env.PORT || 5000);
	console.log("Server has started.");
	
	var engine = require('engine.io');
	var sockServer = engine.attach(server);
	sockServer.on('connection', function (socket) {
		console.log("-1 user");
		  socket.on('message', function(data){ });
		  socket.on('close', function(){ });
		});
	var WebSocketServer = require('websocket').server;
	wsServer = new WebSocketServer({
	    httpServer: server
	});

	// WebSocket server
	wsServer.on('connection', function(request) {
		console.log('a user connected0');
	    var connection = request.accept(null, request.origin);

	    // This is the most important callback for us, we'll handle
	    // all messages from users here.
	    connection.on('message', function(message) {
	        if (message.type === 'utf8') {
	            // process WebSocket message
	        }
	    });

	    connection.on('close', function(connection) {
	        // close user connection
	    });
	});
	
	
	
	
	var io = require('socket.io').listen(server)
	io.on('connection', function(socket){
		  console.log('a user connected1');
		  socket.broadcast.emit('hi');
		  socket.on('disconnect', function(){
			    console.log('user disconnected');
			  });
		});
	/*
	server.on('connection', function(socket){
		  console.log('a user connected2');
		  try{
			  socket.broadcast.emit('hi');}catch(err){console.log("connection is not socket")}
		  socket.on('disconnect', function(){
			    console.log('user disconnected');
			  });
		});*/
}

exports.start = start;


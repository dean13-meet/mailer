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
	server = http.createServer(onRequest);
	server.listen(process.env.PORT || 5000);
	console.log("Server has started.");
	
	var io = require('socket.io').listen(server)
	io.on('connection', function(socket){
		  console.log('a user connected1');
		  socket.emit('hi');
		  socket.on('message', function(message))
				  {
			  console.log(message);
				  })
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


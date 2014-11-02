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
		request.setEncoding("utf8");
		request.addListener("data", function(postDataChunk) {
			postData += postDataChunk;
			console.log("Received POST data chunk '"+
				postDataChunk + "'.");
		});
		request.addListener("end", function() {
			console.log("routing postdata: " + postData)
			route(handle, pathname, response, postData);
		});
	}
	http.createServer(onRequest).listen(process.env.PORT || 5000);
	console.log("Server has started.");
}

exports.start = start;


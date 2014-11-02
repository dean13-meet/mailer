



function route(handle, pathname, response, postData) {
	pathname = pathname.toLowerCase();
	console.log("About to route a request for " + pathname + " , with data: " + postData);
	
	if (typeof handle[pathname] === 'function') {
		handle[pathname](response, postData);
	} 
	else if (pathname.indexOf("doge")>-1)
		{
		console.log("doge!!");
		handle["doge"](response, postData);
		}
	
		
	
	
	else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

exports.route = route;

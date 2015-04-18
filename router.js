

function route(handle, pathname, response, postData, trackers) {
	pathname = pathname.toLowerCase();
	console.log("About to route a request for " + pathname);
	
	if (typeof handle[pathname] === 'function') {
		shouldNotEnd = handle[pathname](response, postData, trackers);
		//if(shouldNotEnd===true && response.end)//if no response was given, just end response
			//{response.end();}
		
	} 
	
	else {
		console.log("No request handler found for " + pathname);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not found");
		response.end();
	}
}

exports.route = route;

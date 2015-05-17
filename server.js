/**
 * New node file
 */
var http = require("http");
var url = require("url");
var trackers = {};
var extend = require('util')._extend;// to allow cloning of objects


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
			req = request;
			ip = req.headers['x-forwarded-for'] || 
		     req.connection.remoteAddress || 
		     req.socket.remoteAddress ||
		     req.connection.socket.remoteAddress;
			//console.log("request: " + JSON.stringify(request.connection));
			
			console.log(ip);
			console.log(JSON.stringify(postdata));
			postData.requestIP = ip;
			console.log(JSON.stringify(postdata));
			route(handle, pathname, response, postData, trackers);
		});
	}
	server = http.createServer(onRequest);
	server.listen(process.env.PORT || 5000);
	console.log("Server has started.");
	
	
	 handlers = {};
     handlers["postMessage"] = "/resturant/postmessage";
     handlers["getMessagesFromChatObject"] = "/resturant/getmessagesfromchatobject";
     handlers["getAllResturantMenu"] = "/resturant/getallresturantmenu";
     handlers["saveResponse"] = "/resturant/saveuserresponsetoquestionbyquestionidanduserid";
     handlers["getDesc"] = "/resturant/getDescOfID";
     handlers["qIDSforEntity"] = "/resturant/getquestionidsforentity";
     handlers["getQuestion"] = "/resturant/getQuestion";
     handlers["getChatWithUser"] = "/resturant/getChatBetweenTwoUsers";
     handlers["getCustomers"] = "/resturant/getCustomers";
     handlers["getUserNameForResturant"] = "/resturant/getUserNameForResturant";
     handlers["getUserOrdersAtResturant"] = "/resturant/getUserOrdersAtResturant";
     handlers["imageIDFromEntity"] = "/resturant/imageIDFromEntity";
     handlers["socketCreateQuestion"] = "/resturant/socketCreateQuestion";
     handlers["setEntityToHaveImage"] = "/resturant/setEntityToHaveImage";
     handlers["socketGetImageFromID"] = "/resturant/socketGetImageFromID";
     
     
     //we are assuming that all iTrack methods accept socket, expect for those listed here:
     itrackMethodsNotAcceptingSockets = ["MITvideo", "onTheAppStore","sendMessage", "printTrackers", "runTrackerUpdate", "sendFenceMessage", "credits"]; //-- make this all lower case plz
     

     var handleCopy = extend({}, handle);//makes a copy
     for(index in itrackMethodsNotAcceptingSockets)
   	  {
   	  delete handleCopy["/itrack/" + itrackMethodsNotAcceptingSockets[index]];
   	  }
     
     
     //console.log(handleCopy);
     
     for(string in handleCopy)//handle came from main
   	  {
   	  if(string.indexOf("/itrack/")!=-1)//means this is an itrack method
   		  {
   		  handlers[string]=string;
   		  }
   	  }
     //console.log(handlers);
	var io = require('socket.io').listen(server, { log: false })
	io.on('connection', function(socket){
		  console.log('a user connected1');
		  socket.isOn = true;
		  socket.on('message', function(message)
				  {
			  console.log(message);
				  });
		  function registerInfo(info)
		  {
			  /*
			   * info:
			   * id
			   * field
			   */
			  if(!info.id || !info.field)
				{
					socket.send("error socketing: no obj/field to track");
					return;
				}
			  str = stringFromIDAndField(info.id, info.field);
			  if(str === "error")
				  {
				  socket.send("error socketing: obj/field is/are not string/s");
					return;
				  }
			  if(typeof trackers[str]!==typeof{})
				  {
				  trackers[str] = {};
				  }
			  trackers[str][socket.id] = socket;
			  socket.send("accepted track of: " + str);
			  console.log("accepted track of: " + str);
			  socket.send("Updated: " + str);
		  }
		  socket.on("registerForNotifications", registerInfo);
		  function resignInfo(info)
				  {
			  /*
			   * info:
			   * id
			   * field
			   */
			  if(!info.id || !info.field)
				{
					socket.send("error socketing: no obj/field to resign track");
					return;
				}
			  str = stringFromIDAndField(info.id, info.field);
			  if(str === "error")
			  {
			  socket.send("error socketing: obj/field is/are not string/s");
				return;
			  }
			  if(trackers[str])
				  {
				  console.log("deleting: " + trackers[str][socket.id]);
				  delete trackers[str][socket.id];
				  }
			  
				  }
		  socket.on("resignNotifications", resignInfo);
		  socket.on("registerAllTrackers", function(info){
			  if(typeof info !== typeof [])
				  {
				  socket.send("error socketing: info for register all is NOT in array form");
					return;
				  }
			  for(i = 0; i < info.length; i++)
			  {
			  
				  trackInfo = info[i];//string form
				  array = trackInfo.split("/");
				  if(array.length!=2)
					  {
					  socket.send("error socketing: string not appropriate in register all at index: " + i);
						break;
					  }
				  dictionary = {"id":array[0], "field":array[1]}
				  registerInfo(dictionary);
				  
			  }
		  });
		  socket.on("resignAllTrackers", function(info){
			  if(typeof info !== typeof [])
			  {
			  socket.send("error socketing: info for resign all is NOT in array form");
				return;
			  }
		  for(i = 0; i < info.length; i++)
			  {
			  
				  trackInfo = info[i];//string form
				  array = trackInfo.split("/");
				  if(array.length!=2)
					  {
					  socket.send("error socketing: string not appropriate in resign all at index: " + i);
						break;
					  }
				  dictionary = {"id":array[0], "field":array[1]}
				  resignInfo(dictionary);
				  
			  }
		  });
		  
		  
		  socket.on('disconnect', function(){
			    console.log('user disconnected');
			    socket.isOn = false;
			  });
		  
		  //else: -- look at: http://stackoverflow.com/questions/10405070/socket-io-client-respond-to-all-events-with-one-handler
		  var original_$emit = socket.$emit;
		  socket.$emit = function() {
		      var args = Array.prototype.slice.call(arguments);
		      original_$emit.apply(socket, ['*'].concat(args));
		      if(!original_$emit.apply(socket, arguments)) {
		          original_$emit.apply(socket, ['default'].concat(args));
		      }
		  }

		 
		  socket.on('default',function(event, data) {
			  
			  handler = handlers[event];
			  if(handler)
				  {
				  route(handle, handler, socket, data, trackers);
				  }
			  else
				  {
				  console.log("No destination for: " + event);
				  }
		  });
		  
		  
		});
	
}
exports.start = start;

function stringFromIDAndField(id, field)
{
return (typeof id === 'string' && typeof field === 'string') ? id + "/" + field	: "error";
}

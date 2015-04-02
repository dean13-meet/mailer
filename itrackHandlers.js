/**
 * New node file
 */



function createUser(socket, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var name
	 * var phoneNumber
	 */

	if(!postdata.name || !postdata.pass)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	name = userID+postdata.name;
	number = postdata.phoneNumber;
	//verify user doesn't exist and create it if it doesn't
	
	//how to respond
	function respond(name, response)
	{
		if(response.error==="not_found")//OK
			{
			saveObject({id:name, phoneNumber:number});
			sendMessageToValidateUser(name);
			}
		else//Not OK
			{
			console.log("elsed");
			}
	}
	
	getURL(getURLForObject(name), respond, [name], false);
}
exports.createUser = createUser;

function sendMessageToValidateUser(name)
{
	
	randomNumber = createAuth(4, true);//true = numbers only

	//get user object:
	
	//how to respond:
	function respond(user)
	{
		if(user.number)
			{
			user.authNumber = randomNumber;
			saveObject(user);
			sendMessage("", {message:"Your verification number is: " + randomNumber, number:user.number});
			}
		else
			return;
	}
	
}

function sendMessage(response, postData)
{
/*
 * PostData:
 * number
 * message
 */
	options = {
			method:'POST',
			url: 'http://textbelt.com/text',
			form:'message='+postData.message+"&number="+postData.number
			};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response.end)
					response.end(body);
				console.log("sending message: " + postData.message + " " + postData.number)
				console.log("message sent");
				console.log(body);
			}
		});
}
exports.sendMessage = sendMessage


//helper methods:

function typeOfID(id)
{
	/* 
	 * id allocation:
	 * user - 001_...
	 * resturant - 002_...
	 * order - 003_...
	 * item - 004_....
	 * employee - 005_...
	 * question - 006_...
	 * images - 007_...
	 */
	str = id.substring(0,3);
	switch(str)
	{
	case userID:return "user"
	default:return "error"
	}

}
userID = "001";

function getURLByIDType(idType)
{
	switch(idType)
	{
	case "user": return usersURL;
	default:return "error"
	}
}
//urls:
var baseURL = "https://couchdb-03f661.smileupps.com/itrack_";

var usersURL = baseURL + "users/";



function getURLForObject(objectID)
{
	categoryURL = getURLByIDType(typeOfID(objectID));
	console.log("cat url: " + categoryURL + " for id: " + objectID);
	return categoryURL==="error" ? categoryURL : categoryURL+objectID;
}



function createID(typeOfObject, callback, args)
{
	idPrefix = "error";
	switch(typeOfObject)
	{
	case "user":{idPrefix = userID; break;}
	
	default:return idPrefix;
	}
	id = idPrefix + "-" + createAuth(25);
	
	url = getURLForObject(id);
	
	console.log("s1");
	options = {
			method: 'GET',
			url: url,
			json: {}
	};
	request(options, function(err, res, body1) { if (err) {
		throw Error(err); } else {
			if(body1.error==="not_found")
				{
				args.push(id);
				
				callback.apply(this, args)
				}
			else
				{
				createID(typeOfObject, callback, args);
				}
			/*options2 = {
					method:'PUT',
					url: idCreator,
					json: body1
			};
			request(options2, function(err, res, body2) { if (err) {
				throw Error(err); } else {
					var id = idPrefix + body2.rev;
					console.log("s3");
					
					args.push(id);
					
					callback.apply(this, args)

				}
			});*/
		}
	});
}

numbers = "0123456789";
allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function createAuth(length, numbersOnly)
{
	var text = "";
	var possible = numbersOnly ? numbers : allChars;

	for( var i=0; i < length; i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function getObject(objID,callback, args, push, value)//use push if you need the argument pushed onto the last arg in args
{
	
	var url = getURLByIDType(typeOfID(objID));
	if(url==="error"){value = {"error": "Wrong objID. given objID: " + objID}}
	if(!value)
		{
		getURL(url+objID, getObject, [objID, callback, args, push], false);
		}
	else {
			if(!push){
				args.push(value); }
			else
			{
				lastArg = args[args.length-1];
			lastArg.push(value);
			}
			//console.log("Callback: " + callback + " args: " + args)
			callback.apply(this, args)
		}
}


function getURL(url, callback, args, push)
{
	console.log("getting url: " + url)
	options = {
			method:'GET',
			url: url
	};
	request(options, function(err, res, body) { if (err) {
		throw Error(err); } else {
			try{
		        a=JSON.parse(body);
		        body = a;//So that if error is called, we do not touch body yet.
		    }catch(e){
		      //Nothing
		    }
			if(!push){
				args.push(body); }
			else
			{
			lastArg = args[args.length-1];
			lastArg.push(body);
			}
			//console.log("Callback: " + callback + " args: " + args)
			callback.apply(this, args)
		}});
}

function saveObject(object, trackerUpdates, trackers)
{
	objectID = object.id;
	json = object;
	url = getURLForObject(objectID);
	if(url !=="error")
		{
		saveURL(url, json, trackerUpdates, trackers);
		}
}


//NOTE: field "TRACK_ANY_FIELD" will send track info on change for ANY field
function saveURL(url, json, trackerUpdates, trackers)
{
	options = {
			method:'PUT',
			url: url,
			json: json
	};
	request(options, function(err, res, body) { if (err) {
		throw Error(err); } else {
			//DONE

			console.log("Saved url: " + url);
			console.log("trackers: " + trackerUpdates);
			
			runTrackers(trackerUpdates, trackers);
		
		}});
}

function runTrackers(trackerUpdates, trackers)
{
	if(trackerUpdates && trackers){
		idsSent = [];
		Array.prototype.contains = function(arr)
		{
			console.log(arr);
			console.log(this.indexOf(arr));
			return this.indexOf(arr) !== -1;

		}
	for(i = 0; i < trackerUpdates.length; i++)
		{
		//NOTE: field "TRACK_ANY_FIELD" will send track info on change for ANY field
		tracker = trackerUpdates[i];
		console.log("Tracker updated: " + tracker);
		clients = trackers[tracker];
		if(clients)
			{
			for (var key in clients) {
				  if (clients.hasOwnProperty(key)) 
				  {
					  client = clients[key];
					  if(client.isOn){
							console.log("randomized key");
							client.send("Updated: " + tracker);
							console.log("Updated: " + tracker)}
					  else
						  delete clients[key];
				  }
				}
			
			}
		trackers[tracker] = clients; //--some clients may have been removed due to not being on
		
		id = tracker.substring(0, tracker.indexOf("/"));
		if(!idsSent.contains(id))
		{
		idsSent.push(id);
		trackerID = id +"/TRACK_ANY_FIELD";
		clients = trackers[trackerID];
		if(clients)
		{
		for (var key in clients) {
			  if (clients.hasOwnProperty(key)) 
			  {
				  client = clients[key];
				  if(client.isOn){
						console.log("randomized key");
						client.send("Updated: " + trackerID);
						console.log("Updated: " + trackerID)}
				  else
					  delete clients[key];
			  }
			}
		
		}
	trackers[trackerID] = clients; //--some clients may have been removed due to not being on
		}
		}
	}
}

function stringFromIDAndField(id, field)
{
return (typeof id === 'string' && typeof field === 'string') ? id + "/" + field	: "error";
}

//methods for checking on server:

function printTrackers(response, postdata, trackers)
{
	//explanation for trackers.hasOwnProperty... : http://stackoverflow.com/questions/558981/iterating-through-list-of-keys-for-associative-array-in-json
	for (var key in trackers) {
		  if (trackers.hasOwnProperty(key)) {
		    response.write(key + ":" + "\n");
		    tracker = trackers[key];
		    for(var key2 in tracker)
		    	{
		    	if(tracker.hasOwnProperty(key2))
		    		{
		    		client = tracker[key2];
		    		response.write(client.id + ":" + client.isOn + "\n");
		    		}
		    	}
		    
		    response.write("\n");//blank line
		  }
		}
	response.end();
}
exports.printTrackers = printTrackers;


function runTrackerUpdate(response, postdata, trackers)
{
	/*
	 * postdata:
	 * 
	 * array trackerUpdates
	 */
	if(!postdata.trackerUpdates)
	{
	if(response)
		response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
	else
		console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
	return;
	}
	runTrackers(postdata.trackerUpdates, trackers);
	response.end("Completed");
}
exports.runTrackerUpdate = runTrackerUpdate;
/**
 * New node file
 */

function requires(postdata, listOfStrings, socket)
{
	for(index in listOfStrings)
		{
		string = listOfStrings[index];
		if(!postdata[string])
			{
			sendToSocket(socket, 
					{"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()});
			return false;
			}
		}
	return true;
}

function sendToSocket(socket, json)
{
	if(socket)
		socket.send(JSON.stringify(json));
	else
		console.log(JSON.stringify(json));
}

function usernameEntered(socket, postdata, trackers)//log in
{
	/*
	 * PostData:
	 * var name
	 */
	if(!requires(postdata, ["name"], socket))return;
	getObject(postdata.name, function (response){//response = userObject
		
		//console.log(response);
		if(!response._id)//Say that username aint good - if we get an error (e.g. file not found), no _id is returned
		{
			if(socket)
				socket.send(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":false, last4DigitsOfNumber:false}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
			else
				console.log(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":false, last4DigitsOfNumber:false}));
			return;
			
		}
		else if(response.number)
			{
			if(socket)
				socket.send(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":true, last4DigitsOfNumber:response.number%10000}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
			else
				console.log(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":true, last4DigitsOfNumber:response.number%10000}));
			
			sendMessageToValidateUser(postdata.name);
			return;
			}
		
		
	else//user exists, but no number
		{
		if(socket)
			socket.send(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":true, last4DigitsOfNumber:false}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
		else
			console.log(JSON.stringify({"eventRecieved":"usernameEntered", "nameExists":true, last4DigitsOfNumber:false}));
		}
		
	}, [], false, "user");
	
}
exports.usernameEntered = usernameEntered;



function createUser(socket, postdata, trackers)//sign up
{
	/*
	 * PostData:
	 * var name
	 */

	if(!requires(postdata, ["name"], socket))return;
	
	name = postdata.name;
	//verify user doesn't exist and create it if it doesn't
	
	//how to respond
	function respond(response)
	{
		if(!response._id)//username free
			{
			if(socket)
				socket.send(JSON.stringify({"eventRecieved":"createUser", "success":true}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
			else
				console.log(JSON.stringify({"eventRecieved":"createUser", "success":true}));
			
			saveObject({_id:name, UUID: createAuth(30), auth:null, geofences:[], number:null, type:"user"}, "user");
			}
		else//username taken
			{
			if(socket)
				socket.send(JSON.stringify({"eventRecieved":"createUser", "success":false}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
			else
				console.log(JSON.stringify({"eventRecieved":"createUser", "success":false}));
			
			}
	}
	
	getObject(name, respond, [], false, "user");
}
exports.createUser = createUser;

function setPhoneNumberForUserName(socket, postdata, trackers)
{   //Note: Currently do NOT support changing the phone number!!! In other words, if a phone number is already set, return.
	/*
	 * PostData:
	 * var name
	 * var number
	 * optional var shouldAutoCallForVerification
	 */
	
	if(!requires(postdata, ["name", "number"], socket))return;
	
	//how to respond
	function respond(user)
	{
		if(!user._id)//username doesn't exist
			{
			if(socket)
				socket.send(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":false, "error":"user doesn't exist"}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
			else
				console.log(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":false, "error":"user doesn't exist"}));
			
			return;
			}
		else//username exists
			{
			
			if(user.number)//user already has a number set
				{
				if(socket)
					socket.send(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":false, "error":"user already has number"}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
				else
					console.log(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":false, "error":"user already has number"}));
				
				return;
				}
			else//no number set
				{
				user.number = postdata.number;
				if(socket)
					socket.send(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":true}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
				else
					console.log(JSON.stringify({"eventRecieved":"setPhoneNumber", "success":true}));
				saveObject(user, "user", false , false, 
						postdata.shouldAutoCallForVerification ? 
								function (name){sendMessageToValidateUser(name)}:false,
								[postdata.name]);
				//sync-call message verification only after save of new number completes.
				}
			}
	}
	
	getObject(postdata.name, respond, [], false, "user");
	
}
exports.setPhoneNumberForUserName = setPhoneNumberForUserName;

function sendMessageToValidateUser(name)
{
	
	randomNumber = createAuth(4, true);//true = numbers only

	//get user object:
	//how to respond:
	function respond(user)
	{
		if(user.number)
			{
			user.auth = randomNumber;
			saveObject(user, "user");
			sendMessage("", {message:"Your verification number is: " + user.auth, number:user.number});
			}
		else
			return;
	}
	getObject(name, respond, [], false, "user");
}

function retryValidation(socket, postdata, trackers)
{
	if(!requires(postdata, ["name"], socket))return;
	
	sendMessageToValidateUser(postdata.name);
}
exports.retryValidation = retryValidation;

function verifyAuthForUserName(socket, postdata, trackers)//gives userUUID if verify success
{
	if(!requires(postdata, ["auth", "name"], socket))return;
	
	function respond(auth, user)
	{
		if(user.auth && user.auth==auth)//check user.auth --- what someone might try doing is sending auth = nil so that if user.auth is nil they will equal and the hacker gets the userUUID!
			{
			sendToSocket(socket, 
					{"eventRecieved":"verifyAuthForUserName", "success":true, userUUID:user.UUID});
			}
		else
			{
			sendToSocket(socket, 
					{"eventRecieved":"verifyAuthForUserName", "success":false});
			}
	}
	getObject(postdata.name, respond, [postdata.auth], false, "user");
}
exports.verifyAuthForUserName = verifyAuthForUserName;

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
				if( response.end)
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
var geofencesFromUserURL = baseURL + "users/_design/userDesign/_view/geofencesFromUser?include_docs=true&key=";//+%22DEMO-USERNAME%22



function getURLForObject(objectID, knownType)
{
	categoryURL = getURLByIDType(knownType?knownType:typeOfID(objectID));
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

function getObject(objID,callback, args, push, knownType, value)//use push if you need the argument pushed onto the last arg in args
{
	var url = getURLByIDType(knownType?knownType:typeOfID(objID));
	if(url==="error"){value = {"error": "Wrong objID. given objID: " + objID}}
	if(!value)
		{
		getURL(url+objID, getObject, [objID, callback, args, push, knownType], false);
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

function saveObject(object, knownType, trackerUpdates, trackers, callAfter, args)//for syncronous saves, send a func to call after to be called after save is completed.
{
	objectID = object._id;
	json = object;
	url = getURLForObject(objectID, knownType);
	if(url !=="error")
		{
		saveURL(url, json, trackerUpdates, trackers, callAfter, args);
		}
}


//NOTE: field "TRACK_ANY_FIELD" will send track info on change for ANY field
function saveURL(url, json, trackerUpdates, trackers, callAfter, args)
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
			
			if(callAfter)
				callAfter.apply(this, args)
		
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
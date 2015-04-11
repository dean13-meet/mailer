/**
 * New node file
 */

function requires(postdata, listOfStrings, socket)
{
	for(index = 0; index < listOfStrings.length;index++)
		{
		stringToCheck = listOfStrings[index];
		if(!postdata.hasOwnProperty(stringToCheck))//so that we can take things like "0" or "false"
			{
			//console.log("missing " + stringToCheck);
			sendToSocket(socket, 
					{"error": "Missing info", "data received" : postdata, "missing":stringToCheck});
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

//Sign In
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
			
			saveObject({_id:name, UUID: createAuth(30), auth:null, geofences:{}, requestedGeofences:{}, number:null, type:"user", updates:[]}, "user");
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
				
				//check if anyone else has that number:
				
				function respond2(user, postdata, socket, response)
				{
					//console.log("response: " + JSON.stringify(response));
					if(response.rows.length==0){
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
					else
						{
						sendToSocket(socket, {"eventRecieved":"setPhoneNumber", "success":false, "reason":"number_taken"});
						return;
						}
				}
				
				getURL(userFromNumber+postdata.number, respond2, [user, postdata, socket], false);
				
				
				
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

//userUUID:
/*
 * Purpose
 * The purpose of the userUUID is to save the user login on the phone. It should NOT be used for 
 * refrencing in database (e.g. a Geofence should NOT have its owner field populated with a userUUID, 
 * instead it should use the username).
 */
function verifyAuthForUserName(socket, postdata, trackers)//gives userUUID if verify success
{
	if(!requires(postdata, ["auth", "name"], socket))return;
	
	function respond(auth, user)
	{
		if(user.auth && user.auth==auth)//check user.auth --- what someone might try doing is sending auth = nil so that if user.auth is nil they will equal and the hacker gets the userUUID!
			{
			sendToSocket(socket, 
					{"eventRecieved":"verifyAuthForUserName", "success":true, userUUID:user.UUID, username:user._id});
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


//Sync Geofences
/*
 * 
 * Geofence syncing works on the following priorities:
 * 
 * Pushes:
 * To update a geofence, you can only send "additions/removals". E.g., adding 1 person to rec list. YOU ARE NOT allowed
 * to "set" - e.g. setting the rec list to be ____. This allows for multiple instances to cause changes with minimal
 * conflicts.
 * 
 * Pulls:
 * When app loads, it automatically pulls all geofences. App continues to listen for tracker updates on ALL geofences,
 *  and USER's geofences and requestedGeofences fields (in case a new geofence gets created).
 *  (NOTE: listen to user by userUUID - the app isn't supposed to have username of yourself, therefore
 *  saves will send updates by userUUID)
 *  
 *  
 *  //Trackers:
 *  trackers will be sent by userUUID if a geofence is created/deleted.
 *  trackers will be sent by geofence userKnownIdentifier if a geofence is modified.
 *  
 *  BIG NOTE:::: 
 *  For now, we just overwrite changes to a geofence - no checking for add/remove as details above. 
 *  What is above is good, and should be implemented in the future - no time for it now (want to finish
 *  version 1 first). Since it is assumable that not many will log into the same account from 2 dif
 *  phones at the same time, above doesn't really matter now.
 * 
 */


function createGeofence(socket, postdata, trackers)
{//currently only supports self-creation
	/*
	 * PostData:
	 * Required
	 * owner - userUUID OR username (e.g. if not self-created)
	 * arrivalMessage
	 * leaveMessage
	 * lat
	 * long
	 * onArrival
	 * onLeave
	 * radius
	 * recs
	 * repeat
	 * address
	 * userKnownIdentifier --the identifier created for the fence by the iPhone
	 * 
	 * 
	 * Optional
	 * requester - userUUID, or blank
	 * status - automatically active if this is left blank
	 * 
	 */
	
	/*
	 * Security Check!
	 * If there is no requester, then owner MUST be userUUID! This is to ensure that you 
	 * cannot supply the username of another person and instantly add a tracker to them! To add a tracker,
	 * either you are the user (in that case you have the userUUID), or you are requesting (in that case
	 * the actual user must accept afterwards).
	 * If there is a requester, the requester must be a userUUID (you cannot request for someone using
	 * their username)
	 */
	
	if(!requires(postdata, ["owner", "arrivalMessage", "leaveMessage", "lat", "long"
	                        , "onArrival", "onLeave", "radius", "recs", "repeat", "address", "userKnownIdentifier"], socket))return;
	
	geofenceID = "GEOFENCE-"+createAuth(30);
	
	//console.log("trackers we got: " + JSON.stringify(trackers["u9ekhOWbtnUiQXxxQZryoRqCLP2g7R/geofences"]))
	function respond(geofenceID, postdata, isRequestingNameForUser, trackers, response)
	{
		
		response = response.rows[0];
		ownerName = isRequestingNameForUser?response.value._id:postdata.owner
		requesterName = isRequestingNameForUser?"":response.value._id
				
		geofence = 
			{
				_id:geofenceID,
				userKnownIdentifier:postdata.userKnownIdentifier,
				arrivalMessage:postdata.arrivalMessage,
				leaveMessage:postdata.leaveMessage,
				lat:postdata.lat,
				long:postdata.long,
				onArrival:postdata.onArrival,
				onLeave:postdata.onLeave,
				owner:ownerName,
				radius:postdata.radius,
				recs:postdata.recs,
				repeat:postdata.repeat,
				requestApproved:isRequestingNameForUser?"N/A":"Pending",
				requestedBy:requesterName,
				status:postdata.status||"Active",
				type:"geofence",
				address:postdata.address,
				arrivalsSent:[],
				leavesSent:[]
			}
		
		//save geofence -- note, no need to update trackers as no one is possibly tracking this (it 
		// is just now being created)
		saveObject(geofence, "geofence");
		
		function savingFunc(geofence, postdata, savingToUser, trackers, response)
		{
			if(savingToUser)
				{
				response.geofences[postdata.userKnownIdentifier] = geofence._id;
				}
			else
				{
				response.requestedGeofences[postdata.userKnownIdentifier] = geofence._id;
				}
			saveObject(response, "user", [response.UUID+(savingToUser?"/geofences":"/requestedGeofences")], trackers
					);//sending updates based on userUUID
			
		}
		//save geofence to owner -- tracker update when saving
		//console.log(ownerName);
		getObject(ownerName, savingFunc, [geofence, postdata, true, trackers], false, "user");
		if(requesterName!=="")
			{
			console.log("requesterName");
			getObject(requesterName, savingFunc, [geofence, postdata, false, trackers], false, "user");
			}
	}
	//finding username:
	if(!postdata.requester)//then we must fetch owner username from userUUID
		{
		url = usernameFromUUIDURL + "%22"+postdata.owner+"%22";
		//console.log(url);
		getURL(url, respond, [geofenceID, postdata, true, trackers], false);
		}
	
	else
		{
		//to deal with soon enough...
		}
}
exports.createGeofence = createGeofence;

function deleteGeofence(socket, postdata, trackers)
{
	/*
	 * Postdata
	 * 
	 * Required
	 * userUUID
	 * userKnownIdentifier
	 */
	if(!requires(postdata, ["userUUID", "userKnownIdentifier"], socket))return;
	function respond(postdata, trackers, userKnownIdentifier, response)
	{
		user = response.rows[0].doc;
		userOwnsFence = !!user.geofences[userKnownIdentifier];//do !! to turn to bool
		if(!userOwnsFence && !user.requestedGeofences[userKnownIdentifier])return;//user has no relationship to this fence
		
		//first get the geofence object so that later we know owner/requester
		getObject(userOwnsFence?user.geofences[userKnownIdentifier]:user.requestedGeofences[userKnownIdentifier], 
				
		function(postdata, trackers, response, geofence){
			
			//delete the geofence object
			deleteObject(userOwnsFence?user.geofences[userKnownIdentifier]:user.requestedGeofences[userKnownIdentifier], 
					"geofence");//no need to tracker update, tracker updates will be sent out once we update that the
			//fence is gone in the user.geofences/user.requestedFences
			
			function removeFenceFromUser(geofence, postdata, removingFromOwner, response)
		{
			if(removingFromOwner)
				{
				delete response.geofences[postdata.userKnownIdentifier];
				}
			else
				{
				delete response.requestedGeofences[postdata.userKnownIdentifier];
				}
			saveObject(response, "user", [response.UUID+(removingFromOwner?"/geofences":"/requestedGeofences")], trackers
					);//sending updates based on userUUID
			
		}
			getObject(geofence.owner, removeFenceFromUser, [geofence, postdata, true], false, "user");
			if(geofence.requestedBy!=="")
				{
				getObject(geofence.requestedBy, removeFenceFromUser, [geofence, postdata, false], false, "user");
				}
			
			
		},[postdata, trackers, response], false, "geofence"	
		);
		
		
	}
	
	url = userobjectFromUUIDURL + "%22"+postdata.userUUID+"%22";
	getURL(url, respond, [postdata, trackers, postdata.userKnownIdentifier], false);
}
exports.deleteGeofence = deleteGeofence;


function getGeofencesForUserUUID(socket, postdata, trackers)
{
/*
 * Postdata
 * 
 * userUUID - nothing else; if they have the UUID, they already signed in so they are in the clear
 * 
 */	
	
	if(!requires(postdata, ["userUUID"], socket))return;
	
	getURL(geofencesFromUserURL+"%22"+postdata.userUUID+"%22", function(socket, response){
		
		sendToSocket(socket, {"eventRecieved":"getGeofencesForUserUUID", rows:response.rows});
		
	}, [socket], false);
	
	
}
exports.getGeofencesForUserUUID = getGeofencesForUserUUID;

function getRequestedGeofencesForUserUUID(socket, postdata, trackers)
{
/*
 * Postdata
 * 
 * userUUID - nothing else; if they have the UUID, they already signed in so they are in the clear
 * 
 */	
	
	if(!requires(postdata, ["userUUID"], socket))return;
	
	getURL(requestedGeofencesFromUserURL+"%22"+postdata.userUUID+"%22", function(socket, response){
		
		sendToSocket(socket,{"eventRecieved":"getRequestedGeofencesForUserUUID", rows:response.rows});
		
	}, [socket], false);
	
	
}
exports.getRequestedGeofencesForUserUUID = getRequestedGeofencesForUserUUID;

//Send Requests to Others

function userNameFromQuery(socket, postdata, trackers)
{
/*
 * Postdata
 * 
 * Required
 * number
 * 
 */
	if(!requires(postdata, ["number"], socket))return;
	
	function respond(postdata, socket, response)
	{
		//console.log("response: " + JSON.stringify(response));
		if(response.rows.length==0){
			sendToSocket(socket, {"eventRecieved":"userNameFromQuery:"+postdata.number, "success":false, "reason":"doesn't_exist"});
			return;
		}
		else
			{
			sendToSocket(socket, {"eventRecieved":"userNameFromQuery:"+postdata.number, "success":true, "username":rows[0].id});
			return;
			}
	}
	
	getURL(userFromNumber+postdata.number, respond, [postdata, socket], false);
	
}
exports.userNameFromQuery;



function requestGeofence(socket, postdata, trackers)
{
	
}



//helper methods:

//typeOfID is outdated.
function typeOfID(id)
{
	/* 
	 * id allocation:
	 * user - 001_...
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
	case "geofence" : return usersURL;
	default:return "error"
	}
}
//urls:
var baseURL = "https://couchdb-03f661.smileupps.com/itrack_";

var usersURL = baseURL + "users/";
var geofencesFromUserURL = baseURL + "users/_design/userDesign/_view/geofencesFromUser?include_docs=true&key=";//+%22userUUID%22
var requestedGeofencesFromUserURL = baseURL + "users/_design/userDesign/_view/requestedGeofencesFromUser?include_docs=true&key=";//+%22userUUID%22
var usernameFromUUIDURL = baseURL + "users/_design/userDesign/_view/UUIDtoUsername?key=";//+%22userUUID%22
var userobjectFromUUIDURL = baseURL + "users/_design/userDesign/_view/UUIDtoUsername?include_docs=true&key=";//+%22userUUID%22
var geofenceFromUserKnownIdentifier = baseURL + "users/_design/userDesign/_view/geofenceFromUserKnownIdentifier?key=";//+%22userKnownIdentifier%22"
var userFromNumber = baseURL + "users/_design/userDesign/_view/userByNumber?key=";//+number (NOTE: no need for %22 - this is a number not string)


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

function deleteObject(objectID, knownType, trackerUpdates, trackers, callAfter, args)
{
	url = getURLForObject(objectID, knownType);
	if(url !=="error")
		{
		deleteURL(url, trackerUpdates, trackers, callAfter, args);
		}
}

function deleteURL(url, trackerUpdates, trackers, callAfter, args)
{
	function respond(url, trackerUpdates, trackers, callAfter, args, doc){
		if(!doc._rev)return;
	options = {
			method:'DELETE',
			url: url + "?rev="+doc._rev
			};
	request(options, function(err, res, body) { if (err) {
		throw Error(err); } else {
			//DONE

			console.log("Deleted url: " + url);
			console.log("trackers: " + trackerUpdates);
			
			runTrackers(trackerUpdates, trackers);
			
			if(callAfter)
				callAfter.apply(this, args)
		
		}});
		}
	//must get the object b4 deleting to know the _rev
	getURL(url, respond, [url, trackerUpdates, trackers, callAfter, args], false);
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
		//console.log("all trackers: " + JSON.stringify(trackers));
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
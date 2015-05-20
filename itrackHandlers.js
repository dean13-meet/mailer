/**
 * New node file
 */

assert = require('assert');
var requestHandlers = require("./requestHandling");

function requires(postdata, listOfStrings, socket) {
	for (index = 0; index < listOfStrings.length; index++) {
		stringToCheck = listOfStrings[index];
		if (!postdata.hasOwnProperty(stringToCheck))// so that we can take
			// things like "0" or
			// "false"
		{
			// console.log("missing " + stringToCheck);
			sendToSocket(socket, {
				"error" : "Missing info",
				"data received" : postdata,
				"missing" : stringToCheck
			});
			return false;
		}
	}
	return true;
}

function sendToSocket(socket, json) {
	if (socket)
		socket.send(JSON.stringify(json));
	else
		console.log(JSON.stringify(json));
}

//Sign In
function usernameEntered(socket, postdata, trackers)// log in
{
	/*
	 * PostData: var name
	 */
	if (!requires(postdata, [ "name" ], socket))
		return;

	if(postdata.name.length > 40)
	{
		sentToSocket(socket,{"eventRecieved":"usernameEntered","success":false,last4DigitsOfNumber:false, "reason":"name over 40 characters!"});
		return;
	}
	getURL(lowercaseUsername+"%22"+postdata.name.toLowerCase()+"%22", function(response) {

		response = response.rows[0];
		// console.log(response);
		if (!response)// Say that username aint good - if we get an error
			// (e.g. file not found), no _id is returned
		{
			if (socket)
				socket.send(JSON.stringify({
					"eventRecieved" : "usernameEntered",
					"nameExists" : false,
					last4DigitsOfNumber : false
				}));// must include id describing - many descriptors are
			// listening on other side, need them to know who gets the
			// description
			else
				console.log(JSON.stringify({
					"eventRecieved" : "usernameEntered",
					"nameExists" : false,
					last4DigitsOfNumber : false
				}));
			return;

		} 

		else
		{
			response = response.value;
			if (response.number) {
				if (socket)
					socket.send(JSON.stringify({
						"eventRecieved" : "usernameEntered",
						"nameExists" : true,
						last4DigitsOfNumber : response.number % 10000
					}));// must include id describing - many descriptors are
				// listening on other side, need them to know who gets the
				// description
				else
					console.log(JSON.stringify({
						"eventRecieved" : "usernameEntered",
						"nameExists" : true,
						last4DigitsOfNumber : response.number % 10000
					}));

				sendMessageToValidateUser(postdata.name);
				return;
			}

			else// user exists, but no number
			{
				if (socket)
					socket.send(JSON.stringify({
						"eventRecieved" : "usernameEntered",
						"nameExists" : true,
						last4DigitsOfNumber : false
					}));// must include id describing - many descriptors are
				// listening on other side, need them to know who gets the
				// description
				else
					console.log(JSON.stringify({
						"eventRecieved" : "usernameEntered",
						"nameExists" : true,
						last4DigitsOfNumber : false
					}));
			}
		}




	}, [], false);

}
exports.usernameEntered = usernameEntered;

function createUser(socket, postdata, trackers)// sign up
{
	/*
	 * PostData: var name
	 */

	if (!requires(postdata, [ "name" ], socket))
		return;

	if(postdata.name.length > 40)
	{
		sentToSocket(socket,{"eventRecieved":"createUser","success":false,"reason":"name over 40 characters!"});
		return;
	}

	name = postdata.name;
	// verify user doesn't exist and create it if it doesn't

	// how to respond
	function respond(response) {

		response = response.rows[0];
		if (!response)// username free
		{
			if (socket)
				socket.send(JSON.stringify({
					"eventRecieved" : "createUser",
					"success" : true
				}));// must include id describing - many descriptors are
			// listening on other side, need them to know who gets the
			// description
			else
				console.log(JSON.stringify({
					"eventRecieved" : "createUser",
					"success" : true
				}));

			saveObject({
				_id : name,
				UUID : createAuth(30),
				auth : null,
				geofences : {},
				requestedGeofences : {},
				number : null,
				type : "user",
				updates : {},
				latestRequestAuthTimestamps:[],
				latestAuthEnterTimestamps:[]
			}, "user");
		} else// username taken
		{
			response = response.value;
			if (socket)
				socket.send(JSON.stringify({
					"eventRecieved" : "createUser",
					"success" : false
				}));// must include id describing - many descriptors are
			// listening on other side, need them to know who gets the
			// description
			else
				console.log(JSON.stringify({
					"eventRecieved" : "createUser",
					"success" : false
				}));

		}
	}

	getURL(lowercaseUsername+"%22"+name.toLowerCase()+"%22", respond, [], false);
}
exports.createUser = createUser;

function setPhoneNumberForUserName(socket, postdata, trackers) { // Note:
	// Currently
	// do NOT
	// support
	// changing
	// the phone
	// number!!!
	// In other
	// words, if
	// a phone
	// number is
	// already
	// set,
	// return.
	/*
	 * PostData: var name var number optional var shouldAutoCallForVerification
	 */

	if (!requires(postdata, [ "name", "number" ], socket))
		return;

	// how to respond
	function respond(user) {
		user = user.rows[0];
		if (!user)// username doesn't exist
		{
			if (socket)
				socket.send(JSON.stringify({
					"eventRecieved" : "setPhoneNumber",
					"success" : false,
					"error" : "user doesn't exist"
				}));// must include id describing - many descriptors are
			// listening on other side, need them to know who gets the
			// description
			else
				console.log(JSON.stringify({
					"eventRecieved" : "setPhoneNumber",
					"success" : false,
					"error" : "user doesn't exist"
				}));

			return;
		} else// username exists
		{
			user = user.value;
			if (user.number)// user already has a number set
			{
				if (socket)
					socket.send(JSON.stringify({
						"eventRecieved" : "setPhoneNumber",
						"success" : false,
						"error" : "user already has number"
					}));// must include id describing - many descriptors are
				// listening on other side, need them to know who gets
				// the description
				else
					console.log(JSON.stringify({
						"eventRecieved" : "setPhoneNumber",
						"success" : false,
						"error" : "user already has number"
					}));

				return;
			} else// no number set
			{

				// check if anyone else has that number:

				function respond2(user, postdata, socket, response) {
					// console.log("response: " + JSON.stringify(response));
					if (response.rows.length == 0) {
						user.number = postdata.number;
						if (socket)
							socket.send(JSON.stringify({
								"eventRecieved" : "setPhoneNumber",
								"success" : true
							}));// must include id describing - many descriptors
						// are listening on other side, need them to
						// know who gets the description
						else
							console.log(JSON.stringify({
								"eventRecieved" : "setPhoneNumber",
								"success" : true
							}));
						saveObject(
								user,
								"user",
								false,
								false,
								postdata.shouldAutoCallForVerification ? function(
										name) {
									sendMessageToValidateUser(name)
								}
								: false, [ postdata.name ]);
						// sync-call message verification only after save of new
						// number completes.
					} else {
						sendToSocket(socket, {
							"eventRecieved" : "setPhoneNumber",
							"success" : false,
							"reason" : "number_taken"
						});
						return;
					}
				}

				getURL(userFromNumber + "%22" +  postdata.number + "%22", respond2, [ user,
				                                                                      postdata, socket ], false);

			}
		}
	}

	getURL(lowercaseUsername+"%22"+postdata.name.toLowerCase()+"%22", respond, [], false);

}
exports.setPhoneNumberForUserName = setPhoneNumberForUserName;

var permittedAuthRetries = 4;//actual is 5 - this is set to 4 b/c there r just so many methods using > not >=
var authTryTimeout = 60;//1 min
function sendMessageToValidateUser(name) {

	randomNumber = createAuth(4, true);// true = numbers only
	//TODO - remove apple admin login
	if(name=="AppleAdminOne" || name == "AppleAdminTwo" || name == "Sophie")randomNumber = "0000";
	// get user object:
	// how to respond:
	function respond(randomNumber, user) {
		user = user.rows[0];
		if(!user)
		{
			return;
		}
		user = user.value;
		currentTime = Math.floor(new Date() / 1000);
		if (user.number) {

			if(!user.latestRequestsAuthTimestamps)
			{
				user.latestRequestsAuthTimestamps = [];
			}
			else
			{
				latest = user.latestRequestsAuthTimestamps;
				console.log("permittedAuthRetries " + permittedAuthRetries);
				console.log(latest);
				if(latest.length>permittedAuthRetries)
				{

					//start trying to weed out tries that have timed out

					for(i = 0; i < latest.length;i++)
					{
						timestamp = latest[i];
						if(currentTime-authTryTimeout>timestamp)
						{
							latest.splice(i, 1);
							i--;
						}
					}
				}

				//now, check if there are still too many retries:
				if(latest.length>permittedAuthRetries)
				{
					console.log("Too many requests to reset auth came for user: " + user._id)

					saveObject(user,"user");//user with the removed auth retries from previous for loop
					return;
				}
			}

			user.latestRequestsAuthTimestamps.push(currentTime);

			user.auth = randomNumber;
			saveObject(user, "user");
			sendMessage("", {
				message : "Your verification number is: " + user.auth,
				number : user.number
			});
		} else
			return;
	}
	getURL(lowercaseUsername+"%22"+name.toLowerCase()+"%22", respond, [randomNumber], false);
}

function retryValidation(socket, postdata, trackers) {
	if (!requires(postdata, [ "name" ], socket))
		return;

	sendMessageToValidateUser(postdata.name);
}
exports.retryValidation = retryValidation;

//userUUID:
/*
 * Purpose The purpose of the userUUID is to save the user login on the phone.
 * It should NOT be used for refrencing in database (e.g. a Geofence should NOT
 * have its owner field populated with a userUUID, instead it should use the
 * username).
 */
function verifyAuthForUserName(socket, postdata, trackers)// gives userUUID if
//verify success
{
	if (!requires(postdata, [ "auth", "name" ], socket))
		return;

	function respond(auth, user) {
		user = user.rows[0];
		if(!user)
			return;
		user = user.value;

		currentTime = Math.floor(new Date() / 1000);

		if(!user.latestAuthEnterTimestamps)
		{
			user.latestAuthEnterTimestamps = [];
		}
		else
		{
			latest = user.latestAuthEnterTimestamps;
			if(latest.length>permittedAuthRetries)
			{
				console.log("permittedAuthRetries " + permittedAuthRetries);
				console.log(latest);
				//console.log("greater " + latest.length + " " + permittedAuthRetries)
				//start trying to weed out tries that have timed out

				for(i = 0; i < latest.length;i++)
				{
					timestamp = latest[i];
					if(currentTime-authTryTimeout>timestamp)
					{
						latest.splice(i, 1);
						i--;
					}
				}
			}

			//now, check if there are still too many retries:
			if(latest.length>permittedAuthRetries)
			{
				sendToSocket(socket,{"eventRecieved":"verifyAuthForUserName", 
					"success":false,
					"reason":"too many tries"
				})
				saveObject(user,"user");//user with the removed auth retries from previous for loop
				return;
			}
		}

		user.latestAuthEnterTimestamps.push(currentTime);

		if (user.auth && user.auth == auth || user._id=="AppleAdminOne" || user._id=="AppleAdminTwo")// check user.auth --- what someone
			// might try doing is sending auth =
			// nil so that if user.auth is nil
			// they will equal and the hacker
			// gets the userUUID!
		{
			sendToSocket(socket, {
				"eventRecieved" : "verifyAuthForUserName",
				"success" : true,
				userUUID : user.UUID,
				username : user._id
			});
		} else {
			sendToSocket(socket, {
				"eventRecieved" : "verifyAuthForUserName",
				"success" : false
			});
		}
		//Reset auth randomly so that old auth cant be used again
		user.auth = createAuth(4);
		//TODO - remove apple admin login
		if(user.adminStatus)user.auth="0000";
		saveObject(user, "user");
	}
	getURL(lowercaseUsername+"%22"+postdata.name.toLowerCase()+"%22", respond, [ postdata.auth ], false);
}
exports.verifyAuthForUserName = verifyAuthForUserName;

function sendMessage(response, postData) {
	/*
	 * PostData: number message
	 */

	console.log(response)
	options = {
		method : 'POST',
		url : 'http://textbelt.com/text?key=leitersdorf',
		form : 'message=' + postData.message + "&number=" + postData.number
	};
	request(options, function(err, res, body) {
		if (err) {
			throw Error(err);
		} else {
			//console.log(JSON.stringify(response))
			//console.log(response.end);
			if (response.end)
				response.end(body);
			console.log("sending message: " + postData.message + " "
					+ postData.number)
					console.log("message sent");
			console.log(body);
		}
	});
}
//exports.sendMessage = sendMessage




//this method is a single connection method -- that is so incase it times out and doesn't
//return to mobile phone in time, the phone knows message was not sent
function sendFenceMessage(response, postdata, trackers)
{
	//Send over lat,long - they will be compared against the geofence in the database.
	//Reasoning: If the fence lat,long was changed (e.g. by signing in from a different phone),
	//the old phone will still be tracking old geofences, which we don't want sending messages anymore.
	//Thus, we must check if the lat, long reached are still the same
	/*
	 * Postdata
	 * 
	 * Required
	 * 
	 * userKnownIdentifier
	 * lat
	 * long
	 * mode //Mode: 1 = arrived, 0 = left.
	 * 
	 */
	/*
	function badReturn(response3)
	{
		response3.end("Missing data");
		console.log("Missing data");
	}*/
	if(!postdata.lat || !postdata.long || !postdata.userKnownIdentifier)
	{
		//badReturn(response);
		console.log("actually, we are missing data")
		return;
	}


	mode = postdata.mode;

	console.log("LALALLLA");
	//console.log(JSON.stringify(response));
	//response.write("so?");
	function respond(response, postdata, trackers, mode, response2)
	{
		if(!response2.rows[0]){//badReturn(response);
			//response.end()
			console.log("fence don't exist");
			console.log(JSON.stringify(response2));
			return;}
		geofence = response2.rows[0].value;
		//response.end("here");

		a = geofence.status == "Active";//make sure it's active first
		b =  ((geofence.lat - postdata.lat)*100000 < 1 || -(geofence.lat - postdata.lat)*100000 < 1);
		c = ((geofence.long - postdata.long)*100000 < 1 || -(geofence.long - postdata.long)*100000 < 1);
		d = mode ? geofence.onArrival : geofence.onLeave;
		console.log("a: " + a + " b: " + b + " c: " + c + " d " + d);

		if(a&&b&&c&&d)
		{
			numbers = getNumbersFromRecs(geofence.recs);
			message = mode ? geofence.arrivalMessage : geofence.leaveMessage;
			message += "\n-" + geofence.owner+"\n\n\nSent From:\n" + geofence.address +"\n\nHere-N-There!"
			console.log(numbers);
			for(i = 0; i < numbers.length; i++)
			{
				number = numbers[i]
				//console.log("sending connection? " + (i==numbers.length-1) + " number " + JSON.stringify(response))
				sendMessage(i==numbers.length-1?response:"", {number: number, message: message})
				//TODO
				//Look above, sendMessage is responsible for telling response whether or not
				//sending the message was successful. However, currently we only send it a 
				//response object when we ask it to send the message to the last number.
				//This is to not have it call response.end many times. However, like this, it only
				//tells if it was successful at sending the message if the last message was 
				//successful - another one could have failed but we won't see it here!
			}

			//response.end("Try?");
			currentTime = Math.floor(new Date() / 1000);
			mode ? geofence.arrivalsSent.push(currentTime):geofence.leavesSent.push(currentTime);

			saveObject(geofence, "geofence");
		}
		else
		{
			//badReturn(response);
			console.log("failed passes")
		}

	}

	url = geofenceFromUserKnownIdentifier + "%22" + postdata.userKnownIdentifier + "%22";
	getURL(url, respond, [response, postdata, trackers, mode], false);

	return true;//see "router"

}
exports.sendFenceMessage = sendFenceMessage;



function getNumbersFromRecs(recs)
{
	//turns persons etc to numbers

	retval = [];
	dicType = typeof {};
	stringType = typeof "";
	for (i = 0; i < recs.length; i++)
	{
		obj = recs[i];
		switch(typeof obj)
		{
		case dicType:
			obj = obj.numbers
			for(key in obj)
			{
				val = obj[key];
				if(val)
				{
					key = key.replace(/[|&;$%@"<>()+,-]/g, "").split("1 ").join("");
					retval.push(key);
				}
			}
			break;
		case stringType:
		{
			key = obj;
			key = key.replace(/[|&;$%@"<>()+,]/g, "").split("1 ").join("");
			retval.push(key);
		}

		break;
		}
	}

	return retval;

}

//Updates for user

/*
 * 
 * Applicable updates:
 * -deletedGeofenceByOwner
 * -deletedGeofenceByRequester
 * -requestedGeofence
 * -requestedGeofenceAccepted
 * -requestedGeofenceDeclined
 * -requesterChangedFence
 * -ownerChangedFence
 * 
 * 
 * Exclusive Updates
 * --These updates are normal updates, with the exception that a user can only have one of them
 * --at a time. For instance, a geofence request updated should only be stored once, with the latest
 * --version.
 * -requesterChangedFence
 * -ownerChangedFence
 */
function createUpdate(userObject, name, userUUID, update, trackers) {

	console.log("createUpdate");
	console.log(name);
	console.log(userUUID);
	console.log(userObject);
	console.log(JSON.stringify(update));
	// You can send either userObject, name, or userUUID - the first one that is
	// non-nil will be used.

	//Create an id for the update:
	updateID = createAuth(30);
	update.updateID = updateID;

	exclusiveUpdates = ["requesterChangedFence", "ownerChangedFence"];

	//first check for exclusive updates:
	//See if the update being created is even exclusive:
	isAnExclusiveUpdate = false;
	for(i = 0; i < exclusiveUpdates.length;i++)
	{
		//console.log(i + " " + exclusiveUpdates[i]);
		if(update.updateName==exclusiveUpdates[i])
		{
			isAnExclusiveUpdate = true;
			break;
		}
	}

	console.log("creating update named: " + update.updateName + ", which is " +( 
			isAnExclusiveUpdate?"exclusive":"not exclusive") + ".");

	function retry(userObject, name, userUUID, update, trackers, response)
	//if there was a doc-update conflict, then over here we can retry
	{
		console.log("retry got: " + JSON.stringify(response));
		if(response.error=='conflict')
		{
			console.log("retry lauched");
			createUpdate(userObject, name, userUUID, update, trackers)
		}
	}

	if (userObject) {
		if(isAnExlusiveUpdate){
			for(key in userObject.updates)
			{
				value = userObject.updates[key];
				//console.log("looking at: " + JSON.stringify(value));
				if(value.updateName == update.updateName)
				{
					//console.log("destorying update: " + JSON.stringify(value) + " " + key);
					delete userObject.updates[key];
				}
			}
		}
		userObject.updates[updateID] = update;
		//console.log("updated userObject: " + JSON.stringify(userObject));
		saveObject(userObject, "user", [ userObject.UUID + "/updates" ],
				trackers,
				retry, [0, userObject.name, userUUID, update, trackers], true		
		);//if we failed in the userObject case, then don't resend the same userObject -_-
		//instead, we send the name from the userObject
	}
	else if (name) {
		function respondName(isAnExclusiveUpdate, update, trackers, response) {

			//console.log(JSON.stringify(response));
			if(isAnExclusiveUpdate){
				for(key in response.updates)
				{
					value = response.updates[key];
					//console.log("looking at: " + JSON.stringify(value) + " " + key);
					if(value.updateName == update.updateName)
					{
						delete response.updates[key];
					}
				}
			}

			response.updates[updateID] = update;
			saveObject(response, "user", [ response.UUID + "/updates" ],
					trackers, retry, [userObject, name, userUUID, update, trackers], true);

		}
		getObject(name, respondName, [ isAnExclusiveUpdate, update, trackers ], false, "user");
	}
	else if (userUUID) {
		function respondUserUUID(isAnExclusiveUpdate, update, trackers, response) {
			user = response.rows[0].doc;
			if(isAnExclusiveUpdate){
				for(key in user.updates)
				{
					value = user.updates[key];
					//console.log("looking at: " + JSON.stringify(value) + " " + key);
					if(value.updateName == update.updateName)
					{
						delete user.updates[key];
					}
				}
			}
			user.updates[updateID] = update;
			saveObject(user, "user", [ user.UUID + "/updates" ], trackers, retry, [userObject, name, 
			                                                                       userUUID, update, trackers], true);
		}
		url = userobjectFromUUIDURL + "%22" + userUUID + "%22";
		getURL(url, respondUserUUID, [ isAnExclusiveUpdate, update, trackers ], false);
	}
}

function getUpdatesForUser(socket, postdata, trackers)
{

	/*
	 * Postdata
	 * Required
	 * userUUID
	 */

	if (!requires(postdata, [ "userUUID" ], socket))
		return;

	function respond(response)
	{
		if(response.rows.length==0)
		{//no user for this userUUID

			sendToSocket(socket, {
				"eventRecieved" : "getUpdatesForUser",
				success:false, "reason":"invalid_userUUID"
			});
			return;
		}

		user = response.rows[0].doc;
		sendToSocket(socket, {
			"eventRecieved" : "getUpdatesForUser",
			success:true, "updates":user.updates
		});

	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	// console.log(url);
	getURL(url, respond, [], false);

}
exports.getUpdatesForUser = getUpdatesForUser;

function dismissUpdateForUser(socket, postdata, trackers)
{
	//NOTE: Doesn't send update to trackers (since you are supposed to know that you deleted this update...)
	/*
	 * Postdata
	 * Required
	 * userUUID
	 * updateID
	 */	
	if (!requires(postdata, [ "userUUID" , "updateID"], socket))
		return;

	function respond(updateID, response)
	{
		if(response.rows.length==0)
		{//no user for this userUUID
			return;
		}

		user = response.rows[0].doc;
		if(!user.updates[updateID])return;
		delete user.updates[updateID];

		saveObject(user, "user")

	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	// console.log(url);
	getURL(url, respond, [postdata.updateID], false);

}
exports.dismissUpdateForUser = dismissUpdateForUser;


//Sync Geofences
/*
 * 
 * Geofence syncing works on the following priorities:
 * 
 * Pushes: To update a geofence, you can only send "additions/removals". E.g.,
 * adding 1 person to rec list. YOU ARE NOT allowed to "set" - e.g. setting the
 * rec list to be ____. This allows for multiple instances to cause changes with
 * minimal conflicts.
 * 
 * Pulls: When app loads, it automatically pulls all geofences. App continues to
 * listen for tracker updates on ALL geofences, and USER's geofences and
 * requestedGeofences fields (in case a new geofence gets created). (NOTE:
 * listen to user by userUUID - the app isn't supposed to have username of
 * yourself, therefore saves will send updates by userUUID)
 * 
 * 
 * //Trackers: trackers will be sent by userUUID if a geofence is
 * created/deleted/accepted/declined. trackers will be sent by geofence userKnownIdentifier if a
 * geofence is modified.
 * 
 * BIG NOTE:::: For now, we just overwrite changes to a geofence - no checking
 * for add/remove as details above. What is above is good, and should be
 * implemented in the future - no time for it now (want to finish version 1
 * first). Since it is assumable that not many will log into the same account
 * from 2 dif phones at the same time, above doesn't really matter now.
 * 
 */

function createGeofence(socket, postdata, trackers) {// currently only
	// supports
	// self-creation
	/*
	 * PostData: Required owner - userUUID OR username (e.g. if not
	 * self-created) arrivalMessage leaveMessage lat long onArrival onLeave
	 * radius recs repeat address userKnownIdentifier --the identifier created
	 * for the fence by the iPhone
	 * 
	 * 
	 * Optional requester - userUUID, or blank status - automatically active if
	 * this is left blank
	 * 
	 */

	/*
	 * Security Check! If there is no requester, then owner MUST be userUUID!
	 * This is to ensure that you cannot supply the username of another person
	 * and instantly add a tracker to them! To add a tracker, either you are the
	 * user (in that case you have the userUUID), or you are requesting (in that
	 * case the actual user must accept afterwards). If there is a requester,
	 * the requester must be a userUUID (you cannot request for someone using
	 * their username)
	 */

	if (!requires(postdata, [ "owner", "arrivalMessage", "leaveMessage", "lat",
	                          "long", "onArrival", "onLeave", "radius", "recs", "repeat",
	                          "address", "userKnownIdentifier" ], socket))
		return;

	geofenceID = "GEOFENCE-" + createAuth(30);

	console.log("CREATED GEOFENCE ID " + geofenceID);

	// console.log("trackers we got: " +
	// JSON.stringify(trackers["u9ekhOWbtnUiQXxxQZryoRqCLP2g7R/geofences"]))
	function respond(geofenceID, postdata, isRequestingNameForUser, trackers,
			response) {

		if(!response.rows[0])return;
		user = response.rows[0].doc;
		ownerName = isRequestingNameForUser ? user._id
				: postdata.owner
				requesterName = isRequestingNameForUser ? "" : user._id

						geofence = {
						_id : geofenceID,
						userKnownIdentifier : postdata.userKnownIdentifier,
						arrivalMessage : postdata.arrivalMessage,
						leaveMessage : postdata.leaveMessage,
						lat : postdata.lat,
						long : postdata.long,
						onArrival : postdata.onArrival,
						onLeave : postdata.onLeave,
						owner : ownerName,
						radius : postdata.radius,
						recs : postdata.recs,
						repeat : postdata.repeat,
						requestApproved : isRequestingNameForUser ? "N/A" : "Pending",
								requestedBy : requesterName,
								status : postdata.status || "Active",
								type : "geofence",
								address : postdata.address,
								arrivalsSent : [],
								leavesSent : []
				}

		// save geofence -- note, no need to update trackers as no one is
		// possibly tracking this (it
		// is just now being created)
		// just make sure that if its being requested, then an update is
		// launched
		saveObject(geofence, "geofence", 0, 0, function(
				isRequestingNameForUser, postdata, requesterName, geofence,
				trackers) {
			if (!isRequestingNameForUser) {
				createUpdate(0, postdata.owner, 0, {
					"updateName" : "requestedGeofence",
					"requester" : requesterName,
					"geofence" : geofence
				}, trackers);
			}
		}, [ isRequestingNameForUser, postdata, requesterName, geofence,
		     trackers ]);

		function savingFunc(socket, geofence, postdata, savingToOwner, trackers,
				response2) {
			if (savingToOwner) {
				response2.geofences[postdata.userKnownIdentifier] = geofence._id;
			} else {
				response2.requestedGeofences[postdata.userKnownIdentifier] = geofence._id;
			}
			tracker = response2.UUID
			+ (savingToOwner ? "/geofences" : "/requestedGeofences");
			socketIgnore = {};
			socketIgnore[tracker] = true;
			ignoreClients = {};
			ignoreClients[socket.id] = socketIgnore;

			saveObject(response2, "user", [ tracker, ignoreClients ],
					trackers);// sending updates based on userUUID

		}
		// save geofence to owner -- tracker update when saving
		// console.log(ownerName);


		getObject(ownerName, savingFunc,
				[ socket, geofence, postdata, true, trackers ], false, "user");
		if (requesterName !== "") {
			console.log("requesterName");
			getObject(requesterName, savingFunc, [ socket, geofence, postdata, false,
			                                       trackers ], false, "user");
		}
	}
	// finding username
	if (!postdata.requester || postdata.requester=="")// then we must fetch owner username from userUUID
	{
		url = userobjectFromUUIDURL + "%22" + postdata.owner + "%22";
		// console.log(url);
		getURL(url, respond, [ geofenceID, postdata, true, trackers ], false);
	}

	else// then we must fetch requester name from userUUID
	{
		url = userobjectFromUUIDURL + "%22" + postdata.requester + "%22";
		// console.log(url);
		getURL(url, respond, [ geofenceID, postdata, false, trackers ], false);

	}
}
exports.createGeofence = createGeofence;

function deleteGeofence(socket, postdata, trackers) {
	/*
	 * Postdata
	 * 
	 * Required userUUID userKnownIdentifier
	 */
	if (!requires(postdata, [ "userUUID", "userKnownIdentifier" ], socket))
		return;
	function respond(postdata, trackers, userKnownIdentifier, socket, response) {
		if(!response || !response.rows || !response.rows[0]) return;
		user = response.rows[0].doc;
		console.log("user: " + JSON.stringify(user));
		if(!user)return;
		userOwnsFence = !(!user.geofences[userKnownIdentifier]);// do !(!..) to
		// turn to bool
		// ->
		// not(not...) =
		// ... (bool
		// form)
		if (!userOwnsFence && !user.requestedGeofences[userKnownIdentifier])
			return;// user has no relationship to this fence

		// first get the geofence object so that later we know owner/requester
		getObject(
				userOwnsFence ? user.geofences[userKnownIdentifier]
				: user.requestedGeofences[userKnownIdentifier],

				function(postdata, trackers, user, userKnownIdentifier,socket,
						geofence) {

					console.log("Deleting: " + JSON.stringify(geofence));
					// delete the geofence object
					deleteObject(
							userOwnsFence ? user.geofences[userKnownIdentifier]
							: user.requestedGeofences[userKnownIdentifier],
							"geofence");// no need to tracker update, tracker
					// updates will be sent out once we
					// update that the
					// fence is gone in the user.geofences/user.requestedFences

					function removeFenceFromUser(geofence, postdata,
							removingFromOwner, user, trackers, socket, response2) {
						if (removingFromOwner) {
							if(response2.geofences[postdata.userKnownIdentifier])
								delete response2.geofences[postdata.userKnownIdentifier];
						} else {
							if(response2.requestedGeofences[postdata.userKnownIdentifier])
								delete response2.requestedGeofences[postdata.userKnownIdentifier];
						}

						tracker = response2.UUID
						+ (removingFromOwner ? "/geofences"
								: "/requestedGeofences");
						socketIgnore = {};
						socketIgnore[tracker] = true;
						ignoreClients = {};
						ignoreClients[socket.id] = socketIgnore;
						saveObject(response2, "user", [ tracker , ignoreClients], trackers,
								function(removingFromOwner, response2, user,
										geofence, trackers) {
							if (!removingFromOwner && geofence.requestedBy!=user._id) {
								//we are removing from requester, and the person removing is not the requester 
								//then we must notify the requester that their fence was removed
								createUpdate(0, response2._id, 0, {
									"updateName" : "deletedGeofenceByOwner",
									"deletedBy" : user._id,
									"geofence" : geofence
								}, trackers);
							}
							else if
							(removingFromOwner && geofence.owner!=user._id) {
								//we are removing from owner, and the person removing is not the owner 
								//then we must notify the owner that their fence was removed
								createUpdate(0,response2._id, 0, {
									"updateName" : "deletedGeofenceByRequester",
									"deletedBy" : user._id,
									"geofence" : geofence
								}, trackers);

							}
						}, [ removingFromOwner, response2, user,
						     geofence, trackers ]);
					}
					getObject(geofence.owner, removeFenceFromUser, [ geofence,
					                                                 postdata, true, user, trackers , socket], false, "user");
					if (geofence.requestedBy !== "") {
						getObject(geofence.requestedBy, removeFenceFromUser, [
						                                                      geofence, postdata, false, user, trackers , socket],
						                                                      false, "user");
					}

				}, [ postdata, trackers, user, userKnownIdentifier, socket ], false,
		"geofence");

	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	getURL(url, respond, [ postdata, trackers, postdata.userKnownIdentifier , socket],
			false);

	// TODO
	// REMEMBER::::
	/*
	 * If deleting a fence with a requester, send an "update" to the requester
	 * to notify them (we want them to see a popup when they log in next time)!
	 */
}
exports.deleteGeofence = deleteGeofence;


var deepEqual = require('deep-equal');
function editGeofence(socket, postdata, trackers)
{
	//NOTE: DO NOT send tracker updates to the person sending this edit! It can throw them into an 
	//infinite loop - imagine the case where they think an update occurs everytime they download new
	//geofence info; if you send them the stuff was updated, they might think the updates are new
	//and will recall this, etc, etc.

	//NOTE: owner/requester are NOT allowed to change! If the owner/requester sent here do not
	//match what's on the database, reject the edit!

	/*
	 * PostData: 
	 * Required 
	 * owner - userUUID OR username
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
	 * userKnownIdentifier
	 * status
	 * amIOwner -- must send since we cannot identify between userUUID and names
	 * 
	 * 
	 * 
	 * Optional 
	 * requester - userUUID, or name, or blank
	 * 
	 */

	if (!requires(postdata, [ "owner", "arrivalMessage", "leaveMessage", "lat",
	                          "long", "onArrival", "onLeave", "radius", "recs", "repeat",
	                          "address", "userKnownIdentifier", "status" , "amIOwner"], socket))
		return;
	console.log(JSON.stringify(postdata));
	function respond(postdata, isRequestingNameForUser, trackers,
			response) {

		if(!response || !response.rows[0] || !response.rows[0].doc)return;
		user = response.rows[0].doc;
		ownerName = isRequestingNameForUser ? user._id
				: postdata.owner
				requesterName = isRequestingNameForUser ? postdata.requester : user._id


						function respond2(postdata, isRequestingNameForUser, trackers, user, ownerName, requesterName, response2)
		{
					if(!response2.rows[0])
					{
						console.log("No geofence matching, returning");return;
					}
					geofence = response2.rows[0].value;
					console.log(JSON.stringify(geofence));
					console.log(ownerName);
					console.log(requesterName);
					if(!geofence){console.log("no geofence, returning");return;}
					if(geofence.owner!==ownerName){console.log("owners don't match, returning");return;}
					if(geofence.requestedBy!=requesterName){console.log("requesters don't match, returning");console.log(requesterName);
					return;}
					console.log("passed");



					a = geofence.leaveMessage ==postdata.leaveMessage;
					b =  ((geofence.lat - postdata.lat)*100000 < 1 || -(geofence.lat - postdata.lat)*100000 < 1);
					c = ((geofence.long - postdata.long)*100000 < 1 || -(geofence.long - postdata.long)*100000 < 1);
					d = geofence.onArrival == postdata.onArrival;
					e = geofence.onLeave == postdata.onLeave;
					f = geofence.radius == postdata.radius;
					g = requesterName!="" || deepEqual(geofence.recs, postdata.recs)//if we have a requester, then recs are just that requester by default
					h = geofence.repeat == postdata.repeat;
					i = geofence.status == postdata.status;
					j = geofence.address == postdata.address;
					if(geofence.arrivalMessage==postdata.arrivalMessage
							&&
							a
							&&
							b
							&&
							c
							&&
							d
							&&
							e
							&&
							f
							&&
							g
							&&
							h
							&&
							i
							&&
							j
					)
					{
						console.log("Fence did not change, returning");
						return;
					}
					else
					{
						console.log("a: " + a + "b: " + b + "c: " + c + "d: " + d + "e: " + e + "f: " + f + "g: " + g 
								+"h: " + h + "i: " + i + "j: " + j);
					}
					geofence = {
							_id : geofence._id,
							_rev : geofence._rev,
							userKnownIdentifier : geofence.userKnownIdentifier,
							arrivalMessage : postdata.arrivalMessage,
							leaveMessage : postdata.leaveMessage,
							lat : postdata.lat,
							long : postdata.long,
							onArrival : postdata.onArrival,
							onLeave : postdata.onLeave,
							owner : ownerName,
							radius : postdata.radius,
							recs : requesterName==""?postdata.recs:geofence.recs,//can't change recs if there is a requester
									repeat : postdata.repeat,
									requestApproved : isRequestingNameForUser?geofence.requestApproved:"Pending",//If the user changing is the requester, change requestApproved to pending
											requestedBy : requesterName,
											status : postdata.status,
											type : "geofence",
											address : postdata.address,
											arrivalsSent : geofence.arrivalsSent,
											leavesSent : geofence.leavesSent
					}

					/* 
			socketIgnore = {};
			socketIgnore[tracker] = true;
			ignoreClients = {};
			ignoreClients[socket.id] = socketIgnore;*/
					saveObject(geofence, "geofence", 0, 0, function(
							isRequestingNameForUser, postdata, requesterName, ownerName, geofence,
							trackers) {


						if (requesterName && requesterName!="") {
							if(isRequestingNameForUser)
							{//owner changed fence
								createUpdate(0, requesterName, 0, {
									"updateName" : "ownerChangedFence",
									"changedBy" : ownerName,
									"geofence" : geofence
								}, trackers);
							}
							else{
								if(a&&b&&c&&d&&e&&f&&g&&h&&j && postdata.status=="Completed")return;
								//if the only thing that is different is turning off the fence, then no update should be sent!!

								createUpdate(0, ownerName, 0, {
									"updateName" : "requesterChangedFence",
									"changedBy" : requesterName,
									"geofence" : geofence
								}, trackers);}
						}
					}, [ isRequestingNameForUser, postdata, requesterName, ownerName, geofence,
					     trackers ], !isRequestingNameForUser?[postdata.requester+"/requestedGeofences"]:false, !isRequestingNameForUser?trackers:false);


		}

		url = geofenceFromUserKnownIdentifier + "%22" + postdata.userKnownIdentifier + "%22";
		getURL(url, respond2, [postdata, isRequestingNameForUser, trackers, user, ownerName, requesterName], false);

	}

	// finding username
	if (postdata.amIOwner)// then we must fetch owner username from userUUID
	{
		url = userobjectFromUUIDURL + "%22" + postdata.owner + "%22";
		// console.log(url);
		getURL(url, respond, [postdata, true, trackers ], false);
	}

	else// then we must fetch requester name from userUUID
	{
		url = userobjectFromUUIDURL + "%22" + postdata.requester + "%22";
		// console.log(url);
		getURL(url, respond, [postdata, false, trackers ], false);

	}

}
exports.editGeofence = editGeofence;

function getGeofencesForUserUUID(socket, postdata, trackers) {
	/*
	 * Postdata
	 * 
	 * userUUID - nothing else; if they have the UUID, they already signed in so
	 * they are in the clear
	 * 
	 */

	if (!requires(postdata, [ "userUUID" ], socket))
		return;

	getURL(geofencesFromUserURL + "%22" + postdata.userUUID + "%22", function(
			socket, response) {

		sendToSocket(socket, {
			"eventRecieved" : "getGeofencesForUserUUID",
			rows : response.rows
		});

	}, [ socket ], false);

}
exports.getGeofencesForUserUUID = getGeofencesForUserUUID;

function getRequestedGeofencesForUserUUID(socket, postdata, trackers) {
	/*
	 * Postdata
	 * 
	 * userUUID - nothing else; if they have the UUID, they already signed in so
	 * they are in the clear
	 * 
	 */

	if (!requires(postdata, [ "userUUID" ], socket))
		return;

	getURL(requestedGeofencesFromUserURL + "%22" + postdata.userUUID + "%22",
			function(socket, response) {

		sendToSocket(socket, {
			"eventRecieved" : "getRequestedGeofencesForUserUUID",
			rows : response.rows
		});

	}, [ socket ], false);

}
exports.getRequestedGeofencesForUserUUID = getRequestedGeofencesForUserUUID;

//Send Requests to Others

function userNameFromQuery(socket, postdata, trackers) {
	/*
	 * Postdata
	 * 
	 * Required number
	 * 
	 */
	if (!requires(postdata, [ "number" ], socket))
		return;

	function respond(postdata, socket, response) {
		// console.log("response: " + JSON.stringify(response));
		if (response.rows.length == 0) {
			sendToSocket(socket, {
				"eventRecieved" : "userNameFromQuery:" + postdata.number,
				"success" : false,
				"reason" : "doesn't_exist"
			});
			return;
		} else {
			sendToSocket(socket, {
				"eventRecieved" : "userNameFromQuery:" + postdata.number,
				"success" : true,
				"username" : response.rows[0].id
			});
			return;
		}
	}

	getURL(userFromNumber + "%22" + postdata.number + "%22", respond, [
	                                                                   postdata, socket ], false);

}
exports.userNameFromQuery = userNameFromQuery;

function requestGeofence(socket, postdata, trackers) {
	/*
	 * PostData: Required owner - username (this is the person we are requesting
	 * from) requester - userUUID (this is us) arrivalMessage leaveMessage lat
	 * long onArrival onLeave radius repeat address userKnownIdentifier --the
	 * identifier created for the fence by the iPhone
	 * 
	 * 
	 * Optional status - automatically active if this is left blank
	 * 
	 * NOTE: createGeofences requires "recs" ------ when requestingGeofence, the
	 * only person to be in "recs" is the requester. Therefore, do not pass
	 * "recs" in postdata as this method will automatically create an array with
	 * just the requester's number.
	 * 
	 */

	if (!requires(postdata, [ "owner", "arrivalMessage", "leaveMessage", "lat",
	                          "long", "onArrival", "onLeave", "radius", "requester", "repeat",
	                          "address", "userKnownIdentifier" ], socket))
		return;

	// get requester number:
	function respondRequest(postdata, socket, trackers, response) {
		response = response.rows[0].doc;
		if (!response.number)
			return;// some error occured!
		postdata.recs = [ response.number ];
		createGeofence(socket, postdata, trackers);
	}
	getURL(userobjectFromUUIDURL + "%22" + postdata.requester + "%22",
			respondRequest, [ postdata, socket, trackers ], false);
}
exports.requestGeofence = requestGeofence;

function acceptGeofence(socket, postdata, trackers)
{
	//For user accepting - tracker updates sent
	//For requesting user - createUpdate sent

	//This is because the accepting user already knows the fence is being accepted and so they
	//expect their mapview to auto update. However, the requesting user doesn't yet know their
	//fence was accepted.


	/*
	 * Postdata
	 * userUUID - owner (person accepting)
	 * geofenceID
	 */

	if (!requires(postdata, [ "userUUID", "geofenceID" ], socket))
		return;

	console.log(1);

	function respond(postdata, trackers, geofence)
	{console.log(2);
	console.log(JSON.stringify(geofence));
	function respond2(postdata, trackers, geofence, response)
	{console.log(3);
	if(response.rows.count==0)return;//user trying to accept geofence doesn't exist (userUUID doesn't match any user)
	user = response.rows[0].doc;
	console.log(JSON.stringify(user));
	if(user._id != geofence.owner)return;//if the user trying to accept this geofence isn't the owner then don't allow them...
	console.log(5);
	if(!geofence.requestedBy)return;//if this goefence was never a requested geofence, then what are we even doing here accepting it...
	console.log(4);
	geofence.requestApproved = "Accepted";
	console.log(JSON.stringify(geofence));
	saveObject(geofence, "geofence", [ user.UUID + "/geofences" ],//send tracker update to the owning user
			trackers,function(
					geofence, trackers) {
		createUpdate(0, geofence.requestedBy, 0, {
			"updateName" : "requestedGeofenceAccepted",
			"geofence" : geofence
		}, trackers);
	}, [ geofence, trackers ]
	);
	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	getURL(url, respond2, [ postdata, trackers, geofence ], false);

	}

	getObject(postdata.geofenceID, respond, [postdata, trackers], false, "geofence");

}
exports.acceptGeofence = acceptGeofence;

function declineGeofence(socket, postdata, trackers)
{
	//For user declining - tracker updates sent
	//For requesting user - createUpdate sent

	//This is because the declining user already knows the fence is being accepted and so they
	//expect their mapview to auto update. However, the requesting user doesn't yet know their
	//fence was accepted.


	/*
	 * Postdata
	 * userUUID - owner (person declining)
	 * geofenceID
	 */

	if (!requires(postdata, [ "userUUID", "geofenceID" ], socket))
		return;

	console.log(1);

	function respond(postdata, trackers, geofence)
	{console.log(2);
	console.log(JSON.stringify(geofence));
	function respond2(postdata, trackers, geofence, response)
	{console.log(3);
	if(response.rows.count==0)return;//user trying to accept geofence doesn't exist (userUUID doesn't match any user)
	user = response.rows[0].doc;
	console.log(JSON.stringify(user));
	if(user._id != geofence.owner)return;//if the user trying to accept this geofence isn't the owner then don't allow them...
	console.log(5);
	if(!geofence.requestedBy)return;//if this goefence was never a requested geofence, then what are we even doing here accepting it...
	console.log(4);
	deleteObject(geofence._id, "geofence", [ user.UUID + "/geofences" ],//send tracker update to the owning user
			trackers,function(
					geofence, trackers) {
		createUpdate(0, geofence.requestedBy, 0, {
			"updateName" : "requestedGeofenceDeclined",
			"geofence" : geofence
		}, trackers);

		//remove geofence from users: 
		//(no need to send any updates, enough updates sent above)

		function removeFenceFromUser(geofence, 
				removingFromOwner, response2) {

			console.log("removing from: " + removingFromOwner + " " + geofence.userKnownIdentifier);
			if (removingFromOwner) {
				delete response2.geofences[geofence.userKnownIdentifier];
			} else {
				delete response2.requestedGeofences[geofence.userKnownIdentifier];
			}
			saveObject(response2, "user");
		}


		getObject(geofence.owner, removeFenceFromUser, [ geofence,
		                                                 true], false, "user");
		getObject(geofence.requestedBy, removeFenceFromUser, [
		                                                      geofence, false],
		                                                      false, "user");


	}, [ geofence, trackers ]
	);
	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	getURL(url, respond2, [ postdata, trackers, geofence ], false);

	}

	getObject(postdata.geofenceID, respond, [postdata, trackers], false, "geofence");
}
exports.declineGeofence = declineGeofence;



//APN:
var agent = require('./APN');

exports.sendAPNMessage = function sendAPNMessage (socket, postdata, trackers)
{
	agent.createMessage()
	.device("5efbc8ce c95e80f5 356ceee6 cc5bf3e7 cfb0b2f7 467f5fc2 76f44c06 fa0b23d0")
	.alert('Hello Universe!')
	.send();

	socket.end("Done");
}


exports.registerDeviceUUID = function registerDeviceUUID(socket, postdata, trackers)
{
	if (!requires(postdata, [ "userUUID", "deviceUUID" ], socket))
		return;


	function respond(deviceUUID, response)
	{
		if(!response.rows.length)return;
		user = response.rows[0].doc;
		devices = user.devices;
		if(!devices)devices = [];
		contains = false;
		for(i = 0; i < devices.length; i++)
		{
			if(devices[i]==deviceUUID)
			{
				contains=true;
				break;
			}
		}
		if(!contains)
		{
			devices.push(deviceUUID);
			user.devices = devices;
			saveObject(user, "user");
		}
	}

	url = userobjectFromUUIDURL + "%22" + postdata.userUUID + "%22";
	getURL(url, respond, [ postdata.deviceUUID ], false);

}

//helper methods:

//typeOfID is outdated.
function typeOfID(id) {
	/*
	 * id allocation: user - 001_...
	 */
	str = id.substring(0, 3);
	switch (str) {
	case userID:
		return "user"
	default:
		return "error"
	}

}
userID = "001";

function getURLByIDType(idType) {
	switch (idType) {
	case "user":
		return usersURL;
	case "geofence":
		return usersURL;
	default:
		return "error"
	}
}
//urls:
var baseURL = "https://couchdb-03f661.smileupps.com/itrack_";

var usersURL = baseURL + "users/";
var geofencesFromUserURL = baseURL
+ "users/_design/userDesign/_view/geofencesFromUser?include_docs=true&key=";// +%22userUUID%22
var requestedGeofencesFromUserURL = baseURL
+ "users/_design/userDesign/_view/requestedGeofencesFromUser?include_docs=true&key=";// +%22userUUID%22
var usernameFromUUIDURL = baseURL
+ "users/_design/userDesign/_view/UUIDtoUsername?key=";// +%22userUUID%22
var userobjectFromUUIDURL = baseURL
+ "users/_design/userDesign/_view/UUIDtoUsername?include_docs=true&key=";// +%22userUUID%22
var geofenceFromUserKnownIdentifier = baseURL
+ "users/_design/userDesign/_view/geofenceFromUserKnownIdentifier?key=";// +%22userKnownIdentifier%22"
var userFromNumber = baseURL
+ "users/_design/userDesign/_view/userByNumber?key=";// +%22number%22
var lowercaseUsername = baseURL + "users/_design/userDesign/_view/lowercaseUsernames?key=";//%22usernameInLowercase%22

function getURLForObject(objectID, knownType) {
	categoryURL = getURLByIDType(knownType ? knownType : typeOfID(objectID));
	console.log("cat url: " + categoryURL + " for id: " + objectID);
	return categoryURL === "error" ? categoryURL : categoryURL + objectID;
}

function createID(typeOfObject, callback, args) {
	idPrefix = "error";
	switch (typeOfObject) {
	case "user": {
		idPrefix = userID;
		break;
	}

	default:
		return idPrefix;
	}
	id = idPrefix + "-" + createAuth(25);

	url = getURLForObject(id);

	console.log("s1");
	options = {
			method : 'GET',
			url : url,
			json : {}
	};
	request(options, function(err, res, body1) {
		if (err) {
			throw Error(err);
		} else {
			if (body1.error === "not_found") {
				args.push(id);

				callback.apply(this, args)
			} else {
				createID(typeOfObject, callback, args);
			}
			/*
			 * options2 = { method:'PUT', url: idCreator, json: body1 };
			 * request(options2, function(err, res, body2) { if (err) { throw
			 * Error(err); } else { var id = idPrefix + body2.rev;
			 * console.log("s3");
			 * 
			 * args.push(id);
			 * 
			 * callback.apply(this, args) } });
			 */
		}
	});
}

numbersPossible = "0123456789";
allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function createAuth(length, numbersOnly) {
	var text = "";
	var possible = numbersOnly ? numbersPossible : allChars;

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function getObject(objID, callback, args, push, knownType, value)// use push
//if you
//need the
//argument
//pushed
//onto the
//last arg
//in args
{
	var url = getURLByIDType(knownType ? knownType : typeOfID(objID));
	if (url === "error") {
		value = {
				"error" : "Wrong objID. given objID: " + objID
		}
	}
	if (!value) {
		getURL(url + objID, getObject,
				[ objID, callback, args, push, knownType ], false);
	} else {
		if (!push) {
			args.push(value);
		} else {
			lastArg = args[args.length - 1];
			lastArg.push(value);
		}
		// console.log("Callback: " + callback + " args: " + args)
		callback.apply(this, args)
	}
}

function getURL(url, callback, args, push) {
	console.log("getting url: " + url)
	options = {
		method : 'GET',
		url : url
	};
	request(options, function(err, res, body) {
		if (err) {
			throw Error(err);
		} else {
			try {
				a = JSON.parse(body);
				body = a;// So that if error is called, we do not touch body
				// yet.
			} catch (e) {
				// Nothing
			}
			if (!push) {
				args.push(body);
			} else {
				lastArg = args[args.length - 1];
				lastArg.push(body);
			}
			// console.log("Callback: " + callback + " args: " + args)
			callback.apply(this, args)
		}
	});
}

function saveObject(object, knownType, trackerUpdates, trackers, callAfter,
		args, getResponse)// for syncronous saves, send a func to call after to be called
//after save is completed.
{
	objectID = object._id;
	json = object;
	url = getURLForObject(objectID, knownType);
	if (url !== "error") {
		saveURL(url, json, trackerUpdates, trackers, callAfter, args, getResponse);
	}
}

function deleteObject(objectID, knownType, trackerUpdates, trackers, callAfter,
		args) {
	url = getURLForObject(objectID, knownType);
	if (url !== "error") {
		deleteURL(url, trackerUpdates, trackers, callAfter, args);
	}
}

function deleteURL(url, trackerUpdates, trackers, callAfter, args) {
	function respond(url, trackerUpdates, trackers, callAfter, args, doc) {
		if (!doc._rev)
			return;
		options = {
				method : 'DELETE',
				url : url + "?rev=" + doc._rev
		};
		request(options, function(err, res, body) {
			if (err) {
				throw Error(err);
			} else {
				// DONE

				console.log("Deleted url: " + url);
				console.log("trackers: " + trackerUpdates);

				runTrackers(trackerUpdates, trackers);


				if (callAfter)
					callAfter.apply(this, args)

			}
		});
	}
	// must get the object b4 deleting to know the _rev
	getURL(url, respond, [ url, trackerUpdates, trackers, callAfter, args ],
			false);
}

//NOTE: field "TRACK_ANY_FIELD" will send track info on change for ANY field
function saveURL(url, json, trackerUpdates, trackers, callAfter, args, getResponse) {
	//getResponse says whether you want the "ok":"201" back - if so, it will be added to args
	options = {
			method : 'PUT',
			url : url,
			json : json
	};
	request(options, function(err, res, body) {
		if (err) {
			throw Error(err);
		} else {
			// DONE



			console.log("Saved url: " + url);
			console.log(body);
			console.log("trackers: " + JSON.stringify(trackerUpdates));

			runTrackers(trackerUpdates, trackers);

			if(getResponse)
				args.push(body);

			if (callAfter)
				callAfter.apply(this, args)

		}
	});
}

function runTrackers(trackerUpdates, trackers) {
	if (trackerUpdates && trackers) {
		idsSent = [];
		Array.prototype.contains = function(arr) {
			//console.log(arr);
			//console.log(this.indexOf(arr));
			return this.indexOf(arr) !== -1;

		}

		var ignoreClients;

		lastTracker = trackerUpdates[trackerUpdates.length-1];
		if(typeof lastTracker === typeof {})
		{
			ignoreClients = lastTracker;
			trackerUpdates.splice(trackerUpdates.length-1, 1);
		}
		//console.log("ignore clients: " + JSON.stringify(ignoreClients));

		for (i = 0; i < trackerUpdates.length; i++) {
			// NOTE: field "TRACK_ANY_FIELD" will send track info on change for
			// ANY field
			tracker = trackerUpdates[i];
			//console.log("Tracker updated: " + tracker);
			clients = trackers[tracker];
			//console.log("With clients: " + clients)
			// console.log("all trackers: " + JSON.stringify(trackers));
			if (clients) {
				for ( var key in clients) {
					if (clients.hasOwnProperty(key)) {
						client = clients[key];
						//console.log("looking at client: " + client)
						if(ignoreClients && ignoreClients[client.id] && ignoreClients[client.id][tracker])continue;

						if (client.isOn) {
							//console.log("randomized key");
							client.send("Updated: " + tracker);
							//console.log("Updated: " + tracker)
						} else
							delete clients[key];
					}
				}

			}
			trackers[tracker] = clients; // --some clients may have been
			// removed due to not being on

			id = tracker.substring(0, tracker.indexOf("/"));
			if (!idsSent.contains(id)) {
				idsSent.push(id);
				trackerID = id + "/TRACK_ANY_FIELD";
				clients = trackers[trackerID];
				if (clients) {
					for ( var key in clients) {
						if (clients.hasOwnProperty(key)) {
							client = clients[key];
							if (client.isOn) {
								//console.log("randomized key");
								client.send("Updated: " + trackerID);
								//console.log("Updated: " + trackerID)
							} else
								delete clients[key];
						}
					}

				}
				trackers[trackerID] = clients; // --some clients may have been
				// removed due to not being on
			}
		}
	}
}

function stringFromIDAndField(id, field) {
	return (typeof id === 'string' && typeof field === 'string') ? id + "/"
			+ field : "error";
}

//methods for checking on server:

function printTrackers(response, postdata, trackers) {
	// explanation for trackers.hasOwnProperty... :
	// http://stackoverflow.com/questions/558981/iterating-through-list-of-keys-for-associative-array-in-json
	for ( var key in trackers) {
		if (trackers.hasOwnProperty(key)) {
			response.write(key + ":" + "\n");
			tracker = trackers[key];
			for ( var key2 in tracker) {
				if (tracker.hasOwnProperty(key2)) {
					client = tracker[key2];
					response.write(client.id + ":" + client.isOn + "\n");
				}
			}

			response.write("\n");// blank line
		}
	}
	response.end();
}
exports.printTrackers = printTrackers;

function runTrackerUpdate(response, postdata, trackers) {
	/*
	 * postdata:
	 * 
	 * array trackerUpdates
	 */
	if (!postdata.trackerUpdates) {
		if (response)
			response.end(JSON.stringify({
				"error" : "Missing info",
				"data received" : postdata,
				"atFunction" : arguments.callee.toString()
			}));
		else
			console.log(JSON.stringify({
				"error" : "Missing info",
				"data received" : postdata,
				"atFunction" : arguments.callee.toString()
			}));
		return;
	}
	runTrackers(postdata.trackerUpdates, trackers);
	response.end("Completed");
}
exports.runTrackerUpdate = runTrackerUpdate;

function credits(res, postdata, trackers)
{
	res.writeHead(200, {'content-type': 'text/html'});
	res.write("Here-N-There<br>" +
			"Mobile Application by: Dean Leitersdorf<br> " +
	"Image Credits: <a href=\"http://icons8.com/web-app/\">Icons8</a>");
	res.end();
}
exports.credits = credits;


function MITvideo(response, postdata, trackers)
{
	response.writeHead(301,
			{Location: 'https://www.youtube.com/watch?v=MPVIGdgCob8'}
	);
	response.end();


	currentTime = Math.floor(new Date() / 1000);
	requestHandlers.sendEmail(null, {user:"Link viewed on HNT", messageID:"blah", 
		context:"MITvideo was viewed at: " + currentTime + "(Unix Epoch Time) from: " + postdata.requestIP});
}
exports.MITvideo = MITvideo;

function onTheAppStore(response, postdata, trackers)
{
	response.writeHead(301,
			{Location: 'https://itunes.apple.com/us/app/here-n-there/id987723784?ls=1&mt=8'}
	);
	response.end();


	currentTime = Math.floor(new Date() / 1000);
	requestHandlers.sendEmail(null, {user:"Link viewed on HNT", messageID:"blah", 
		context:"onTheAppStore was viewed at: " + currentTime + "(Unix Epoch Time) from: " + postdata.requestIP});
}
exports.onTheAppStore = onTheAppStore;
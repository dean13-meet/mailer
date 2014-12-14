/*
 * Survey:
 * var orderID
 * array questions
 * 
 * Order:
 * var id
 * var auth
 * var resturant
 * array items
 * array employeesServing
 * array extraQuestions
 * 
 * Item:
 * var id //will only be used for saving!
 * var name
 * array questions
 * var image
 * 
 * Employee:
 * var id //will only be used for saving!
 * var name
 * var image
 * array questions
 * 
 * Question:
 * var id //will only be used for saving!
 * var text
 * var shouldAllowStarRating
 * var shouldAllowTextInput
 * var image
 * array userResponses
 * 
 * UserResponse:
 * var userID
 * var starRating
 * var textResponse
 * 
 * 
 * User:
 * var id
 * var name
 * var pass
 * var auth
 * array orders
 * array chats
 * TODO rest
 * 
 * Resturant:
 * var id
 * var name
 * var images
 * array chats
 * TODO rest
 * 
 * Image:
 * var id
 * var resturantID
 * var data
 * var Content_Type
 * 
 * chatObject:
 * var id
 * dic participants = {user/resturantID, lastChatMessageIndex}
 * array messages
 * var timestamp --lastest update to chat
 * 
 * message: 
 * (NOTE: messages are NOT objects and do not have IDs - they belong to chatObjects)
 * (NOTE: messages are dictionaries)
 * var objectReference (e.g. order reference, image reference)
 * var text
 * var timestamp
 * 
 * id allocation:
 * user - 001_...
 * resturant - 002_...
 * order - 003_...
 * item - 004_....
 * employee - 005_...
 * question - 006_...
 * image - 007_...
 * chatObject - 008_...
 * 
 */


//Create
function createOrder(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var resturant
	 * array items
	 * array employeesServing
	 * array extraQuestions
	 */

	if(!postdata.resturant || !postdata.items || !postdata.employeesServing || !postdata.extraQuestions)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!id){
		createID("order", createOrder, [response, postdata, trackers]);
	}else{
		auth = createAuth();

		json = 
		{
				id:id,
				auth:auth,
				resturant:postdata.resturant,
				itemsOrdered:postdata.items,
				employeesServing:postdata.employeesServing,
				extraQuestions:postdata.extraQuestions
		}
		options = {
				method:'PUT',
				url: ordersURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created order: " + body);

				console.log("Created order: " + body);

			}
		});
	}

}
exports.createOrder = createOrder;


function createItem(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var name
	 * array questions
	 * var imageID
	 */

	if(!postdata.name || !postdata.questions)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("item", createItem, [response, postdata, trackers]);
	}else{

		if(!postdata.imageID)postdata.imageID = "defFood";
		json = {
				id:id,
				name:postdata.name,
				imageID:postdata.imageID,
				questions:postdata.questions 
		}
		options = {
				method:'PUT',
				url: itemURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created item: " + body);

				console.log("Created item: " + body);

			}
		});


	}
}
exports.createItem = createItem;


function createEmployee(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var name
	 * array questions
	 * var imageID
	 */

	if(!postdata.name || !postdata.questions)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("employee", createEmployee, [response, postdata, trackers]);
	}else{
		if(!postdata.imageID)postdata.imageID = "defWaiter";
		json = {
				id:id,
				name:postdata.name,
				imageID:postdata.imageID,
				questions:postdata.questions 
		}
		options = {
				method:'PUT',
				url: employeeURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created employee: " + body);

				console.log("Created employee: " + body);

			}
		});


	}
}
exports.createEmployee = createEmployee;


function createQuestion(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var text
	 * var shouldAllowStarRating
	 * var shouldAllowTextInput
	 * var imageID
	 */

	if(!postdata.text || !postdata.shouldAllowStarRating || !postdata.shouldAllowTextInput)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("question", createQuestion, [response, postdata, trackers]);
	}else{
		if(!postdata.imageID)postdata.imageID = "defGeneralQuestion";
		json = {
				id:id,
				text:postdata.text,
				shouldAllowStarRating:postdata.shouldAllowStarRating,
				shouldAllowTextInput:postdata.shouldAllowTextInput,
				imageID:postdata.imageID,
				userResponses:[] 
		}
		options = {
				method:'PUT',
				url: questionURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created question: " + body);

				console.log("Created question: " + body);

			}
		});


	}
}
exports.createQuestion = createQuestion;


function createUser(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var name
	 */

	if(!postdata.name)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("user", createUser, [response, postdata, trackers]);
	}else{

		auth = createAuth();
		json = {
				id:id,
				name:postdata.name,
				pass:postdata.pass,
				auth:auth,
				orders:[],
				chats: []
		}
		options = {
				method:'PUT',
				url: usersURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created user: " + body);

				console.log("Created user: " + body);

			}
		});


	}
}
exports.createUser = createUser;


function createResturant(response, postdata, trackers, id)
{
	/*
	 * PostData:
	 * var name
	 */

	if(!postdata.name)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("resturant", createResturant, [response, postdata, trackers]);
	}else{

		json = {
				id:id,
				name:postdata.name,
				images:[],
				chats: []
		}
		options = {
				method:'PUT',
				url: resturantsURL + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created resturant: " + body);

				console.log("Created resturant: " + body);

			}
		});


	}
}
exports.createResturant = createResturant;

function urlToImageData(url, callback, args, push)
{
	//from http://stackoverflow.com/questions/3709391/node-js-base64-encode-a-downloaded-image-for-use-in-data-uri

	var URL = require('url');
    sURL = url;
    oURL = URL.parse(sURL);
    http = require('http');
    client = http.createClient(80, oURL.hostname);
    requestImage = client.request('GET', oURL.pathname, {'host': oURL.hostname});
requestImage.end();
requestImage.on('response', function (response)
{
    var type = response.headers["content-type"],
        prefix = type;
        body = "";

    response.setEncoding('binary');
    response.on('end', function () {
        var base64 = new Buffer(body, 'binary').toString('base64'),
            
        data = base64;
        console.log(data);
        json = {"data":data, "Content_Type":prefix};
        if(!push){
			args.push(json); }
		else
		{
			lastArg = args[args.length-1];
		lastArg.push(json);
		}
		//console.log("Callback: " + callback + " args: " + args)
		callback.apply(this, args)
    });
    response.on('data', function (chunk) {
        if (response.statusCode == 200) body += chunk;
    });
});
}
exports.urlToImageData = urlToImageData;

function uploadImage(response, postdata, trackers, id, resturantObject)
{

	/*
	 * PostData:
	 * var resturantID
	 * dic data {data, Content-Type}
	 */
	
	
	if(!postdata.resturantID || !postdata.data)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("image", uploadImage, [response, postdata, trackers]);
		return;
	}
	if(!resturantObject)
		{
		getObject(postdata.resturantID, uploadImage, [response, postdata, trackers, id], false);
		return;
		}
	
		
	
		json = {
				"id":id,
				"resturantID":postdata.resturantID,
				"_attachments":
					{
					"image":
						{
						"content_type":postdata.data.Content_Type,
					    "data": postdata.data.data
					    	}
					}
		}
		console.log("JSON " + JSON.stringify(json))
		options = {
				method:'PUT',
				url: getURLByIDType("image") + id,
				json: json
		};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				if(response)
					response.end("Created image: " + body);

				console.log("Created image: " + JSON.stringify(body));

			}
		});
		
		resturantObject.images.push(id);
		saveURL(getURLForObject(resturantObject.id), resturantObject);


	
	
}
exports.uploadImage = uploadImage;

function createChat(response, postdata, trackers, id, participants)
{
	/*
	 * PostData:
	 * array participants -- at this stage it can be an array, as they all start with 0 message index
	 */
	
	
	if(!postdata.participants || (typeof postdata.participants != typeof[]))
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	
	if(!id)
		{
		createID("chatObject", createChat, [response, postdata, trackers]);
		return;
		}
	
	
	
	if(!participants)participants=[];
	if(participants.length<postdata.participants.length)
		{
		objectID = postdata.participants[participants.length];
		console.log("updating participant: " + objectID);
		getObject(objectID, createChat, [response, postdata, trackers, id, participants], true);
		return;
		}
	var d = new Date();
	var n = d.getTime();
	participantsDic = {};
	for(i = 0; i < postdata.participants.length; i++)
	{
	participantsDic[postdata.participants[i]] = 0;//set all message indexies to 0
	}
	json = {
			id:id,
			participants:participantsDic,
			messages:[],
			timestamp:n
	}
	
	saveObject(id, json, [], trackers);
	for(i = 0; i < participants.length; i++)
		{
		participant = participants[i];
		if(typeof participant.chats != typeof[])participant.chats =[];
		participant.chats.push(id);
		console.log(JSON.stringify(participant))
		saveObject(participant.id, participant, [participant.id+"/"+"chats"], trackers);
		}
	if(response)
		{
		response.end(id);
		}
	
}
exports.createChat = createChat;

function postMessage(socket, postdata, trackers, user, chatObject)
{
	/*
	 * PostData:
	 * userID
	 * userAuth
	 * chatObjectID
	 * objectReference (e.g. image/order)
	 * text
	 * timestamp
	 */
	if(!postdata.userID || !postdata.userAuth || !postdata.chatObjectID || /*!postdata.objectReference ||*/ !postdata.text || !postdata.timestamp)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!user)
	{
	getObject(postdata.userID, postMessage, [socket, postdata, trackers], false);
	return;
	}
	if(user.auth!==postdata.userAuth)
		{
		if(socket)
			socket.send(JSON.stringify({"error": "Incorrect user auth"}));
		else
			console.log(JSON.stringify({"error": "Incorrect user auth"}));
		return;
		}
	if(!chatObject)
		{
		getObject(postdata.chatObjectID, postMessage, [socket, postdata, trackers, user], false);
		return;
		}
	if(!(user.id in chatObject.participants))
		{
		if(socket)
			socket.send(JSON.stringify({"error": "User not allowed to post in this chat"}));
		else
			console.log(JSON.stringify({"error": "User not allowed to post in this chat"}));
		return;
		}
	sender = user.id.substring(3, user.id.indexOf("-"));//just the unique ID part - no need to store all
	message = 
		{
			objectReference: postdata.objectReference,
			text: postdata.text,
			timestamp: postdata.timestamp,
			sender: sender
		}
	if( typeof chatObject.messages != typeof [])chatObject.messages = [];
	chatObject.messages.push(message);
	chatObject.timestamp = message.timestamp;
	saveObject(chatObject.id, chatObject, [chatObject.id+"/"+"messages"], trackers);
}
exports.postMessage = postMessage;


//Get or update:

function getImageByID(response2, postdata, trackers, image)
{
/*
 * PostData:
 * var imageID
 */	
	console.log("Image postdata: " + JSON.stringify(postdata));
	if(!postdata.imageID)
	{
		if(response2)
			response2.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	var url;
	if(postdata.imageID.substring(0,3)==="def")//def images have no IDs
		url = getURLByIDType("image")+postdata.imageID;
	else 
		url = getURLForObject(postdata.imageID);
	
	url = url + "/image";
	console.log("image url: " + url);
	
	if(!image)
		{
		
		
		var URL = require('url');
	    sURL = url;
	    oURL = URL.parse(sURL);
	    http = require('http');
	    client = http.createClient(80, oURL.hostname);
	    requestImage = client.request('GET', oURL.pathname, {'host': oURL.hostname});
	requestImage.end();
	requestImage.on('response', function (response)
	{
		
	    var type = response.headers["content-type"],
	    	prefix = "data:" + type + ";base64,",
	        body = "";

	    response.setEncoding('binary');
	    response.on('end', function () {
	    	callback = getImageByID;
			args = [response2, postdata, trackers];
			push = false;
			
			
	        var base64 = new Buffer(body, 'binary').toString('base64'),
	            
	        data = base64;
	        console.log(data);
	        json = {"data":data, "Content_Type":prefix};
	        if(!push){
				args.push(json); }
			else
			{
			lastArg = args[args.length-1];
			lastArg.push(json);
			}
			//console.log("Callback: " + callback + " args: " + args)
	        console.log("image args: " + args)
			callback.apply(this, args)
	    });
	    response.on('data', function (chunk) {
	        if (response.statusCode == 200) body += chunk;
	    });
	});
		/*
		console.log("no image");
		getURL(url, getImageByID, [response, postdata, trackers], false);*/
		return;
		}
	
	
	if(response2)
		{
		console.log("Sending image: " + image);
		console.log("Sending image json: " + JSON.stringify(image));
		//response2.write('Content-Length:'+image.data.length+'\r\n');
		//response2.write('Content-Type:' + image.Content_Type + '\r\n');
		response2.end(image.data);
		}

	else
		console.log("Fetched image: " + image);

	
}
exports.getImageByID = getImageByID;

function getOrdersByUserID(response, postdata, trackers, user)
{
	/*
	 * PostData:
	 * var userID
	 * var userAuth
	 */
	if(!postdata.userID || !postdata.userAuth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!user)
		{
		getObject(postdata.userID, getOrdersByUserID, [response, postdata, trackers], false);
		}
	else{
		if(user.auth == postdata.userAuth)
			{
			if(response)
				response.end(JSON.stringify({"orders":user.orders}));
			else
				console.log("User's orders: " + JSON.stringify({"orders":user.orders}));
			}
		else
			{
			if(response)
				response.end(JSON.stringify({error: "Error: Incorrect user auth."}));
			else
				console.log("Error: Incorrect user auth.");
			
			}
	}
	
}
exports.getOrdersByUserID = getOrdersByUserID;

function getChatsByUserID(response, postdata, trackers, user)
{
	/*
	 * PostData:
	 * var userID
	 * var userAuth
	 */
	if(!postdata.userID || !postdata.userAuth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!user)
		{
		getObject(postdata.userID, getChatsByUserID, [response, postdata, trackers], false);
		}
	else{
		if(user.auth === postdata.userAuth)
			{
			if(response)
				response.end(JSON.stringify({"chats":user.chats}));
			else
				console.log("User's chats: " + JSON.stringify({"chats":user.chats}));
			}
		else
			{
			if(response)
				response.end(JSON.stringify({error: "Error: Incorrect user auth."}));
			else
				console.log("Error: Incorrect user auth.");
			
			}
	}
	
}
exports.getChatsByUserID = getChatsByUserID;

function getDescriptionOfChatByID(response, postdata, trackers, chatObject, participants)
{
	/*
	 * PostData
	 * var chatID
	 * var userID
	 */
	
	if(!postdata.chatID || typeOfID(postdata.chatID)!=="chatObject" || !postdata.userID || typeOfID(postdata.userID)!=="user")
		{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
		}
	
	if(!chatObject)
		{
		getObject(postdata.chatID, getDescriptionOfChatByID, [response, postdata, trackers], false);
		return;
		}
	
	if(!participants){
	participantIDs = Object.keys(chatObject.participants);
	for(i = 0; i < participantIDs.length; i++)
		{
		id = participantIDs[i];
		if(id===postdata.userID)
			{
			participantIDs.splice(i, 1);
			break;
			}
		}
	postdata.participantIDs = participantIDs;//just storing in postdata for convinience
	
	participants = [];
	}
	
	if(participants.length<postdata.participantIDs.length)
	{
	objectID = postdata.participantIDs[participants.length];
	console.log("getting participant: " + objectID);
	getObject(objectID, getDescriptionOfChatByID, [response, postdata, trackers, chatObject, participants], true);
	return;
	}
	participantNames = [];
	for(i = 0; i < participants.length; i++)
		{
		participantNames[i] = participants[i].name;
		}
	jsonResponse = {"participantNames" : participantNames, "timestamp" : chatObject.timestamp}
	if(response)
		response.end(JSON.stringify(jsonResponse));
	else
		console.log("Returning chat desc: " + jsonResponse);	
}
exports.getDescriptionOfChatByID = getDescriptionOfChatByID;

var defaultMessageLoad = 20;//20 messages loaded
function getMessagesFromChatObject(socket, postdata, trackers, user, chatObject)
{
	/*
	 * PostData:
	 * userID
	 * userAuth
	 * chatObjectID
	 * messageIndex
	 * loadPrev (this is basically when we are loading old messages, not just new ones)
	 */
	
	/*
	 * Returns:
	 * {messages:["many messages"], shouldTimeSkip:(bool - whether to force skip)}
	 */
	console.log("sending messages");
	if(!postdata.userID || !postdata.userAuth || !postdata.chatObjectID || (typeof postdata.messageIndex)==="undefined")//do undefined check, b/c messageIndex CAN be 0
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!user)
	{
	getObject(postdata.userID, getMessagesFromChatObject, [socket, postdata, trackers], false);
	return;
	}
	if(user.auth!==postdata.userAuth)
		{
		if(socket)
			socket.send(JSON.stringify({"error": "Incorrect user auth"}));
		else
			console.log(JSON.stringify({"error": "Incorrect user auth"}));
		return;
		}
	if(!chatObject)
		{
		getObject(postdata.chatObjectID, getMessagesFromChatObject, [socket, postdata, trackers, user], false);
		return;
		}
	if(!(user.id in chatObject.participants))
		{
		if(socket)
			socket.send(JSON.stringify({"error": "User not allowed to get from this chat"}));
		else
			console.log(JSON.stringify({"error": "User not allowed to get from this chat"}));
		return;
		}
	
	console.log("while sending messages");
	messagesToReturn = chatObject.messages;
	console.log("messages returning " + messagesToReturn);
	shouldTimeSkip = false;
	indexToReturn = postdata.messageIndex;
	if(postdata.loadPrev)//this is a back load - return all messages from 20 messages past (where 20 = defaultMessageLoad)
		indexToReturn -= defaultMessageLoad;
	else if(messagesToReturn.length>defaultMessageLoad+indexToReturn)//this is a forward load -- return most recent messages, ignoring old ones and forcing a time skip
		{indexToReturn = messagesToReturn.length-defaultMessageLoad; shouldTimeSkip = true;}
	
	messagesToReturn = messagesToReturn.slice(indexToReturn, messagesToReturn.length);
	
	if(socket)
		socket.send(JSON.stringify({"answerForGetMessagesFromChatObject":chatObject.id,"messages": messagesToReturn, "shouldTimeSkip":shouldTimeSkip, "messageIndex":chatObject.messages.length}));
	else
		console.log(JSON.stringify({"messages": messagesToReturn, "shouldTimeSkip":shouldTimeSkip}));
	console.log("sent messages");
}
exports.getMessagesFromChatObject = getMessagesFromChatObject;

function getSurveyByOrderIDandUserID(response, postdata, trackers, order, user, items, employees, questionsItems, questionsEmployees, questionsOrder)
{
	/*
	 * PostData:
	 * var orderID
	 * var auth -- optional
	 * var userID
	 * var userAuth
	 */
	
	if(!postdata.orderID || !postdata.userID || !postdata.userAuth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		//else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	Array.prototype.pushArray = function(arr) {
		this.push.apply(this, arr);
	};
	
	
	if(!order){
		getObject(postdata.orderID, getSurveyByOrderIDandUserID, [response, postdata, trackers], false);
		return;
	}
	if(!user){
		getObject(postdata.userID, getSurveyByOrderIDandUserID, [response, postdata, trackers, order], false);
		return;
	}else{
		if(user.auth != postdata.userAuth)
			{
			if(response)
				response.end(JSON.stringify({error: "Error: Incorrect user auth."}));
			//else
				console.log("Error: Incorrect user auth.");
			
			return;
			}
	}

	if(!items)items = [];
	if(items.length<order.itemsOrdered.length)
	{
		
		url = order.itemsOrdered[items.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, trackers, order, user, items], true);
		return;
	}
	if(!employees)employees = [];
	if(employees.length<order.employeesServing.length)
	{
		
		url = order.employeesServing[employees.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, trackers, order, user, items, employees], true);
		return;
	}
	var questionsItemsIDs = [];
	for(i = 0; i < items.length; i++)
		{
		questionsItemsIDs.pushArray(items[i].questions)}
	
	
	if(!questionsItems)questionsItems = [];
	if(questionsItems.length<questionsItemsIDs.length)
	{
		url = questionsItemsIDs[questionsItems.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, trackers, order, user, items, employees, questionsItems], true);
		return;
	}
	var questionsEmployeesIDs = [];
	for(i = 0; i < employees.length; i++)
		{questionsEmployeesIDs.pushArray(employees[i].questions)}
	
	if(!questionsEmployees){questionsEmployees = [];}
	if(questionsEmployees.length<questionsEmployeesIDs.length)
	{
		url = questionsEmployeesIDs[questionsEmployees.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, trackers, order, user, items, employees, questionsItems, questionsEmployees], true);
		return;
	}
	
	if(!questionsOrder){questionsOrder = [];}
	if(questionsOrder.length<order.extraQuestions.length)
	{
		url = order.extraQuestions[questionsOrder.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, trackers, order, user, items, employees, questionsItems, questionsEmployees,questionsOrder], true);
		return;
	}
//	Auth:

	
	var orderID = order.id;

	Array.prototype.contains = function(arr)
	{
		console.log(arr);
		console.log(this.indexOf(arr));
		return this.indexOf(arr) !== -1;

	}
	var needsAuth = !user.orders.contains(orderID);
	if(!needsAuth||(needsAuth && postdata.auth === order.auth))
	{
		

		questions = [];
		questions.pushArray(questionsItems);
		questions.pushArray(questionsEmployees)
		questions.pushArray(questionsOrder);

		for(i = 0; i < questions.length; i++)
			{
			question = questions[i];
			userResponses = question.userResponses;
			for(j = 0; j < userResponses.length; j++)
				{
				if(userResponses[j].userID!==user.id)userResponses.splice(j,1);//remove all responses not belonging to this user
				}
			question.userResponses = userResponses;
			questions[i] = question;
			}
			
		
		survey = 
		{
				questions:questions,
				orderID:orderID
		}
		if(response)
			response.end(JSON.stringify(survey));
		//else
			console.log("Sent: " + JSON.stringify(survey));

		//Save order to user's orders AND notify trackers that user's orders changed:
		if(needsAuth){
			user.orders.push(orderID)
			url = usersURL + user.id;
			json = user;
			saveURL(url, json, [stringFromIDAndField(user.id, "orders")], trackers);
		}
	}
	else
	{
		if(response)
			response.end(JSON.stringify({error: "Error: Incorrect auth."}));
		else
			console.log("Error: Incorrect auth.");
	}


}
exports.getSurveyByOrderIDandUserID = getSurveyByOrderIDandUserID;



function saveUserResponseToQuestionbyQuestionIDandUserID(response, postdata)
{

}
exports.saveUserResponseToQuestionbyQuestionIDandUserID = saveUserResponseToQuestionbyQuestionIDandUserID;



var userQueryURL = "https://resturantapp.couchappy.com/resturant_users/_design/queryName/_view/queryName";
function signIn(response, postdata, trackers, retVal)
{
	console.log("postdata: " + JSON.stringify(postdata))
	console.log("name: " + postdata.name)
	console.log("pass: " + postdata.pass)
/*
 * PostData:
 * var name
 * var pass
 */	
	if(!postdata.name || !postdata.pass)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
/*
 * Return: 
 * var userID
 * var auth
 */

	if(!retVal)
		{
		console.log("1");
		getURL(userQueryURL, signIn, [response, postdata, trackers], false);
		}
	else
	{console.log("2");
		var user;
		for(var i = 0; i < retVal.rows.length; i++)
		{
			console.log("3");
			row = retVal.rows[i];
			if(row.key==postdata.name)
				{
				console.log("4");
				user = row.value;
				break;
				}
		}
		if(user && user.pass==postdata.pass)
			{
			console.log("5");
			//update auth
			var auth = createAuth();
			var url = getURLByIDType(typeOfID(user.id));
			user.auth = auth;
			saveURL(url+user.id, user);
			console.log("6");
			ret = {userID:user.id, auth:auth}
			if(response){console.log("7");
				response.end(JSON.stringify(ret));}
			console.log("8");
			console.log("Fetched userID: " + JSON.stringify(ret));
			}
		else
		{console.log("9");
			if(response)
				response.end(JSON.stringify({error: "Error: Incorrect username or password."}));
			else
				console.log("Error: Incorrect username or password.");
		}
		
	}
	
}
exports.signIn = signIn;

function validateUserAuth(response, postdata, trackers, user)
{
/*
 * PostData:
 * var userID
 * var auth
 */	
	if(!postdata.userID || !postdata.auth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!user)
		{
		getObject(postdata.userID, validateUserAuth, [response, postdata, trackers], false);
		}
	else
		{
		console.log("User: " + user);
		console.log("UserPost: " + JSON.stringify(postdata));
		if(user.id===postdata.userID && user.auth === postdata.auth)
			{
			if(response)
				response.end("true");
			//else
				console.log("true");
			}
		else
			{
			if(response)
				response.end("false");
			//else
				console.log("false");
			}
		
		}
	
	
}
exports.validateUserAuth = validateUserAuth;

function getResturantNameByResturantID(response, postdata, trackers, resturant)
{
	/*
	 * PostData:
	 * var resturantID
	 */
	if(!postdata.resturantID || typeOfID(postdata.resturantID)!=="resturant")
		{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
		}
	
	if(!resturant)
		{
		getObject(postdata.resturantID, getResturantNameByResturantID, [response, postdata, trackers], false);
		return;
		}
	if(response)
		response.end(resturant.name);
	//else
		console.log("Returning resturant name: " + resturant.name);
}
exports.getResturantNameByResturantID = getResturantNameByResturantID;

function getResturantNameByOrderID(response, postdata, trackers, order)
{
	/*
	 * PostData:
	 * var orderID
	 */
	if(!postdata.orderID || typeOfID(postdata.orderID)!=="order")
		{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
		}
	
	if(!order)
		{
		getObject(postdata.orderID, getResturantNameByOrderID, [response, postdata, trackers], false);
		return;
		}
	
	getResturantNameByResturantID(response, {"resturantID":order.resturant});
}
exports.getResturantNameByOrderID = getResturantNameByOrderID;

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
	case "001":return "user"
	case "002":return "resturant"
	case "003":return "order"
	case "004":return "item"
	case "005":return "employee"
	case "006":return "question"
	case "007":return "image"
	case "008":return "chatObject"
	default:return "error"
	}

}

function getURLByIDType(idType)
{
	switch(idType)
	{
	case "user": return usersURL;
	case "resturant": return resturantsURL;
	case "order": return ordersURL;
	case "item": return itemURL;
	case "employee": return employeeURL;
	case "question": return questionURL;
	case "image" : return imagesURL;
	case "chatObject" : return chatsURL;
	default:return "error"
	}
}

function getURLForObject(objectID)
{
	categoryURL = getURLByIDType(typeOfID(objectID));
	console.log("cat url: " + categoryURL + " for id: " + objectID);
	return categoryURL==="error" ? categoryURL : categoryURL+objectID;
}
//urls:
var baseURL = "https://resturantapp.couchappy.com/";
var idCreator = baseURL + "resturant_id_creator/getID";
var ordersURL = baseURL + "resturant_orders/";
var itemURL = baseURL + "resturant_items/";
var employeeURL = baseURL + "resturant_employees/";
var questionURL = baseURL + "resturant_questions/";
var usersURL = baseURL + "resturant_users/";
var resturantsURL = baseURL + "resturant_resturants/";
var imagesURL = baseURL + "resturant_images/";
var chatsURL = baseURL + "resturant_chats/";


function createID(typeOfObject, callback, args)
{
	idPrefix = "error";
	switch(typeOfObject)
	{
	case "user":{idPrefix = "001"; break;}
	case "resturant":{idPrefix = "002"; break;}
	case "order":{idPrefix = "003"; break;}
	case "item":{idPrefix = "004"; break;}
	case "employee":{idPrefix = "005"; break;}
	case "question":{idPrefix = "006"; break;}
	case "image": {idPrefix = "007"; break;}
	case "chatObject": {idPrefix = "008"; break;}
	default:return idPrefix;
	}
	console.log("s1");
	options = {
			method: 'GET',
			url: idCreator,
			json: {}
	};
	request(options, function(err, res, body1) { if (err) {
		throw Error(err); } else {
			console.log("s2");
			console.log(body1);
			options2 = {
					method:'PUT',
					url: idCreator,
					json: body1
			};
			request(options2, function(err, res, body2) { if (err) {
				throw Error(err); } else {
					var id = idPrefix + body2.rev;
					console.log("s3");
					console.log(body2);
					console.log(id);
					args.push(id);
					console.log("Callback: " + callback + " args: " + args)
					callback.apply(this, args)

				}
			});
		}
	});
}

function createAuth()
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < 25; i++ )
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

function saveObject(objectID, json, trackerUpdates, trackers)
{
	url = getURLForObject(objectID);
	if(url !=="error")
		{
		saveURL(url, json, trackerUpdates, trackers);
		}
}

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
			if(trackerUpdates && trackers){
			for(i = 0; i < trackerUpdates.length; i++)
				{
				
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
				}
		}
		}});
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

function addMessage(response, postdata, trackers)
{
	json = {"participants":["00237-e7e3e8b5789c82bcb8b58ab92b7458dc", "00138-adf774bf0a710ddb027bd39eb7f011b5"]}
	createChat(response, json, trackers);
}
exports.addMessage = addMessage;

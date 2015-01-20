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
 * var timestamp //since 1970
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
 * dic userResponses (userID to userResponse)
 * var resturantID
 * 
 * UserResponse: (is Entry in dic)
 * var userID
 * var starRating //-1 for not answered
 * var textResponse
 * 
 * 
 * User:
 * var id
 * var name
 * var pass
 * var auth
 * dic orders (orderID -> resturantID)//saves time needing to fetch order object to see which resturant it belongs to
 * array chats
 * TODO rest
 * 
 * Resturant:
 * var id
 * var name
 * var pass
 * var auth
 * var images
 * array chats
 * array items
 * array employees
 * array otherQuestions
 * dic customers (userID -> #timeVisitedResturant)
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
 * dic participants = {user/resturantID, lastChatMessageIndex (--user read up to this index; this is for "read" messages)}
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

		var d = new Date();
		var n = d.getTime();
		json = 
		{
				id:id,
				auth:auth,
				resturant:postdata.resturant,
				itemsOrdered:postdata.items,
				employeesServing:postdata.employeesServing,
				extraQuestions:postdata.extraQuestions,
				timestamp:n
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


function createItem(response, postdata, trackers, id, resturant)
{
	/*
	 * PostData:
	 * var name
	 * array questions
	 * var imageID
	 * var resturantID
	 */

	if(!postdata.name || !postdata.questions || !postdata.resturantID || typeOfID(postdata.resturantID)!=="resturant")
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("item", createItem, [response, postdata, trackers]);
		return;
	}
	if(!resturant)
	{
	getObject(postdata.resturantID, createItem,[response, postdata, trackers, id], false);
	return;
	}
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


		
	resturant.items.push(id);
	saveObject(resturant.id, resturant, [resturant.id+"/"+"items"], trackers);
}
exports.createItem = createItem;


function createEmployee(response, postdata, trackers, id, resturant)
{
	/*
	 * PostData:
	 * var name
	 * array questions
	 * var imageID
	 * var resturantID
	 */

	if(!postdata.name || !postdata.questions || postdata.resturantID || typeOfID(postdata.resturantID)!=="resturant")
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!id){
		createID("employee", createEmployee, [response, postdata, trackers]);
		return;
	}
	if(!resturant)
	{
	getObject(postdata.resturantID, createEmployee,[response, postdata, trackers, id], false);
	return;
	}
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
	resturant.employees.push(id);
	saveObject(resturant.id, resturant, [resturant.id+"/"+"employees"], trackers);
	
}
exports.createEmployee = createEmployee;

function socketCreateQuestion(socket, postdata, trackers)
{
response = {};
response.end = function (something){/*do nothing*/}
createQuestion(response, postdata, trackers);
}
exports.socketCreateQuestion = socketCreateQuestion;

function createQuestion(response, postdata, trackers, id, resturant, entity)
{
	/*
	 * PostData:
	 * var text
	 * var shouldAllowStarRating
	 * var shouldAllowTextInput
	 * var imageID
	 * var entityID //e.g. item/employee
	 * var resturantID
	 * var isResturantQuestion -- means it belongs in "otherQuestions"
	 */

	if(!postdata.text || typeof postdata.shouldAllowStarRating === "undefined" || typeof postdata.shouldAllowTextInput === "undefined" || !postdata.resturantID)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!resturant || !entity){//means we are in the process of saving to a resturant/entity - question was ALREADY created, no need to recreate
	if(!id){
		createID("question", createQuestion, [response, postdata, trackers]);
		return;
	}
		if(!postdata.imageID)postdata.imageID = "defGeneralQuestion";
		json = {
				id:id,
				text:postdata.text,
				shouldAllowStarRating:postdata.shouldAllowStarRating,
				shouldAllowTextInput:postdata.shouldAllowTextInput,
				imageID:postdata.imageID,
				userResponses:{},
				resturantID:postdata.resturantID
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
		if((resturant || (postdata.resturantID && typeOfID(postdata.resturantID)==="resturant")) && postdata.isResturantQuestion)
			{
			if(!resturant)
				{
				getObject(postdata.resturantID, createQuestion, [response, postdata, trackers, id], false);
				return;
				}
			resturant.otherQuestions.push(id);
			saveObject(resturant.id, resturant, [resturant.id+"/"+"otherQuestions"], trackers);
			}
		else//save to entity
			{
			if(!entity)
				{
				getObject(postdata.entityID, createQuestion, [response, postdata, trackers, id, resturant], false);//note resturant is undefined in this case
				return;
				}
			entity.questions.push(id);
			saveObject(entity.id, entity, [entity.id+"/questions"], trackers);
			}

	
}
exports.createQuestion = createQuestion;


function createUser(response, postdata, trackers, id)
{
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
	if(!id){
		createID("user", createUser, [response, postdata, trackers]);
	}else{

		auth = createAuth();
		json = {
				id:id,
				name:postdata.name,
				pass:postdata.pass,
				auth:auth,
				orders:{},
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
				
				//save only if successul in creating user:
				saveURL(names_to_ids+postdata.name, {"id":id});

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
	if(!id){
		createID("resturant", createResturant, [response, postdata, trackers]);
	}else{

		auth = createAuth();
		json = {
				id:id,
				name:postdata.name,
				pass:postdata.pass,
				auth:auth,
				images:["defFood", "defWaiter", "defGeneralQuestion"],
				chats: [],
				items: [],
				employees: [],
				otherQuestions: [],
				customers:{}
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

				//save only if successul in creating user:
				saveURL(names_to_ids+postdata.name, {"id":id});
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
		saveObject(id, json);
		if(response)
			response.end(id);
		else
			console.log(id);
		
		resturantObject.images.push(id);
		saveURL(getURLForObject(resturantObject.id), resturantObject);


	
	
}
exports.uploadImage = uploadImage;

function setEntityToHaveImage(socket, postdata, trackers, imageID, entity)
{
	/*
	 * PostData:
	 * var entityID //item, employee, or question 
	 * var resturantID
	 * dic data {data, Content-Type}
	 */
	
	if((!postdata.entityID || !postdata.resturantID || !postdata.data)&&!imageID)//if we are given an imageID, don't do any checks - this method can be used to simply set an entity to have an imageID, without uploading a new image
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!imageID){
	response = {socket:socket, postdata:postdata, trackers:trackers};
	response.end = function(newImageID)
	{
		setEntityToHaveImage(this.socket, this.postdata, this.trackers, newImageID);
	}
	uploadImage(response, {"resturantID":postdata.resturantID, "data":postdata.data}, trackers);
	return;
	}
	
	if(!entity)
		{
		getObject(postdata.entityID, setEntityToHaveImage, [socket, postdata, trackers, imageID], false);
		return;
		}
	if(entity.imageID!==imageID)//user may try to set the current imageID to the same object - if this is the case, do nothing, its just a waste of time and database calls
		{
		prevID = entity.imageID;
		entity.imageID = imageID;
		saveObject(entity.id, entity, [entity.id+"/imageID"], trackers);
		
		//save every question that had a default id to have this id
		if(typeOfID(entity.id)==="item" || typeOfID(entity.id)==="employee")
			{
			saveImageToQuestion = function (imageID, trackers, questionObj)
			{
				if(questionObj.imageID!==imageID){
				questionObj.imageID = imageID;
				saveObject(questionObj.id, questionObj, [questionObj.id+"/imageID"], trackers);}
			}
			console.log("questions of entity: " + JSON.stringify(entity));
			for(i = 0; i < entity.questions.length; i++)
				{
				question = entity.questions[i];
				console.log("getting object: " + question);
				getObject(question, saveImageToQuestion, [imageID, trackers],false);
				}
			}
		}
	
}
exports.setEntityToHaveImage = setEntityToHaveImage;

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
	trackerUpdates = Object.keys(chatObject.participants);
	for(i = 0; i < trackerUpdates.length; i++)
		{
		trackerUpdates[i] += "/chats";
		}
	console.log("traking dfds: " + trackerUpdates);
	trackerUpdates.push((chatObject.id+"/"+"messages"));
	saveObject(chatObject.id, chatObject, trackerUpdates, trackers);
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
		response2.end(image.data);
		}

	else
		console.log("Fetched image: " + image);

	
}
exports.getImageByID = getImageByID;

function socketGetImageFromID(socket, postdata, trackers)
{
	/*
	 * postdata:
	 * 
	 * var imageID
	 * 
	 */
	if(!postdata.imageID)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	response = {socket:socket, postdata:postdata, trackers:trackers};
	response.end = function (imageData)
	{
		if(socket)
			socket.send(JSON.stringify({"eventRecieved":"socketGetImageFromID", "imageID":postdata.imageID, "imageData":imageData}));
		else
			console.log(JSON.stringify({"eventRecieved":"socketGetImageFromID", "imageID":postdata.imageID, "imageData":imageData}));
		
	}

	getImageByID(response, postdata, trackers);
}
exports.socketGetImageFromID = socketGetImageFromID;

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
	
	if(!postdata.chatID || typeOfID(postdata.chatID)!=="chatObject" || !postdata.userID || !(typeOfID(postdata.userID)==="user"  || typeOfID(postdata.userID)==="resturant"))
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
		console.log("Participant: " + id);
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

function getChatBetweenTwoUsers(socket, postdata, trackers, user1, user2, commonChat)
{
/*
 * postdata:
 * 
 * user1ID
 * user1Auth //user1 is user requesting this info
 * user2ID
 */	
	
/*
 * returns: chatID with both of them, and ONLY them listed as users - whether the chat previously existed or a new
 * one was created for them
 * TODO make sure that the chat is only between the TWO users - in the current configuration, we will only have 2 
 * user chats, so that will not be a problem. BUT if more than 2 users are ever present in a chat, the below code 
 * will NOT ensure that there are only 2 users in the chat!! Someone can accidently send a message to the wrong
 * person because of this!
 */
	
	if(!postdata.user1ID || !postdata.user1Auth || !postdata.user2ID)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!commonChat){
	if(!user1)
		{
		getObject(postdata.user1ID, getChatBetweenTwoUsers, [socket, postdata, trackers], false);
		return;
		}
	if(user1.auth!==postdata.user1Auth)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Incorrect user auth"}));
		else
			console.log(JSON.stringify({"error": "Incorrect user auth"}));
		return;
		}
	if(!user2)
	{
	getObject(postdata.user2ID, getChatBetweenTwoUsers, [socket, postdata, trackers, user1], false);
	return;
	}
	
	//finding first common chat:
	a = user1.chats;
	b = user2.chats;
	while( a.length > 0 && b.length > 0 )
	  {  
	     if(a[0] < b[0] ) a.shift(); 
	     else if (a[0] > b[0] ) b.shift(); 
	     else
	     {
	       commonChat = a.shift();
	       break;
	     }
	  }
	if(!commonChat)
		{
		response = {socket:socket, postdata:postdata, trackers:trackers, user1:user1, user2:user2};
		response.end = function (chatID){commonChat = chatID; 
		if(this.socket)
			this.socket.send(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
		else
			console.log(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
		
		};
		createChat(response, {participants:[user1.id, user2.id]});
		return;
		}

	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
	else
		console.log(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
	
	return;
	}
	if(this.socket)
		this.socket.send(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
	else
		console.log(JSON.stringify({"eventRecieved":"getChatWithUser:"+user2.id,"chatID":commonChat}));
}
exports.getChatBetweenTwoUsers = getChatBetweenTwoUsers;

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
	
	userLastReadIndex = chatObject.participants[user.id];
	if(userLastReadIndex<chatObject.messages.length)
		{
		userLastReadIndex = chatObject.messages.length;
		chatObject.participants[user.id] = userLastReadIndex;
		saveObject(chatObject.id, chatObject);//no need to send out updates, this is just for database records (so far) -- may be used in future if want to add "read" messages;
		}
}
exports.getMessagesFromChatObject = getMessagesFromChatObject;

function getSurveyByOrderIDandUserID(response, postdata, trackers, order, user, items, employees, questionsItems, questionsEmployees, questionsOrder)
{
	/*
	 * PostData:
	 * var orderID
	 * var auth -- optional
	 * var userID ------- may be resturantID if resturant wants to look at a user's order
	 * var userAuth
	 * 
	 * var secondorialUserID //userID of user that the resturant owner wants to see how the user filled in the order
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
	
	
	
	var orderID = order.id;
	var needsAuth = true;
	switch (typeOfID(postdata.userID)){
		case "user":{needsAuth=!user.orders[orderID];break;}
		case "resturant":{needsAuth = order.resturant!==postdata.userID;break;}
		default : {needsAuth=true;break;}
	}
	
	
	
	if(needsAuth&&(postdata.auth !== order.auth))
		{
		if(response)
			response.end(JSON.stringify({error: "Error: Incorrect auth."}));
		else
			console.log("Error: Incorrect auth.");
		
		return;
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

	
	

	Array.prototype.contains = function(arr)
	{
		console.log(arr);
		console.log(this.indexOf(arr));
		return this.indexOf(arr) !== -1;

	}
	
	
		

		questions = [];
		questions.pushArray(questionsItems);
		questions.pushArray(questionsEmployees)
		questions.pushArray(questionsOrder);

		var isResturant = typeOfID(postdata.userID)==="resturant";
		for(i = 0; i < questions.length; i++)
			{
			question = questions[i];
			userRep = question.userResponses[isResturant?postdata.secondorialUserID:postdata.userID];
			question.userResponses = userRep===undefined ? {"userStarRating":-1, "userTextResponse":""}: userRep;//changes from (dic of dic) to (dic)
			
			//question.id = "";//remove id - don't want users accessing questionID, b/c that is the only security for retriving answers of ALL users to the question
			
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

		//Save order to user's orders, notify trackers that user's orders changed, and save user to resturant's customers
		if(needsAuth){
			user.orders[orderID] = order.resturant;
			url = usersURL + user.id;
			json = user;
			saveURL(url, json, [stringFromIDAndField(user.id, "orders")], trackers);
			saveUserToResturantCustomers(user.id, order.resturant, trackers);
		}
	
}
exports.getSurveyByOrderIDandUserID = getSurveyByOrderIDandUserID;

function saveUserToResturantCustomers(userID, resturantID, trackers, resturant)
{
	if(typeOfID(userID)!=="user" || typeOfID(resturantID)!=="resturant")
		return;
	
	if(!resturant)
		{
		getObject(resturantID, saveUserToResturantCustomers, [userID, resturantID, trackers], false);
		return;
		}
	val = resturant.customers[userID];
	val = !val ? 1 : val + 1;
	resturant.customers[userID] = val;
	saveObject(resturantID, resturant, [resturantID+"/customers"], trackers);
}


function saveUserResponseToQuestionbyQuestionIDandUserID(socket, postdata, trackers, question)
{
	//TODO imporve efficiency of avg calc -- store avg in question everytime it gets a new response, much easier. Put this improvement in save user response

	/*
	 * postdata:
	 * questionID
	 * userID
	 * textResponse
	 * starRating
	 */
	
	
	if(!postdata.questionID || typeOfID(postdata.questionID)!=="question"  || !postdata.userID)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!question)
		{
		getObject(postdata.questionID, saveUserResponseToQuestionbyQuestionIDandUserID, [socket, postdata, trackers], false);
		return;
		}
	
	response = {
			userID:postdata.userID,
			textResponse:postdata.textResponse?postdata.textResponse:"",
			starRating:postdata.starRating?postdata.starRating:-1
	}
	question.userResponses[postdata.userID] = response;
	saveObject(question.id, question, [question.id+"/userResponses"], trackers);
	
}
exports.saveUserResponseToQuestionbyQuestionIDandUserID = saveUserResponseToQuestionbyQuestionIDandUserID;



var userQueryURL = "https://resturantapp.couchappy.com/resturant_users/_design/queryName/_view/queryName";
function signIn(response, postdata, trackers, retVal, user)
{
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
 * var userID/resturantID
 * var auth
 */

	if(!retVal)
		{
		console.log("1");
		getURL(names_to_ids+postdata.name, signIn, [response, postdata, trackers], false);
		return;
		}

	if(!retVal.id)
	{
		if(response)
				response.end(JSON.stringify({error: "Error: Incorrect username or password."}));
			else
				console.log("Error: Incorrect username or password.");
	}

	if(!user)
		{
		id = retVal.id;
		getObject(id, signIn, [response, postdata, trackers, retVal], false);
		return;
		}

	
	console.log("2");
		
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
			type = typeOfID(user.id.substring(0,3));
			if(response)
				response.end(JSON.stringify({"validation":"true", "type":type}));
			//else
				console.log(JSON.stringify({"validation":"true", "type":type}));
			}
		else
			{
			if(response)
				response.end(JSON.stringify({"validation":"false", "type":"error", "user":user, "data":postdata}));
			//else
				console.log(JSON.stringify({"validation":"false", "type":"error", "user":user, "data":postdata}));
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

function getResturantNameByOrderID(response, postdata, trackers, order)// returns timestamp of order - not restName
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
	
	if(response)
		response.end(""+order.timestamp);//""+ to convert to string
	//else
		console.log(""+order.timestamp);
		
	//getResturantNameByResturantID(response, {"resturantID":order.resturant});
}
exports.getResturantNameByOrderID = getResturantNameByOrderID;


function getAllResturantMenu(socket, postdata, trackers, resturant)
{
	/*
	 * postdata:
	 * var resturantID
	 * var auth
	 */
	
	if(!postdata.resturantID || !postdata.auth)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!resturant)
	{
	getObject(postdata.resturantID, getAllResturantMenu, [socket, postdata, trackers], false);
	return;
	}
	if(resturant.auth == postdata.auth)
		{
		response = {
				items:resturant.items,
				employees:resturant.employees,
				otherQuestions:resturant.otherQuestions
		}
		if(socket)
			socket.send(JSON.stringify({"eventRecieved":"getAllResturantMenu", "data":response}));
		else
			console.log(JSON.stringify({"eventRecieved":"getAllResturantMenu", "data":response}));
		}
	else
		{
		if(socket)
			socket.send(JSON.stringify({error: "Error: Incorrect resturant auth."}));
		else
			console.log("Error: Incorrect resturant auth.");
		
		}

}
exports.getAllResturantMenu = getAllResturantMenu;


function getDescOfID (socket, postdata, trackers, desc)
{
	/*
	 * postdata
	 * 
	 * var id
	 * 
	 * (optional) var userID;//to send in case of requesting chatObject Description
	 */
	if(!postdata.id)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	if(!desc){
	id = postdata.id;
	switch(typeOfID(id))
	{
	case "item":{
		getItemDesc(id, getDescOfID, [socket, postdata, trackers], false);
		return;}
	case "employee":{
		getItemDesc(id, getDescOfID, [socket, postdata, trackers], false);//emplyee and item are same for this
		return;}
	case "question":{
		getQuestionDesc(id, getDescOfID, [socket, postdata, trackers],false);
		return;}
	case "chatObject":
		{
		response = {socket:socket, postdata:postdata, trackers:trackers};
		response.end = function end(jsonDataAsString)
		{
			if(this.socket)
				this.socket.send(JSON.stringify({"eventRecieved":"getDesc:"+this.postdata.id, "desc":JSON.parse(jsonDataAsString)}));
			else
				console.log(JSON.stringify({"eventRecieved":"getDesc:"+this.postdata.id, "desc":JSON.parse(jsonDataAsString)}));
		}
		getDescriptionOfChatByID(response, {chatID:postdata.id, userID:postdata.userID})
		return;
		}
	case "order":
		{
		response = {socket:socket, postdata:postdata, trackers:trackers};
		response.end = function end(timestamp)
		{
			if(this.socket)
				this.socket.send(JSON.stringify({"eventRecieved":"getDesc:"+this.postdata.id, "desc":{"timestamp":timestamp}}));
			else
				console.log(JSON.stringify({"eventRecieved":"getDesc:"+this.postdata.id, "desc":{"timestamp":timestamp}}));
		}
		getResturantNameByOrderID(response, {orderID:postdata.id})
		return;
		}
		
	default:{
		desc = {"desc":"NO DESC"};
		return;}
	}
	}
	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"getDesc:"+postdata.id, "desc":desc}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
	else
		console.log(JSON.stringify({"eventRecieved":"getDesc:"+postdata.id, "desc":desc}));
}
exports.getDescOfID = getDescOfID;

function getItemDesc(itemID,callback, args, push, item, possibleQ, question)
{
	if(!item)
		{
		getObject(itemID, getItemDesc, [itemID, callback, args, push], false);
		return;
		}
	if(!question)
		{
	if(!possibleQ) possibleQ = item.questions;
	
	if(possibleQ.length==0)
		{
		name = item.name;
		desc = {"name": name, stars:-1}
		if(!push){
			args.push(desc); }
		else
		{
			lastArg = args[args.length-1];
		lastArg.push(desc);
		}
		//console.log("Callback: " + callback + " args: " + args)
		callback.apply(this, args)
		
		return;
		}
	qID = possibleQ[0];
	getObject(qID, getItemDesc, [itemID, callback, args, push, item, possibleQ], false);
	return;
		}
	else
		{
		if(!question.shouldAllowStarRating)
			{
			//ignore question and recall self
			getItemDesc(itemID, callback, args, push, item, possibleQ);
			return;
			}
		userResponses = question.userResponses;
		totStars = 0;
		totUsersToCount = 0;
		//TODO imporve efficiency of avg calc -- store avg in question everytime it gets a new response, much easier. Put this improvement in save user response 
		
		for(var key in userResponses)
			{
			if(userResponses.hasOwnProperty(key))
				{
				rep = userResponses[key];
				if(rep.starRating>=0){//means user gave rating
					totStars+=rep.starRating;
					totUsersToCount++;
				}
				}
			}
	
		console.log("calcing avg: " + totStars + " " + totUsersToCount);
		avg = totUsersToCount>0? totStars/totUsersToCount : -1;
		
		name = item.name;
		desc = {"name": name, stars:avg, imageID:item.imageID}
		if(!push){
			args.push(desc); }
		else
		{
			lastArg = args[args.length-1];
		lastArg.push(desc);
		}
		//console.log("Callback: " + callback + " args: " + args)
		callback.apply(this, args)
		
		return;
		
		
			}
		}
	
function getQuestionDesc(qID, callback, args, push, question)
{
	if(!question)
		{
		getObject(qID, getQuestionDesc, [qID, callback, args, push], false);
		return;
		}
	text = question.text;
	avg = -1;
	if(question.shouldAllowStarRating){
	userResponses = question.userResponses;
	totStars = 0;
	totUsersToCount = 0;
	//TODO imporve efficiency of avg calc -- store avg in question everytime it gets a new response, much easier. Put this improvement in save user response
	for(var key in userResponses)
	{
	if(userResponses.hasOwnProperty(key))
		{
		rep = userResponses[key];
		if(rep.starRating>=0){//means user gave rating
			totStars+=rep.starRating;
			totUsersToCount++;
		}
		}
	}
	
	avg = totStars/totUsersToCount;
	}
	
	desc = {"name": text, 
			stars:avg, 
			"imageID": question.imageID
			}
	if(!push){
		args.push(desc); }
	else
	{
		lastArg = args[args.length-1];
	lastArg.push(desc);
	}
	//console.log("Callback: " + callback + " args: " + args)
	callback.apply(this, args)
	return;
}

function getQuestionIDSforEntity (socket, postdata, trackers, entity)
{
	/*
	 * postdata:
	 * 
	 * var entityID (item/employee)
	 * 
	 */
	if(!postdata.entityID || (typeOfID(postdata.entityID)!=="item" && typeOfID(postdata.entityID)!=="employee"))
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!entity)
		{
		getObject(postdata.entityID, getQuestionIDSforEntity, [socket, postdata, trackers], false);
		return;
		}
	
	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"qIDSforEntity:"+postdata.entityID, "qIDS":entity.questions}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
	else
		console.log(JSON.stringify({"eventRecieved":"qIDSforEntity:"+postdata.entityID, "qIDS":entity.questions}));
	
}
exports.getQuestionIDSforEntity = getQuestionIDSforEntity;

function getQuestion (socket, postdata, trackers, questionObj)
{
/*
 * postdata:
 * 
 * var qID
 * var entityID //used for identifying who to send question to on reciever's end
 * 
 * var resturantID
 * 
 */	
	
	if(!postdata.qID || typeOfID(postdata.qID)!=="question" || !postdata.resturantID || !postdata.entityID/*don't check entityID type, it can be ANYTHING - just used for recognition on recievers end. not used here at all, except for as part of data being sent back*/)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!questionObj)
		{
		getObject(postdata.qID, getQuestion, [socket, postdata, trackers], false);
		return;
		}
	if(questionObj.resturantID==postdata.resturantID){
		if(socket)
			socket.send(JSON.stringify({"eventRecieved":"getQuestion:"+postdata.entityID, "question":questionObj}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
		else
			console.log(JSON.stringify({"eventRecieved":"getQuestion:"+postdata.entityID, "question":questionObj}));
	}
	else
		{
		if(socket)
			socket.send(JSON.stringify({"error":"not authorized to get question"}));
		else
			console.log(JSON.stringify({"error":"not authorized to get question"}));
	
		}
}
exports.getQuestion = getQuestion;


function getCustomers(socket, postdata, trackers, resturant)
{
/*
 * postdata:
 * 
 * resturantID
 * auth
 * 
 */	
	if(!postdata.resturantID || !postdata.auth)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!resturant)
		{
		getObject(postdata.resturantID, getCustomers, [socket, postdata, trackers], false);
		return;
		}
	
	if(resturant.auth !== postdata.auth)
		{
		if(socket)
			socket.send(JSON.stringify({"error":"Incorrect auth"}));
		else
			console.log(JSON.stringify({"error":"Incorrect auth"}));
		
		return;
		}
	
	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"getCustomers", "customers":resturant.customers}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
	else
		console.log(JSON.stringify({"eventRecieved":"getCustomers", "customers":resturant.customers}));

}
exports.getCustomers = getCustomers;

function getUserNameForResturant(socket, postdata, trackers, user)
{
/*
 * postdata:
 * 
 * userID //its ok not veryfing with anything else, the userNameForResturant is supposed to be public
 */	
	
	if(!postdata.userID)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!user)
		{
		getObject(postdata.userID, getUserNameForResturant, [socket, postdata, trackers], false);
		return;
		}
	
	
	retval = user.userNameForResturant ? user.userNameForResturant : user.name;
	
	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"getUserNameForResturant:"+postdata.userID,"userID":postdata.userID , "name":retval}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
	else
		console.log(JSON.stringify({"eventRecieved":"getUserNameForResturant:"+postdata.userID,"userID":postdata.userID , "name":retval}));
}
exports.getUserNameForResturant = getUserNameForResturant;


function getUserOrdersAtResturant(socket, postdata, trackers, user)
{
/*
 * postdata:
 * 
 * userID
 * resturantID
 * 
 */
	if(!postdata.userID || !postdata.resturantID)
	{
		if(socket)
			socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		else
			console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
		return;
	}
	
	if(!user)
	{
	getObject(postdata.userID, getUserOrdersAtResturant, [socket, postdata, trackers], false);
	return;
	}
	
	orders = [];
	userOrdersDic = user.orders
	for(key in userOrdersDic)
		{
		if(userOrdersDic.hasOwnProperty(key))
				{
					if(userOrdersDic[key]===postdata.resturantID)
						{
						orders.push(key);
						}
				}
		}
	if(socket)
		socket.send(JSON.stringify({"eventRecieved":"getUserOrdersAtResturant:"+postdata.userID,"orders":orders}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
	else
		console.log(JSON.stringify({"eventRecieved":"getUserOrdersAtResturant:"+postdata.userID,"orders":orders}));
	
}
exports.getUserOrdersAtResturant = getUserOrdersAtResturant;

function imageIDFromEntity(socket, postdata, trackers, entity)
{
	/*
	 * postdata:
	 * 
	 * entityID
	 * 
	 */
		if(!postdata.entityID)
		{
			if(socket)
				socket.send(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
			else
				console.log(JSON.stringify({"error": "Missing info", "data received" : postdata, "atFunction":arguments.callee.toString()}));
			return;
		}
		if(!entity)
			{
			getObject(postdata.entityID, imageIDFromEntity, [socket, postdata, trackers], false);
			return;
			}
		
		if(socket)
			socket.send(JSON.stringify({"eventRecieved":"imageIDFromEntity:"+postdata.entityID,"imageID":entity.imageID}));//must include id describing - many descriptors are listening on other side, need them to know who gets the description
		else
			console.log(JSON.stringify({"eventRecieved":"imageIDFromEntity:"+postdata.entityID,"imageID":entity.imageID}));
		
}
exports.imageIDFromEntity = imageIDFromEntity;


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

var names_to_ids = baseURL + "resturant_names_to_ids/";


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
					
					args.push(id);
					
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

function addMessage(response, postdata, trackers)
{
	json = {"participants":["00237-e7e3e8b5789c82bcb8b58ab92b7458dc", "00138-adf774bf0a710ddb027bd39eb7f011b5"]}
	createChat(response, json, trackers);
}
exports.addMessage = addMessage;

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
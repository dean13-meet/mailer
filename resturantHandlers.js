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
 * TODO rest
 * Resturant:
 * var id
 * var name
 * var images
 * TODO rest
 * 
 * Image:
 * var id
 * var resturantID
 * var data
 * var Content_Type
 * 
 * id allocation:
 * user - 001_...
 * resturant - 002_...
 * order - 003_...
 * item - 004_....
 * employee - 005_...
 * question - 006_...
 * image - 007_...
 * 
 */



//Create
function createOrder(response, postdata, id)
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
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	
	if(!id){
		createID("order", createOrder, [response, postdata]);
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


function createItem(response, postdata, id)
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
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("item", createItem, [response, postdata]);
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


function createEmployee(response, postdata, id)
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
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("employee", createEmployee, [response, postdata]);
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


function createQuestion(response, postdata, id)
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
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("question", createQuestion, [response, postdata]);
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


function createUser(response, postdata, id)
{
	/*
	 * PostData:
	 * var name
	 */

	if(!postdata.name)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("user", createUser, [response, postdata]);
	}else{

		auth = createAuth();
		json = {
				id:id,
				name:postdata.name,
				pass:postdata.pass,
				auth:auth,
				orders:[]
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


function createResturant(response, postdata, id)
{
	/*
	 * PostData:
	 * var name
	 */

	if(!postdata.name)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("resturant", createResturant, [response, postdata]);
	}else{

		json = {
				id:id,
				name:postdata.name,
				images:[]
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

function uploadImage(response, postdata, id, resturantObject)
{

	/*
	 * PostData:
	 * var resturantID
	 * dic data {data, Content-Type}
	 */
	
	
	if(!postdata.resturantID || !postdata.data)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!id){
		createID("image", uploadImage, [response, postdata]);
		return;
	}
	if(!resturantObject)
		{
		getObject(postdata.resturantID, uploadImage, [response, postdata, id], false);
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

//Get or update:

function getImageByID(response, postdata, image)
{
/*
 * PostData:
 * var imageID
 */	
	if(!postdata.imageID)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
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
	        prefix = type;
	        body = "";

	    response.setEncoding('binary');
	    response.on('end', function () {
	    	callback = getImageByID;
			args = [response, postdata];
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
		getURL(url, getImageByID, [response, postdata], false);*/
		return;
		}
	
	
	if(response)
		{
		console.log("Sending image: " + image);
		console.log("Sending image json: " + JSON.stringify(image));
		console.log("response is: " + response);
		response.end(image);
		}

	else
		console.log("Fetched image: " + image);

	
}
exports.getImageByID = getImageByID;

function getOrdersByUserID(response, postdata, user)
{
	/*
	 * PostData:
	 * var userID
	 * var userAuth
	 */
	if(!postdata.userID || !postdata.userAuth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!user)
		{
		getObject(postdata.userID, getOrdersByUserID, [response, postdata], false);
		}
	else{
		if(user.auth == postdata.userAuth)
			{
			if(response)
				response.end(user.orders);
			else
				console.log("User's orders: " + user.orders);
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

function getSurveyByOrderIDandUserID(response, postdata, order, user, items, employees, questionsItems, questionsEmployees, questionsOrder)
{
	/*
	 * PostData:
	 * var orderID
	 * var auth
	 * var userID
	 * var userAuth
	 */
	
	if(!postdata.orderID || !postdata.auth || !postdata.userID || !postdata.userAuth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	Array.prototype.pushArray = function(arr) {
		this.push.apply(this, arr);
	};
	
	
	if(!order){
		getObject(postdata.orderID, getSurveyByOrderIDandUserID, [response, postdata], false);
		return;
	}
	if(!user){
		getObject(postdata.userID, getSurveyByOrderIDandUserID, [response, postdata, order], false);
		return;
	}else{
		if(user.auth != postdata.userAuth)
			{
			if(response)
				response.end(JSON.stringify({error: "Error: Incorrect user auth."}));
			else
				console.log("Error: Incorrect user auth.");
			
			return;
			}
	}

	if(!items)items = [];
	if(items.length<order.itemsOrdered.length)
	{
		
		url = order.itemsOrdered[items.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, order, user, items], true);
		return;
	}
	if(!employees)employees = [];
	if(employees.length<order.employeesServing.length)
	{
		
		url = order.employeesServing[employees.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, order, user, items, employees], true);
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
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, order, user, items, employees, questionsItems], true);
		return;
	}
	var questionsEmployeesIDs = [];
	for(i = 0; i < employees.length; i++)
		{questionsEmployeesIDs.pushArray(employees[i].questions)}
	
	if(!questionsEmployees)questionsEmployees = [];
	if(questionsEmployees.length<questionsEmployeesIDs.length)
	{
		url = questionsEmployeesIDs[questionsEmployees.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, order, user, items, employees, questionsItems, questionsEmployees], true);
		return;
	}
	
	if(!questionsOrder)questionsOrder = [];
	if(questionsOrder.length<order.extraQuestions.length)
	{
		url = order.extraQuestions[questionsOrder.length];
		getObject(url, getSurveyByOrderIDandUserID, [response, postdata, order, user, items, employees, questionsItems, questionsEmployees,questionsOrder], true);
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
		else
			console.log("Sent: " + JSON.stringify(survey));

		//Save order to user's orders:
		if(needsAuth){
			user.orders.push(orderID)
			options = {
				method:'PUT',
				url: usersURL + user.id,
				json: user
			};
			request(options, function(err, res, body) { if (err) {
				throw Error(err); } else {

					console.log("Updated user: " + JSON.stringify(body));

				}
			});
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
function signIn(response, postdata, retVal)
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
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
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
		getURL(userQueryURL, signIn, [response, postdata], false);
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

function validateUserAuth(response, postdata, user)
{
/*
 * PostData:
 * var userID
 * var auth
 */	
	if(!postdata.userID || !postdata.auth)
	{
		if(response)
			response.end(JSON.stringify({"error": "Missing info"}));
		else
			console.log(JSON.stringify({"error": "Missing info"}));
		return;
	}
	if(!user)
		{
		getObject(postdata.userID, validateUserAuth, [response, postdata], false);
		}
	else
		{
		user = JSON.parse(user);
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
function saveURL(url, json)
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
		}});
}

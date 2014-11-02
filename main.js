var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandling");
var messageSender = require("./messageSender");

var handle = {}
//ANYTHING INSIDE HANDLE [] should be lower case!
handle["/"] = requestHandlers.open;
handle["/sendemail"] = requestHandlers.sendEmail;
handle["/download_dean_l_electricfieldsimulation"] = requestHandlers.downloadEFS;
handle["/createmessage"] = requestHandlers.createMessage;
handle["/editMessage"] = requestHandlers.editMessage;
handle["doge"] = requestHandlers.doge;

//resturant handlers:
handle["/resturant/createorder"] = requestHandlers.resturantApp.createOrder;
handle["/resturant/createitem"] = requestHandlers.resturantApp.createItem;
handle["/resturant/createemployee"] = requestHandlers.resturantApp.createEmployee;
handle["/resturant/createquestion"] = requestHandlers.resturantApp.createQuestion;
handle["/resturant/createuser"] = requestHandlers.resturantApp.createUser;
handle["/resturant/createresturant"] = requestHandlers.resturantApp.createResturant;
handle["/resturant/getsurveybyorderidanduserid"] = requestHandlers.resturantApp.getSurveyByOrderIDandUserID;
handle["/resturant/signin"] = requestHandlers.resturantApp.signIn;
handle["/resturant/getordersbyuserid"] = requestHandlers.resturantApp.getOrdersByUserID;

server.start(router.route, handle);





//Testing:

//var userJSON = {orderID:"00347-ece5f5e2b12c83807646d3f10ed2db25", userID:"00138-adf774bf0a710ddb027bd39eb7f011b5", auth:"V8WjC"}
//requestHandlers.resturantApp.getSurveyByOrderIDandUserID("", userJSON);

json = {userID:"00138-adf774bf0a710ddb027bd39eb7f011b5", userAuth:"8X3rPk99wm7RpLPM1pFVrigHT"}
requestHandlers.resturantApp.signIn("", json);

var json = 
{
resturant:"dean's pizza",
items:["lazagna", "pizza"],
employeesServing:["sir 1", "madam 2"],
extraQuestions:["1 q..."]
}
//requestHandlers.resturantApp.createOrder("", json); 

//messageSender.start("https://remindme.couchappy.com/messages/_design/getByLaunchDate/_view/getByLaunchDate/", "https://remindme.couchappy.com/messages/");

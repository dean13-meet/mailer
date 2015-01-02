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
handle["/uploadfileacsl"] = requestHandlers.uploadFileACSL;
handle["/acslanswers"] = requestHandlers.ACSLanswers;

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
handle["/resturant/validateuserauth"] = requestHandlers.resturantApp.validateUserAuth;
handle["/resturant/getimagebyid"] = requestHandlers.resturantApp.getImageByID;
handle["/resturant/uploadimage"] = requestHandlers.resturantApp.uploadImage;
handle["/resturant/urltoimagedata"] = requestHandlers.resturantApp.urlToImageData;
handle["/resturant/getresturantnamebyorderid"] = requestHandlers.resturantApp.getResturantNameByOrderID;
handle["/resturant/getresturantnamebyresturantid"] = requestHandlers.resturantApp.getResturantNameByResturantID;
handle["/resturant/createchat"] = requestHandlers.resturantApp.createChat;
handle["/resturant/getchatsbyuserid"] = requestHandlers.resturantApp.getChatsByUserID;
handle["/resturant/getdescriptionofchatbyid"] = requestHandlers.resturantApp.getDescriptionOfChatByID;

//NOTE: Socket-only accepting functions are handled in server file

//testing server:
handle["/resturant/printtrackers"] = requestHandlers.resturantApp.printTrackers;
handle["/resturant/addmessage"] = requestHandlers.resturantApp.addMessage;


server.start(router.route, handle);


//json = {"name":"Deanster", "pass":"admin"};
//requestHandlers.resturantApp.createUser("", json);

//json2 = {"name":"Deanster's Resturant", "pass":"admin"};
//requestHandlers.resturantApp.createResturant("", json2);


//json = {"participants":["00237-e7e3e8b5789c82bcb8b58ab92b7458dc", "00138-adf774bf0a710ddb027bd39eb7f011b5"]}
//requestHandlers.resturantApp.createChat("", json, "");

function test (data)
{
if(!data)
{
requestHandlers.resturantApp.urlToImageData("http://www.picresize.com/images/rsz_man-w-questions-320x320.jpg", test, [], false);
}
else
requestHandlers.resturantApp.uploadImage("",{"data":data, "resturantID":"00237-e7e3e8b5789c82bcb8b58ab92b7458dc"});
}
//test();

//Testing:

//var userJSON = {orderID:"00347-ece5f5e2b12c83807646d3f10ed2db25", userID:"00138-adf774bf0a710ddb027bd39eb7f011b5", auth:"V8WjC", userAuth:"de"}
//requestHandlers.resturantApp.getSurveyByOrderIDandUserID("", userJSON);

//json = {userID:"00138-adf774bf0a710ddb027bd39eb7f011b5", userAuth:"8X3rPk99wm7RpLPM1pFVrigHT"}
//requestHandlers.resturantApp.signIn("", json);



//messageSender.start("https://remindme.couchappy.com/messages/_design/getByLaunchDate/_view/getByLaunchDate/", "https://remindme.couchappy.com/messages/");

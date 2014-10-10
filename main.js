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

server.start(router.route, handle);

messageSender.start("https://remindme.couchappy.com/messages/_design/getByLaunchDate/_view/getByLaunchDate/", "https://remindme.couchappy.com/messages/");

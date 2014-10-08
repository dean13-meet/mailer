var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandling");

var handle = {}
//ANYTHING INSIDE HANDLE [] should be lower case!
handle["/"] = requestHandlers.open;
handle["/sendemail"] = requestHandlers.sendEmail;
handle["/download_dean_l_electricfieldsimulation"] = requestHandlers.downloadEFS;
handle["/createmessage"] = requestHandlers.createMessage;

server.start(router.route, handle);



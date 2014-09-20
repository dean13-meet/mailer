var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandling");

var handle = {}
handle["/sendEmail"] = requestHandlers.sendEmail;

server.start(router.route, handle);

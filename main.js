var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandling");

var handle = {}
handle["/"] = requestHandlers.open;
handle["/sendEmail"] = requestHandlers.sendEmail;
handle["/download_Dean_L_ElectricFieldSimulation"] = requestHandlers.downloadEFS;

server.start(router.route, handle);

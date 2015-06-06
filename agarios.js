/**
 * New node file
 */

var async = require("async");


var grids = {};//gridID to grid

var gridSize = 5000;
//actual grid is -gridsize/2 to gridsize/2


var defVeloc = 500

var sockets = {}  //---- playerID to socket (keep sockets seperate from players, since JSON.stringify can't take sockets)
//Grid:
/*
 * 
 * players = {}  ---- playerID to player
 * food = []
 * 
 */

//Player
/*
 * trackingID - used for client to keep track of which player is which, THIS IS NOT THE SAME ID USED BY THE CLIENT TO UPDATE THE PLAYER SPEED!
 * location = {"x":..., "y":...}
 * mass
 * name
 * dirx
 * diry
 * dampening 0 <= damp <= 1 -- this slows down 
 * 
 */ 

//Food
/*
 * 
 * location = {"x":..., "y":...}
 * 
 */


function requires(postdata, listOfStrings, socket) {
	for (var index = 0; index < listOfStrings.length; index++) {
		var stringToCheck = listOfStrings[index];
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


function startGameWithName(socket, postdata)
{
	if (!requires(postdata, [ "name" ], socket))
		return;
	
	var player = {};
	player.trackingID = createAuth(20);
	player.mass = 10;
	player.name = postdata.name;
	player.location = randomLocation();
	player.dirx = .707;
	player.diry = .707;
	player.dampening = 1;
	
	var playerID = createAuth(20);
	sockets[playerID] = socket;
	var gridID = signForGrid(player, playerID);
	sendToSocket(socket, {"eventRecieved":"playerRegistered","playerID":playerID, "gridID": gridID, 
		playerObject:player});
	
	startUpdates();

}
exports.startGameWithName = startGameWithName;


function signForGrid(player, playerID)
{
	var gridID = null;
	for(var key in grids)
		{
		if(Object.keys(grids[key].players).length<100)
			gridID = key;
			break;
		}
	if(!gridID)
		{
		gridID = createGrid();
		}
	grids[gridID].players[playerID] = player;
	return gridID;
}


function randomLocation(gridsize)
{
	var gridsize = gridsize ? gridsize : gridSize;//gridSize is the class variable
	var x = random(-gridsize/2 + 20, gridsize/2 - 20);
	var y = random(-gridsize/2 + 20, gridsize/2 - 20);
	return {"x":x, "y":y};
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createGrid()
{
	var gridID = createAuth(20);
	while(grids[gridID])
		{
		gridID = createAuth(20);
		}
	
	var grid = {};
	grid.players = {};
	grid.food = [];
	grids[gridID] = grid;
	return gridID;
}



var numbersPossible = "0123456789";
var allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function createAuth(length, numbersOnly) {
	var text = "";
	var possible = numbersOnly ? numbersPossible : allChars;

	for (var i = 0; i < length; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}


function showGrids(response, postdata)
{
	response.write("Grids: \n\n");
	for(var key in grids)
		{
		response.write(key + ":\n");
		response.write(JSON.stringify(grids[key]));
		response.write("\n");
		}
	response.end();
}
exports.showGrids = showGrids;

var maxFPS = 80;
var fps = 0;
var lastUpdate = new Date();
//startGameWithName(0, {name:"Deanster"});
var countDownToSendSocketInfo = 4;//send the updates to clients only 1/5 of the time as the physics engine runs
var currentCountdownToSocket = countDownToSendSocketInfo;//this is the variable that will be decrimented
var updateSeq = 0;//use this to track update#, client should only accept updates higher than their current updateSeq, incase 2 updates were sent and the first arrived last
var lastUpdateToClients = 0;//don't update clients more than every 200ms
var updateClientsOnlyEvery = 200;//ms

var isUpdating = false;
startUpdates();
function startUpdates(response)
{
	if(response)
		response.end("Started");
	if(isUpdating)return;
	console.log("Starting updates");
	isUpdating = true;
	
	runGridUpdates();
}
exports.startUpdates = startUpdates;

function stopUpdates(response)
{
	if(response)
		response.end("Stopped");
	if(!isUpdating)return;
	console.log("Stopping updates");
	isUpdating = false;
}
exports.stopUpdates = stopUpdates;

var totalPlayersUpdated = 0;
function runGridUpdates()
{
	updateSeq++;
	var endTime = new Date();//millisec
	var deltaTime = endTime-lastUpdate;
	lastUpdate = endTime;
	var fps = 1000/deltaTime;
	totalPlayersUpdated = 0;
	for(var key in grids)
		{
		updateGrid(key, fps)
		}
	if(totalPlayersUpdated==0)
		{
		stopUpdates();
		return;
		}
	var nowTime = new Date();
	if(currentCountdownToSocket<=1 && nowTime>=lastUpdateToClients-updateClientsOnlyEvery)
		{
			updateClients();
			currentCountdownToSocket = countDownToSendSocketInfo;
		}
	else
		currentCountdownToSocket--;
	
	setTimeout(runGridUpdates, (deltaTime < 1000/maxFPS) ? 1000/maxFPS - deltaTime : 0 );
	
 	//console.log("Done");
}




function updateGrid(gridID, fps)
{
	
	var grid = grids[gridID];
	//console.log("Updating gridID: " + gridID);
	//console.log(JSON.stringify(grid));
	
	updatePlayerPositions(grid.players, fps);
}

function updatePlayerPositions(players, fps)
{
	//console.log("players");
	for(var playerID in players)
		{
		totalPlayersUpdated++;
		var player = players[playerID];
		//console.log("Player in updating: " + JSON.stringify(player));
		if(!verifyDirs(player.dirx, player.diry))continue;
		if(!(player.dampening >=0 && player.dampening<=1))continue;
		var x = (1/fps)*player.dampening*player.dirx*defVeloc + player.location.x;
		var y = (1/fps)*player.dampening*player.diry*defVeloc + player.location.y;
		//console.log("x,y " + x + "," + y);
		//console.log("Fps: " + fps);
		x = Math.min(gridSize/2, Math.max(x, -gridSize/2));
		y = Math.min(gridSize/2, Math.max(y, -gridSize/2));
		player.location.x = x;
		player.location.y = y;
		//console.log("Player after updating: " + JSON.stringify(player));
		}
}

function verifyDirs(dirx, diry)
{
	//console.log("dir1");
	if(dirx<-1 || dirx>1)return false;//console.log("dir2");
	if(diry<-1 || diry>1)return false;//console.log("dir3");
	
	var distanceSquared = dirx*dirx + diry*diry;
	//console.log("double: " + distanceSquared);
	
	return ((distanceSquared-1)*100 < 1 && -(distanceSquared-1)*100 < 1);
}

function updateClients()
{
	for(var key in grids)
		{
		var grid = grids[key];
		var playersDic = grid.players;
		var players = [];
		for(var o in playersDic) {
		    players.push(playersDic[o]);
		}
		for(var key2 in playersDic)
			{
			sendToSocket(sockets[key2], {"eventRecieved":"gridUpdate", "players":players, "updateSeq":updateSeq});
			}
		}
	lastUpdateToClients = new Date();
	console.log("updated clients");
}


function setPlayerMovement(socket, postdata)
{
	if (!requires(postdata, [ "gridID", "playerID", "dirx", "diry", "dampening" ], socket))
		return;
	
	var grid = grids[postdata.gridID];
	if(!grid)return;
	var player = grid.players[postdata.playerID];
	if(!player)return;
	if(!verifyDirs(postdata.dirx, postdata.diry))return;
	if(!(postdata.dampening>=0 && postdata.dampening<=1))return;
	player.dirx = postdata.dirx;
	player.diry = postdata.diry;
	player.dampening = postdata.dampening;
}
exports.setPlayerMovement = setPlayerMovement;



function credits(res, postdata, trackers)
{
	res.writeHead(200, {'content-type': 'text/html'});
	res.write("Agar iOS<br>" +
			"Mobile Application by: Dean Leitersdorf and Wilson Wang<br> " +
	"Image Credits: <a href=\"http://icons8.com/web-app/\">Icons8</a>");
	res.end();
}
exports.credits = credits;
/**
 * New node file
 */

var async = require("async");


var grids = {};//gridID to grid

var gridSize = 5000;
//actual grid is -gridsize/2 to gridsize/2


var defVeloc = 500

//Grid:
/*
 * 
 * players = {}  ---- playerID to player, player contains socket
 * food = []
 * 
 */

//Player
/*
 * trackingID - used for client to keep track of which player is which, THIS IS NOT THE SAME ID USED BY THE CLIENT TO UPDATE THE PLAYER SPEED!
 * location = {"x":..., "y":...}
 * mass
 * socket
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
	for (index = 0; index < listOfStrings.length; index++) {
		stringToCheck = listOfStrings[index];
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
	
	player = {};
	player.trackingID = createAuth(20);
	player.socket = socket;
	player.mass = 10;
	player.name = postdata.name;
	player.location = randomLocation();
	player.dirx = .707;
	player.diry = .707;
	player.dampening = 1;
	
	playerID = createAuth(20);
	gridID = signForGrid(player, playerID);
	sendToSocket(socket, {"playerID":playerID, "gridID": gridID, playerObject:player});

}
exports.startGameWithName = startGameWithName;


function signForGrid(player, playerID)
{
	gridID = null;
	for(key in grids)
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
	gridsize = gridsize ? gridsize : gridSize;//gridSize is the class variable
	x = random(-gridsize/2 + 20, gridsize/2 - 20);
	y = random(-gridsize/2 + 20, gridsize/2 - 20);
	return {"x":x, "y":y};
}

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createGrid()
{
	gridID = createAuth(20);
	while(grids[gridID])
		{
		gridID = createAuth(20);
		}
	
	grid = {};
	grid.players = {};
	grid.food = [];
	grids[gridID] = grid;
	return gridID;
}



numbersPossible = "0123456789";
allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
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
	for(key in grids)
		{
		response.write(key + ":\n");
		response.write(JSON.stringify(grids[key]));
		response.write("\n");
		}
	response.end();
}
exports.showGrids = showGrids;

maxFPS = 20;
fps = 0;
lastUpdate = new Date();
//startGameWithName(0, {name:"Deanster"});
countDownToSendSocketInfo = 5;//send the updates to clients only 1/5 of the time as the physics engine runs
currentCountdownToSocket = countDownToSendSocketInfo;//this is the variable that will be decrimented
updateSeq = 0;//use this to track update#, client should only accept updates higher than their current updateSeq, incase 2 updates were sent and the first arrived last


runGridUpdates();
function runGridUpdates()
{
	updateSeq++;
	endTime = new Date();//millisec
	deltaTime = endTime-lastUpdate;
	lastUpdate = endTime;
	fps = 1000/deltaTime;
	totalPlayersUpdated = 
	for(key in grids)
		{
		updateGrid(key, fps)
		}
	
	
	if(currentCountdownToSocket==1)
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
	
	grid = grids[gridID];
	//console.log("Updating gridID: " + gridID);
	//console.log(JSON.stringify(grid));
	
	updatePlayerPositions(grid.players, fps);
}

function updatePlayerPositions(players, fps)
{
	//console.log("players");
	for(playerID in players)
		{
		player = players[playerID];
		if(!verifyDirs(player.dirx, player.diry))continue;
		if(!(player.dampening >=0 && player.dampening<=1))continue;
		x = (1/fps)*player.dampening*player.dirx*defVeloc + player.location.x;
		y = (1/fps)*player.dampening*player.diry*defVeloc + player.location.y;
		x = Math.min(gridSize/2, Math.max(x, -gridSize/2));
		y = Math.min(gridSize/2, Math.max(y, -gridSize/2));
		player.location.x = x;
		player.location.y = y;
		}
}

function verifyDirs(dirx, diry)
{
	//console.log("dir1");
	if(dirx<-1 || dirx>1)return false;//console.log("dir2");
	if(diry<-1 || diry>1)return false;//console.log("dir3");
	
	distanceSquared = dirx*dirx + diry*diry;
	//console.log("double: " + distanceSquared);
	
	return ((distanceSquared-1)*100 < 1 && -(distanceSquared-1)*100 < 1);
}

function updateClients()
{
	for(key in grids)
		{
		grid = grids[key];
		playersDic = grid.players;
		players = [];
		for(o in playersDic) {
		    players.push(playersDic[o]);
		}
		for(i = 0; i < players.length; i++)
			{
			player = players[i];
			sendToSocket(player.socket, {"eventRecieved":"gridUpdate", "players":players, "updateSeq":updateSeq});
			}
		}
}



function credits(res, postdata, trackers)
{
	res.writeHead(200, {'content-type': 'text/html'});
	res.write("Agar iOS<br>" +
			"Mobile Application by: Dean Leitersdorf and Wilson Wang<br> " +
	"Image Credits: <a href=\"http://icons8.com/web-app/\">Icons8</a>");
	res.end();
}
exports.credits = credits;
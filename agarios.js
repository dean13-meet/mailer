/**
 * New node file
 */
var grids = {};//gridID to grid

var gridSize = 5000;
//actual grid is -gridsize/2 to gridsize/2


//Grid:
/*
 * 
 * Players = {}  ---- playerID to player, player contains socket
 * Food = []
 * 
 */

//Player
/*
 * 
 * Location = {"x":..., "y":...}
 * Mass
 * socket
 * name
 * 
 */ 

//Food
/*
 * 
 * Location = {"x":..., "y":...}
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
	player.socket = socket;
	player.mass = 10;
	player.name = postdata.name;
	player.location = randomLocation();
	
	playerID = createAuth(20)
	gridID = signForGrid(player, playerID);
	sendToSocket(socket, {"playerID":playerID, "gridID": gridID});

}
exports.startGameWithName = startGameWithName;


function signForGrid(player, playerID)
{
	gridID;
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
	response.write("Grids: ");
	for(key in grids)
		{
		response.write(key + ":");
		response.write(JSON.stringify(grids[key]));
		}
	response.end();
}
exports.showGrids = showGrids;
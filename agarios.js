/**
 * New node file
 */
var grids = {};//gridID to grid

var gridSize = 5000;
//actual grid is -gridsize/2 to gridsize/2


//Grid:
/*
 * 
 * players = {}  ---- playerID to player, player contains socket
 * food = []
 * 
 */

//Player
/*
 * 
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
	player.socket = socket;
	player.mass = 10;
	player.name = postdata.name;
	player.location = randomLocation();
	player.dirx = .707;
	player.diry = .707;
	player.dampening = 0;
	
	playerID = createAuth(20)
	gridID = signForGrid(player, playerID);
	sendToSocket(socket, {"playerID":playerID, "gridID": gridID});

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

startGameWithName(0, {name:"Deanster"});
runGridUpdates();


function runGridUpdates()
{
	for(key in grids)
		{
		updateGrid(key);
		}
	
}

function updateGrid(gridID)
{
	currentTime = new Date();//millisec
	grid = grids[gridID];
	updatePlayerPositions(grid.players);
	
}

function updatePlayerPositions(players)
{
	console.log("players");
	for(playerID in players)
		{
		
		player = players[playerID];
		console.log(verifyDirs(player.dirx, player.diry));
		console.log("damp ok: " + (player.dampening >=0 && player.dampening<=1))
		
		}
}

function verifyDirs(dirx, diry)
{
	console.log("dir1");
	if(dirx<-1 || dirx>1)return false;console.log("dir2");
	if(diry<-1 || diry>1)return false;console.log("dir3");
	
	distanceSquared = dirx*dirx + diry*diry;
	console.log("double: " + distanceSquared);
	
	return ((distanceSquared-1)*100 < 1 && -(distanceSquared-1)*100 < 1);
	
}
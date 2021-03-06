/**
 * New node file
 */

var async = require("async");

var grids = {};// gridID to grid

var gridSize = 5000;
// actual grid is -gridsize/2 to gridsize/2

var defVeloc = 400

var sockets = {} // ---- playerID to socket (keep sockets seperate from
					// players, since JSON.stringify can't take sockets)
// Grid:
/*
 * 
 * players = {} ---- playerID to player
 * trackToID = {}//player trackingID to playerID
 * foods = {}
 * numFoodsInGrid = int;//use this to keep track of ## of foods on grid -- counting "foods" dictionary is expensive
 * foodsAdded = [] //used to update sockets
 * foodsDeleted []
 * 
 */

// Player
/*
 * trackingID - used for client to keep track of which player is which, THIS IS
 * NOT THE SAME ID USED BY THE CLIENT TO UPDATE THE PLAYER SPEED! 
 * location = {"x":..., "y":...} 
 * mass 
 * name 
 * dirx 
 * diry 
 * dampening 0 <= damp <= 1 -- this slows down
 * radius -- can be derived from mass, but useful to store as it is expensive to calculate every frame (uses sqrt)
 * massFactor --can be derived from mass, but expensive to calculate (requires ^mass)
 * 
 */

// Food
/*
 * 
 * location = {"x":..., "y":...}
 * trackingID
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

function startGameWithName(socket, postdata) {
	if (!requires(postdata, [ "name" ], socket))
		return;

	var player = {};
	player.trackingID = createAuth(20);
	player.mass = 10;
	player.radius = Math.sqrt(radSqrFromMass(player.mass));
	player.massFactor = massFactorForMass(player.mass);
	player.name = postdata.name;
	player.location = randomLocation();
	player.dirx = .707;
	player.diry = .707;
	player.dampening = 1;

	var playerID = createAuth(20);
	sockets[playerID] = socket;
	var gridID = signForGrid(player, playerID);
	sendToSocket(socket, {
		"eventRecieved" : "playerRegistered",
		"playerID" : playerID,
		"gridID" : gridID,
		playerObject : player
	});

	startUpdates();

}
exports.startGameWithName = startGameWithName;

function signForGrid(player, playerID) {
	var gridID = null;
	for ( var key in grids) {
		if (Object.keys(grids[key].players).length < 100)
			gridID = key;
		break;
	}
	if (!gridID) {
		gridID = createGrid();
	}
	grids[gridID].players[playerID] = player;
	grids[gridID].trackToID[player.trackingID] = playerID;
	return gridID;
}

function randomLocation(gridsize) {
	var gridsize = gridsize ? gridsize : gridSize;// gridSize is the class
													// variable
	var x = random((-gridsize / 2) + 20, (gridsize / 2) - 20);
	var y = random((-gridsize / 2) + 20, (gridsize / 2) - 20);
	console.log("rand loc: " + x + " " + y);
	return {
		"x" : x,
		"y" : y
	};
}

function random(min, max) {
	return Math.random() * (max - min) + min;
}

function createGrid() {
	var gridID = createAuth(20);
	while (grids[gridID]) {
		gridID = createAuth(20);
	}

	var grid = {};
	grid.players = {};
	grid.foods = {};
	grid.foodsAdded = [];
	grid.foodsRemoved = [];
	grid.numFoodsInGrid = 0;
	grid.trackToID = {};
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

function showGrids(response, postdata) {
	response.write("Grids: \n\n");
	for ( var key in grids) {
		response.write(key + ":\n");
		response.write(JSON.stringify(grids[key]));
		response.write("\n");
	}
	response.end();
}
exports.showGrids = showGrids;

var maxFPS = 100;
var fps = 0;
var lastUpdate = Date.now();
// startGameWithName(0, {name:"Deanster"});
var countDownToSendSocketInfo = 4;// send the updates to clients only 1/5 of
									// the time as the physics engine runs
var currentCountdownToSocket = countDownToSendSocketInfo;// this is the
															// variable that
															// will be
															// decrimented
var updateSeq = 0;// use this to track update#, client should only accept
					// updates higher than their current updateSeq, incase 2
					// updates were sent and the first arrived last
var lastUpdateToClients = 0;// don't update clients more than every 200ms
var updateClientsOnlyEvery = 20;// ms

var isUpdating = false;
startUpdates();
function startUpdates(response) {
	if (response)
		response.end("Started");
	if (isUpdating)
		return;
	console.log("Starting updates");
	isUpdating = true;

	runGridUpdates();
}
exports.startUpdates = startUpdates;

function stopUpdates(response) {
	if (response)
		response.end("Stopped");
	if (!isUpdating)
		return;
	console.log("Stopping updates");
	isUpdating = false;
}
exports.stopUpdates = stopUpdates;

var totalPlayersUpdated = 0;
function runGridUpdates() {
	if (!isUpdating)
		return;
	updateSeq++;
	var endTime = Date.now();// millisec
	var deltaTime = endTime - lastUpdate;
	lastUpdate = endTime;
	var fps = 1000 / deltaTime;
	totalPlayersUpdated = 0;
	for ( var key in grids) {
		updateGrid(key, fps)
	}
	if (totalPlayersUpdated == 0) {
		stopUpdates();
		return;
	}
	var nowTime = Date.now();
	//console.log("now " + nowTime);
	//console.log(lastUpdateToClients);
	//console.log(updateClientsOnlyEvery);
	if ((currentCountdownToSocket <= 1)
			&& (nowTime >= (lastUpdateToClients + updateClientsOnlyEvery))) {
		updateClients();
		performCollisionDetection();//we don't wanna run this too often
		currentCountdownToSocket = countDownToSendSocketInfo;
	} else
		currentCountdownToSocket--;

	setTimeout(runGridUpdates, (deltaTime < 1000 / maxFPS) ? ((1000 / maxFPS)
			- deltaTime ): 0);

	// console.log("Done");
}

function updateGrid(gridID, fps) {

	var grid = grids[gridID];
	// console.log("Updating gridID: " + gridID);
	// console.log(JSON.stringify(grid));

	updatePlayerPositions(grid.players, fps);
	updateFoods(grid, fps);
}

function updatePlayerPositions(players, fps) {
	// console.log("players");
	for ( var playerID in players) {
		totalPlayersUpdated++;
		var player = players[playerID];
		// console.log("Player in updating: " + JSON.stringify(player));
		if (!verifyDirs(player.dirx, player.diry))
			continue;
		if (!(player.dampening >= 0 && player.dampening <= 1))
			continue;
		
		var massFactor = player.massFactor;
		
		var x = (1 / fps) * player.dampening * player.dirx * defVeloc * massFactor
				+ player.location.x;
		var y = (1 / fps) * player.dampening * player.diry * defVeloc * massFactor
				+ player.location.y;
		/*console.log("x,y " + x + "," + y);
		console.log("damp: " + player.dampening + " dirx " +player.dirx + " diry " + player.diry + " def " + defVeloc + " massFactor " + player.massFactor + " location " + JSON.stringify(player.location)) 
		console.log("Fps: " + fps);*/
		x = Math.min(gridSize / 2 - player.radius, Math.max(x, -gridSize / 2 + player.radius));
		y = Math.min(gridSize / 2 - player.radius, Math.max(y, -gridSize / 2 + player.radius));
		//console.log("setting x,y " + x + "," + y);
		player.location.x = x;
		player.location.y = y;
		// console.log("Player after updating: " + JSON.stringify(player));
	}
}

//this is the exp decay formula for when 100 mass is twice as slow as 10
var base = 0.998888888823279462629434;
var mult = 1.08005973889;
function massFactorForMass(mass, currentMassFactor, change)
{
	//when currentMassFactor and change are given, use them to calculate new massFactor, as it will be much more efficient
	if(currentMassFactor)
		{
		return currentMassFactor * Math.pow(base,change);
		}
	return mult*Math.pow(base,mass);
}

const numFoods = 300;//max foods
function updateFoods(grid, fps)
{
	if (!isUpdating)
		return;
	
	
	if(grid.numFoodsInGrid>=numFoods)return;
	
	
	var foods = grid.foods;
	
	/*
	var maxToSpawnThisTime = numFoods-grid.numFoodsInGrid;
	maxToSpawnThisTime = Math.min(2, maxToSpawnThisTime);
	var toSpawn = Math.random()*maxToSpawnThisTime;*/
	
	var toSpawn = Math.floor((Math.random()*fps/10))==0?1:0;//chance to spawn is 10 in 1 sec
	
	for(var i = 0; i < toSpawn; i++)
		{
		var food = {};
		food.location = randomLocation();
		food.trackingID = createAuth(7);
		grid.foods[food.trackingID]=food;
		grid.foodsAdded.push(food);
		grid.numFoodsInGrid++;
		}
}

//if you realize you don't have an accurate food count, then make sure to refetch foods
function requestFoods(socket, postdata)
{
	if (!requires(postdata, [ "gridID" ], socket))
		return;
	sendToSocket(socket, {
		"eventRecieved" : "requestFoods",
		"foods":grids[postdata.gridID].foods
	});
	console.log("SENT FOODS!!");
	
}
exports.requestFoods = requestFoods;

function verifyDirs(dirx, diry) {
	// console.log("dir1");
	if (dirx < -1 || dirx > 1)
		return false;// console.log("dir2");
	if (diry < -1 || diry > 1)
		return false;// console.log("dir3");

	var distanceSquared = dirx * dirx + diry * diry;
	// console.log("double: " + distanceSquared);

	return ((distanceSquared - 1) * 100 < 1 && -(distanceSquared - 1) * 100 < 1);
}

function updateClients() {
	if (!isUpdating)
		return;
	for (var key in grids) {
		var grid = grids[key];
		var playersDic = grid.players;
		var players = [];
		for ( var o in playersDic) {
			players.push(playersDic[o]);
		}
		for ( var key2 in playersDic) {
			sendToSocket(sockets[key2], {
				"eventRecieved" : "gridUpdate",
				"players" : players,
				"foodsAdded":grid.foodsAdded,
				"foodsRemoved":grid.foodsRemoved,
				"actualFoodCount":grid.numFoodsInGrid,
				"updateSeq" : updateSeq
			});
		}
		grid.foodsAdded = [];
		grid.foodsRemoved = [];
	}
	lastUpdateToClients = Date.now();
	//console.log("updated clients");
}

function setPlayerMovement(socket, postdata) {
	if (!requires(postdata,
			[ "gridID", "playerID", "dirx", "diry", "dampening" ], socket))
		return;

	var grid = grids[postdata.gridID];
	if (!grid)
		return;
	var player = grid.players[postdata.playerID];
	if (!player)
		return;
	if (!verifyDirs(postdata.dirx, postdata.diry))
		return;
	if (!(postdata.dampening >= 0 && postdata.dampening <= 1))
		return;
	player.dirx = postdata.dirx;
	player.diry = postdata.diry;
	player.dampening = postdata.dampening;
	
	sockets[postdata.playerID] = socket;//socket might have changed (e.g. close and open app)
}
exports.setPlayerMovement = setPlayerMovement;


//Out-of-Order now: -- don't use
function collisionDetected(socket, postdata)
{
	if (!requires(postdata,
			[ "gridID", "collisions" ], socket))
		return;
	
	console.log("got collisions: " + JSON.stringify(postdata.collisions))
	var grid = grids[postdata.gridID];
	if(!grid)return;
	var collisions = postdata.collisions;
	if(!collisions.length)return;//also ensures this is an array, otherwise it won't have length
	for(var i = 0; i<collisions.length; i++)
		{
		var collision = collisions[i];
		if(!collision.first || !collision.second)continue;
		if(collision.arePlayers)
			{
			console.log("1");
			}
		else
			{
			console.log("2");
			var playerID = grid.trackToID[collision.first];
			if(!playerID)return;
			var player = grid.players[playerID];
			console.log("6 " + playerID);
			var food = grid.foods[collision.second];
			console.log("3 " + JSON.stringify(food) + "4 " + JSON.stringify(player));
			if(!player || !food)continue;
			var offset = getOffset(player.location, food.location);
			var distSquare = offset.x*offset.x + offset.y*offset.y;
			var radSqr = player.radius;radSqr*=radSqr;
			
			console.log("5 " + offset + distSquare + radSqr);
			
			if(distSquare<radSqr)
			{
				delete grid.foods[collision.second];
				grid.foodsRemoved.push(food);
				grid.numFoodsInGrid--;
				player.mass++;
				player.radius = Math.sqrt(radSqrFromMass(player.mass));
				player.massFactor = massFactorForMass(player.mass, player.massFactor, 1);
			}
			}
		}
}
exports.collisionDetected = collisionDetected;


//a collision is only considered if the distance between the centers is smaller than the sum of the two radi minus half the smaller radius of the two
function collisionDetection(grid)
{
    
    //compare square of distance since ^2 is faster than sqrt
    var allPlayers = [];
    var playersTemp = grid.players;
    for(var key in playersTemp)
    	{
    	allPlayers.push(playersTemp[key]);
    	}
    //NSArray* allFoods = self.foods.allValues;
    for(var i = 0; i < allPlayers.length; i++)
    {
        var player1 = allPlayers[i];
        var r1 = player1.radius;
        
        for(var j = i + 1; j < allPlayers.length; j++)
        {
            var player2 = allPlayers[j];
            
            console.log("Checking for collision between players: " + JSON.stringify(player1) + " " + JSON.stringify(player2));
            
            var r2 = player2.radius;
            var radSqr = r1+r2;radSqr*=radSqr;
            var offset = getOffset(player1.location, player2.location);
            var distSquare = offset.x*offset.x + offset.y*offset.y;
            
            console.log("offset: " + JSON.stringify(offset) + " distSqr: " + distSquare + " radSqr: " + radSqr);
            if(distSquare<radSqr)
            {
                var smallest = r1<r2?r1:r2;
                console.log("smallest: " + smallest);
                var dist = Math.sqrt(distSquare);
                if(dist < r1+r2 - smallest/2)
                {
                    //collision:
                    console.log("we got a colission!");
                    performTakeOver(player1, player2, true, grid);
                }
            }
            
        }
        
        //now compare against the foods:
        var r1Squared = r1*r1;
        var foods = grid.foods;
        for(var key in foods)
        {
        	var food = foods[key];
            var offset = getOffset(player1.location, food.location);
            var distSquare = offset.x*offset.x + offset.y*offset.y;
            if(distSquare < r1Squared)
            {
                //collision:
            	performTakeOver(player1, food, false, grid);
            }
        }
    }
    
    
}
function performTakeOver(player, target, arePlayers, grid)
{
	
    if(arePlayers)
    {
    	console.log("Performing take over: " + JSON.stringify(player) + " " + JSON.stringify(target));
        var player2 = target;
        var firstIsSmaller = player.mass < player2.mass;
        var atLeastTenPercentBigger = firstIsSmaller ? player.mass*1.1<player2.mass : player2.mass*1.1<player.mass;
        console.log("f: " + firstIsSmaller + " a: " + atLeastTenPercentBigger);
        if(atLeastTenPercentBigger)
        {
        	var winner  = firstIsSmaller ? player2 : player;
           var loser = firstIsSmaller ? player : player2;
            
            var playerID = grid.trackToID[loser.trackingID];
            console.log("playerID: " + playerID);
            delete grid.players[playerID];
            delete grid.trackToID[loser.trackingID];
            
            winner.mass += loser.mass;
            winner.radius = Math.sqrt(radSqrFromMass(winner.mass));
    		winner.massFactor = massFactorForMass(winner.mass, winner.massFactor, loser.mass);
    		var socket = sockets[playerID];
    		sendToSocket(socket, {
    			"eventRecieved" : "youWereEaten"
			});
        }
    }
    else
    {
    	delete grid.foods[target.trackingID];
		grid.foodsRemoved.push(target);
		grid.numFoodsInGrid--;
		player.mass++;
		player.radius = Math.sqrt(radSqrFromMass(player.mass));
		player.massFactor = massFactorForMass(player.mass, player.massFactor, 1);
    }
    
}

function performCollisionDetection()
{

	for(var key in grids)
		{
		collisionDetection(grids[key]);
		}
}



var areaPerOneMass=150
function radSqrFromMass(mass)
{
	return (mass*areaPerOneMass)/3.1415926;
}


function getOffset(one, two)
{
	return {"x":one.x-two.x, "y":one.y-two.y};
}

function credits(res, postdata, trackers) {
	res.writeHead(200, {
		'content-type' : 'text/html'
	});
	res
			.write("Agar iOS<br>"
					+ "Mobile Application by: Dean Leitersdorf and Wilson Wang<br> "
					+ "Image Credits: <a href=\"http://icons8.com/web-app/\">Icons8</a>");
	res.end();
}
exports.credits = credits;
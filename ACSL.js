/**
 * New node file
 */
fs = require('fs');//file system


//Givens:
//Distances:
AB = 450;
BC = 140;
CD = 120;
DE = 320;
EF = 250;
FG = 80;

//Roads:
roads = {"I":65, "H":60, "M":55, "S":45}


//Car Types:
cars = {"C":28, "M":25, "F":22, "V":20};

//Distance Calculation:
function distance(start, finish)
{
	startNum = locationToNumber(start);
	finishNum = locationToNumber(finish);
	if(startNum==-1 || finishNum==-1){return"Error: Incorrect location(s)";}
	distance2 = 0;
	for(i = startNum; i <finishNum; i++)
		{
		switch(i)
		{
		case 1:{distance2+=AB; break;}
		case 2:{distance2+=BC; break;}
		case 3:{distance2+=CD; break;}
		case 4:{distance2+=DE; break;}
		case 5:{distance2+=EF; break;}
		case 6:{distance2+=FG; break;}
		}
		}
	return distance2;
}

function locationToNumber(location)//Example: A = 1, B = 2.... any letter not supported returns -1
{
	locations = ["A", "B", "C", "D", "E", "F", "G"];
	return letterToNumber(locations, location);
}

//Time Calculation:
function time (distance, road)
{
	mph = roads[road];
	if(mph==undefined){return"Error: Incorrect road";}
	return distance/mph;
}

function timeToHoursMinString(time)
{
hoursDouble = time;
hoursInt = Math.floor(hoursDouble);
minInt = Math.round((hoursDouble-hoursInt)*60);

hoursString = hoursInt<10 ? "0"+hoursInt : hoursInt;
minString = minInt<10 ? "0"+minInt : minInt;

return hoursString + ":" + minString;
}


//Cost Calculation:
function cost(distance, carType, gallonPrice)
{
	mpg = cars[carType];
	if(cars==undefined){return"Error: Incorrect car type";}
	return gallonPrice*distance/mpg;
}

function costToString(cost)
{
costTruncatedToTwoDecimals = cost*100;
costTruncatedToTwoDecimals = Math.round(costTruncatedToTwoDecimals);
costTruncatedToTwoDecimals/=100;
return "$"+costTruncatedToTwoDecimals;
}

//Helper method:
function letterToNumber(array, value)
{
	index = array.indexOf(value);
	return index>=0 ? index+1 : -1;
}

//combiner method:
function run(start, end, carType, road, gallonPrice)
{
distanceToGo = distance(start, end);
timeString = "time error";
costString = "cost error";

if(typeof distanceToGo === typeof(0)||typeof distanceToGo === typeof(0.0)){//make sure it is an int/double --- not an error

timeString = time(distanceToGo, road);//this is int here -- the time in hours required. do this step first to check for "error" in next line
if(typeof timeString === typeof(0)||typeof timeString === typeof(0.0))
timeString = timeToHoursMinString(timeString);

costString = cost(distanceToGo, carType, gallonPrice);//same as comment above
if(typeof costString === typeof(0)||typeof costString === typeof(0.0))
costString = costToString(costString);
}

return distanceToGo+", " + timeString + ", " + costString;
}
exports.run = run;
/**
 * New node file
 */

var requestHandlers = require("./requestHandling");

var toDelete = [];

function start(urlToListenTo, urlToDeleteFrom)

{
	try{
	//console.log("STARTING TO SEND");
	options = 
		{method: 'GET',
		url: urlToListenTo,
		json: {}
		};
	request(options, function(err, res, body) { if (err) {
		throw Error(err); } else {
			//console.log(res.statusCode, body);
			
			
			
			var BreakException= {};

			try {
				if(body)
			body.rows.forEach(function(x)
					{
					var time = Date.now()/1000;
				var notContains = !!toDeleteContains(x);
				//console.log("notC: " + notContains)
				if(notContains){
						if( x.value.date.seconds <= time)
							{
							//console.log("sending " + x.id)
							//console.log("WHEN: " + toDelete.toString())
							requestHandlers.sendEmail(null, x.value);
							toDelete.push(x);//removes from urlToListenTo
							}
						else {throw BreakException;}
					}
					}
			);
			} catch(e) {
			    if (e!==BreakException) throw e;
			}
			
			//console.log("DELETING messages " + toDelete.length); 
			if(toDelete){
			toDelete.forEach(function(x)
					{
				if(x){
				//console.log("DELETING: " + x.id)
				options2 = 
				{method: 'DELETE',
				url: urlToDeleteFrom+x.id+"\?rev\="+x.value._rev,
				json: {}
				};
				//console.log("rev: " + JSON.stringify(options2.json))
				request(options2, function(err, res, body2) { if (err) {
				}else
					//console.log(res.statusCode, body2)
					for(var i = 0; i < toDelete.length; i++)
						{
						if(toDelete[i]==x)
							{toDelete.splice(i, 1);}
						
						}
					
					
				
				});
					}
		}
			);
			}
			process.nextTick(function(){callback = start(urlToListenTo, urlToDeleteFrom)});
		}
	});
}
catch(e){
	console.log("ERROR: " + e)
	try{
	process.nextTick(function(){callback = start(urlToListenTo, urlToDeleteFrom)});
	}catch (e2){console.log("ERROR: " + e2)}
}

}
	
function toDeleteContains(value)
{
	try{
	return !!toDelete.every(function(x){
	
	//console.log("lets check: " + (x==value) + x + " " +  value)
	if(x.id==value.id){
		//console.log("returning true")
		return false;
		}
	else
		return true;
	})	
	}
	catch(e){
		console.log("ERROR: " + e)
	}

}

exports.start = start;

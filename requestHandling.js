var querystring = require("querystring");

var nodemailer = require('nodemailer');
request = require('request')
fs = require('fs');


// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
	service: "Mailgun",
    auth: {
        user: 'dean@sandbox88ff04e4c401491e983e66ec8f0741ac.mailgun.org',
        pass: 'leitersdorf'
    }
});


// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols

function sendEmail(response, postData)
{
console.log("SENDING EMAIL: " + JSON.stringify(postData));
var mailOptions = {
    from: postData.user || 'dean.leitersdorf@gmail.com', // sender address
    to: postData.rec || '6503508998@vtext.com',//, 6506901817@vtext.com, 6508470427@vtext.com', // list of receivers
    subject: postData.messageID ? ''  : 'Paly Detection', // Subject line
    text: postData.context || 'Dean arrived at school.', // plaintext body
    //html: '<b>Hello world </b>' // html body
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
    	console.log(error);
    	if(response!=null)//do not delete this
      response.end("error");
        
    }else{
    	if(response!=null)//do not delete this
        response.end('Message sent: ' + info.response);
    }
});
}

var path = require('path');
var mime = require('mime');
var fs = require('fs');

function downloadEFS(res, postData)
{
	
	var file = __dirname + '/DEAN_L_electricFieldSimulation.jar';
	console.log(file);
	
	var filename = path.basename(file);
	  var mimetype = mime.lookup(file);

	  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	  res.setHeader('Content-type', mimetype);
	  console.log("EXISTS: " + fs.existsSync(file));
	  
	  var filestream = fs.createReadStream(file);
	  filestream.pipe(res);	
	  filestream.on('error', function(err) {
		    res.end(err);
		  });
	  console.log("HERE");
}
exports.downloadEFS = downloadEFS

function sendMessage(response, postData)
{
/*
 * PostData:
 * number
 * message
 */
	options = {
			method:'POST',
			url: 'http://textbelt.com/text',
			form:'message='+postData.message+"&number="+postData.number
			};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				response.end(body);
			}
		});
}
exports.sendMessage = sendMessage

var exec=require("child_process").exec;

function open(res, postData)
{
	res.write(__dirname);
	exec("ls -lah", function(error, stdout, stderr){
		
	    res.write(stdout);
	    res.end("HERE");
	});
	
}
function createMessage(response, postData)
{
	
	postData = JSON.parse(postData);
	console.log("creating message using postData: " + postData);
keyToGetMessageID = "9f811fc38470d144e2195e6c6a000b39";

options = {
	method: process.argv[2] || 'GET',
	url: 'https://remindme.couchappy.com/messageid/' + (keyToGetMessageID),
	json: {}
	};
request(options, function(err, res, body) { if (err) {
	throw Error(err); } else {
	
		//console.log(res.statusCode, body);
		
		options = {
	method: process.argv[2] || 'PUT',
	url: 'https://remindme.couchappy.com/messageid/' + (keyToGetMessageID),
	json: body
	};
request(options, function(err, res, body2) { if (err) {
	throw Error(err); } else {
		//console.log(res.statusCode, body2);//the return from the PUT
		//console.log(body._rev);//the return from the previous GET
		
		messageid = body._rev;
defaultMessage = "DEF MESSAGE";
defaultUser = "65035089989";
defaultRec = "6503508998";
defaultTime = "1420070400";//1 Jan 2015

message = 
{
messageID: messageid,
context: postData.context || defaultMessage,
user: postData.user || defaultUser,
rec: postData.rec || defaultRec,
date: 
{
seconds: postData.date.seconds || defaultTime
}

}


console.log("created message: " + JSON.stringify(message))
options = {
	method: process.argv[2] || 'GET',
	url: 'https://remindme.couchappy.com/phone_numbers/' + (process.argv[3] || message["user"]),
	json: {}
	};
request(options, function(err, res, body) { if (err) {
	throw Error(err); } else {
		//console.log(res.statusCode, body);
		console.log("gonna push on: " + body.messages);
		body.messages.push(message);
	}
options = {
	method: process.argv[2] || 'PUT',
	url: 'https://remindme.couchappy.com/phone_numbers/' + (process.argv[3] || message["user"]),
	json: body
	};
request(options, function(err, res, body2) { if (err) {
	throw Error(err); } else {
		//console.log(res.statusCode, body2);
	}
});
	
});

options = {
		method: process.argv[2] || 'PUT',
		url: 'https://remindme.couchappy.com/messages/' + message.messageID,
		json: message
		};
	request(options, function(err, res, body2) { if (err) {
		throw Error(err); } else {
			response.end("Created Message" + message);
			//console.log(res.statusCode, body2);
			//response.end(JSON.stringify(message));
		}
	});
		}
	});



		
	}
});
		
	}

function editMessage(response, message)
{
	defaultMessage = "DEF MESSAGE";
	defaultUser = "6503508998";
	defaultRec = "6503508998";
	defaultTime = "1420070400";
	
	options = {
			method: process.argv[2] || 'PUT',
			url: 'https://remindme.couchappy.com/messages/' + message.messageID,
			json: message
			};
		request(options, function(err, res, body) { if (err) {
			throw Error(err); } else {
				console.log(res.statusCode, body);
				
			}
		});
		
		options = {
				method: process.argv[2] || 'GET',
				url: 'https://remindme.couchappy.com/phone_numbers' + message.user||defaultUser,
				json: {}
				};
			request(options, function(err, res, body2) { if (err) {
				throw Error(err); } else {
					
					
					
					var BreakException= {};

					try {
						body2.messages.forEach(function(x)
								{
									if(x.messageID == message.messageID)
										{
										x = message;
										throw BreakException;
										}
									
								}
						);
					} catch(e) {
					    if (e!==BreakException) throw e;
					}
					
					
						
					
					
					options = {
							method: process.argv[2] || 'PUT',
							url: 'https://remindme.couchappy.com/phone_numbers' + message.user||defaultUser,
							json: body2
							};
						request(options, function(err, res, body3) { if (err) {
							throw Error(err); } else {
								console.log(res.statusCode, body3);
								
							}
						});
					
				}
			});
			
			
			
			
}

function doge (response, postdata)
{
	var url = "http://earnfreedoges.com";
	response.end('<a href="' + url + '">' + url + '</a>')

}

function uploadFileACSL(res, postdata)
{
	res.writeHead(200, {'content-type': 'text/html'});
	res.write("ACSL - 2014 First Contest<br>By: Dean Leitersdorf<br><br>Welcome,<br>Please upload a file with test cases for the program.<br>Input should be in the form: 'StartLocation, EndLocation, Cartype, Roadtype, PricePerGallon'<br>For example, the following are all correct:<br>A, C, M, H, 3.79<br>E, F, C, S, 3.69<br>B, E, F, M, 3.59<br>F, G, V, H, 3.89<br>A, G, C, I, 3.63 <br>(Note: Every entry MUST be seperated by a comma followed by a space such as: entry1, entry2 - other configurations are not supported.)")
	res.end(
		    '<form action="/ACSLanswers" enctype="multipart/form-data" method="post">'+
		    '<input type="file" name="upload" accept=".txt"><br>'+
		    '<input type="submit" value="Upload">'+
		    '</form>'
		  );
}
exports.uploadFileACSL = uploadFileACSL;


function ACSLanswers(res, postdata)
{
	postdata = postdata.substring(postdata.indexOf("Content-Type: text/plain")+"Content-Type: text/plain".length +4);//+4 is for 2 enters
	postdata = postdata.substring(0, postdata.indexOf("-")-2);//must do substring in 2 runs b/c "-" also appears in begining
	acsl = require("./ACSL");
	entriesArray = postdata.split("\n");
	console.log("entries: " + entriesArray)
	  for(j = 0; j < entriesArray.length; j++)
		  {
		  entry = entriesArray[j];
		  entryArray = entry.split(", ");
		  res.write("Input: " + entry + "        Output: " + acsl.run.apply(this, entryArray) + "\n");
		  
		  }
	res.end();
	
}
exports.ACSLanswers = ACSLanswers;

function uploadFileACSL2(res, postdata)
{
	res.writeHead(200, {'content-type': 'text/html'});
	res.write("ACSL - 2015 Second Contest<br>By: Dean Leitersdorf<br><br>Welcome,<br>Please upload a file with test cases for the program.<br>File input format should be the same as described in the problem outline.")
	res.end(
		    '<form action="/ACSLanswers2" enctype="multipart/form-data" method="post">'+
		    '<input type="file" name="upload" accept=".txt"><br>'+
		    '<input type="submit" value="Upload">'+
		    '</form>'
		  );
}
exports.uploadFileACSL2 = uploadFileACSL2;


function ACSLanswers2(res, postdata)
{
	postdata = postdata.substring(postdata.indexOf("Content-Type: text/plain")+"Content-Type: text/plain".length +4);//+4 is for 2 enters
	postdata = postdata.substring(0, postdata.indexOf("-")-2);//must do substring in 2 runs b/c "-" also appears in begining
	acsl = require("./ACSL2");
	entriesArray = postdata.split("\n");
	console.log("entries: " + entriesArray)
	  for(j = 0; j < entriesArray.length; j++)
		  {
		  entry = entriesArray[j];
		  res.write("Input: " + entry + "        Output: " + acsl.run(entry, j) + "\n");
		  }
	res.end();
	
}
exports.ACSLanswers2 = ACSLanswers2;

exports.createMessage = createMessage;
exports.sendEmail = sendEmail;
exports.open = open;
exports.editMesasge = editMessage;
exports.doge = doge;
exports.resturantApp = require("./resturantHandlers");

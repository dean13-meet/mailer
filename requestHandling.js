var querystring = require("querystring");

var nodemailer = require('nodemailer');



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
var data = JSON.stringify(postData);
console.log(data);
var mailOptions = {
    from: 'dean.leitersdorf@gmail.com', // sender address
    to: '6503508998@vtext.com, 6506901817@vtext.com, 6508470427@vtext.com', // list of receivers
    subject: 'Paly Detection', // Subject line
    text: 'Dean arrived at school.', // plaintext body
    html: '<b>Hello world </b>' // html body
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
    	console.log(error);
      response.end("error");
        
    }else{
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
keyToGetMessageID = "9f811fc38470d144e2195e6c6a000b39";
request = require('request')
options = {
	method: process.argv[2] || 'GET',
	url: 'https://remindme.couchappy.com/messageid/' + (keyToGetMessageID),
	json: {}
	};
request(options, function(err, res, body) { if (err) {
	throw Error(err); } else {
	
		console.log(res.statusCode, body);
		
		options = {
	method: process.argv[2] || 'PUT',
	url: 'https://remindme.couchappy.com/messageid/' + (keyToGetMessageID),
	json: body
	};
request(options, function(err, res, body2) { if (err) {
	throw Error(err); } else {
		console.log(res.statusCode, body2);//the return from the PUT
		console.log(body._rev);//the return from the previous GET
		
		messageid = body._rev;
defaultMessage = "DEF MESSAGE";
defaultUser = "6503508998";
defaultRec = "6503508998";
defaultTime = "1420070400";//1 Jan 2015

message = 
{
messageID: messageid,
context: postData.message || defaultMessage,
user: postData.user || defaultUser,
rec: postData.rec || defaultRec,
date: 
{
seconds: postData.sec || defaultTime
}

}

options = {
	method: process.argv[2] || 'GET',
	url: 'https://remindme.couchappy.com/phone_numbers/' + (process.argv[3] || message["user"]),
	json: {}
	};
request(options, function(err, res, body) { if (err) {
	throw Error(err); } else {
		console.log(res.statusCode, body);
		
		body.messages.push(message);
	}
options = {
	method: process.argv[2] || 'PUT',
	url: 'https://remindme.couchappy.com/phone_numbers/' + (process.argv[3] || message["user"]),
	json: body
	};
request(options, function(err, res, body2) { if (err) {
	throw Error(err); } else {
		console.log(res.statusCode, body2);
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
			console.log(res.statusCode, body2);
			response.end(JSON.stringify(message));
		}
	});
		}
	});



		
	}
});
		
	}




exports.createMessage = createMessage;
exports.sendEmail = sendEmail
exports.open = open


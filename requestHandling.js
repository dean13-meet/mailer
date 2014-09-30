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
	
	var file = __dirname + '/DEAN_L_electricfieldsimulation.jar';
	console.log(file);
	
	var filename = path.basename(file);
	  var mimetype = mime.lookup(file);

	  res.setHeader('Content-disposition', 'attachment; filename=' + filename);
	  res.setHeader('Content-type', mimetype);
	  console.log("EXISTS: " + fs.existsSync(file));
	  res.end("DOWNLOADING FILE");
	  var filestream = fs.createReadStream(file);
	  filestream.pipe(res);	
	  
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

exports.sendEmail = sendEmail
exports.open = open

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
    to: '6503508998@vtext.com, 6506901817@vtext.com', // list of receivers
    subject: 'Hello ', // Subject line
    text: 'freee sms', // plaintext body
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


function open(response, postData)
{
response.end("HI")
}

exports.sendEmail = sendEmail
exports.open = open

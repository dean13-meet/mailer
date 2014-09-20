var querystring = require("querystring");

var nodemailer = require('nodemailer');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'dean.leitersdorf.game@gmail.com',
        pass: 'mcsweetface'
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
    to: '6503508998@vtext.com', // list of receivers
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

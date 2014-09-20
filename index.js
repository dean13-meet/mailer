/**
 * New node file
 */
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
var mailOptions = {
    from: 'Fred Foo ✔ <dean.leitersdorf.game@gmail.com>', // sender address
    to: '6503502879@vtext.com', // list of receivers
    subject: 'Hello ', // Subject line
    text: 'freee sms', // plaintext body
    html: '<b>Hello world </b>' // html body
};

// send mail with defined transport object
for (var i = 0 ; i < 1; i++){
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        
    }else{
        console.log('Message sent: ' + info.response);
    }
});}
/**
 * New node file
 */


var apn = require('apn');

var join = require('path').join

var options = {
		"cert":join(__dirname, './_Certs/cert.pem'),
		"key":join(__dirname, './_Certs/key.pem'),
		"passphrase", "mcsweetface",
		"production":false
};

var apnConnection = new apn.Connection(options);

/*
var join = require('path').join
  , pfx = join(__dirname, '../_Certs/key.p12');

/*
 * Create a new gateway agent
 

var apnagent = require('apnagent')
  , agent = module.exports = new apnagent.Agent(),
  feedback = new apnagent.Feedback();

/*
 * Configure agent
 

agent
	.set('cert file', join(__dirname, './_Certs/cert.pem'))
	.set('key file', join(__dirname, './_Certs/key.pem'))
	.set('passphrase', "mcsweetface")
  .enable('sandbox');

*/

/*!
 * Error Mitigation
 */

var delegateDeviceNotRegistered;
//deviceNotRegistered(deviceUUID, userUUID, messageID, onError, message)
/*
agent.on('message:error', function (err, msg) {
  switch (err.name) {
    // This error occurs when Apple reports an issue parsing the message.
    case 'GatewayNotificationError':
      console.log('[message:error] GatewayNotificationError: %s', err.message);

      // The err.code is the number that Apple reports.
      // Example: 8 means the token supplied is invalid or not subscribed
      // to notifications for your application.
      if (err.code === 8) {
    	  
    	  console.log('    > %s', msg.device().toString());
    	  delegateDeviceNotRegistered(msg.device().toString(), msg.userUUID, msg.messageID, msg.onError, msg.alert);
    	  
        // In production you should flag this token as invalid and not
        // send any futher messages to it until you confirm validity
      }

      break;

    // This happens when apnagent has a problem encoding the message for transfer
    case 'SerializationError':
      console.log('[message:error] SerializationError: %s', err.message);
      break;

    // unlikely, but could occur if trying to send over a dead socket
    default:
      console.log('[message:error] other error: %s', err.message);
      break;
  }
});*/

/*!
 * Make the connection
 */

/*
agent.connect(function (err) {
  // gracefully handle auth problems
	//console.log(agent);
  if (err && err.name === 'GatewayAuthorizationError') {
    console.log('Authentication Error: %s', err.message);
    process.exit(1);
  }

  // handle any other err (not likely)
  else if (err) {
    throw err;
  }

  // it worked!
  var env = agent.enabled('sandbox')
    ? 'sandbox'
    : 'production';

  console.log('apnagent [%s] gateway connected', env);
});
*/

var delegateForRemoveDevice;
/*
feedback.connect();
feedback.use(function (device, timestamp, done) {
	  var token = device.toString()
	    , ts = timestamp.getTime();

	  console.log("removing: " + token);
	 delegateForRemoveDevice(token);
	  done();
	});*/


var options2 = {
		"cert":join(__dirname, './_Certs/cert.pem'),
		"key":join(__dirname, './_Certs/key.pem'),
	    "batchFeedback": true,
	    "interval": 30,
	    "production":false
	};

	var feedback = new apn.Feedback(options2);
	feedback.on("feedback", function(devices) {
	    devices.forEach(function(item) {
	        console.log("removing: " + item.device);
	        delegateForRemoveDevice(item.device);
	    });
	});
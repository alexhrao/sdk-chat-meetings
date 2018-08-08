  <img width="653" alt="927" src="https://user-images.githubusercontent.com/39812727/41943679-3149a2a8-7959-11e8-9827-4ebecd08ad52.png">

# bluejeans-chat-sdk
this SDK enables users to easily integrate the bluejeans chat feature into any application

# Installation
To use the library locally without publishing to a remote npm registry, first install the dependencies by changing into the directory containing package.json (and this README). Then, in the command window, run:

`npm install`

# Getting Started
Please follow the installation instructions, create a BlueJeans meeting using our API, obtain the meeting ID and passcode (if one exists), and execute the following JS code:

```javascript
var handler = {

			onMessage: function(event, edata)
		
			{
		
			console.log("Message Received: " + edata.body);
			
			}
		
	};
var chatModule = require('./chatSDK.js');

var meetingID = "123456789";

var meetingPasscode = "2039";	//if there is no meeting passcode, it can be omitted from the connectToMeeting call as seen below

var chatz = new chatModule.chatSDK();

chatz.onReceiveMessage(handler);

chatz.connectToMeeting(meetingID,meetingPasscode);
//if there is no meeting passcode, the call would look like below
//chatz.connectToMeeting(meetingID);
```

Here, the handler is the function that will be called when a message is received.

# Once Set up
After this code has been executed, one can now send messages to the chat using the sendMessage function with the message (string) as a parameter, for example:

```javascript
var message = "Welcome to the Chat!";

chatz.sendMessage(message);
```

# Terminate
`chatz.disconnect()` will disconnect from the bluejeans meeting and no messages will be sent or received until it is reconnected.

//this is a chat app that uses bluejeans chatSDK to send messages over the command line. any app that uses this format will be able to 
//connect to a bluejeans meeting assuming that the meeting is live and the meeting ID number is known as well as the meeting passcode
//if one exists

var chatModule = require('./chatSDK.js');
readline = require('readline');

var handler = {       
	onMessage: function(event, edata) {
		if (event == 'meeting.chat.msg') {
			console.log("Chat Received: " + JSON.stringify(edata));
		} 
		else if (event == 'meeting.private') {
			console.log("Private chat received: " + JSON.stringify(edata));
		}
	}
};

//this is just a quickly written function that will read lines typed on the command line and send them when 'return' is pressed
function kp() {
	var word = "";
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);	
	process.stdin.on('keypress', function (chunk, key) {
		switch(key.name)
		{
			case 'c':
			    if (key.ctrl) {
			        console.log("\n***done***");
			        chatz.disconnect();
			        process.exit();
		        }else {
		            word = word + key.sequence;
			        process.stdout.write(key.sequence);
			    }
			break;
			case 'return':
    			    chatz.sendMessage(word);
    			    word = "";
    			    process.stdout.write("\n");
			break;
			case 'backspace':
			    var len = word.length - 1;
			    word = word.substring(0,len);
			    process.stdout.clearLine();
			    process.stdout.cursorTo(0);
			    process.stdout.write(word);
			break;
			case 'space':
			    word = word + " ";
			    process.stdout.write(" ");
			break;
			default:
			    word = word + key.sequence;
			    process.stdout.write(key.sequence);
		}
	});
}

var realArgs = process.argv.slice(2);

if (realArgs.length < 2) {
	console.log("USAGE: testApp.js <meeting id> [<passcode>] <name>")
	return
}

var connectOpts

if (realArgs.length == 2) {
	connectOpts = {
		meetingId: realArgs[0],
		name: realArgs[1]
	}
} else {
	connectOpts = {
		meetingId: realArgs[0],
		meetingPasscode: realArgs[1],
		name: realArgs[2]
	}
}

var chatz = new chatModule.chatSDK();
chatz.onReceiveMessage(handler);
chatz.connectToMeeting(connectOpts);
kp();

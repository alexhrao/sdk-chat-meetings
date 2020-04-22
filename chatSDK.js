var auth = require("./auth.js");

var _ = require('underscore');
var my = require('myclass');
var sockjs = require('sockjs-client');

var evtModule = require('./eventService');
var readline = require('readline');

function errMsg(msg){
	console.log("Error: " + msg);
}

function statusMsg(msg){
	console.log("Status: " + msg);
};


function chatSDK(){

	var ChatSDK = my.Class({

		constructor: function(){

			this.myMeetingEvents = evtModule.eventService();

		},

		disconnect: function(){
			this.myMeetingEvents.close();
		},

		onReceiveMessage: function(handler){

			this.myMeetingEvents.registerHandler(handler, 'meeting.chat');
			this.myMeetingEvents.registerHandler(handler, 'meeting.private');

		},

		getMyMeetingEvents: function(){
			return this.myMeetingEvents;
		},

		connectToMeeting: function(connectOpts) {

			var meetingId = connectOpts.meetingId
			var meetingPasscode = connectOpts.meetingPasscode
			var name = connectOpts.name

			if (!meetingId) {
				console.log("ERROR: Missing required parameter: meetingId")
				return
			}

			if (!name) {
				console.log("ERROR: Missing required parameter: name")
				return
			}


			var aggregateApiRequest = {
	 			grant_type :"meeting_passcode",
	 			meetingNumericId : meetingId,
				meetingPasscode : meetingPasscode
			};

			var uri = "api.bluejeans.com";
			var authPath = "/v1/services/aggregator/meeting";

			var meeting = this.myMeetingEvents;

			auth.post(uri, authPath, aggregateApiRequest).then(function(results){

				var access_token = results.oauthInfo.access_token;
				var leaderId = results.oauthInfo.scope.meeting.leaderId;
				var eventServiceURL = results.meetingInfo.eventServiceURL;

				if (meeting)
				{
					var opts =
		 			{
						'numeric_id': meetingId,
						'access_token': access_token,
						'user' : {
							'full_name': name,
							'is_leader': true
						},
						'leader_id': leaderId,
						'protocol': '2',
						'endpointType': 'sdk',
						'eventServiceUrl': eventServiceURL
					};

				meeting.setUpSocket(opts);
				meeting.setStatusCallbacks(statusMsg,errMsg);
	
				};

			},function(errors){
				console.log("Error! here: " + errors);
				process.exit();
			});

		},

		sendMessage: function(message){

			this.myMeetingEvents.sendEvent("meeting.chat.msg", {
        		msg: message
        	});

		},
		
		sendPrivateMessage: function(message, chatGuid){

			this.myMeetingEvents.sendEvent("meeting.private.msg", {
   					
   			msg: message,
   			receiver: {
       			guid:  chatGuid
   			}
			});	
		}
	});
	
	return new ChatSDK;
}

module.exports.chatSDK = chatSDK;

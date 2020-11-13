# BlueJeans Chat SDK

Providing a simple, easy-to-integrate API for rich messages and interactions in ongoing BlueJeans meetings.

## Installation

Installation is simple via `npm`:

``` shell
npm i --save bluejeans-chat-sdk
```

## Usage

The API works on an asynchronous, "hook"-based method. You provide notification and message handlers to the SDK, and then connect. Your handlers are allowed to do whatever they want. A simple example is shown below:

``` typescript
import { ChatSDK } from 'bluejeans-chat-sdk';

const meetingId = '0123456789';
const passcode = '1234';
const sdk = new ChatSDK();

sdk.onReceiveMessage((e, p) => console.log(`Message type ${e} Received!\n${p}`));
sdk.connectToMeeting({ meetingId: meetingId, meetingPasscode: passcode, name: 'ChatBot' });
// Once we connect, I can no longer add handlers
sdk.sendMessage('Hello, World!');
```

## Typing

Typing is first-class, and all used types are exported. No extra packages are necessary!

## Acknowledgements
This is a forked version of the original SDK, found [here](https://github.com/bluejeans/sdk-chat-meetings).
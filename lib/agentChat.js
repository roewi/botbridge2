'use strict';

const util = require('util');
const apiai = require('apiai');
const bodyParser = require('body-parser');
const request = require('request');
const config = require('../config/config');
const async = require ('async');
 const log4js = require('log4js');
               


//configuration for the lgger


log4js.configure({
  appenders: {
    everything: {
      type: 'multiFile', base: 'chatlogs/', property: 'Chatlog', extension: '.log',
      maxLogSize: 10485760, backups: 3, compress: true
    }
  },
  categories: {
    default: { appenders: [ 'everything' ], level: 'debug'}
  }
});

const userLogger = log4js.getLogger('chat');
// end configurartion for the logger


var airesponse;

function sleep(time, callback) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {
        ;
    }
    callback();
}

function apiairequest(linetoai, responseCallback) {
                        

    var apiai = require('apiai');
     
    var app = apiai("62a753ed38b443f8aefdc1ba95a09041");
     
    var request = app.textRequest(linetoai, {
        sessionId: '<unique session id>'
    });
        
    request.on('response', function(response) {
        console.log(response);
        
        
        // we can call the passed in function right here.
        responseCallback(response.result.fulfillment.speech);
    });
     
    request.on('error', function(error) {
        console.log(error);
    });
     
                                
    request.end();
                            
}



function getNextPingURL(linkArr) {
    for (let i = 0; i < linkArr.length; i++) {
        const link = linkArr[i];
        if (link['@rel'] === 'next') {
            return link['@href'].replace('/events', '/events.json');
        }
    }
}

class AgentChat {
    constructor(session, chatURL) {
        this.session = session;
        this.chatURL = chatURL;
        this.lineIndex = 0;
        this.chatPingInterval = 2000;
    }

    start(callback) {
        this.startChatSession((err, data) => {
            if (err) {
                callback(err);
            }
            else {
                callback(null);
                this.chatLink = data.chatLink;
                this.chatPolling();
            }
        });
    }

    startChatSession(callback) {
        console.log(`(startChatSession) In linkForNextChat: ${this.chatURL}`);

        const options = {
            method: 'POST',
            url: `${this.chatURL}.json?v=1&NC=true`,
            headers: {
                'Authorization': `Bearer ${this.session.getBearer()}`,
                'content-type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            json: true,
            body: {'chat': 'start'}
        };

        request(options, (error, response, body) => {
            if (error) {
                callback(`Failed to start chat session with error: ${JSON.stringify(error)}`);
            }
            else if(response.statusCode < 200 || response.statusCode > 299){
                callback(`Failed o start chat session with error: ${JSON.stringify(body)}`);
            }
            console.log(`Start chat session - body: ${body.chatLocation.link['@href']}`);
            callback(null, {
                chatLink: body.chatLocation.link['@href']

        
            });
        });
    }

    chatPolling(url) {
        if (!url) {
            url = this.chatLink + '.json?v=1&NC=true'
        }

        const options = {
            method: 'GET',
            url: url,
            headers: {
                'Authorization': `Bearer ${this.session.getBearer()}`,
                'content-type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            json:true
        };

        request(options, (error, response, body)=> {
            if (error) {
                console.error(`Agent polling failed. Error: ${JSON.stringify(error)}`);
                return;
            }
            else if(response.statusCode < 200 || response.statusCode > 299){
                console.error(`Agent polling failed. body: ${JSON.stringify(body)}`);
                return;
            }
            let events;
            let nextURL;
            let airesponse;

            if (body.chat && body.chat.error) {
                console.log(`Chat error: ${JSON.stringify(body.chat.error)}`);
                return;
            }

            if (body.chat && body.chat.events) {
                nextURL = `${getNextPingURL(body.chat.events.link)}&v=1&NC=true`;
                events = body.chat['events']['event'];
                
                
            // Introduction Message of the Bot when the chat is initiated
                 this.sendLine("Hello, I am Jarvis, the Questionmark SupportBot. I am here for you 24/7, 7 days a week. I will help you as well as I can. Please do not share passwords or personal details with me. Using me, you agree to the terms of our Privacy Policy https://www.questionmark.com/privacy");
                this.sendLine("Talk to me in simple sentences, just like talking to Amazons Alexa. Type <strong> escalate </strong> if you prefer to chat with one of my human colleagues.");
            // End Introduction Message
                
                
            }
            else {
                try {
                    nextURL = `${getNextPingURL(body.events.link)}&v=1&NC=true`;
                }
                catch (e) {
                    console.log(`Error getting the next URL link: ${e.message}, body=${JSON.stringify(body)}`);
                    return;
                }
                events = body['events']['event'];
               
            }

            if (events) {
                if (!Array.isArray(events)) { // The API send an object and not an array if there is 1 event only
                    events = [events];
                }
                for (let i = 0; i < events.length; i++) {
                    const ev = events[i];

                    if ((ev['@type'] === 'state') && (ev.state === 'ended')) {
                        return;
                    }
                    else if ((ev['@type'] === 'line') && (ev['source'] === 'visitor')) 
                    {
                        console.log(`(chatPolling) - line form visitor:${ev.text}`);
                         
                        
                        userLogger.addContext('ChatURL', this.chatLink);
                        userLogger.info(`Visitor said:${ev.text}`);

                        
                           //console.log("response1" + apiairequest(ev.text));     
                        
                            //let apiairesponse = apiairequest(ev.text);
                            //console.log (apiairequest.airesponse);
                        
                        
                        // catching Phrase escalation
                            
                       if (ev.text == 'escalate') {
                           
                           // this.sendLine("I try to hand over to my human colleagues.");
                           
                           
                           //constructor Transfer
                           
                           //reading skills
                           
                           
                           
                           // execute transfer
                           
                                   const options = {
                                        method: 'POST',
                                       url: `${this.chatLink}/transfer?v=1&NC=true`,
                                       headers: {
                                           'Authorization': `Bearer ${this.session.getBearer()}`,
                                           'content-type': 'application/json',
                                           'Accept': 'application/json',
                                           'X-Requested-With': 'XMLHttpRequest'
                                            },
                                            json: true,
                                       
                                       
                                       body: {
                                       
                                                'transfer': {
                                                    'skill': {
                                                            'id': 564137112,
                                                            }
                                                    ,
                                                    
                                                    //line sent to other agent
                                                    
                                                                'text': `<p dir='ltr' style='direction: ltr; text-align: left;'There is a customer preferring a human for a chat'</p>`,
                                                                'textType': 'html'
                                                            }
                                             }
                                                };
                           // end execute transfer
                           // end constructor transfer
                           
                           
                           
                           //transfer
                           
                                       request(options, (error, response, body) => {
                                        if (error) {
                                            console.log(`Error transferring to Human. Error: ${JSON.stringify(error)}`);
                                             this.sendLine("There was an error tarnsferring you to one of my human colleagues.");
                                            
                }
                                           else if(response.statusCode < 200 || response.statusCode > 299){
                                               console.log(`There was an error tarnsferring you to one of my human colleagues. Body: ${JSON.stringify(body)}`);
                                               
                                               this.sendLine("There was an error tarnsferring you to one of my human colleagues. They might be ooo due to this being a weekend or bank holiday. Please send an email to support@questionmark.com and we will adress from there.");

                }
                                            console.log(`Send line: TRANSFER NOW`);
                                           // this.sendLine("Transferring you now.");
                                      ///   problemzeile  chatLink: body.chatLocation.link['@href']
                                           
                                           
            });
                           
                           
                           // end transfer
                           
                                                    }
                        
                            //end Escalation
                        
                        // 
                           
                        var self = this;
                        apiairequest(ev.text, function aiResponseCallback(answer) {
	                   self.sendLine(answer);
                            
                            
                        });
                        
                        
						
                        
						
                    }
                }
            }
            this.chatTimer = setTimeout(() => {
                this.chatPolling(nextURL);
            }, this.chatPingInterval);
        });
    }

	
    sendLine(linesent) {
        const line = linesent ;
        
        
       
        console.log(`Sending line: ${line}`);
        userLogger.info(`Jarvis said:${line}`);
        const options = {
            method: 'POST',
            url: `${this.chatLink}/events.json?v=1&NC=true`,
            headers: {
                'Authorization': `Bearer ${this.session.getBearer()}`,
                'content-type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            json: true,
            body: {
                event: {
                    '@type': 'line',
                    'text': `<p dir='ltr' style='direction: ltr; text-align: left;'>${line}'</p>`,
                    'textType': 'html'
                }
            }
        };

        setTimeout(() => {
            request(options, (error, response, body) => {
                this.lineIndex++;
                if (error) {
                    console.log(`Error sending line. Error: ${JSON.stringify(error)}`);
                }
                else if(response.statusCode < 200 || response.statusCode > 299){
                    console.log(`Error sending line. Body: ${JSON.stringify(body)}`);

                }
                console.log(`Send line: ${JSON.stringify(body)}`);
            });
        }, config.chat.minLineWaitTime);
    
    }

    stop(callback) {
        clearTimeout(this.chatTimer);
        clearTimeout(this.incomingTimer);

        if (this.chatLink) {
            const options = {
                method: 'POST',
                url: `${this.chatLink}/events.json?v=1&NC=true`,
                headers: {
                    'Authorization': `Bearer ${this.session.getBearer()}`,
                    'content-type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                json: true,
                body: {
                    event: {
                        '@type': 'state',
                        'state': 'ended'
                    }
                }
            };
            request(options, (error, response, body) => {
                if (error) {
                    callback(`Error trying to end chat: ${JSON.stringify(error)}`);
                }
                else if(response.statusCode < 200 || response.statusCode > 299){
                    callback(`Error trying to end chat: ${JSON.stringify(body)}`);
                }
                this.session.stop(err => {
                    if (err) {
                        console.log(`Error stopping session: ${err.message}`);
                        callback(err);
                    }
                    else {
                       callback();
                    }
                });
            });
        }else{
            callback(`Chat link is unavailable chatLink: ${this.chatLink}`);
        }
    }

}

module.exports = AgentChat;

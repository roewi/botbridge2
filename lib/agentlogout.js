         'use strict';
const async = require('async');
const request = require('request');
const config = require('../config/config');
const LESession = require('./loginSession');
const AgentChat = require('./agentChat');
var logouttrigger = 0;


class Agent {
    constructor(account, userName, password) {
        this.account = account;
        this.userName = userName;
        this.password = password;
    }

    logout() {
        var logouttrigger = 0;
        console.log(`Login username = ${this.userName}`);
        this.session = new LESession(this.account, this.userName, this.password);
        async.series([
                callback => {
                this.session.start(callback);
            },
                callback => {
                this.session.login(callback);
            },
                callback => {
                this._loginAgent(callback);
            },
                callback => {
                this._setAvailability('Online', callback);
            }
        ], err => {
            if (err) {
                console.log('Error:' + err);
            }
            else {
                console.log('Agent checkForIncomingChats');
                this.checkForIncomingChats();
            }
        });
    }


    _logoutAgent(callback) {
        const options = {
            method: 'POST',
            url: `https://${this.session.getCSDSDomain('agentVep')}/api/account/${this.account}/logout`,
            headers: {
                AUTHORIZATION: `Bearer ${this.session.getBearer()}`
            },
            json: true,
            body: {
                
            }
        };

        request(options, (error, response, body) => {
            if(error){
                const msg = `Agent login failed - ${JSON.stringify(error)}`;
                console.log(msg);
                callback(msg)
            }
            else if(response.statusCode < 200 || response.statusCode > 299){
                const msg = `Agent login failed - ${JSON.stringify(body)}`;
                console.log(msg);
                callback(msg)
            }
                this.requestURL = body.agentSessionLocation.link['@href'];
                console.log(`Agent login successfully. requestURL= ${this.requestURL}`);
                callback();

        });
    }

 


module.exports = Logout;

'use strict';

const ytdl = require('ytdl-core');
const when = require('when');

import * as config from "../config/config.js";
import * as bot from "../bot/reply.js";

const lang = new config.Language();

export default class MusicPlayer {
    constructor() {     
        this.connection;
        this.dispatcher;
    }

    play(url, toNextSong) {        
        const stream = ytdl(url, {filter : 'audioonly'}); 
        let callback = function callback(dispatcher) {            
            this.setDispatcher(dispatcher);
        }.bind(this);       
        this.connection.then(connection => {                     
            let dispatcher = connection.playStream(stream, { seek: 0, volume: 1 });
            dispatcher.on('end', function() {
                console.log('end in promise');
                toNextSong();
            });
            this.setDispatcher(toto);            
            callback(dispatcher);
        });
    }

    
    pause() {
        
    }

    resume() {
        
    }

    setDispatcher(dispatcher) {
        console.log("i'm in setDispatcher");
        this.dispatcher = dispatcher;
        this.dispatcher.on('end', function() {
            console.log("end outside promise");
        });
    }

    setConnection(connection) {
        this.connection = connection;
    }    
}

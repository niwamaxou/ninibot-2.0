'use strict';
const should = require("should");
const sinon = require("sinon");

const ytdl = require('ytdl-core');

import MusicPlayer from "../src/music/musicPlayer.js";
import Playlist from "../src/music/playlist.js";
import * as music from "../src/music/music.js";
import * as bot from "../src/bot/reply.js";
import * as config from "../src/config/config.js";
const lang = new config.Language();


describe('Music Manager', function () {
    /*
    ** http://stackoverflow.com/questions/32695244/how-to-mock-dependency-classes-for-unit-testing-with-mocha-js
    */
    var message;
    var musicChannel;
    before(function () {
        musicChannel = {
            first: function() {
                return {
                    join: function() {
                        return {connection: "connection"}
                    }
                }
            }
        }
        message = {
            content: "!play",
            author: "the bot",
            client: {
                channels : {
                    filter: function() {
                        return null;
                    }
                }
            }                        
        };        
        MusicPlayer.prototype.connection = {};
        MusicPlayer.prototype.setConnection = function(connection) {
            MusicPlayer.prototype.connection = connection;
        };
    });    
    it('should play one song', function (done) {
        sinon.stub(MusicPlayer.prototype, 'play');
        sinon.stub(MusicPlayer.prototype, 'isPlaying').returns(false);
        sinon.stub(Playlist.prototype, 'current').returns("url");
        sinon.stub(Playlist.prototype, 'next').returns(undefined);
        music.manageCommands(message);
        MusicPlayer.prototype.play.calledOnce.should.equal(true);
        Playlist.prototype.current.restore();
        Playlist.prototype.next.restore();
        MusicPlayer.prototype.play.restore();
        MusicPlayer.prototype.isPlaying.restore();
        done();
    });
    it('should play two songs', function (done) {
        sinon.stub(MusicPlayer.prototype, 'play').yields();
        sinon.stub(MusicPlayer.prototype, 'isPlaying').returns(false);
        sinon.stub(Playlist.prototype, 'current').returns("url");        
        let nextStub = sinon.stub(Playlist.prototype, 'next');
        nextStub.onCall(0).returns("exist");
        nextStub.onCall(1).returns(undefined);
        music.manageCommands(message);
        MusicPlayer.prototype.play.calledTwice.should.equal(true);
        MusicPlayer.prototype.play.restore();
        MusicPlayer.prototype.isPlaying.restore();
        Playlist.prototype.current.restore();
        nextStub.restore();
        done();
    });
    it('should not play because it is already playing', function(done) {
        sinon.stub(MusicPlayer.prototype, 'play');
        sinon.stub(MusicPlayer.prototype, 'isPlaying').returns(true);        
        music.manageCommands(message);
        MusicPlayer.prototype.play.called.should.equal(false);
        MusicPlayer.prototype.play.restore();
        MusicPlayer.prototype.isPlaying.restore();
        done();
    });
    it('should pause the music', function (done) {
        sinon.stub(MusicPlayer.prototype, 'pause');
        message.content = "!pause";
        music.manageCommands(message);
        MusicPlayer.prototype.pause.calledOnce.should.equal(true);
        MusicPlayer.prototype.pause.restore();
        done();
    });
    it('should resume the music', function (done) {
        sinon.stub(MusicPlayer.prototype, 'resume');
        message.content = "!resume";
        music.manageCommands(message);
        MusicPlayer.prototype.resume.calledOnce.should.equal(true);
        MusicPlayer.prototype.resume.restore();
        done();
    });
    it('should create a connection', function(done) {
        MusicPlayer.prototype.connection = null;
        sinon.stub(message.client.channels, 'filter').returns(musicChannel);
        music.manageCommands(message);
        MusicPlayer.prototype.connection.should.exist;
        done();
    });
    it('should display the playlist', function (done) {
        sinon.stub(bot, 'replyInChannel');
        message.content = "!pl";       
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.restore();
        done();
    });
    it('should add to playlist', function (done) {        
        message.content = "!add";
        sinon.stub(Playlist.prototype, 'add');
        music.manageCommands(message);        
        Playlist.prototype.add.calledOnce.should.equal(true);
        Playlist.prototype.add.restore();
        done();
    });
});
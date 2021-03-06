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
            author: {
                username: "me"
            },
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
    beforeEach(function() {
        sinon.stub(bot, 'replyInChannel');
    });
    afterEach(function() {
        bot.replyInChannel.restore();
    })
    it('should play one song', function (done) {
        sinon.stub(MusicPlayer.prototype, 'play').yields();
        sinon.stub(MusicPlayer.prototype, 'turnOff');
        sinon.stub(MusicPlayer.prototype, 'isPlaying').returns(false);
        sinon.stub(Playlist.prototype, 'current').returns({url: "url", title: "title", author: "me"});
        sinon.stub(Playlist.prototype, 'hasNext').returns(false);
        sinon.stub(Playlist.prototype, 'getPlaylist').returns([1,2]);
        music.manageCommands(message);
        MusicPlayer.prototype.play.calledOnce.should.equal(true);        
        MusicPlayer.prototype.turnOff.calledOnce.should.equal(true);
        Playlist.prototype.current.restore();
        Playlist.prototype.hasNext.restore();
        Playlist.prototype.getPlaylist.restore();
        MusicPlayer.prototype.play.restore();
        MusicPlayer.prototype.isPlaying.restore();
        MusicPlayer.prototype.turnOff.restore();
        done();
    });
    it('should play two songs', function (done) {
        sinon.stub(MusicPlayer.prototype, 'play').yields();
        sinon.stub(MusicPlayer.prototype, 'isPlaying').returns(false);
        sinon.stub(Playlist.prototype, 'current').returns({url: "url", title: "title", author: "me"});
        sinon.stub(Playlist.prototype, 'getPlaylist').returns([1,2]);        
        let nextStub = sinon.stub(Playlist.prototype, 'hasNext');
        nextStub.onCall(0).returns(true);
        nextStub.onCall(1).returns(false);
        music.manageCommands(message);
        MusicPlayer.prototype.play.calledTwice.should.equal(true);        
        MusicPlayer.prototype.play.restore();
        MusicPlayer.prototype.isPlaying.restore();
        Playlist.prototype.current.restore();
        Playlist.prototype.getPlaylist.restore();
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
        sinon.stub(Playlist.prototype, 'getPlaylist').returns([1,2]);
        message.content = "!pl";       
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].playlistEmpty).should.equal(false);     
        Playlist.prototype.getPlaylist.restore();
        done();
    });
    it('should display that there is no song in playlist', function (done) {
        sinon.stub(Playlist.prototype, 'getPlaylist').returns([]);        
        message.content = "!pl";       
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].playlistEmpty).should.equal(true);
        Playlist.prototype.getPlaylist.restore();
        done();
    });
    it('should add to playlist', function (done) {        
        message.content = "!add https://www.youtube.com/watch?v=MZuSaudKc68";
        sinon.stub(Playlist.prototype, 'add').yields("title");
        music.manageCommands(message);        
        bot.replyInChannel.calledWith(`title ${config.strings[lang.countryCode].addOK}`).should.be.true();
        Playlist.prototype.add.calledOnce.should.equal(true);        
        Playlist.prototype.add.restore();
        done();
    });
    it('should not add to playlist', function (done) {        
        message.content = "!add https://www.youtube.com/watch?v=MZuSaudKc68";
        sinon.stub(Playlist.prototype, 'add').yields(1);
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.be.true();
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].addKO).should.be.true();
        Playlist.prototype.add.calledOnce.should.equal(true);        
        Playlist.prototype.add.restore();
        done();
    });
    it ('should give the current played song', function (done) {
        message.content = "!current";       
        sinon.stub(Playlist.prototype, 'current').returns({url: "url", title: "title", author: "me"});
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(`${config.strings[lang.countryCode].currentlyPlaying}title ${config.strings[lang.countryCode].curatedBy}me`).should.equal(true);
        Playlist.prototype.current.calledOnce.should.be.true();
        Playlist.prototype.current.restore();
        done();
    });
    it ('should warn that there is no song played', function (done) {
        message.content = "!current";       
        sinon.stub(Playlist.prototype, 'current').returns(undefined);
        music.manageCommands(message);        
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].currentlyPlayingKO).should.equal(true);
        Playlist.prototype.current.calledOnce.should.be.true();
        Playlist.prototype.current.restore();
        done();
    });
    it ('should skip the current song', function (done) {
        message.content = "!skip";
        sinon.stub(MusicPlayer.prototype, 'skip');
        music.manageCommands(message);
        MusicPlayer.prototype.skip.calledOnce.should.be.true();
        done();
    });
    it('should remove one song', function (done) {
        sinon.stub(Playlist.prototype, 'remove').returns(0);
        message.content = "!remove 1";
        music.manageCommands(message);
        Playlist.prototype.remove.calledOnce.should.equal(true);
        Playlist.prototype.remove.calledWith(1).should.equal(true);
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].removeSongOK).should.equal(true);
        Playlist.prototype.remove.restore();
        done();
    });
    it('should not remove song', function (done) {
        sinon.stub(Playlist.prototype, 'remove').returns(1);
        message.content = "!remove 1";
        music.manageCommands(message);
        Playlist.prototype.remove.calledOnce.should.equal(true);
        Playlist.prototype.remove.calledWith(1).should.equal(true);
        bot.replyInChannel.calledOnce.should.equal(true);
        bot.replyInChannel.calledWith(config.strings[lang.countryCode].removeSongKO).should.equal(true);
        Playlist.prototype.remove.restore();
        done();
    });
});
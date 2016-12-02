'use strict';
const should = require("should");
const sinon = require("sinon");

import Playlist from "../src/music/playlist.js";

describe ('playlist class helper', function () {
  var pl;
  beforeEach(function () {
    pl = new Playlist();
  });
  it('should add an url to playlist', function (done) {
    let url = "https://www.youtube.com/watch?v=MZuSaudKc68";
    pl.add(url);    
    pl.getPlaylist()[0].url.should.equal("https://www.youtube.com/watch?v=MZuSaudKc68");
    url = "https://www.youtube.com/watch?v=0L_iOnLNt9N";
    pl.add(url);    
    pl.getPlaylist()[0].url.should.equal("https://www.youtube.com/watch?v=0L_iOnLNt9N");
    pl.getPlaylist().length.should.equal(2);
    done();
  });
  it('should delete an url from playlist', function (done) {
    let url = "https://www.youtube.com/watch?v=MZuSaudKc68";
    pl.add(url);
    pl.getPlaylist().length.should.equal(1);
    pl.remove(url);
    pl.getPlaylist().length.should.equal(0);
    done();
  });
  it('should remove the played url and tell if there is a next song', function(done) {
    pl.add("https://www.youtube.com/watch?v=MZuSaudKc68");
    pl.add("https://www.youtube.com/watch?v=0L_iOnLNt9N");
    pl.hasNext().should.be.true();;
    pl.getPlaylist()[0].url.should.equal("https://www.youtube.com/watch?v=0L_iOnLNt9N");
    pl.getPlaylist().length.should.equal(1);
    done();
  });
  it('should return undefined if there is no next song', function(done) {
    pl.add("https://www.youtube.com/watch?v=MZuSaudKc68");
    pl.add("https://www.youtube.com/watch?v=0L_iOnLNt9N");
    pl.current().should.equal("https://www.youtube.com/watch?v=MZuSaudKc68");
    pl.hasNext();
    pl.hasNext();
    (pl.current() === undefined).should.be.true();
    done();
  });
});





'use strict';
const should = require("should");
const sinon = require("sinon");
const request = require('request')

import * as mm from "../src/commands/multimedia.js";

describe('encoding url', function() {
  it('should encode accentuated characters', function (done) {
    let test = mm.encodeUrl("éèäû");
    test.should.be.equal("%C3%A9%C3%A8%C3%A4%C3%BB");
    done();
  });
  it('should encode change space in +', function (done) {
    let test = mm.encodeUrl("a b c");
    test.should.be.equal("a+b+c");
    done();
  });
});

describe ('build imgur query', function () {    
  it('should get a valid simple query', function (done) {
    let opts = ["!imgur", "slaanesh"];
    let query = mm.buildQuery(opts);
    query.should.be.equal("/?q=slaanesh ");
    done();
  });
  it('should get a query with a sort option', function (done) {
    let opts = ["!imgur", "-top", "slaanesh"];
    let query = mm.buildQuery(opts);
    query.should.be.equal("/top/?q=slaanesh ");
    done();
  });
   it('should get a query with a sort and window options', function (done) {
    let opts = ["!imgur", "-top", "-week", "slaanesh"];
    let query = mm.buildQuery(opts);
    query.should.be.equal("/top/week/?q=slaanesh ");
    done();
  });
  it('should get the help option', function (done) {
    let opts = ["!imgur", "-help", "khorne"];
    let query = mm.buildQuery(opts);
    query.should.be.equal(-1);
    done();
  });
});

describe ('imgur search', function () {
    before(function(){ 
        sinon
        .stub(request, 'get')        
        .yields({});
  });

  after(function(){
      request.get.restore();
  });
  it('should get an image', function (done) {
    let message = {
        content: "!imgur slaanesh"
    }
    mm.imgur(message);
    request.get.called.should.be.equal(true);
    done();
  });
});
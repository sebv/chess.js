'use strict';

/* jshint quotmark: false */
/* jshint expr: true */
/* global test, suite*/

if (typeof require !== "undefined") {
  var chai = require('chai');
  var should = require('chai').should();
  var fs = require('fs');
  var PgnParser = require('../chess').PgnParser;
}
var assert = chai.assert;


if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fn, scope) {
    for(var i = 0, len = this.length; i < len; ++i) {
      fn.call(scope, this[i], i, this);
    }
  };
}

suite("PGN parser", function() {
  var simplePgn = fs.readFileSync( __dirname + '/pgn/simple.pgn').toString();
  simplePgn.replace(/\r/g, '');
  // alternate score syntax
  var simplePgn2 = simplePgn.replace(' 1-0', '\n1-0');

  var simpleTests = [
    {name:'simple pgn 1', pgn: simplePgn},
    {name:'simple pgn 2', pgn: simplePgn2},
    {name:'simple pgn 1 with newline: \\n', pgn: simplePgn, newLine: '\n'},
    {name:'simple pgn 1 with newline: \\r\\n', pgn: simplePgn, newLine: '\r\n'},
    {name:'simple pgn 1 with newline: <br />', pgn: simplePgn, newLine: '<br />'},
    {name:'simple pgn 1 with newline: <br />\\n', pgn: simplePgn, newLine: '<br />\n'},
  ];

  simpleTests.forEach(function(simpleTest) {
    test(simpleTest.name, function() {
      var movesAsString = '',
        movesAsStringWithNum = '',
        score,
        headers = {},
        end;
      var cb = function(evt,data) {
        if(evt === 'move'){
          movesAsString += ' ' + data;
          movesAsStringWithNum += ' ' + data;
        }
        if(evt === 'move-num'){
          movesAsStringWithNum += ' ' + data + ':';
        }
        if(evt === 'score'){
          score = data;
        }
        if(evt === 'header'){
          headers[data.name] = data.value;
        }
        if(evt === 'end'){
          end = true;
        }
      };
      var pgn = simpleTest.pgn;
      if(simpleTest.newLine) pgn = pgn.replace(/\n/g, simpleTest.newLine);
      var parser;
      parser = new PgnParser(simpleTest.newLine);
      parser.parse(pgn, cb);
      var numOfMoves = movesAsString.match(/\s/g).length;
      end.should.be.true;
      numOfMoves.should.equal(81);
      movesAsString.match(/^ c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7/).should.exist;
      movesAsString.match(/ Nf6 Rxf6 gxf6 Rxf6 Kg8 Bc4 Kh8 Qf4$/).should.exist;
      movesAsStringWithNum.match(/^ 1: c4 e6 2: Nf3 d5 3: d4 Nf6 4: Nc3 Be7/).should.exist;
      movesAsStringWithNum.match(/ Nf6 38: Rxf6 gxf6 39: Rxf6 Kg8 40: Bc4 Kh8 41: Qf4$/);
      score.should.equal('1-0');
      Object.keys(headers).should.have.length(12);
      headers['Event'].should.equal("Reykjavik WCh");
      headers['ECO'].should.equal("D59");
      headers['PlyCount'].should.equal("81");
    });
  });
});



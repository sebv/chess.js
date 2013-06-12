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

function readFile(filename) {
  var pgn = fs.readFileSync( __dirname + '/pgn/' + filename).toString();
  pgn = pgn.replace(/\r/g, '');
  return pgn;
}

suite("PGN parser", function() {
  suite("aaa", function() {
  
  var simplePgn = readFile('simple.pgn');
  var simplePgn2 = simplePgn.replace(' 1-0', '\n1-0');
  var simpleTests = [
    {name:'simple pgn 1', pgn: simplePgn},
    {name:'simple pgn 2', pgn: simplePgn2},
    {name:'simple pgn 1', pgn: '\n\n\n' + simplePgn + '\n\n\n'},
    {name:'simple pgn 1 with newline: \\n', pgn: simplePgn, newLine: '\n'},
    {name:'simple pgn 1 with newline: \\r\\n', pgn: simplePgn, newLine: '\r\n'},
    {name:'simple pgn 1 with newline: \\r\\n', pgn: simplePgn, newLine: '\r?\n'},
    {name:'simple pgn 1 with newline: <br />', pgn: simplePgn, newLine: '<br />'},
    {name:'simple pgn 1 with newline: <br />\\n?', pgn: simplePgn, newLine: '<br />\n'},
    {name:'simple pgn 1 with newline: <br />\\n?', pgn: simplePgn.trim(), newLine: '<br />\n?'},
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
      if(simpleTest.newLine) pgn = pgn.replace(/\n/g, simpleTest.newLine.replace(/\?/g,''));
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
  

  // comments tests
  var commentPgn = readFile('comment.pgn');
  var commentPgn2 = commentPgn.replace('{Main comment}', '{Main\ncomment}');
  var commentPgn3 = commentPgn.replace('{Main comment}\n', '\n{Main comment}\n');
  var commentPgn4 = commentPgn.replace('{Main comment}\n', '\n\n{Main comment}');
  var commentTests = [
    {name:'comment 1', pgn: commentPgn},
    {name:'comment 2', pgn: commentPgn2},
    {name:'comment 3', pgn: commentPgn3},
    {name:'comment 4', pgn: commentPgn4},
    {name:'comment 5', pgn: commentPgn, newLine: '<br />'},
    {name:'comment 6', pgn: commentPgn2, newLine: '<br />'},
    {name:'comment 7', pgn: commentPgn3, newLine: '\r\n'},
  ];

  commentTests.forEach(function(commentTest) {
    test(commentTest.name, function() {
      var movesAsString = '',
        movesAsStringWithNum = '',
        score,
        headers = {},
        comments = {},
        end,
        currentMove = null,
        currentMoveNum = null;
      var cb = function(evt,data) {
        if(evt === 'move'){
          movesAsString += ' ' + data;
          movesAsStringWithNum += ' ' + data;
          currentMove = currentMoveNum + '.' + data;
        }
        if(evt === 'move-num'){
          movesAsStringWithNum += ' ' + data + ':';
          currentMoveNum = data;
        }
        if(evt === 'score'){
          score = data;
        }
        if(evt === 'header'){
          headers[data.name] = data.value;
        }
        if(evt === 'comment'){
          comments[currentMove ? currentMove : 'main'] = data;
        }
        if(evt === 'end'){
          end = true;
        }
      };
      var pgn = commentTest.pgn;
      if(commentTest.newLine) pgn = pgn.replace(/\n/g, commentTest.newLine.replace(/\?/g,''));
      var parser;
      parser = new PgnParser(commentTest.newLine);
      parser.parse(pgn, cb);
      var numOfMoves = movesAsString.match(/\s/g).length;
      end.should.be.true;
      numOfMoves.should.equal(33);
      movesAsString.match(/^ e4 e5 Nf3 d6 d4 Bg4\?/).should.exist;
      movesAsString.match(/Bxd7\+ Nxd7 Qb8\+ Nxb8 Rd8#$/).should.exist;
      movesAsString.match(/Bg5\!/).should.exist;
      movesAsString.match(/Nxb5\!\!/).should.exist;
      movesAsString.match(/Bxf3\?\?/).should.exist;
      movesAsStringWithNum.match(/^ 1: e4 e5 2: Nf3 d6 3: d4 Bg4?/).should.exist;
      movesAsStringWithNum.match(/ 15: Bxd7\+ Nxd7 16: Qb8\+ Nxb8 17: Rd8#$/).should.exist;
      score.should.equal('1-0');
      Object.keys(headers).should.have.length(12);
      headers['Event'].should.equal("Paris");
      headers['ECO'].should.equal("C41");
      headers['PlyCount'].should.equal("33");
      comments['main'].should.equal("Main comment");
      comments['1.e5'].should.equal("most common");
      comments['3.Bg4?'].should.equal("This is a weak move already.--Fischer");
      comments['9.Bg5!'].should.equal("Black is in what's like a zugzwang position " +
        "here. He can't develop the [Queen's] knight because the pawn " +
        "is hanging, the bishop is blocked because of the " +
        "Queen.--Fischer");
      comments['15.Bxd7+'].should.equal("nearly finished");
    });
  });
  });

});



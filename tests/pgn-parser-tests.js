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

function fixNewLine(pgn, newLine) {
  if(newLine) pgn = pgn.replace(/\n/g, newLine.replace(/\?/g,''));
  return pgn;
}

function initLine(id, parent) {
  if(parent) id = parent.id + ' / ' + id;

  return {
    id: id,
    parent: parent,
    movesAsString: '',
    movesAsStringWithNum: '',
    currentMove: null,
    currentMoveNum: null
  };
}

var TestClient = function() {
  var _this = this;
  this.score = null;
  this.headers = {};
  this.comments = {};
  this.nags = {};
  this.lines = {},
  this.end = null;
  this.currentLine = initLine('main');
  this.lines[this.currentLine.id] = this.currentLine;

  var _cb = function(evt,data) {
    if(evt === 'move'){
      this.currentLine.movesAsString += ' ' + data;
      this.currentLine.movesAsStringWithNum += ' ' + data;
      this.currentLine.prevMove = this.currentLine.currentMove;
      this.currentLine.currentMove = this.currentLine.currentMoveNum + '.' + data;
    }
    if(evt === 'move-num'){
      this.currentLine.movesAsStringWithNum += ' ' + data + ':';
      this.currentLine.currentMoveNum = data;
    }
    if(evt === 'score'){
      this.score = data;
    }
    if(evt === 'header'){
      this.headers[data.name] = data.value;
    }
    if(evt === 'comment'){
      this.comments[this.currentLine.currentMove ? this.currentLine.currentMove : 'main'] = data;
    }
    if(evt === 'nag'){
      this.nags[this.currentLine.currentMove ? this.currentLine.currentMove : 'main'] = data;
    }
    if(evt === 'variation-start'){
      this.currentLine = initLine(this.currentLine.prevMove ? this.currentLine.prevMove : 'start' , this.currentLine);
      if(this.lines[this.currentLine.id]) this.currentLine.id = this.currentLine.id + ' / # ';
      this.lines[this.currentLine.id] = this.currentLine;
    }
    if(evt === 'variation-end'){
      this.currentLine = this.currentLine.parent;
    }
    if(evt === 'end'){
      this.end = true;
    }
  };

  this.cb = function() {
    _cb.apply(_this, arguments);
  };
};

suite("PGN parser", function() {
  suite("simple tests", function() {
  
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
        var tc = new TestClient();
        var pgn = fixNewLine(simpleTest.pgn, simpleTest.newLine);
        var parser;
        parser = new PgnParser(simpleTest.newLine);
        parser.parse(pgn, tc.cb);

        var numOfMoves = tc.lines['main'].movesAsString.match(/\s/g).length;
        tc.end.should.be.true;
        numOfMoves.should.equal(81);
        tc.lines['main'].movesAsString.match(/^ c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7/).should.exist;
        tc.lines['main'].movesAsString.match(/ Nf6 Rxf6 gxf6 Rxf6 Kg8 Bc4 Kh8 Qf4$/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/^ 1: c4 e6 2: Nf3 d5 3: d4 Nf6 4: Nc3 Be7/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/ Nf6 38: Rxf6 gxf6 39: Rxf6 Kg8 40: Bc4 Kh8 41: Qf4$/);
        tc.score.should.equal('1-0');
        Object.keys(tc.headers).should.have.length(12);
        tc.headers['Event'].should.equal("Reykjavik WCh");
        tc.headers['ECO'].should.equal("D59");
        tc.headers['PlyCount'].should.equal("81");
      });
    });
  });

  suite("testing comments, ! ? !! ?? symbols after moves and nags", function() {

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
        var tc = new TestClient();
        var pgn = fixNewLine(commentTest.pgn, commentTest.newLine);
        var parser;
        parser = new PgnParser(commentTest.newLine);
        parser.parse(pgn, tc.cb);

        var numOfMoves = tc.lines['main'].movesAsString.match(/\s/g).length;
        tc.end.should.be.true;
        numOfMoves.should.equal(33);
        tc.lines['main'].movesAsString.match(/^ e4 e5 Nf3 d6 d4 Bg4\?/).should.exist;
        tc.lines['main'].movesAsString.match(/Bxd7\+ Nxd7 Qb8\+ Nxb8 Rd8#$/).should.exist;
        tc.lines['main'].movesAsString.match(/Bg5\!/).should.exist;
        tc.lines['main'].movesAsString.match(/Nxb5\!\!/).should.exist;
        tc.lines['main'].movesAsString.match(/Bxf3\?\?/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/^ 1: e4 e5 2: Nf3 d6 3: d4 Bg4?/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/ 15: Bxd7\+ Nxd7 16: Qb8\+ Nxb8 17: Rd8#$/).should.exist;
        tc.score.should.equal('1-0');
        Object.keys(tc.headers).should.have.length(12);
        tc.headers['Event'].should.equal("Paris");
        tc.headers['ECO'].should.equal("C41");
        tc.headers['PlyCount'].should.equal("33");
        
        tc.comments['main'].should.equal("Main comment");
        tc.comments['1.e5'].should.equal("most common");
        tc.comments['3.Bg4?'].should.equal("This is a weak move already.--Fischer");
        tc.comments['9.Bg5!'].should.equal("Black is in what's like a zugzwang position " +
          "here. He can't develop the [Queen's] knight because the pawn " +
          "is hanging, the bishop is blocked because of the " +
          "Queen.--Fischer");
        tc.comments['15.Bxd7+'].should.equal("nearly finished");

        tc.nags['1.e5'].should.equal(19);
        tc.nags['3.d4'].should.equal(25);
        tc.nags['10.cxb5'].should.equal(29);
      });
    });

    test('nag defs', function() {
      PgnParser.NAGS.should.exist;
      PgnParser.NAGS[0].should.equals('null annotation');
      PgnParser.NAGS[80].should.equals('White has a moderately weak pawn structure');
      PgnParser.NAGS[139].should.equals('Black has severe time control pressure');

    });

  });

  suite("testing variations", function() {

    // comments tests
    var variationPgn = readFile('variation.pgn');
    var variationTests = [
      {name:'variation 1', pgn: variationPgn},
    ];

    variationTests.forEach(function(variationTest) {
      test(variationTest.name, function() {
        var tc = new TestClient();
        var pgn = fixNewLine(variationTest.pgn, variationTest.newLine);
        var parser;
        parser = new PgnParser(variationTest.newLine);
        parser.parse(pgn, tc.cb);

        tc.score.should.equal('1-0');
        tc.end.should.be.true;
        
        Object.keys(tc.headers).should.have.length(12);
        tc.headers['Event'].should.equal("Reykjavik WCh");
        tc.headers['ECO'].should.equal("D59");
        tc.headers['PlyCount'].should.equal("81");
        Object.keys(tc.lines).should.have.length(10);
        // main line
        tc.lines['main'].should.exist;
        var numOfMoves = tc.lines['main'].movesAsString.match(/\s/g).length;
        numOfMoves.should.equal(81);
        tc.lines['main'].movesAsString.match(/^ c4 e6 Nf3 d5 d4 Nf6 Nc3 Be7/).should.exist;
        tc.lines['main'].movesAsString.match(/ Rxf6 Kg8 Bc4 Kh8 Qf4$/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/^ 1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7/).should.exist;
        tc.lines['main'].movesAsStringWithNum.match(/ 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4$/).should.exist;
        // alt start
        tc.lines['main / start'].should.exist;
        tc.lines['main / start'].movesAsString.should.equal(' e5 Nf3');
        // move 3 line
        tc.lines['main / 3.d4'].should.exist;
        tc.lines['main / 3.d4'].movesAsString.should.equal(' Be7 Nc3 Nf6');
        // move 16 line
        tc.lines['main / 16.O-O'].should.exist;
        tc.lines['main / 16.O-O'].movesAsString.should.equal(' Ra6 Be2 Nd7 Nd4 Qf8 Nxe6');
        // move 21 line
        tc.lines['main / 21.f4'].should.exist;
        tc.lines['main / 21.f4'].movesAsString.should.equal( ' Qe8 e5 Rb8 Bc4 Kh8 Qh3 Nf8 b3 a5 f5 exf5 Rxf5 ' +
          'Nh7 Rcf1 Qd8 Qg3 Re7 h4 Rbb7 e6 Rbc7');
        // move 27 line
        tc.lines['main / 27.Rxf5'].should.exist;
        tc.lines['main / 27.Rxf5'].movesAsString.should.equal(' Qd8 Rcf1 Nh7 Qg3 Re7');
        // move 27 line / subline
        tc.lines['main / 27.Rxf5 / 28.Rcf1'].should.exist;
        tc.lines['main / 27.Rxf5 / 28.Rcf1'].movesAsString.should.equal(' Re7 Qg3 Nh7');
        // move 29 line
        tc.lines['main / 29.Re7'].should.exist;
        tc.lines['main / 29.Re7'].movesAsString.should.equal(' e6 Rbb7 h4 Rbc7 Qe5 Qe8 a4 Qd8' +
          ' R1f2 Qe8 R2f3 Qd8 Bd3 Qe8 Qe4 Nf6 Rxf6 gxf6 Rxf6');
        // move 29 line / move 32 subline
        tc.lines['main / 29.Re7 / 32.Qe5'].should.exist;
        tc.lines['main / 29.Re7 / 32.Qe5'].movesAsString.
          should.equal(' Qd8 a4 Qe8 R1f2 Qe8 R2f3 Qd8');
        // move 29 line / move 32 subline /move 33 subline
        tc.lines['main / 29.Re7 / 32.Qe5 / 33.Qe8'].should.exist;
        tc.lines['main / 29.Re7 / 32.Qe5 / 33.Qe8'].movesAsString.
          should.equal(' R2f3 Qe8 R1f2');
      });
    });
  });

  suite("testing real complex file", function() {

    // comments tests
    var complexPgn = readFile('complex.pgn');
    var complexTests = [
      {name:'complex 1', pgn: complexPgn},
    ];

    complexTests.forEach(function(complexTest) {
      test(complexTest.name, function() {
        var tc = new TestClient();
        var pgn = fixNewLine(complexTest.pgn, complexTest.newLine);
        var parser;
        parser = new PgnParser(complexTest.newLine);
        parser.parse(pgn, tc.cb);

        tc.score.should.equal('1-0');
        tc.end.should.be.true;

        Object.keys(tc.headers).should.have.length(13);
        tc.headers['Event'].should.equal("Live Chess");
        tc.headers['ECO'].should.equal("C50");
        tc.headers['TimeControl'].should.equal("15|10");

        Object.keys(tc.lines).should.have.length(44);
        tc.lines['main'].should.exist;
        var numOfMoves = tc.lines['main'].movesAsString.match(/\s/g).length;
        numOfMoves.should.equal(80);
        
        // main line
        tc.lines['main'].movesAsString.match(/^ e4 e5 Nf3 Nc6 Bc4 Bc5 O-O d6 c3 Be6 Bxe6 fxe6/).should.exist;
        tc.lines['main'].movesAsString.match(/ Kxd4 Ne2\+ Kxd5 Nxc1$/).should.exist;
                                               
      });
    });
  });

});



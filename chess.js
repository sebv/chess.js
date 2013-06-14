'use strict';

/*
 * Copyright (c) 2011, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

(function() {

  /*****************************************************************************
   * Pieces representation
   ****************************************************************************/
    
  var BLACK = 'b';
  var WHITE = 'w';

  var EMPTY = -1;

  var PAWN = 'p';
  var KNIGHT = 'n';
  var BISHOP = 'b';
  var ROOK = 'r';
  var QUEEN = 'q';
  var KING = 'k';

  var SYMBOLS = 'pnbrqkPNBRQK';

  /*****************************************************************************
   * 0x88 board representation
   ****************************************************************************/

   /*
      SQUARES should contain the following:

      a8: 112, b8: 113, c8: 114, d8: 115, e8: 116, f8: 117, g8: 118, h8: 119
      a7:  96, b7:  97, c7:  98, d7:  99, e7: 100, f7: 101, g7: 102, h7: 103,
      a6:  80, b6:  81, c6:  82, d6:  83, e6:  84, f6:  85, g6:  86, h6:  87,
      a5:  64, b5:  65, c5:  66, d5:  67, e5:  68, f5:  69, g5:  70, h5:  71,
      a4:  48, b4:  49, c4:  50, d4:  51, e4:  52, f4:  53, g4:  54, h4:  55,
      a3:  32, b3:  33, c3:  34, d3:  35, e3:  36, f3:  37, g3:  38, h3:  39,
      a2:  16, b2:  17, c2:  18, d2:  19, e2:  20, f2:  21, g2:  22, h2:  23,
      a1:   0, b1:   1, c1:   2, d1:   3, e1:   4, f1:   5, g1:   6, h1:   7,
   */
  var SQUARES_KEYS = [], // from a1 to h8 
      SQUARES_KEYS_A8_TO_H1 = [], // from a8 to h1
      SQUARES = {};

  for(var  i=0; i<8; i++)
    for(var j=0; j<8; j++)
    {
      SQUARES_KEYS.push(String.fromCharCode('a'.charCodeAt()+j) + (i+1));
      SQUARES_KEYS_A8_TO_H1.push(String.fromCharCode('a'.charCodeAt()+j) + (8-i));
    }

  for(var i=0; i< SQUARES_KEYS.length; i++) {
    SQUARES[SQUARES_KEYS[i]] =
      (Math.floor(i / 8)) * 16 + (i % 8); // rank * 16 + file
  }

  var RANK_1 = 0;
  var RANK_2 = 1;
  var RANK_7 = 6;
  var RANK_8 = 7;

  /*****************************************************************************
   * Pieces movement
   ****************************************************************************/

  // using 0x88 representation
  var PAWN_OFFSETS = {
    w: [16, 32, 17, 15],
    b: [-16, -32, -17, -15]
  };

  // using 0x88 representation
  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14,  18, 33, 31,  14],
    b: [-17, -15,  17,  15],
    r: [-16,   1,  16,  -1],
    q: [-17, -16, -15,   1,  17, 16, 15,  -1],
    k: [-17, -16, -15,   1,  17, 16, 15,  -1]
  };


  /*****************************************************************************
   * Attack related constants
   ****************************************************************************/

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  // using SHIFTS masks
  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
    0 ,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    0 , 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
    0 , 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
    0 , 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
    0 , 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
    0 , 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
    0 , 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    0 , 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
    0 , 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
    0 , 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
    0 , 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
    0 ,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  // using 0x88 representation
  
  var RAYS = [
    17 ,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
    0  , 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
    0  ,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
    0  ,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
    0  ,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
    0  ,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
    0  ,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
    1  ,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
    0  ,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
    0  ,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
    0  ,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
    0  ,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
    0  ,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
    0  ,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];
  
  /*****************************************************************************
   * Move related constants
   ****************************************************************************/

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q'
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64
  };

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

  /*****************************************************************************
   * Other constants
   ****************************************************************************/

  var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i){
    var f = file(i), r = rank(i);
    return 'abcdefgh'.substring(f,f+1) + '12345678'.substring(r,r+1);
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1;
  }


  function clone(obj) {
    var dupe = (obj instanceof Array) ? [] : {};

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe;
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  /***************************************************************************
   * Pgn Parser 
   ********************x******************************************************/

  var PgnParser = function(newLine) {
    this.newLine = newLine;
  };

  PgnParser.prototype.parse = function(pgn, cb) {
    function emit(evt, data) {
      cb(evt,data);
    }

    if(!pgn)
      throw new Error('No pgn.');

    // extracting pgn sections
    var _newLine = '\\r?\\n';
    if(this.newLine) _newLine = this.newLine.replace(/\n/g, '\\n').
      replace(/\r/g, '\\r').
      replace(/\//g, '\\/');

    var regexString = '^(?:NL)*((?:\\[.*\\](?:NL))*)((?:\\{((?:.|NL)*?)\\}|(?:NL))*' +
      '1\\.(?:.*(?:NL)?)*)$';
    var regex = new RegExp(regexString.replace(/NL/g, _newLine));
    var matches = pgn.match(regex);

    var headersAsString,moveListAsString;
    if(matches) {
      headersAsString = matches[1];
      moveListAsString = matches[2];
    }

    if(!moveListAsString)
      throw new Error('Invalid pgn, cannot extract move list.');

    if(headersAsString){
      // parsing headers
      var headerRegexAsString = 'NL|\\[(\\w+)\\s+\\"(.*?)\\"\\]';
      var headerRegex = new RegExp(headerRegexAsString.replace(/NL/g, _newLine), 'g');
      while ((matches = headerRegex.exec(headersAsString)) !== null) {
        if(matches[1]) emit('header',{name:matches[1], value:matches[2]});
      }
    }

    // parsing movelist
    var moveListRegexString = '\\s+|NL|(\\d+)\\.+|\\$(\\d+)|(\\d\\-\\d)|' +
      '([\\w\\-\\#\\+\\?\\!]+)NL|([\\w\\-\\#\\+\\?\\!]+)|\\{((?:.|NL)*?)\\}|(\\()|(\\))';
    var moveListRegex = new RegExp(moveListRegexString.replace(/NL/g, _newLine), 'g');
    while ((matches = moveListRegex.exec( moveListAsString)) !== null) {
      var idx = null;
      for(var i = 1; i <=8 ; i++) { if(matches[i]){ idx = i; break;} }
      switch(idx) {
      case 1:
        emit('move-num',matches[idx]);
        break;
      case 2:
        emit('nag', parseInt(matches[idx], 10));
        break;
      case 3:
        emit('score',matches[idx]);
        break;
      case 4:
      case 5:
        emit('move',matches[idx]);
        break;
      case 6:
        var rawComment = matches[idx],
            comment = '';
        var commentRegexAsString = '(.+?)NL|(.+)';
        var commentRegex = new RegExp(commentRegexAsString.replace(/NL/g, _newLine), 'g');
        var cMatches;
        while ((cMatches = commentRegex.exec(rawComment)) !== null) {
          if(cMatches[1]) comment += cMatches[1] + ' ';
          else if(cMatches[2]) comment += cMatches[2];
        }
        emit('comment',comment.trim());
        break;
      case 7:
        emit('variation-start');
        break;
      case 8:
        emit('variation-end');
        break;
      }
    }
    emit('end');
  };

  PgnParser.NAGS = [
    'null annotation',
    'good move (traditional "!")',
    'poor move (traditional "?")',
    'very good move (traditional "!!")',
    'very poor move (traditional "??")',
    'speculative move (traditional "!?")',
    'questionable move (traditional "?!")',
    'forced move (all others lose quickly)',
    'singular move (no reasonable alternatives)',
    'worst move',
    'drawish position',
    'equal chances, quiet position',
    'equal chances, active position',
    'unclear position',
    'White has a slight advantage',
    'Black has a slight advantage',
    'White has a moderate advantage',
    'Black has a moderate advantage',
    'White has a decisive advantage',
    'Black has a decisive advantage',
    'White has a crushing advantage (Black should resign)',
    'Black has a crushing advantage (White should resign)',
    'White is in zugzwang',
    'Black is in zugzwang',
    'White has a slight space advantage',
    'Black has a slight space advantage',
    'White has a moderate space advantage',
    'Black has a moderate space advantage',
    'White has a decisive space advantage',
    'Black has a decisive space advantage',
    'White has a slight time (development) advantage',
    'Black has a slight time (development) advantage',
    'White has a moderate time (development) advantage',
    'Black has a moderate time (development) advantage',
    'White has a decisive time (development) advantage',
    'Black has a decisive time (development) advantage',
    'White has the initiative',
    'Black has the initiative',
    'White has a lasting initiative',
    'Black has a lasting initiative',
    'White has the attack',
    'Black has the attack',
    'White has insufficient compensation for material deficit',
    'Black has insufficient compensation for material deficit',
    'White has sufficient compensation for material deficit',
    'Black has sufficient compensation for material deficit',
    'White has more than adequate compensation for material deficit',
    'Black has more than adequate compensation for material deficit',
    'White has a slight center control advantage',
    'Black has a slight center control advantage',
    'White has a moderate center control advantage',
    'Black has a moderate center control advantage',
    'White has a decisive center control advantage',
    'Black has a decisive center control advantage',
    'White has a slight kingside control advantage',
    'Black has a slight kingside control advantage',
    'White has a moderate kingside control advantage',
    'Black has a moderate kingside control advantage',
    'White has a decisive kingside control advantage',
    'Black has a decisive kingside control advantage',
    'White has a slight queenside control advantage',
    'Black has a slight queenside control advantage',
    'White has a moderate queenside control advantage',
    'Black has a moderate queenside control advantage',
    'White has a decisive queenside control advantage',
    'Black has a decisive queenside control advantage',
    'White has a vulnerable first rank',
    'Black has a vulnerable first rank',
    'White has a well protected first rank',
    'Black has a well protected first rank',
    'White has a poorly protected king',
    'Black has a poorly protected king',
    'White has a well protected king',
    'Black has a well protected king',
    'White has a poorly placed king',
    'Black has a poorly placed king',
    'White has a well placed king',
    'Black has a well placed king',
    'White has a very weak pawn structure',
    'Black has a very weak pawn structure',
    'White has a moderately weak pawn structure',
    'Black has a moderately weak pawn structure',
    'White has a moderately strong pawn structure',
    'Black has a moderately strong pawn structure',
    'White has a very strong pawn structure',
    'Black has a very strong pawn structure',
    'White has poor knight placement',
    'Black has poor knight placement',
    'White has good knight placement',
    'Black has good knight placement',
    'White has poor bishop placement',
    'Black has poor bishop placement',
    'White has good bishop placement',
    'Black has good bishop placement',
    'White has poor rook placement',
    'Black has poor rook placement',
    'White has good rook placement',
    'Black has good rook placement',
    'White has poor queen placement',
    'Black has poor queen placement',
    'White has good queen placement',
    'Black has good queen placement',
    'White has poor piece coordination',
    'Black has poor piece coordination',
    'White has good piece coordination',
    'Black has good piece coordination',
    'White has played the opening very poorly',
    'Black has played the opening very poorly',
    'White has played the opening poorly',
    'Black has played the opening poorly',
    'White has played the opening well',
    'Black has played the opening well',
    'White has played the opening very well',
    'Black has played the opening very well',
    'White has played the middlegame very poorly',
    'Black has played the middlegame very poorly',
    'White has played the middlegame poorly',
    'Black has played the middlegame poorly',
    'White has played the middlegame well',
    'Black has played the middlegame well',
    'White has played the middlegame very well',
    'Black has played the middlegame very well',
    'White has played the ending very poorly',
    'Black has played the ending very poorly',
    'White has played the ending poorly',
    'Black has played the ending poorly',
    'White has played the ending well',
    'Black has played the ending well',
    'White has played the ending very well',
    'Black has played the ending very well',
    'White has slight counterplay',
    'Black has slight counterplay',
    'White has moderate counterplay',
    'Black has moderate counterplay',
    'White has decisive counterplay',
    'Black has decisive counterplay',
    'White has moderate time control pressure',
    'Black has moderate time control pressure',
    'White has severe time control pressure',
    'Black has severe time control pressure'
  ];

  /***************************************************************************
   * Position Class 
   **************************************************************************/

  var Position = function() {
    this.reset();
  };

  Position.prototype.reset = function() {
    this.board = new Array(128);
    this.kings = {w: EMPTY, b: EMPTY};
    this.turn = WHITE;
    this.castling = {w: 0, b: 0};
    this.ep_square = EMPTY;
    this.half_moves = 0;
    this.move_number = 1;
  };

  Position.prototype.cloneFields = function() {
    return {
      kings: {b: this.kings.b, w: this.kings.w},
      turn: this.turn,
      castling: {b: this.castling.b, w: this.castling.w},
      ep_square: this.ep_square,
      half_moves: this.half_moves,
      move_number: this.move_number
    };
  };

  Position.prototype.setFields = function(fields) {
    this.kings.w = fields.kings.w;
    this.kings.b = fields.kings.b;
    this.turn = fields.turn;
    this.castling.w = fields.castling.w;
    this.castling.b = fields.castling.b;
    this.ep_square = fields.ep_square;
    this.half_moves = fields.half_moves;
    this.move_number = fields.move_number;
  };

  Position.prototype.in_check = function() {
    return this._king_attacked(this.turn);
  };

  Position.prototype.in_checkmate = function() {
    return this.in_check() && this.generate_moves().length === 0;
  };

  Position.prototype.in_stalemate = function() {
    return !this.in_check() && this.generate_moves().length === 0;
  };

  Position.prototype.insufficient_material = function() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;
    for (var i = 0; i< this.board.length; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) { i += 7; continue; }

      var piece = this.board[i];
      if (piece) {
        pieces[piece.type] = (piece.type in pieces) ?
                              pieces[piece.type] + 1 : 1;
        if (piece.type === BISHOP) {
          bishops.push(sq_color);
        }
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) { return true; }

    /* k vs. kn .... or .... k vs. kb */
    else if (num_pieces === 3 && (pieces[BISHOP] === 1 ||
                                 pieces[KNIGHT] === 1)) { return true; }

    /* kb vs. kb where any number of bishops are all on the same color */
    else if (num_pieces === pieces[BISHOP] + 2) {
      var sum = 0;
      var len = bishops.length;
      for (var i = 0; i < len; i++) {
        sum += bishops[i];
      }
      if (sum === 0 || sum === len) { return true; }
    }

    return false;
  };

  Position.prototype.build_move = function(from, to, flags, promotion) {
    var move = {
      color: this.turn,
      from: from,
      to: to,
      flags: flags,
      piece: this.board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (this.board[to]) {
      move.captured = this.board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
      move.captured = PAWN;
    }
    return move;
  };

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   */
  Position.prototype.move_to_san = function(move) {
    var output = '';

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O';
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O';
    } else {
      var disambiguator = this._get_disambiguator(move);

      if (move.piece !== PAWN) {
        output += move.piece.toUpperCase() + disambiguator;
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0];
        }
        output += 'x';
      }

      output += algebraic(move.to);

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase();
      }
    }

    var oldFields = this.cloneFields();
    this.make_move(move);
    if (this.in_check()) {
      if (this.in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    this.undo_move(move, oldFields);
    return output;
  };

  /* convert a move from Standard Algebraic Notation (SAN) to 0x88
   * coordinates
  */
  Position.prototype.move_from_san = function(move) {
    var to, from, flags = BITS.NORMAL, promotion;
    var parse = move.match(/^([NBKRQ])?([abcdefgh12345678][12345678]?)?(x)?([abcdefgh][12345678])(=?[NBRQ])?/);

    if (move.slice(0, 5) === 'O-O-O') {
      from = this.kings[this.turn];
      to = from - 2;
      flags = BITS.QSIDE_CASTLE;
    } else if (move.slice(0, 3) === 'O-O') {
      from = this.kings[this.turn];
      to = from + 2;
      flags = BITS.KSIDE_CASTLE;
    } else if (parse && parse[1]) {
      // regular moves
      var piece = parse[1].toLowerCase();
      if (parse[3]) {
        // capture
        flags = BITS.CAPTURE;
      }
      to = SQUARES[parse[4]];
      for (var j = 0, len = PIECE_OFFSETS[piece].length; j < len; j++) {
        var offset = PIECE_OFFSETS[piece][j];
        var square = to;

        while (true) {
          square += offset;
          if (square & 0x88) break;

          var b = this.board[square];
          if (b) {
            if (b.color === this.turn && b.type === piece && (!parse[2] || algebraic(square).indexOf(parse[2]) >= 0)) {
              from = square;
            }
            break;
          }

          /* break, if knight or king */
          if (piece === 'n' || piece === 'k') break;
        }
      }
    } else if (parse) {
      // pawn move
      if (parse[3]) {
        // capture
        to = SQUARES[parse[4]];
        for (var j = 2; j < 4; j++) {
          var square = to - PAWN_OFFSETS[this.turn][j];
          if (square & 0x88) continue;

          if (this.board[square] != null &&
              this.board[square].color === this.turn &&
              algebraic(square)[0] === parse[2]) {
            from = square;
          }
        }
        if (this.board[to]) {
          flags = BITS.CAPTURE;
        } else {
          flags = BITS.EP_CAPTURE;
        }
      } else {
        // normal move
        to = SQUARES[move.slice(0,2)];
        var c = to - PAWN_OFFSETS[this.turn][0],
            b = this.board[c];
        if (b && b.type === PAWN && b.color === this.turn) {
          from = c;
        } else {
          c = to - PAWN_OFFSETS[this.turn][1];
          b = this.board[c];
          if (b && b.type === PAWN && b.color === this.turn) {
            from = c;
            flags = BITS.BIG_PAWN;
          }
        }
      }
      // promotion?
      if (parse[5]) {
        promotion = parse[5][1].toLowerCase();
        if(typeof parse[5][1] === 'undefined') {
          promotion = parse[5][0].toLowerCase();
        } else {
          promotion = parse[5][1].toLowerCase();
        }
      }
    }
    if (from >=0 && to >=0 && flags) {
      return this.build_move(from, to, flags, promotion);
    } else if (move.length > 0) {
      /* alert(move); // error in PGN, or in parsing. */
    }
  };

  Position.prototype.make_move = function(move) {
    var us = this.turn;
    var them = swap_color(us);
    

    this.board[move.to] = this.board[move.from];
    this.board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      this.board[move.to - PAWN_OFFSETS[us][0]] = null;
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      this.board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (this.board[move.to].type === KING) {
      this.kings[this.board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        this.board[castling_to] = this.board[castling_from];
        this.board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        this.board[castling_to] = this.board[castling_from];
        this.board[castling_from] = null;
      }

      /* turn off castling */
      this.castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (this.castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            this.castling[us] & ROOKS[us][i].flag) {
          this.castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (this.castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            this.castling[them] & ROOKS[them][i].flag) {
          this.castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      this.ep_square = move.to - PAWN_OFFSETS[us][0];
    } else {
      this.ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      this.half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      this.half_moves = 0;
    } else {
      this.half_moves++;
    }

    if (this.turn === BLACK) {
      this.move_number++;
    }
    this.turn = swap_color(this.turn);
  };

  Position.prototype.undo_move = function(move, prevPositionFields) {
    var us = swap_color(this.turn);
    var them = this.turn;

    this.board[move.from] = this.board[move.to];
    this.board[move.from].type = move.piece;  // to undo any promotions
    this.board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      this.board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index = move.to - PAWN_OFFSETS[us][0];
      this.board[index] = {type: PAWN, color: them};
    }

    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from;
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1;
        castling_from = move.to - 1;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2;
        castling_from = move.to + 1;
      }

      this.board[castling_to] = this.board[castling_from];
      this.board[castling_from] = null;
    }

    this.setFields(prevPositionFields);
    return move;
  };

  Position.prototype.generate_fen = function() {
    var empty = 0;
    var fen = '';
    for (var i =0; i < SQUARES_KEYS_A8_TO_H1.length; i++) {
      var idx = SQUARES[SQUARES_KEYS_A8_TO_H1[i]];
      if (this.board[idx] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = this.board[idx].color;
        var piece = this.board[idx].type;

        fen += (color === WHITE) ?
                 piece.toUpperCase() : piece.toLowerCase();
      }

      if ((idx + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (idx !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        
      }
    }

    var cflags = '';
    if (this.castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (this.castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (this.castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (this.castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = (this.ep_square === EMPTY) ? '-' : algebraic(this.ep_square);

    return [fen, this.turn, cflags, epflags, this.half_moves, this.move_number].join(' ');
  };

  Position.prototype.generate_moves = function(options) {
    var moves = [];
    var us = this.turn;
    var them = swap_color(us);
    var second_rank = {b: RANK_7, w: RANK_2};

    var first_sq = 0;
    var last_sq = this.board.length;
    
    var single_square = false;

    /* do we want legal moves? */
    var legal = (typeof options !== 'undefined' && 'legal' in options) ?
                options.legal : true;

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
      } else {
        /* invalid square */
        return [];
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      var piece = this.board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (this.board[square] == null) {
          this._add_move(moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && this.board[square] == null) {
            this._add_move(moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;

          if (this.board[square] != null &&
          this.board[square].color === them) {
            this._add_move(moves, i, square, BITS.CAPTURE);
          } else if (square === this.ep_square) {
            this._add_move(moves, i, this.ep_square, BITS.EP_CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            if (this.board[square] == null) {
              this._add_move(moves, i, square, BITS.NORMAL);
            } else {
              if (this.board[square].color === us) break;
              this._add_move(moves, i, square, BITS.CAPTURE);
              break;
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break;
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if ((!single_square) || last_sq === this.kings[us]) {
      /* king-side castling */
      if (this.castling[us] & BITS.KSIDE_CASTLE) {
        var castling_from = this.kings[us];
        var castling_to = castling_from + 2;

        if (this.board[castling_from + 1] == null &&
            this.board[castling_to]       == null &&
            !this._attacked(them, this.kings[us]) &&
            !this._attacked(them, castling_from + 1) &&
            !this._attacked(them, castling_to)) {
          this._add_move(moves, this.kings[us] , castling_to,
                   BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (this.castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = this.kings[us];
        var castling_to = castling_from - 2;

        if (this.board[castling_from - 1] == null &&
            this.board[castling_from - 2] == null &&
            this.board[castling_from - 3] == null &&
            !this._attacked(them, this.kings[us]) &&
            !this._attacked(them, castling_from - 1) &&
            !this._attacked(them, castling_to)) {
          this._add_move(moves, this.kings[us], castling_to,
                   BITS.QSIDE_CASTLE);
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves;
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      var oldFields = this.cloneFields();
      this.make_move(moves[i]);
      if (!this._king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      this.undo_move(moves[i], oldFields);
    }

    return legal_moves;
  };

  /* pretty = external move object */
  Position.prototype.make_pretty = function(ugly_move) {
    var move = clone(ugly_move);
    move.san = this.move_to_san(move);
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = '';

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move;
  };

  Position.prototype.ascii = function() {
    var s = '   +------------------------+\n';
    for (var i = 0; i < SQUARES_KEYS_A8_TO_H1.length; i++) {
      var square = SQUARES[SQUARES_KEYS_A8_TO_H1[i]];
      /* display the rank */
      if (file(square) === 0) {
        s += ' ' + '87654321'[rank(square)] + ' |';
      }

      /* empty piece */
      if (this.board[square] == null) {
        s += ' . ';
      } else {
        var piece = this.board[square].type;
        var color = this.board[square].color;
        var symbol = (color === WHITE) ?
                     piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((square + 1) & 0x88) {
        s += '|\n';
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s;
  };

  Position.prototype.square_color = function(square) {
    if (square in SQUARES) {
      var sq_0x88 = SQUARES[square];
      return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
    }

    return null;
  };

  Position.prototype._attacked = function(color, square) {
    for (var i = 0; i <= this.board.length; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      /* if empty square or wrong color */
      if (this.board[i] == null || this.board[i].color !== color) continue;

      var piece = this.board[i];
      var difference = i - square;
      var index = difference + 119;
      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference < 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true;

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (this.board[j] != null) { blocked = true; break; }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  };

  Position.prototype._king_attacked = function(color) {
    return this._attacked(swap_color(color), this.kings[color]);
  };

  /* this function is used to uniquely identify ambiguous moves */
  Position.prototype._get_disambiguator = function(move) {
    var moves = this.generate_moves();

    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      }
      /* if the moving piece rests on the same file, use the rank symbol as the
       * disambiguator
       */
      else if (same_file > 0) {
        return algebraic(from).charAt(1);
      }
      /* else use the file symbol */
      else {
        return algebraic(from).charAt(0);
      }
    }

    return '';
  };

  Position.prototype.validate_fen = function(fen) {
    var errors = {
      0: 'No errors.',
      1: 'FEN string must contain six space-delimited fields.',
      2: '6th field (move number) must be a positive integer.',
      3: '5th field (half move counter) must be a non-negative integer.',
      4: '4th field (en-passant square) is invalid.',
      5: '3rd field (castling availability) is invalid.',
      6: '2nd field (side to move) is invalid.',
      7: '1st field (piece positions) does not contain 8 \'/\'-delimited rows.',
      8: '1st field (piece positions) is invalid [consecutive numbers].',
      9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
    };

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 6) {
      return {valid: false, error_number: 1, error: errors[1]};
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || (parseInt(tokens[5], 10) <= 0)) {
      return {valid: false, error_number: 2, error: errors[2]};
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || (parseInt(tokens[4], 10) < 0)) {
      return {valid: false, error_number: 3, error: errors[3]};
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return {valid: false, error_number: 4, error: errors[4]};
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if( !/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return {valid: false, error_number: 5, error: errors[5]};
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return {valid: false, error_number: 6, error: errors[6]};
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/');
    if (rows.length !== 8) {
      return {valid: false, error_number: 7, error: errors[7]};
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return {valid: false, error_number: 8, error: errors[8]};
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return {valid: false, error_number: 9, error: errors[9]};
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 8) {
        return {valid: false, error_number: 10, error: errors[10]};
      }
    }

    /* everything's okay! */
    return {valid: true, error_number: 0, error: errors[0]};
  };

  Position.prototype.load = function(fen) {
    // We use k to traverse SQUARES_KEYS_A8_TO_H1 from a8 to h1,
    // in the same order as the fen spec.
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var k = 0;
    var valid = SYMBOLS + '12345678/';

    if (!this.validate_fen(fen).valid) {
      return false;
    }

    this.reset();

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        // nothing to do
      } else if (is_digit(piece)) {
        k += parseInt(piece, 10);
      } else {
        var color = (piece < 'a') ? WHITE : BLACK;
        var square = SQUARES[SQUARES_KEYS_A8_TO_H1[k]];
        this.put({type: piece.toLowerCase(), color: color}, algebraic(square));
        k++;
      }
    }

    this.turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      this.castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      this.castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      this.castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      this.castling.b |= BITS.QSIDE_CASTLE;
    }

    this.ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    this.half_moves = parseInt(tokens[4], 10);
    this.move_number = parseInt(tokens[5], 10);
    return true;
  };

  Position.prototype.put = function(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false;
    }

    /* check for piece */
    if ((!piece.type)||(SYMBOLS.indexOf(piece.type.toLowerCase()) === -1)) {
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false;
    }

    var sq = SQUARES[square];
    this.board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      this.kings[piece.color] = sq;
    }
    return true;
  };

  Position.prototype.get = function(square) {
    var piece = this.board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  };

  Position.prototype.remove = function(square) {
    var piece = this.get(square);
    this.board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      this.kings[piece.color] = EMPTY;
    }
    return piece;
  };

  Position.prototype.to_move_obj = function(move) {
    /* The _move_Obj function can be called with in the following parameters:
     *
     * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
     *
     * .move({ from: 'h7', <- where the 'move' is a move object (additional
     *         to :'h8',      fields are ignored)
     *         promotion: 'q',
     *      })
     */
    var move_obj = null;
    var moves = this.generate_moves();

    if (typeof move === 'string') {
      /* convert the move string to a move object */
      for (var i = 0, len = moves.length; i < len; i++) {
        var sanMove = this.move_to_san(moves[i]);
        if (move === sanMove) {
          move_obj = moves[i];
          break;
        }
      }
    } else if (typeof move === 'object') {
      /* convert the pretty move object to an ugly move object */
      for (var i = 0, len = moves.length; i < len; i++) {
        if (move.from === algebraic(moves[i].from) &&
            move.to === algebraic(moves[i].to) &&
            (!('promotion' in moves[i]) ||
            move.promotion === moves[i].promotion)) {
          move_obj = moves[i];
          break;
        }
      }
    }

    return move_obj;
  };

  Position.prototype._add_move = function(moves, from, to, flags) {
    /* if pawn promotion */
    if (this.board[from].type === PAWN &&
    (rank(to) === RANK_8 || rank(to) === RANK_1)) {
      var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
      for (var i = 0, len = pieces.length; i < len; i++) {
        moves.push(this.build_move(from, to, flags, pieces[i]));
      }
    } else {
      moves.push(this.build_move(from, to, flags));
    }
  };

  /***************************************************************************
   * Chess Class Constructor 
   **************************************************************************/

  var Chess = function(fen) {

    this.headers = {};

    this.position = new Position();

    this.moveList = [];

    /* if the user passes in a fen string, load it, else default to
     * starting position
     */
    if (typeof fen === 'undefined') {
      this.load(DEFAULT_POSITION);
    } else {
      this.load(fen);
    }
  };

  /***************************************************************************
   * CLASS STATIC 
   **************************************************************************/

  Chess.WHITE = WHITE;
  Chess.BLACK = BLACK;
  Chess.PAWN = PAWN;
  Chess.KNIGHT = KNIGHT;
  Chess.BISHOP = BISHOP;
  Chess.ROOK = ROOK;
  Chess.QUEEN = QUEEN;
  Chess.KING = KING;
  Chess.SQUARES = SQUARES_KEYS; // a1 to h8
  Chess.SQUARES_A8_TO_H1 = SQUARES_KEYS_A8_TO_H1; // a8 to h1  
  Chess.FLAGS = FLAGS;

  /***************************************************************************
  * PUBLIC API
  **************************************************************************/

  Chess.prototype.clear = function() {
    this.position.reset();
    this.moveList = [];
    this.headers = {};
    this._update_setup(this.position.generate_fen());
  };

  Chess.prototype.load = function(fen) {
    this.clear();
    if( !this.position.load(fen) ) return false;
    this._update_setup(this.position.generate_fen());
    return true;
  };

  Chess.prototype.reset = function() {
    return this.load(DEFAULT_POSITION);
  };

  Chess.prototype.moves = function(options) {
    /* The internal representation of a chess move is in 0x88 format, and
     * not meant to be human-readable.  The code below converts the 0x88
     * square coordinates to algebraic coordinates.  It also prunes an
     * unnecessary move keys resulting from a verbose call.
     */

    var ugly_moves = this.position.generate_moves(options);
    var moves = [];

    for (var i = 0, len = ugly_moves.length; i < len; i++) {

      /* does the user want a full move object (most likely not), or just
       * SAN
       */
      if (typeof options !== 'undefined' && 'verbose' in options &&
          options.verbose) {
        moves.push(this.position.make_pretty(ugly_moves[i]));
      } else {
        moves.push(this.position.move_to_san(ugly_moves[i]));
      }
    }

    return moves;
  };

  Chess.prototype.in_check = function() {
    return this.position.in_check();
  };

  Chess.prototype.in_checkmate = function() {
    return this.position.in_checkmate();
  };

  Chess.prototype.in_stalemate = function() {
    return this.position.in_stalemate();
  };

  Chess.prototype.in_draw = function() {
    return this.position.half_moves >= 100 ||
           this.in_stalemate() ||
           this.insufficient_material() ||
           this.in_threefold_repetition();
  };

  Chess.prototype.insufficient_material = function() {
    return this.position.insufficient_material();
  };

  Chess.prototype.in_threefold_repetition = function() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the _make_move/_undo_move functions,
     * avoiding the costly that we do below.
     */
    var positions = {};
    var repetition = false;

    this._undo_all();

    var checkFen = function() {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = this.position.generate_fen().split(' ').slice(0,4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }
    }.bind(this);

    checkFen();

    for(var i= 0; i < this.moveList.length; i++){
      var moveRecord = this.moveList[i];
      this.position.make_move(moveRecord.move);

      checkFen();
    }

    return repetition;
  };

  Chess.prototype.game_over = function() {
    return this.position.half_moves >= 100 ||
           this.in_checkmate() ||
           this.in_stalemate() ||
           this.insufficient_material() ||
           this.in_threefold_repetition();
  };

  Chess.prototype.validate_fen = function(fen) {
    return this.position.validate_fen(fen);
  };

  Chess.prototype.fen = function() {
    return this.position.generate_fen(arguments);
  };

  Chess.prototype.pgn = function(options) {
    /* using the specification from http://www.chessclub.com/help/PGN-spec
     * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
     */
    var newline = (typeof options === 'object' &&
                   typeof options.newline_char === 'string') ?
                   options.newline_char : '\n';
    var max_width = (typeof options === 'object' &&
                     typeof options.max_width === 'number') ?
                     options.max_width : 0;
    var result = [];
    var header_exists = false;

    var pos = this.position;

    /* add the PGN header headerrmation */
    for (var i in this.headers) {
      /* TODO: order of enumerated properties in header object is not
       * guaranteed, see ECMA-262 spec (section 12.6.4)
       */
      result.push('[' + i + ' \"' + this.headers[i] + '\"]' + newline);
      header_exists = true;
    }

    if (header_exists && this.moveList.length) {
      result.push(newline);
    }

    this._undo_all();

    var moves = [];
    var move_string = '';
    var pgn_move_number = 1;

    /* build the list of moves.  a move_string looks like: "3. e3 e6" */
    for(var i = 0; i < this.moveList.length; i++) {
      var move = this.moveList[i].move;

      /* if the position started with black to move, start PGN with 1. ... */
      if (pgn_move_number === 1 && move.color === 'b') {
        move_string = '1. ...';
        pgn_move_number++;
      } else if (move.color === 'w') {
        /* store the previous generated move_string if we have one */
        if (move_string.length) {
          moves.push(move_string);
        }
        move_string = pgn_move_number + '.';
        pgn_move_number++;
      }

      move_string = move_string + ' ' + this.position.move_to_san(move);
      this.position.make_move(move);
    }

    /* are there any other leftover moves? */
    if (move_string.length) {
      moves.push(move_string);
    }

    /* is there a result? */
    if (typeof this.headers.Result !== 'undefined') {
      moves.push(this.headers.Result);
    }

    /* moveList should be back to what is was before we started generating PGN,
     * so join together moves
     */
    if (max_width === 0) {
      return result.join('') + moves.join(' ');
    }

    /* wrap the PGN output at max_width */
    var current_width = 0;
    for (var i = 0; i < moves.length; i++) {
      /* if the current move will push past max_width */
      if (current_width + moves[i].length > max_width && i !== 0) {

        /* don't end the line with whitespace */
        if (result[result.length - 1] === ' ') {
          result.pop();
        }

        result.push(newline);
        current_width = 0;
      } else if (i !== 0) {
        result.push(' ');
        current_width++;
      }
      result.push(moves[i]);
      current_width += moves[i].length;
    }

    return result.join('');
  };

  Chess.prototype.load_pgn = function(pgn, options) {
    var pos = this.position;

    var newline_char = (typeof options === 'object' &&
                        typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';

    this.reset();
    
    var parser = new PgnParser(newline_char);
    var lastMove = null,
        ended = false;
    try {
      parser.parse( pgn, function(evt, data) {
        switch(evt) {
        case 'header':
          this.headers[data.name] = data.value;
          break;
        case  'move':
          var move = this.position.move_from_san(trim(data));
            /* move not possible! (don't clear the board to examine to show the
             * latest valid position)
             */
          if (move == null) {
            throw new Error('Invalid move');
          } else {
            this._make_move(move);
          }
          lastMove = move;
          break;
        case  'score':
          if(!this.headers['Result']) this.headers['Result'] = data;
          break;
        case 'end':
          ended  = true;
          break;
        }
      }.bind(this));
    } catch(err){
      console.error(err);
      return false;
    }
    return ended;
  };

  Chess.prototype.header = function(args) {
    this._set_header(args);
  };

  Chess.prototype.ascii = function() {
    return this.position.ascii();
  };

  Chess.prototype.turn = function() {
    return this.position.turn;
  };

  Chess.prototype.move = function(move) {
    /* The move function can be called with in the following parameters:
     *
     * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
     *
     * .move({ from: 'h7', <- where the 'move' is a move object (additional
     *         to :'h8',      fields are ignored)
     *         promotion: 'q',
     *      })
     */
    var move_obj = this.position.to_move_obj(move);

    if (!move_obj) return null;

    /* need to make a copy of move because we can't generate SAN after the
     * move is made
     */
    var pretty_move = this.position.make_pretty(move_obj);

    this._make_move(move_obj);
    return pretty_move;
  };

  Chess.prototype.undo = function() {
    var move = this._undo_move();
    return (move) ? this.position.make_pretty(move) : null;
  };

  Chess.prototype.put = function(piece, square) {
    if( !this.position.put(piece, square) ) return false;
    this._update_setup(this.position.generate_fen());
    return true;
  };

  Chess.prototype.get = function(square) {
    return this.position.get(square);
  };

  Chess.prototype.remove = function(square) {
    var piece = this.position.remove(square);
    this._update_setup(this.position.generate_fen());
    return piece;
  };

  Chess.prototype.square_color = function(square) {
    return this.position.square_color(square);
  };

  Chess.prototype.history = function(options) {
    var pos = this.position;

    var move_history = [];
    var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                   options.verbose);

    this._undo_all();

    for(var i = 0; i < this.moveList.length; i++) {
      var move = this.moveList[i].move;
      if (verbose) {
        move_history.push(this.position.make_pretty(move));
      } else {
        move_history.push(this.position.move_to_san(move));
      }
      this.position.make_move(move);
    }

    return move_history;
  };

  /***************************************************************************
  * NON PUBLIC METHODS
  **************************************************************************/

  Chess.prototype._set_header = function(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
          typeof args[i + 1] === 'string') {
        this.headers[args[i]] = args[i + 1];
      }
    }
    return this.headers;
  };

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if moveList.length is zero, ie moves haven't been
   * made.
   */
  Chess.prototype._update_setup = function(fen) {
    if (this.moveList.length > 0) return;
    if (fen !== DEFAULT_POSITION) {
      this.headers['SetUp'] = fen;
      this.headers['FEN'] = '1';
    } else {
      delete this.headers['SetUp'];
      delete this.headers['FEN'];
    }
  };

  Chess.prototype._push = function(move) {
    var oldFields = this.position.cloneFields();
    this.moveList.push({
      move: move,
      prevFields: this.position.cloneFields()
    });
  };

  Chess.prototype._make_move = function(move) {
    this._push(move);
    this.position.make_move(move);
  };

  Chess.prototype._undo_move = function() {
    var pos = this.position;
    var old = this.moveList.pop();
    if (old == null) { return null; }

    var move = old.move;

    return pos.undo_move(old.move, old.prevFields);
  };

  Chess.prototype._undo_all = function() {
    for(var i= this.moveList.length -1; i >= 0; i--){
      var moveRecord = this.moveList[i];
      this.position.undo_move(moveRecord.move, moveRecord.prevFields);
    }
  };

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/

  Chess.prototype._perft = function(depth) {
    var moves = this.position.generate_moves({legal: false});
    var nodes = 0;
    var color = this.position.turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      this._make_move(moves[i]);
      if (!this.position._king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = this._perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      this._undo_move();
    }

    return nodes;
  };

  /* export Chess object if using node or any other CommonJS compatible
   * environment */
  if (typeof exports !== 'undefined') {
    exports.Chess = Chess;
    exports.PgnParser = PgnParser;
  }
  if (typeof window !== 'undefined') {
    window.Chess = Chess;
    window.PgnParser = PgnParser;
  }
})();

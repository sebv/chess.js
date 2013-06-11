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

  var DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

  var POSSIBLE_RESULTS = ['1-0', '0-1', '1/2-1/2', '*'];

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15]
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14,  18, 33, 31,  14],
    b: [-17, -15,  17,  15],
    r: [-16,   1,  16,  -1],
    q: [-17, -16, -15,   1,  17, 16, 15,  -1],
    k: [-17, -16, -15,   1,  17, 16, 15,  -1]
  };

  var ATTACKS, RAYS;
  (function() {
    /* jshint indent: false */
    ATTACKS = [
      20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
       0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
       0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
       0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
       0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
      24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
       0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
       0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
       0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
       0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
       0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
      20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
    ];

    RAYS = [
       17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
        0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
        0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
        0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
        0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
        1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
        0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
        0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
        0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
        0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
        0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
      -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
    ];
  })();

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

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

  var RANK_1 = 7;
  var RANK_2 = 6;
  var RANK_3 = 5;
  var RANK_4 = 4;
  var RANK_5 = 3;
  var RANK_6 = 2;
  var RANK_7 = 1;
  var RANK_8 = 0;

  var SQUARES;
  (function() {
    /* jshint indent: false */
    SQUARES = {
      a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
      a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
      a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
      a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
      a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
      a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
      a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
      a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
    };
  })();

  var ROOKS = {
    w: [{square: SQUARES.a1, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h1, flag: BITS.KSIDE_CASTLE}],
    b: [{square: SQUARES.a8, flag: BITS.QSIDE_CASTLE},
        {square: SQUARES.h8, flag: BITS.KSIDE_CASTLE}]
  };

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
    return 'abcdefgh'.substring(f,f+1) + '87654321'.substring(r,r+1);
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

  var Chess = function(fen) {

    var position = {
      board: new Array(128),
      kings: {w: EMPTY, b: EMPTY},
      turn: WHITE,
      castling: {w: 0, b: 0},
      ep_square: EMPTY,
      half_moves: 0,
      move_number: 1,
      history: [],
      header: {}
    };

    this._pos = function() {return position;};

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
  Chess.SQUARES = (function() {
              /* from the ECMA-262 spec (section 12.6.4):
               * "The mechanics of enumerating the properties ... is
               * implementation dependent"
               * so: for (var sq in SQUARES) { keys.push(sq); } might not be
               * ordered correctly
               */
              var keys = [];
              for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
                if (i & 0x88) { i += 7; continue; }
                keys.push(algebraic(i));
              }
              return keys;
            })();
  Chess.FLAGS = FLAGS;

  /***************************************************************************
  * PUBLIC API
  **************************************************************************/

  Chess.prototype.load = function(fen) {
    var pos = this._pos();
    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    var square = 0;
    var valid = SYMBOLS + '12345678/';

    if (!this.validate_fen(fen).valid) {
      return false;
    }

    this.clear();

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);

      if (piece === '/') {
        square += 8;
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
      } else {
        var color = (piece < 'a') ? WHITE : BLACK;
        this.put({type: piece.toLowerCase(), color: color}, algebraic(square));
        square++;
      }
    }

    pos.turn = tokens[1];

    if (tokens[2].indexOf('K') > -1) {
      pos.castling.w |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('Q') > -1) {
      pos.castling.w |= BITS.QSIDE_CASTLE;
    }
    if (tokens[2].indexOf('k') > -1) {
      pos.castling.b |= BITS.KSIDE_CASTLE;
    }
    if (tokens[2].indexOf('q') > -1) {
      pos.castling.b |= BITS.QSIDE_CASTLE;
    }

    pos.ep_square = (tokens[3] === '-') ? EMPTY : SQUARES[tokens[3]];
    pos.half_moves = parseInt(tokens[4], 10);
    pos.move_number = parseInt(tokens[5], 10);

    this._update_setup(this._generate_fen());

    return true;
  };

  Chess.prototype.reset = function() {
    this.load(DEFAULT_POSITION);
  };

  Chess.prototype.moves = function(options) {
    /* The internal representation of a chess move is in 0x88 format, and
     * not meant to be human-readable.  The code below converts the 0x88
     * square coordinates to algebraic coordinates.  It also prunes an
     * unnecessary move keys resulting from a verbose call.
     */

    var ugly_moves = this._generate_moves(options);
    var moves = [];

    for (var i = 0, len = ugly_moves.length; i < len; i++) {

      /* does the user want a full move object (most likely not), or just
       * SAN
       */
      if (typeof options !== 'undefined' && 'verbose' in options &&
          options.verbose) {
        moves.push(this._make_pretty(ugly_moves[i]));
      } else {
        moves.push(this._move_to_san(ugly_moves[i]));
      }
    }

    return moves;
  };

  Chess.prototype.in_check = function() {
    return this._king_attacked(this._pos().turn);
  };

  Chess.prototype.in_checkmate = function() {
    return this.in_check() && this._generate_moves().length === 0;
  };

  Chess.prototype.in_stalemate = function() {
    return !this.in_check() && this._generate_moves().length === 0;
  };

  Chess.prototype.in_draw = function() {
    return this._pos().half_moves >= 100 ||
           this.in_stalemate() ||
           this.insufficient_material() ||
           this.in_threefold_repetition();
  };

  Chess.prototype.insufficient_material = function() {
    var pieces = {};
    var bishops = [];
    var num_pieces = 0;
    var sq_color = 0;
    var pos = this._pos();
    for (var i = SQUARES.a8; i<= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) { i += 7; continue; }

      var piece = pos.board[i];
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

  Chess.prototype.in_threefold_repetition = function() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the _make_move/_undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = this._undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = this._generate_fen().split(' ').slice(0,4).join(' ');

      /* has the position occurred three or move times */
      positions[fen] = (fen in positions) ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      this._make_move(moves.pop());
    }

    return repetition;
  };

  Chess.prototype.game_over = function() {
    return this._pos().half_moves >= 100 ||
           this.in_checkmate() ||
           this.in_stalemate() ||
           this.insufficient_material() ||
           this.in_threefold_repetition();
  };

  Chess.prototype.validate_fen = function(fen) {
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

  Chess.prototype.fen = function() {
    return this._generate_fen(arguments);
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

    var pos = this._pos();

    /* add the PGN header headerrmation */
    for (var i in pos.header) {
      /* TODO: order of enumerated properties in header object is not
       * guaranteed, see ECMA-262 spec (section 12.6.4)
       */
      result.push('[' + i + ' \"' + pos.header[i] + '\"]' + newline);
      header_exists = true;
    }

    if (header_exists && pos.history.length) {
      result.push(newline);
    }

    /* pop all of history onto reversed_history */
    var reversed_history = [];
    while (pos.history.length > 0) {
      reversed_history.push(this._undo_move());
    }

    var moves = [];
    var move_string = '';
    var pgn_move_number = 1;

    /* build the list of moves.  a move_string looks like: "3. e3 e6" */
    while (reversed_history.length > 0) {
      var move = reversed_history.pop();

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

      move_string = move_string + ' ' + this._move_to_san(move);
      this._make_move(move);
    }

    /* are there any other leftover moves? */
    if (move_string.length) {
      moves.push(move_string);
    }

    /* is there a result? */
    if (typeof pos.header.Result !== 'undefined') {
      moves.push(pos.header.Result);
    }

    /* history should be back to what is was before we started generating PGN,
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
    function mask(str) {
      return str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    }

    function has_keys(object) {
      var has_keys = false;
      for (var key in object) {
        has_keys = true;
      }
      return has_keys;
    }

    function parse_pgn_header(header, options) {
      var newline_char = (typeof options === 'object' &&
                          typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';
      var header_obj = {};
      var headers = header.split(newline_char);
      var key = '';
      var value = '';

      for (var i = 0; i < headers.length; i++) {
        key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1');
        value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\]$/, '$1');
        if (trim(key).length > 0) {
          header_obj[key] = value;
        }
      }

      return header_obj;
    }

    var pos = this._pos();

    var newline_char = (typeof options === 'object' &&
                        typeof options.newline_char === 'string') ?
                          options.newline_char : '\r?\n';
    var regex = new RegExp('^(\\[(.|' + mask(newline_char) + ')*\\])' +
                           '(' + mask(newline_char) + ')*' +
                           '1.(' + mask(newline_char) + '|.)*$', 'g');

    /* get header part of the PGN file */
    var header_string = pgn.replace(regex, '$1');

    /* no info part given, begins with moves */
    if (header_string[0] !== '[') {
      header_string = '';
    }

    this.reset();

    /* parse PGN header */
    var headers = parse_pgn_header(header_string, options);
    for (var key in headers) {
      this._set_header([key, headers[key]]);
    }

    /* delete header to get the moves */
    var ms = pgn.replace(header_string, '').replace(new RegExp(mask(newline_char), 'g'), ' ');

    /* delete comments */
    ms = ms.replace(/(\{[^}]+\})+?/g, '');

    /* delete move numbers */
    ms = ms.replace(/\d+\./g, '');


    /* trim and get array of moves */
    var moves = trim(ms).split(new RegExp(/\s+/));

    /* delete empty entries */
    moves = moves.join(',').replace(/,,+/g, ',').split(',');
    var move = '';

    for (var half_move = 0; half_move < moves.length - 1; half_move++) {
      move = this._move_from_san(trim(moves[half_move]));

      /* move not possible! (don't clear the board to examine to show the
       * latest valid position)
       */
      if (move == null) {
        return false;
      } else {
        this._make_move(move);
      }
    }

    /* examine last move */
    move = moves[moves.length - 1];
    if (POSSIBLE_RESULTS.indexOf(move) > -1) {
      if (has_keys(pos.header) && typeof pos.header.Result === 'undefined') {
        this._set_header(['Result', move]);
      }
    }
    else {
      move = this._move_from_san(trim(move));
      if (move == null) {
        return false;
      } else {
        this._make_move(move);
      }
    }
    return true;
  };

  Chess.prototype.header = function(args) {
    this._set_header(args);
  };

  Chess.prototype.ascii = function() {
    var s = '   +------------------------+\n';
    var pos = this._pos();
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |';
      }

      /* empty piece */
      if (pos.board[i] == null) {
        s += ' . ';
      } else {
        var piece = pos.board[i].type;
        var color = pos.board[i].color;
        var symbol = (color === WHITE) ?
                     piece.toUpperCase() : piece.toLowerCase();
        s += ' ' + symbol + ' ';
      }

      if ((i + 1) & 0x88) {
        s += '|\n';
        i += 8;
      }
    }
    s += '   +------------------------+\n';
    s += '     a  b  c  d  e  f  g  h\n';

    return s;
  };

  Chess.prototype.turn = function() {
    return this._pos().turn;
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
    var move_obj = null;
    var moves = this._generate_moves();

    if (typeof move === 'string') {
      /* convert the move string to a move object */
      for (var i = 0, len = moves.length; i < len; i++) {
        if (move === this._move_to_san(moves[i])) {
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

    /* failed to find move */
    if (!move_obj) {
      return null;
    }

    /* need to make a copy of move because we can't generate SAN after the
     * move is made
     */
    var pretty_move = this._make_pretty(move_obj);

    this._make_move(move_obj);

    return pretty_move;
  };

  Chess.prototype.undo = function() {
    var move = this._undo_move();
    return (move) ? this._make_pretty(move) : null;
  };

  Chess.prototype.clear = function() {
    var pos = this._pos();
    pos.board = new Array(128);
    pos.kings = {w: EMPTY, b: EMPTY};
    pos.turn = WHITE;
    pos.castling = {w: 0, b: 0};
    pos.ep_square = EMPTY;
    pos.half_moves = 0;
    pos.move_number = 1;
    pos.history = [];
    pos.header = {};
    this._update_setup(this._generate_fen());
  };

  Chess.prototype.put = function(piece, square) {
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
    this._pos().board[sq] = {type: piece.type, color: piece.color};
    if (piece.type === KING) {
      this._pos().kings[piece.color] = sq;
    }

    this._update_setup(this._generate_fen());

    return true;
  };

  Chess.prototype.get = function(square) {
    var piece = this._pos().board[SQUARES[square]];
    return (piece) ? {type: piece.type, color: piece.color} : null;
  };

  Chess.prototype.remove = function(square) {
    var piece = this.get(square);
    this._pos().board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      this._pos().kings[piece.color] = EMPTY;
    }

    this._update_setup(this._generate_fen());

    return piece;
  };

  Chess.prototype.square_color = function(square) {
    if (square in SQUARES) {
      var sq_0x88 = SQUARES[square];
      return ((rank(sq_0x88) + file(sq_0x88)) % 2 === 0) ? 'light' : 'dark';
    }

    return null;
  };

  Chess.prototype.history = function(options) {
    var pos = this._pos();
    var reversed_history = [];
    var move_history = [];
    var verbose = (typeof options !== 'undefined' && 'verbose' in options &&
                   options.verbose);

    while (pos.history.length > 0) {
      reversed_history.push(this._undo_move());
    }

    while (reversed_history.length > 0) {
      var move = reversed_history.pop();
      if (verbose) {
        move_history.push(this._make_pretty(move));
      } else {
        move_history.push(this._move_to_san(move));
      }
      this._make_move(move);
    }

    return move_history;
  };

  /***************************************************************************
  * NON PUBLIC METHODS
  **************************************************************************/

  Chess.prototype._generate_fen = function() {
    var empty = 0;
    var fen = '';
    var pos = this._pos();
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (pos.board[i] == null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = pos.board[i].color;
        var piece = pos.board[i].type;

        fen += (color === WHITE) ?
                 piece.toUpperCase() : piece.toLowerCase();
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.h1) {
          fen += '/';
        }

        empty = 0;
        i += 8;
      }
    }

    var cflags = '';
    if (pos.castling[WHITE] & BITS.KSIDE_CASTLE) { cflags += 'K'; }
    if (pos.castling[WHITE] & BITS.QSIDE_CASTLE) { cflags += 'Q'; }
    if (pos.castling[BLACK] & BITS.KSIDE_CASTLE) { cflags += 'k'; }
    if (pos.castling[BLACK] & BITS.QSIDE_CASTLE) { cflags += 'q'; }

    /* do we have an empty castling flag? */
    cflags = cflags || '-';
    var epflags = (pos.ep_square === EMPTY) ? '-' : algebraic(pos.ep_square);

    return [fen, pos.turn, cflags, epflags, pos.half_moves, pos.move_number].join(' ');
  };

  Chess.prototype._set_header = function(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' &&
          typeof args[i + 1] === 'string') {
        this._pos().header[args[i]] = args[i + 1];
      }
    }
    return this._pos().header;
  };

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  Chess.prototype._update_setup = function(fen) {
    var pos = this._pos();
    if (pos.history.length > 0) return;
    if (fen !== DEFAULT_POSITION) {
      pos.header['SetUp'] = fen;
      pos.header['FEN'] = '1';
    } else {
      delete pos.header['SetUp'];
      delete pos.header['FEN'];
    }
  };

  Chess.prototype._build_move = function(board, from, to, flags, promotion) {
    var move = {
      color: this._pos().turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    } else if (flags & BITS.EP_CAPTURE) {
      move.captured = PAWN;
    }
    return move;
  };

  Chess.prototype._generate_moves = function(options) {
    this.add_move = function(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (board[from].type === PAWN &&
      (rank(to) === RANK_8 || rank(to) === RANK_1)) {
        var pieces = [QUEEN, ROOK, BISHOP, KNIGHT];
        for (var i = 0, len = pieces.length; i < len; i++) {
          moves.push(this._build_move(board, from, to, flags, pieces[i]));
        }
      } else {
        moves.push(this._build_move(board, from, to, flags));
      }
    };

    var pos = this._pos();
    var moves = [];
    var us = pos.turn;
    var them = swap_color(us);
    var second_rank = {b: RANK_7, w: RANK_2};

    var first_sq = SQUARES.a8;
    var last_sq = SQUARES.h1;
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

      var piece = pos.board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        if (pos.board[square] == null) {
          this.add_move(pos.board, moves, i, square, BITS.NORMAL);

          /* double square */
          var square = i + PAWN_OFFSETS[us][1];
          if (second_rank[us] === rank(i) && pos.board[square] == null) {
            this.add_move(pos.board, moves, i, square, BITS.BIG_PAWN);
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;

          if (pos.board[square] != null &&
          pos.board[square].color === them) {
            this.add_move(pos.board, moves, i, square, BITS.CAPTURE);
          } else if (square === pos.ep_square) {
            this.add_move(pos.board, moves, i, pos.ep_square, BITS.EP_CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            if (pos.board[square] == null) {
              this.add_move(pos.board, moves, i, square, BITS.NORMAL);
            } else {
              if (pos.board[square].color === us) break;
              this.add_move(pos.board, moves, i, square, BITS.CAPTURE);
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
    if ((!single_square) || last_sq === pos.kings[us]) {
      /* king-side castling */
      if (pos.castling[us] & BITS.KSIDE_CASTLE) {
        var castling_from = pos.kings[us];
        var castling_to = castling_from + 2;

        if (pos.board[castling_from + 1] == null &&
            pos.board[castling_to]       == null &&
            !this._attacked(them, pos.kings[us]) &&
            !this._attacked(them, castling_from + 1) &&
            !this._attacked(them, castling_to)) {
          this.add_move(pos.board, moves, pos.kings[us] , castling_to,
                   BITS.KSIDE_CASTLE);
        }
      }

      /* queen-side castling */
      if (pos.castling[us] & BITS.QSIDE_CASTLE) {
        var castling_from = pos.kings[us];
        var castling_to = castling_from - 2;

        if (pos.board[castling_from - 1] == null &&
            pos.board[castling_from - 2] == null &&
            pos.board[castling_from - 3] == null &&
            !this._attacked(them, pos.kings[us]) &&
            !this._attacked(them, castling_from - 1) &&
            !this._attacked(them, castling_to)) {
          this.add_move(pos.board, moves, pos.kings[us], castling_to,
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
      this._make_move(moves[i]);
      if (!this._king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      this._undo_move();
    }

    return legal_moves;
  };

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   */
  Chess.prototype._move_to_san = function(move) {
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

    this._make_move(move);
    if (this.in_check()) {
      if (this.in_checkmate()) {
        output += '#';
      } else {
        output += '+';
      }
    }
    this._undo_move();

    return output;
  };

  /* convert a move from Standard Algebraic Notation (SAN) to 0x88
   * coordinates
  */
  Chess.prototype._move_from_san = function(move) {
    var to, from, flags = BITS.NORMAL, promotion;
    var parse = move.match(/^([NBKRQ])?([abcdefgh12345678][12345678]?)?(x)?([abcdefgh][12345678])(=?[NBRQ])?/);

    var pos = this._pos();
    if (move.slice(0, 5) === 'O-O-O') {
      from = pos.kings[pos.turn];
      to = from - 2;
      flags = BITS.QSIDE_CASTLE;
    } else if (move.slice(0, 3) === 'O-O') {
      from = pos.kings[pos.turn];
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

          var b = pos.board[square];
          if (b) {
            if (b.color === pos.turn && b.type === piece && (!parse[2] || algebraic(square).indexOf(parse[2]) >= 0)) {
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
          var square = to - PAWN_OFFSETS[pos.turn][j];
          if (square & 0x88) continue;

          if (pos.board[square] != null &&
              pos.board[square].color === pos.turn &&
              algebraic(square)[0] === parse[2]) {
            from = square;
          }
        }
        if (pos.board[to]) {
          flags = BITS.CAPTURE;
        } else {
          flags = BITS.EP_CAPTURE;
        }
      } else {
        // normal move
        to = SQUARES[move.slice(0,2)];
        var c = to - PAWN_OFFSETS[pos.turn][0],
            b = pos.board[c];
        if (b && b.type === PAWN && b.color === pos.turn) {
          from = c;
        } else {
          c = to - PAWN_OFFSETS[pos.turn][1];
          b = pos.board[c];
          if (b && b.type === PAWN && b.color === pos.turn) {
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
      return this._build_move(pos.board, from, to, flags, promotion);
    } else if (move.length > 0) {
      /* alert(move); // error in PGN, or in parsing. */
    }
  };

  Chess.prototype._attacked = function(color, square) {
    var board = this._pos().board;
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) { i += 7; continue; }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue;

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
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
          if (board[j] != null) { blocked = true; break; }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  };

  Chess.prototype._king_attacked = function(color) {
    return this._attacked(swap_color(color), this._pos().kings[color]);
  };



  Chess.prototype._push = function(move) {
    var pos = this._pos();
    pos.history.push({
      move: move,
      kings: {b: pos.kings.b, w: pos.kings.w},
      turn: pos.turn,
      castling: {b: pos.castling.b, w: pos.castling.w},
      ep_square: pos.ep_square,
      half_moves: pos.half_moves,
      move_number: pos.move_number
    });
  };

  Chess.prototype._make_move = function(move) {
    var pos = this._pos();
    var us = pos.turn;
    var them = swap_color(us);
    this._push(move);

    pos.board[move.to] = pos.board[move.from];
    pos.board[move.from] = null;

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (pos.turn === BLACK) {
        pos.board[move.to - 16] = null;
      } else {
        pos.board[move.to + 16] = null;
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      pos.board[move.to] = {type: move.promotion, color: us};
    }

    /* if we moved the king */
    if (pos.board[move.to].type === KING) {
      pos.kings[pos.board[move.to].color] = move.to;

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1;
        var castling_from = move.to + 1;
        pos.board[castling_to] = pos.board[castling_from];
        pos.board[castling_from] = null;
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1;
        var castling_from = move.to - 2;
        pos.board[castling_to] = pos.board[castling_from];
        pos.board[castling_from] = null;
      }

      /* turn off castling */
      pos.castling[us] = '';
    }

    /* turn off castling if we move a rook */
    if (pos.castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (move.from === ROOKS[us][i].square &&
            pos.castling[us] & ROOKS[us][i].flag) {
          pos.castling[us] ^= ROOKS[us][i].flag;
          break;
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (pos.castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (move.to === ROOKS[them][i].square &&
            pos.castling[them] & ROOKS[them][i].flag) {
          pos.castling[them] ^= ROOKS[them][i].flag;
          break;
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (pos.turn === 'b') {
        pos.ep_square = move.to - 16;
      } else {
        pos.ep_square = move.to + 16;
      }
    } else {
      pos.ep_square = EMPTY;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      pos.half_moves = 0;
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      pos.half_moves = 0;
    } else {
      pos.half_moves++;
    }

    if (pos.turn === BLACK) {
      pos.move_number++;
    }
    pos.turn = swap_color(pos.turn);
  };

  Chess.prototype._undo_move = function() {
    var pos = this._pos();
    var old = pos.history.pop();
    if (old == null) { return null; }

    var move = old.move;
    pos.kings = old.kings;
    pos.turn = old.turn;
    pos.castling = old.castling;
    pos.ep_square = old.ep_square;
    pos.half_moves = old.half_moves;
    pos.move_number = old.move_number;

    var us = pos.turn;
    var them = swap_color(pos.turn);

    pos.board[move.from] = pos.board[move.to];
    pos.board[move.from].type = move.piece;  // to undo any promotions
    pos.board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      pos.board[move.to] = {type: move.captured, color: them};
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index;
      if (us === BLACK) {
        index = move.to - 16;
      } else {
        index = move.to + 16;
      }
      pos.board[index] = {type: PAWN, color: them};
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

      pos.board[castling_to] = pos.board[castling_from];
      pos.board[castling_from] = null;
    }

    return move;
  };

  /* this function is used to uniquely identify ambiguous moves */
  Chess.prototype._get_disambiguator = function(move) {
    var moves = this._generate_moves();

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

  /* pretty = external move object */
  Chess.prototype._make_pretty = function(ugly_move) {
    var move = clone(ugly_move);
    move.san = this._move_to_san(move);
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

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/

  Chess.prototype._perft = function(depth) {
    var moves = this._generate_moves({legal: false});
    var nodes = 0;
    var color = this._pos().turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      this._make_move(moves[i]);
      if (!this._king_attacked(color)) {
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
  if (typeof exports !== 'undefined') exports.Chess = Chess;
})();


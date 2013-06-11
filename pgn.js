'use strict';

var PgnParser = function(cb) {
	this.emit = function (evt, data) {
		cb(evt,data);
	};
};

PgnParser.prototype.parse = function(pgn) {
	// extracting pgn sections
	pgn = pgn.trim();
	var regex = /^((?:\[.*\]\n)*)((?:\{.*\}\n)?\n1\.(?:.*\n)*)(.*)$/;
	var matches = pgn.match(regex);
	var headersAsString = matches[1].trim();
	var moveListAsString = matches[2].trim();
	var score = matches[3].trim();

	if(!moveListAsString)
		throw new Error('Invalid pgn file, cannot extract move list');
	if(!score)
		throw new Error('Invalid pgn file, no score');

	if(headersAsString){
		// parsing headers
		var headerRegex = /(\[(\w+)\s+\"(.*)\"\])/g;
		var headers = {};
		while ((matches = headerRegex.exec(headersAsString)) !== null)
		{
			headers[matches[2]] = matches[3];
			this.emit('header',{name:matches[2], value:matches[3]});
		}
	}

	// parsing movelist
	var moveListRegex = /\s+|(\d+)\.+|\$(\d+)|([\w\-]+)|\{(.*?)\}|(\()|(\))/g;
	while ((matches = moveListRegex.exec( moveListAsString)) !== null)
	{
		//console.log(matches[0]);
		var idx = 1;
		if (matches[idx]){
			this.emit('move-num',matches[idx]);
		}
		idx++;
		if (matches[idx]){
			this.emit('nag',matches[idx]);
		}
		idx++;
		if (matches[idx]){
			this.emit('move',matches[idx]);
		}
		idx++;
		if (matches[idx]){
			this.emit('comment',matches[idx]);
		}
		idx++;
		if (matches[idx]){
			this.emit('variation-start');
		}
		idx++;
		if (matches[idx]){
			this.emit('variation-end');
		}
	}

	this.emit('score', score);
};

if (typeof exports !== 'undefined') exports.PgnParser = PgnParser;

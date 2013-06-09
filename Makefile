test:
	./node_modules/.bin/mocha -u tdd -s 0 --reporter spec tests/tests.js

min:
	./node_modules/.bin/uglifyjs chess.js -m -c > chess.min.js

.PHONY: test

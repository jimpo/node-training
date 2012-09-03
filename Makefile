MOCHA_OPTS=--reporter nyan --require test/common
UNIT_TEST_FILES=$(shell find test/unit/ -name '*.js')

install:
	@npm install

test: test-unit

test-unit:
	@NODE_ENV=test NODE_PATH=./lib ./node_modules/.bin/mocha \
		$(MOCHA_OPTS) $(UNIT_TEST_FILES)

.PHONY: install test test-unit

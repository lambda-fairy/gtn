'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var intro = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(g) {
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return g.say('Welcome to the Number Guessing Game!');

          case 2:
            _context2.next = 4;
            return g.say('I\'m thinking of a number from 1 through 100.');

          case 4:
            _context2.next = 6;
            return start(g);

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function intro(_x4) {
    return _ref2.apply(this, arguments);
  };
}();

var start = function () {
  var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(g) {
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return loop(g, { low: 1, high: 100, chances: 5 });

          case 2:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function start(_x5) {
    return _ref3.apply(this, arguments);
  };
}();

var loop = function () {
  var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(g, _ref4) {
    var low = _ref4.low,
        high = _ref4.high,
        chances = _ref4.chances;
    var guess, options, actual;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            g.setChances(chances);

            if (!chances) {
              _context4.next = 21;
              break;
            }

            _context4.next = 4;
            return g.ask('What is your guess?');

          case 4:
            guess = _context4.sent;

            // We can either respond "too high" or "too low".
            // But we don't want to put ourselves in a tight spot.
            // For example, if the user guesses 99 on their first turn, we don't
            // want to say "too low"; because then they'll win on the next turn.
            // So we first do some arithmetic to determine which of the two choices
            // are safe.
            options = [];

            if (guessesNeeded(low, guess - 1) >= chances - 1) options.push('toohigh');
            if (guessesNeeded(guess + 1, high) >= chances - 1) options.push('toolow');
            _context4.t0 = g.random.choice(options);
            _context4.next = _context4.t0 === 'toohigh' ? 11 : _context4.t0 === 'toolow' ? 15 : 19;
            break;

          case 11:
            _context4.next = 13;
            return g.say('Too high!');

          case 13:
            _context4.next = 15;
            return loop(g, {
              low: low,
              high: Math.min(high, guess - 1),
              chances: chances - 1
            });

          case 15:
            _context4.next = 17;
            return g.say('Too low!');

          case 17:
            _context4.next = 19;
            return loop(g, {
              low: Math.max(low, guess + 1),
              high: high,
              chances: chances - 1
            });

          case 19:
            _context4.next = 29;
            break;

          case 21:
            g.recordLoss();
            actual = g.random.randint(low, high);
            _context4.next = 25;
            return g.say('The number was actually... ' + actual + '!');

          case 25:
            _context4.next = 27;
            return g.gameOver('Would you like to play again?');

          case 27:
            _context4.next = 29;
            return start(g);

          case 29:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function loop(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
}();

// Calculate the minimum number of bisections needed to reduce [low, high] down
// to a single element.
//
// Returns -1 when high < low.


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function findLocalStorage() {
  var _arr = ['localStorage', 'sessionStorage'];

  for (var _i = 0; _i < _arr.length; _i++) {
    var type = _arr[_i];
    try {
      var storage = window[type];
      var x = 'gtnStorageTest';
      storage.setItem(x, x);
      storage.removeItem(x);
      return storage;
    } catch (e) {}
  }
  return null;
}

var Journal = function () {
  function Journal(storage) {
    _classCallCheck(this, Journal);

    this.storage = storage || findLocalStorage();
    this.rewind();
  }

  _createClass(Journal, [{
    key: 'rewind',
    value: function rewind() {
      this.journal = [];
      this.index = 0;
      var data = null;
      try {
        data = JSON.parse(this.storage.getItem('gtnJournal'));
      } catch (e) {
        console.error('Error while loading game: ' + e);
      }
      if (Array.isArray(data)) {
        this.journal = data;
      } else {
        console.log('No save data found; starting new game');
      }
    }
  }, {
    key: 'save',
    value: function save() {
      try {
        this.storage.setItem('gtnJournal', JSON.stringify(this.journal));
      } catch (e) {
        console.error('Error while saving game: ' + e);
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      try {
        this.journal = [];
        this.storage.removeItem('gtnJournal');
      } catch (e) {
        console.error('Error while resetting game: ' + e);
      }
    }
  }, {
    key: '_read',
    value: function _read(label, args) {
      // Try to replay an entry from the journal
      var entry = this.journal[this.index];
      if (entry) {
        if (entry.label === label && JSON.stringify(entry.args) === JSON.stringify(args)) {
          // Return the pre-computed result
          ++this.index;
          return entry;
        } else {
          // There's an entry here, but it doesn't match our game logic!
          // Log the issue and keep going...
          console.error('Invalid log! Expected ' + label + '(' + args + ') but got ' + entry.label + '(' + entry.args + ')');
          // Delete all entries since we know they're wrong
          this.reset();
          location.reload();
        }
      }
      return null;
    }
  }, {
    key: '_write',
    value: function _write(label, args, result) {
      // Write an entry to the journal
      this.journal[this.index] = { label: label, args: args, result: result };
      ++this.index;
      this.save();
    }
  }, {
    key: 'record',
    value: function record(label, args, callback) {
      var entry = this._read(label, args);
      if (entry) {
        return entry.result;
      } else {
        var result = callback();
        this._write(label, args, result);
        return result;
      }
    }
  }, {
    key: 'promise',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(label, args, callback) {
        var entry, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                entry = this._read(label, args);

                if (!entry) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return', entry.result);

              case 5:
                _context.next = 7;
                return new Promise(callback);

              case 7:
                result = _context.sent;

                this._write(label, args, result);
                return _context.abrupt('return', result);

              case 10:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function promise(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
      }

      return promise;
    }()
  }]);

  return Journal;
}();

var Random = function () {
  function Random(journal) {
    _classCallCheck(this, Random);

    this.journal = journal;
  }

  _createClass(Random, [{
    key: 'choice',
    value: function choice(items) {
      return this.journal.record('choice', [items], function () {
        return items[Math.floor(items.length * Math.random())];
      });
    }
  }, {
    key: 'randint',
    value: function randint(low, high) {
      return this.journal.record('randint', [low, high], function () {
        return Math.floor((high - low + 1) * Math.random() + low);
      });
    }
  }]);

  return Random;
}();

var GuessTheNumber = function () {
  function GuessTheNumber(journal, root, mouthAnimator, chancesContainer, chancesText, lossesContainer, lossesText, dialogText, dialogOk, inputForm, inputText, playAgainButton) {
    _classCallCheck(this, GuessTheNumber);

    this.journal = journal;
    this.root = root;
    this.mouthAnimator = mouthAnimator;
    this.chancesContainer = chancesContainer;
    this.chancesText = chancesText;
    this.lossesContainer = lossesContainer;
    this.lossesText = lossesText;
    this.dialogText = dialogText;
    this.dialogOk = dialogOk;
    this.inputForm = inputForm;
    this.inputText = inputText;
    this.playAgainButton = playAgainButton;
    this.setChances(null);
    this.losses = 0;
    this.random = new Random(journal);
  }

  _createClass(GuessTheNumber, [{
    key: 'startDialog',
    value: function startDialog(text) {
      var _this = this;

      this.dialogText.textContent = text;
      this.mouthAnimator.start();
      setTimeout(function () {
        return _this.mouthAnimator.stop();
      }, 50 * text.length);
    }
  }, {
    key: 'setChances',
    value: function setChances(chances) {
      if (chances === null) {
        this.chancesContainer.style.display = 'none';
      } else {
        this.chancesContainer.style.display = 'block';
        this.chancesText.textContent = chances;
      }
    }
  }, {
    key: 'recordLoss',
    value: function recordLoss() {
      ++this.losses;
      this.lossesContainer.style.display = 'block';
      this.lossesText.textContent = this.losses;
    }
  }, {
    key: 'say',
    value: function say(text) {
      var _this2 = this;

      return this.journal.promise('say', [text], function (resolve) {
        _this2.startDialog(text);
        _this2.dialogOk.style.display = 'block';
        _this2.dialogOk.focus();
        var handleDialog = function handleDialog() {
          _this2.dialogOk.style.display = 'none';
          _this2.dialogOk.removeEventListener('click', handleDialog);
          resolve();
        };
        _this2.dialogOk.addEventListener('click', handleDialog);
      });
    }
  }, {
    key: 'ask',
    value: function ask(question) {
      var _this3 = this;

      return this.journal.promise('ask', [question], function (resolve) {
        _this3.startDialog(question);
        _this3.inputForm.style.display = 'block';
        _this3.inputText.value = '';
        _this3.inputText.focus();
        var handleInput = function handleInput(e) {
          e.preventDefault();
          var guess = parseInt(_this3.inputText.value, 10);
          if (isNaN(guess) || guess < 1 || guess > 100) return;
          _this3.inputForm.style.display = 'none';
          _this3.inputForm.removeEventListener('submit', handleInput);
          resolve(guess);
        };
        _this3.inputForm.addEventListener('submit', handleInput);
      });
    }
  }, {
    key: 'gameOver',
    value: function gameOver(taunt) {
      var _this4 = this;

      return this.journal.promise('gameOver', [taunt], function (resolve) {
        _this4.startDialog(taunt);
        _this4.playAgainButton.style.display = 'block';
        _this4.playAgainButton.focus();
        var handlePlayAgain = function handlePlayAgain(e) {
          _this4.playAgainButton.style.display = 'none';
          _this4.playAgainButton.removeEventListener('click', handlePlayAgain);
          resolve();
        };
        _this4.playAgainButton.addEventListener('click', handlePlayAgain);
      });
    }
  }]);

  return GuessTheNumber;
}();

var MouthAnimator = function () {
  function MouthAnimator(mouth) {
    var _this5 = this;

    _classCallCheck(this, MouthAnimator);

    this.mouth = mouth;
    this.semaphore = 0;
    this.mouth.addEventListener('animationiteration', function () {
      if (_this5.semaphore <= 0) _this5.mouth.classList.remove('mouth-moving');
    });
  }

  // Start the animation, if it's not running already.


  _createClass(MouthAnimator, [{
    key: 'start',
    value: function start() {
      ++this.semaphore;
      if (this.semaphore > 0) this.mouth.classList.add('mouth-moving');
    }

    // Stop the animation before the next cycle.

  }, {
    key: 'stop',
    value: function stop() {
      --this.semaphore;
    }
  }]);

  return MouthAnimator;
}();

window.addEventListener('load', function () {
  var journal = new Journal();
  var root = document.getElementById('main');
  var mouth = document.getElementById('face').contentDocument.getElementById('mouth');
  var mouthAnimator = new MouthAnimator(mouth);
  var chancesContainer = document.getElementById('chances');
  var chancesText = document.getElementById('chances-text');
  var lossesContainer = document.getElementById('losses');
  var lossesText = document.getElementById('losses-text');
  var dialogText = document.getElementById('dialog-text');
  var dialogOk = document.getElementById('dialog-ok');
  var inputForm = document.getElementById('input');
  var inputText = document.getElementById('input-text');
  var playAgainButton = document.getElementById('play-again');
  var g = new GuessTheNumber(journal, root, mouthAnimator, chancesContainer, chancesText, lossesContainer, lossesText, dialogText, dialogOk, inputForm, inputText, playAgainButton);
  window.g = g;
  intro(g);
});

function guessesNeeded(low, high) {
  if (high < low) return -1;
  var range = high - low + 1;
  var i = void 0;
  for (i = 0; range > 1; ++i) {
    range = Math.floor((range - 1) / 2);
  }return i;
}
//# sourceMappingURL=gtn.js.map
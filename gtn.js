'use strict'


class GuessTheNumber {
  constructor(root, mouthAnimator, dialogText, dialogOk, inputForm, inputText, playAgainButton) {
    this.root = root
    this.mouthAnimator = mouthAnimator
    this.dialogText = dialogText
    this.dialogOk = dialogOk
    this.inputForm = inputForm
    this.inputText = inputText
    this.playAgainButton = playAgainButton
  }

  startDialog(text) {
    this.dialogText.textContent = text
    this.mouthAnimator.start()
    setTimeout(() => this.mouthAnimator.stop(), 50 * text.length)
  }

  say(text) {
    return new Promise(resolve => {
      this.startDialog(text)
      this.dialogOk.style.display = 'block'
      this.dialogOk.focus()
      var handleDialog = () => {
        this.dialogOk.style.display = 'none'
        this.dialogOk.removeEventListener('click', handleDialog)
        resolve()
      }
      this.dialogOk.addEventListener('click', handleDialog)
    })
  }

  ask(question) {
    return new Promise(resolve => {
      this.startDialog(question)
      this.inputForm.style.display = 'block'
      this.inputText.value = ''
      this.inputText.focus()
      var handleInput = e => {
        e.preventDefault()
        var guess = parseInt(this.inputText.value, 10)
        if (isNaN(guess) || guess < 1 || guess > 100) return
        this.inputForm.style.display = 'none'
        this.inputForm.removeEventListener('submit', handleInput)
        resolve(guess)
      }
      this.inputForm.addEventListener('submit', handleInput)
    })
  }

  gameOver(taunt) {
    return new Promise(resolve => {
      this.startDialog(taunt)
      this.playAgainButton.style.display = 'block'
      this.playAgainButton.focus()
      var handlePlayAgain = e => {
        this.playAgainButton.style.display = 'none'
        this.playAgainButton.removeEventListener('click', handlePlayAgain)
        resolve()
      }
      this.playAgainButton.addEventListener('click', handlePlayAgain)
    })
  }
}


class MouthAnimator {
  constructor(mouth) {
    this.mouth = mouth
    this.semaphore = 0
    this.mouth.addEventListener('animationiteration', () => {
      if (this.semaphore <= 0) this.mouth.classList.remove('mouth-moving')
    })
  }

  // Start the animation, if it's not running already.
  start() {
    ++this.semaphore
    if (this.semaphore > 0) this.mouth.classList.add('mouth-moving')
  }

  // Stop the animation before the next cycle.
  stop() {
    --this.semaphore
  }
}


window.addEventListener('load', () => {
  var root = document.getElementById('main')
  var mouth = document.getElementById('face').contentDocument.getElementById('mouth')
  var mouthAnimator = new MouthAnimator(mouth)
  var dialogText = document.getElementById('dialog-text')
  var dialogOk = document.getElementById('dialog-ok')
  var inputForm = document.getElementById('input')
  var inputText = document.getElementById('input-text')
  var playAgainButton = document.getElementById('play-again')
  var g = new GuessTheNumber(root, mouthAnimator, dialogText, dialogOk, inputForm, inputText, playAgainButton)
  window.g = g
  intro(g)
})


function intro(g) {
  return g.say(`Welcome to the Number Guessing Game!`)
    .then(() => g.say(`I'm thinking of a number from 1 through 100.`))
    .then(() => start(g))
}


function start(g) {
  loop(g, 1, 100, 5)
}


function loop(g, low, high, chances) {
  if (chances) {
    // Obfuscate the logging a bit
    console.log(((chances << 24) | (high << 16) | low).toString(36))
    return g.ask(`What is your guess?`)
      .then(guess => {
        // We can either respond "too high" or "too low".
        // But we don't want to put ourselves in a tight spot.
        // For example, if the user guesses 99 on their first turn, we don't
        // want to say "too low"; because then they'll win on the next turn.
        // So we first do some arithmetic to determine which of the two choices
        // are safe.
        var options = []
        if (guessesNeeded(low, guess - 1) >= chances - 1) options.push('toohigh')
        if (guessesNeeded(guess + 1, high) >= chances - 1) options.push('toolow')
        switch (randomChoice(options)) {
          case 'toohigh':
            return g.say(`Too high!`)
              .then(() => loop(g, low, Math.min(high, guess - 1), chances - 1))
          case 'toolow':
            return g.say(`Too low!`)
              .then(() => loop(g, Math.max(low, guess + 1), high, chances - 1))
        }
      })
  } else {
    var actual = Math.floor((high - low + 1) * Math.random() + low)
    return g.say(`The number was actually... ${actual}!`)
      .then(() => g.gameOver(`Would you like to play again?`))
      .then(() => start(g))
  }
}


// Calculate the minimum number of bisections needed to reduce [low, high] down
// to a single element.
//
// Returns -1 when high < low.
function guessesNeeded(low, high) {
  if (high < low) return -1
  var range = high - low + 1
  for (var i = 0; range > 1; ++i) range = Math.floor((range - 1) / 2)
  return i
}


// Pick a random element from an array.
function randomChoice(items) {
  var i = Math.floor(items.length * Math.random())
  return items[i]
}

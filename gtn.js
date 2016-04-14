'use strict'


class GuessTheNumber {
  constructor(root, mouthAnimator, dialogText, inputText, dialogOk, inputOk) {
    this.root = root
    this.mouthAnimator = mouthAnimator
    this.dialogText = dialogText
    this.inputText = inputText
    this.dialogOk = dialogOk
    this.inputOk = inputOk
  }

  transition(args) {
    for (var s of ['dialog', 'input', 'gameover']) {
      this.root.classList.remove(`state-${s}`)
    }
    this.root.classList.add(`state-${args.state}`)
    this.dialogText.textContent = args.text || ''
    if (args.animationLength) {
      this.mouthAnimator.start()
      setTimeout(() => this.mouthAnimator.stop(), args.animationLength)
    }
    if (args.onDialog) {
      var callback = () => {
        args.onDialog.call(this)
        this.dialogOk.removeEventListener('click', callback)
      }
      this.dialogOk.addEventListener('click', callback)
    }
    if (args.onInput) {
      var callback = () => {
        var guess = parseInt(this.inputText.value, 10)
        if (isNaN(guess) || guess < 1 || guess > 100) return
        args.onInput.call(this, guess)
        this.inputOk.removeEventListener('click', callback)
      }
      this.inputText.value = ''
      this.inputText.focus()
      this.inputOk.addEventListener('click', callback)
    }
  }

  say(text) {
    return new Promise(resolve => {
      this.transition({
        state: 'dialog',
        text: text,
        animationLength: 50 * text.length,
        onDialog: resolve,
      })
    })
  }

  ask(question) {
    return new Promise(resolve => {
      this.transition({
        state: 'input',
        text: question,
        onInput: resolve,
      })
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
  var inputText = document.getElementById('input-text')
  var dialogOk = document.getElementById('dialog-ok')
  var inputOk = document.getElementById('input-ok')
  var g = new GuessTheNumber(root, mouthAnimator, dialogText, inputText, dialogOk, inputOk)
  window.g = g
  startGame(g)
})


function startGame(g) {
  return g.say(`Welcome to the Number Guessing Game!`)
    .then(() => g.say(`I'm thinking of a number from 1 through 100.`))
    .then(() => g.ask(`What is your guess?`))
    .then(guess =>
      guess === 42 ?
        g.say(`Correct!`) :
        g.say(`Completely and utterly wrong!`))
}

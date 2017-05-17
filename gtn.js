'use strict'


function findLocalStorage() {
  for (let type of ['localStorage', 'sessionStorage']) {
    try {
      let storage = window[type]
      let x = 'gtnStorageTest'
      storage.setItem(x, x)
      storage.removeItem(x)
      return storage
    } catch (e) {}
  }
  return null
}


class Journal {
  constructor(storage) {
    this.storage = storage || findLocalStorage()
    this.rewind()
  }

  rewind() {
    this.journal = []
    this.index = 0
    let data = null
    try {
      data = JSON.parse(this.storage.getItem('gtnJournal'))
    } catch (e) {
      console.error(`Error while loading game: ${e}`)
    }
    if (Array.isArray(data)) {
      this.journal = data
    } else {
      console.log(`No save data found; starting new game`)
    }
  }

  save() {
    try {
      this.storage.setItem('gtnJournal', JSON.stringify(this.journal))
    } catch (e) {
      console.error(`Error while saving game: ${e}`)
    }
  }

  reset() {
    try {
      this.journal = []
      this.storage.removeItem('gtnJournal')
    } catch (e) {
      console.error(`Error while resetting game: ${e}`)
    }
  }

  _read(label, args) {
    // Try to replay an entry from the journal
    let entry = this.journal[this.index]
    if (entry) {
      if (entry.label === label && JSON.stringify(entry.args) === JSON.stringify(args)) {
        // Return the pre-computed result
        ++this.index
        return entry
      } else {
        // There's an entry here, but it doesn't match our game logic!
        // Log the issue and keep going...
        console.error(`Invalid log! Expected ${label}(${args}) but got ${entry.label}(${entry.args})`)
        // Delete all entries since we know they're wrong
        this.reset()
        location.reload()
      }
    }
    return null
  }

  _write(label, args, result) {
    // Write an entry to the journal
    this.journal[this.index] = { label, args, result }
    ++this.index
    this.save()
  }

  record(label, args, callback) {
    let entry = this._read(label, args)
    if (entry) {
      return entry.result
    } else {
      let result = callback()
      this._write(label, args, result)
      return result
    }
  }

  promise(label, args, callback) {
    let entry = this._read(label, args)
    if (entry) {
      return Promise.resolve(entry.result)
    } else {
      return new Promise(callback).then(result => {
        this._write(label, args, result)
        return result
      })
    }
  }
}


class Random {
  constructor(journal) {
    this.journal = journal
  }

  choice(items) {
    return this.journal.record('choice', [items], () =>
      items[Math.floor(items.length * Math.random())])
  }

  randint(low, high) {
    return this.journal.record('randint', [low, high], () =>
      Math.floor((high - low + 1) * Math.random() + low))
  }
}


class GuessTheNumber {
  constructor(journal, root, mouthAnimator, chancesContainer, chancesText, lossesContainer, lossesText, dialogText, dialogOk, inputForm, inputText, playAgainButton) {
    this.journal = journal
    this.root = root
    this.mouthAnimator = mouthAnimator
    this.chancesContainer = chancesContainer
    this.chancesText = chancesText
    this.lossesContainer = lossesContainer
    this.lossesText = lossesText
    this.dialogText = dialogText
    this.dialogOk = dialogOk
    this.inputForm = inputForm
    this.inputText = inputText
    this.playAgainButton = playAgainButton
    this.setChances(null)
    this.losses = 0
    this.random = new Random(journal)
  }

  startDialog(text) {
    this.dialogText.textContent = text
    this.mouthAnimator.start()
    setTimeout(() => this.mouthAnimator.stop(), 50 * text.length)
  }

  setChances(chances) {
    if (chances === null) {
      this.chancesContainer.style.display = 'none'
    } else {
      this.chancesContainer.style.display = 'block'
      this.chancesText.textContent = chances
    }
  }

  recordLoss() {
    ++this.losses
    this.lossesContainer.style.display = 'block'
    this.lossesText.textContent = this.losses
  }

  say(text) {
    return this.journal.promise('say', [text], resolve => {
      this.startDialog(text)
      this.dialogOk.style.display = 'block'
      this.dialogOk.focus()
      let handleDialog = () => {
        this.dialogOk.style.display = 'none'
        this.dialogOk.removeEventListener('click', handleDialog)
        resolve()
      }
      this.dialogOk.addEventListener('click', handleDialog)
    })
  }

  ask(question) {
    return this.journal.promise('ask', [question], resolve => {
      this.startDialog(question)
      this.inputForm.style.display = 'block'
      this.inputText.value = ''
      this.inputText.focus()
      let handleInput = e => {
        e.preventDefault()
        let guess = parseInt(this.inputText.value, 10)
        if (isNaN(guess) || guess < 1 || guess > 100) return
        this.inputForm.style.display = 'none'
        this.inputForm.removeEventListener('submit', handleInput)
        resolve(guess)
      }
      this.inputForm.addEventListener('submit', handleInput)
    })
  }

  gameOver(taunt) {
    return this.journal.promise('gameOver', [taunt], resolve => {
      this.startDialog(taunt)
      this.playAgainButton.style.display = 'block'
      this.playAgainButton.focus()
      let handlePlayAgain = e => {
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
  let journal = new Journal()
  let root = document.getElementById('main')
  let mouth = document.getElementById('face').contentDocument.getElementById('mouth')
  let mouthAnimator = new MouthAnimator(mouth)
  let chancesContainer = document.getElementById('chances')
  let chancesText = document.getElementById('chances-text')
  let lossesContainer = document.getElementById('losses')
  let lossesText = document.getElementById('losses-text')
  let dialogText = document.getElementById('dialog-text')
  let dialogOk = document.getElementById('dialog-ok')
  let inputForm = document.getElementById('input')
  let inputText = document.getElementById('input-text')
  let playAgainButton = document.getElementById('play-again')
  let g = new GuessTheNumber(journal, root, mouthAnimator, chancesContainer, chancesText, lossesContainer, lossesText, dialogText, dialogOk, inputForm, inputText, playAgainButton)
  window.g = g
  intro(g)
})


function intro(g) {
  return g.say(`Welcome to the Number Guessing Game!`)
    .then(() => g.say(`I'm thinking of a number from 1 through 100.`))
    .then(() => start(g))
}


function start(g) {
  loop(g, { low: 1, high: 100, chances: 5 })
}


function loop(g, { low, high, chances }) {
  g.setChances(chances)
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
        let options = []
        if (guessesNeeded(low, guess - 1) >= chances - 1) options.push('toohigh')
        if (guessesNeeded(guess + 1, high) >= chances - 1) options.push('toolow')
        switch (g.random.choice(options)) {
          case 'toohigh':
            return g.say(`Too high!`)
              .then(() => loop(g, {
                low,
                high: Math.min(high, guess - 1),
                chances: chances - 1
              }))
          case 'toolow':
            return g.say(`Too low!`)
              .then(() => loop(g, {
                low: Math.max(low, guess + 1),
                high,
                chances: chances - 1
              }))
        }
      })
  } else {
    g.recordLoss()
    let actual = g.random.randint(low, high)
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
  let range = high - low + 1
  let i
  for (i = 0; range > 1; ++i) range = Math.floor((range - 1) / 2)
  return i
}

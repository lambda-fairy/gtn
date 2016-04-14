'use strict'


class GuessTheNumber {
  constructor(mouthAnimator, dialog) {
    this.mouthAnimator = mouthAnimator
    this.dialog = dialog
    this.dialog.style.visibility = 'hidden'
  }

  speak(text, delay) {
    return new Promise(resolve => {
      this.dialog.textContent = text
      this.dialog.style.visibility = 'visible'
      this.mouthAnimator.start()
      setTimeout(() => {
        this.dialog.style.visibility = 'hidden'
        this.mouthAnimator.stop()
        resolve()
      }, delay)
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
  var mouth = document.getElementById('face').contentDocument.getElementById('mouth')
  var mouthAnimator = new MouthAnimator(mouth)
  var dialog = document.getElementById('dialog')
  var gtn = new GuessTheNumber(mouthAnimator, dialog)
  window.gtn = gtn
  testFunction()
})


function testFunction() {
  return window.gtn.speak("Math is hard!", 2000).then(() =>
    window.gtn.speak("Let's go shopping!", 2000)).then(() =>
    testFunction())
}

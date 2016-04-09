'use strict'

var SVG = 'http://www.w3.org/2000/svg'

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

window.addEventListener('load', () => {
  var mouthAnimator = document.getElementById('face').contentWindow.mouthAnimator
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

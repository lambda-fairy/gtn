'use strict'

var SVG = 'http://www.w3.org/2000/svg'

var MouthAnimator = null

window.addEventListener('load', () => {
  var face = document.getElementById('face').contentWindow
  window.MouthAnimator = face.MouthAnimator
  console.info('Try these commands:')
  console.info(`
    MouthAnimator.start()
    MouthAnimator.stop()
    MouthAnimator.setNomsPerSecond(5)`)
})

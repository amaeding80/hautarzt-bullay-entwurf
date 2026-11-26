// meine Etiketten zeigen: ?vorschlag=1
if (location.search.indexOf('vorschlag=1') > -1) document.body.className = ''

// Vorschau: Links ohne Ziel (vor Livegang raus)
var texte = {
  impressum: 'Nur Vorschau: Hier käme das Impressum der Praxis.',
  datenschutz: 'Nur Vorschau: Hier käme die Datenschutzerklärung.',
  anfrage: 'Nur Vorschau: Der Rückruf-Wunsch ist noch nicht eingebaut.'
}
var hinweis = document.getElementById('hinweis'), uhr
document.querySelectorAll('a[href="#"]:not(.online)').forEach(function (a) {
  a.onclick = function (e) {
    e.preventDefault()
    hinweis.textContent = texte[a.dataset.demo] || 'Nur Vorschau.'
    hinweis.className = 'da'
    clearTimeout(uhr)
    uhr = setTimeout(function () { hinweis.className = '' }, 4000)
  }
})

// Handy: Liste wischen
var liste = document.getElementById('liste'), wisch = document.getElementById('wisch')
wisch.onclick = function () {
  if (liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - 5) liste.scrollTo({ left: 0, behavior: 'smooth' })
  else liste.scrollBy({ left: liste.clientWidth * 0.8, behavior: 'smooth' })
}
liste.onscroll = function () {
  wisch.textContent = liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - 5 ? '← Zurück' : 'Wischen →'
}

// Online-Termin Vorschau: Schritte laufen allein durch, dann von vorn
var demo = document.getElementById('termin-demo'), lauf
function zeige(n) {
  var s = demo.querySelectorAll('.schritt'), punkte = demo.querySelectorAll('.schritte span')
  for (var i = 0; i < s.length; i++) { s[i].className = i == n ? 'schritt an' : 'schritt'; punkte[i].className = i == n ? 'jetzt' : '' }
  demo.querySelectorAll('.gewaehlt, .da').forEach(function (x) { x.classList.remove('gewaehlt', 'da') })
  // Balken läuft mit
  var b = document.getElementById('balken'), dauer = n == 2 ? 6 : 3.2
  b.style.transition = 'none'; b.style.width = (n * 25) + '%'; b.offsetWidth
  b.style.transition = 'width ' + dauer + 's linear'; b.style.width = ((n + 1) * 25) + '%'
  var klick = s[n].querySelector('[data-klick]')
  if (klick) lauf = setTimeout(function () { klick.classList.add('gewaehlt') }, 1200)
  s[n].querySelectorAll('.antwort').forEach(function (a, k) { setTimeout(function () { a.classList.add('da') }, 900 + k * 900) })
  // Fragebogen: Ja/Nein wird nacheinander angetippt
  s[n].querySelectorAll('.tipp').forEach(function (t, k) { setTimeout(function () { t.classList.add('gewaehlt') }, 1000 + k * 1100) })
  lauf = setTimeout(function () { zeige((n + 1) % s.length) }, n == 2 ? 6000 : 3200)
}
document.querySelectorAll('.online').forEach(function (b) {
  b.onclick = function (e) { e.preventDefault(); demo.showModal(); clearTimeout(lauf); zeige(0) }
})
document.getElementById('zu').onclick = function () { demo.close() }
demo.onclose = function () { clearTimeout(lauf) }

// Fotos: kein Rechtsklick, kein Ziehen, auch Hintergrundbilder
function istBild(el) {
  if (!(el instanceof Element)) return false
  if (el.closest('img, picture')) return true
  var bg = getComputedStyle(el).backgroundImage
  return !!bg && bg.indexOf('url(') !== -1
}
function bildDarunter(e) {
  var liste = document.querySelectorAll('img, picture')
  for (var i = 0; i < liste.length; i++) {
    var r = liste[i].getBoundingClientRect()
    if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) return true
  }
  return false
}
function bildSperren(e) { if (istBild(e.target) || bildDarunter(e)) e.preventDefault() }
document.addEventListener('contextmenu', bildSperren)
document.addEventListener('dragstart', bildSperren)
document.querySelectorAll('img, picture').forEach(function (i) { i.setAttribute('draggable', 'false') })

// feste Knöpfe: ab "Damit können Sie zu mir kommen", unten beim Kontakt wieder weg
var feste = document.getElementById('feste'), ab = false, bis = false
function knopf() {
  var da = ab && !bis
  feste.className = da ? 'feste da' : 'feste'
  document.body.classList.toggle('mit-leiste', da)
}
new IntersectionObserver(function (e) { ab = e[0].isIntersecting || e[0].boundingClientRect.top < 0; knopf() }).observe(document.getElementById('wofuer'))
new IntersectionObserver(function (e) { bis = e[0].isIntersecting || e[0].boundingClientRect.top < 0; knopf() }).observe(document.getElementById('kontakt'))

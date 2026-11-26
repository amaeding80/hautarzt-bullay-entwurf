// Erreichbarkeit oben + heute in der Liste (Di-Do 8:30-16:30)
(function () {
  var d = new Date();
  var tag = d.getDay();
  var min = d.getHours() * 60 + d.getMinutes();
  var offen = tag >= 2 && tag <= 4;
  var el = document.getElementById('status');

  if (el) {
    if (offen && min >= 510 && min < 990) el.innerHTML = '<b>Jetzt erreichbar</b>, heute bis 16:30 Uhr';
    else if (offen && min < 510) el.innerHTML = 'Heute ab <b>8:30 Uhr</b> erreichbar';
    else el.innerHTML = 'Wieder erreichbar ' + (tag === 2 || tag === 3 ? 'morgen' : 'am Dienstag') + ' ab <b>8:30 Uhr</b>';
  }

  var li = document.querySelector('#tage li[data-tag="' + tag + '"]');
  if (li) {
    li.classList.add('heute');
    li.querySelector('span').insertAdjacentHTML('beforebegin', '<em>heute</em>');
  }
})();

// Wischen / Zurück
document.querySelectorAll('.wisch-btn').forEach(function (btn) {
  var liste = document.getElementById(btn.getAttribute('aria-controls'));
  if (!liste) return;

  function ende() {
    return liste.scrollLeft + liste.clientWidth >= liste.scrollWidth - 10;
  }
  var t;
  liste.addEventListener('scroll', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      btn.innerHTML = ende() ? '&larr; Zurück' : 'Wischen &rarr;';
    }, 80);
  }, { passive: true });

  btn.addEventListener('click', function () {
    if (ende()) liste.scrollTo({ left: 0, behavior: 'smooth' });
    else liste.scrollBy({ left: liste.firstElementChild.offsetWidth + 12, behavior: 'smooth' });
  });
});

// Anfrage - nur Demo! Versand fehlt noch, vor Livegang anbinden
var f = document.getElementById('anfrage-form');
if (f) {
  var schritte = f.querySelectorAll('.schritt');
  var jetzt = 0;
  var tagNamen = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // die nächsten 6 Sprechtage (Di-Do), ab morgen. Feiertage/Urlaub fehlen noch!
  var box = document.getElementById('tage-wahl');
  var d = new Date();
  var n = 0;
  while (n < 6) {
    d.setDate(d.getDate() + 1);
    var w = d.getDay();
    if (w < 2 || w > 4) continue;
    var lang = tagNamen[w] + ', ' + d.getDate() + '. ' + monate[d.getMonth()];
    box.insertAdjacentHTML('beforeend',
      '<label><input type="radio" name="tag" value="' + lang + '"><b>' + tagNamen[w].slice(0, 2) + '</b> ' + d.getDate() + '.' + (d.getMonth() + 1) + '.</label>');
    n++;
  }

  function zeige(i) {
    schritte[jetzt].hidden = true;
    jetzt = i;
    schritte[i].hidden = false;
    document.getElementById('stand-nr').textContent = i + 1;
    f.querySelectorAll('.schritt-stand i').forEach(function (s, k) {
      s.className = k <= i ? 'aktiv' : '';
    });
    var top = document.getElementById('anfrage').getBoundingClientRect().top;
    if (top < 0) document.getElementById('anfrage').scrollIntoView({ behavior: 'smooth' });
  }

  function ok(i) {
    if (i === 0) return !!f.querySelector('[name=anliegen]:checked');
    if (i === 1) return f.querySelector('[name=tag]:checked') && f.querySelector('[name=zeit]:checked');
    return f.elements['name'].value.trim() && f.telefon.value.trim() && f.privat.checked &&
      (!f.foto.files.length || f.foto_einwilligung.checked);
  }

  f.querySelectorAll('.weiter').forEach(function (b) {
    b.addEventListener('click', function () {
      var fe = schritte[jetzt].querySelector('.fehler');
      if (!ok(jetzt)) { fe.hidden = false; return; }
      fe.hidden = true;
      zeige(jetzt + 1);
    });
  });
  f.querySelectorAll('.zurueck').forEach(function (b) {
    b.addEventListener('click', function () { zeige(jetzt - 1); });
  });

  // Hinweis weg, sobald was gewählt wird
  f.addEventListener('change', function () {
    f.querySelectorAll('.fehler').forEach(function (fe) { if (ok(jetzt)) fe.hidden = true; });
  });

  // Foto bleibt im Browser (nur Vorschau)
  f.foto.addEventListener('change', function () {
    var img = document.getElementById('foto-vorschau');
    if (!f.foto.files.length) return;
    img.src = URL.createObjectURL(f.foto.files[0]);
    img.hidden = false;
    document.getElementById('foto-text').textContent = 'Anderes Foto wählen';
    document.getElementById('foto-ok').hidden = false;
  });

  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var fe = schritte[2].querySelector('.fehler');
    if (!ok(2)) {
      fe.textContent = f.foto.files.length && !f.foto_einwilligung.checked
        ? 'Für das Foto brauche ich noch Ihre Einwilligung.'
        : 'Bitte Name, Telefon und das Häkchen zur Privatpraxis ausfüllen.';
      fe.hidden = false;
      return;
    }
    document.getElementById('danke-termin').textContent = 'Ihre Wunschzeit für den Rückruf: ' +
      f.querySelector('[name=tag]:checked').value + ', zwischen ' + f.querySelector('[name=zeit]:checked').value +
      ', unter ' + f.telefon.value.trim() + '.';
    document.getElementById('danke-foto').hidden = !f.foto.files.length;
    f.hidden = true;
    document.getElementById('danke').hidden = false;
  });
}

// Vorschau: Platzhalter wieder zeigen mit ?platzhalter=1
if (/platzhalter=1/.test(location.search)) document.body.classList.remove('ohne-platzhalter');

// Vorschau: Etiketten an meinen Ideen zeigen mit ?vorschlag=1 (sonst aus)
if (/vorschlag=1/.test(location.search)) document.body.classList.remove('ohne-ideen');

// Vorschau: Links ohne Ziel zeigen kurz einen Hinweis (vor Livegang raus)
(function () {
  var hinweis = document.getElementById('demo-hinweis');
  var texte = {
    impressum: 'Nur Vorschau: Hier käme das Impressum der Praxis.',
    datenschutz: 'Nur Vorschau: Hier käme die Datenschutzerklärung.',
    barrierefreiheit: 'Nur Vorschau: Hier käme die Erklärung zur Barrierefreiheit.',
    anfrage: 'Nur Vorschau: Die Anfrage wird in diesem Entwurf nicht verschickt.'
  };
  var timer;
  function zeigen(text) {
    if (!hinweis) return;
    hinweis.textContent = text;
    hinweis.classList.add('da');
    clearTimeout(timer);
    timer = setTimeout(function () { hinweis.classList.remove('da'); }, 4000);
  }
  // tel:, mailto: und Maps bleiben echte Links, das Logo springt nach oben
  document.querySelectorAll('[data-demo], a[href="#"]:not(.logo)').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      zeigen(texte[el.getAttribute('data-demo')] || 'Nur Vorschau.');
    });
  });
  var form = document.getElementById('anfrage-form');
  if (form) form.addEventListener('submit', function () { zeigen(texte.anfrage); });
})();

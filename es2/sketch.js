// Wassily Kandinsky, 13 Rechtecke, 1930 (60 x 70 cm)
// Fonte: https://www.copia-di-arte.com/a/wassily-kandinsky/13rechtecke.html
// Obiettivo: riprodurre un quadro astratto geometrico e creare varianti cromatiche dinamiche.
// Vincoli: canvas di riferimento 800x600; qui 514x600 per mantenere il rapporto dell'opera.
// Colori in HSL, HSB o OKLCH; variazioni casuali limitate da una regola.
// parametri variabili dichiarati all'inizio; animazione o interazione sui colori o sulle aree.

const opacitaSovrapposizioni = 72;
const ampiezzaOscillazioneLuminosita = 20;
const velocitaOscillazioneLuminosita = 0.010;
const latoCursore = 14;
const fattoreRiduzioneRiquadri = 0.8;
const numeroMassimoRiquadri = 5;
const tonoSfondoOriginale = 46;
const saturazioneSfondoOriginale = 52;
const saturazioneSfondoVariato = 35;
const coloriForme = [
  [205, 91, 64],
  [351, 35, 85],
  [25, 60, 50],
  [17, 74, 34],
  [47, 55, 96],
  [359, 88, 78],
  [2, 85, 60],
  [25, 60, 55],
  [12, 45, 95],
  [224, 96, 45],
  [359, 88, 68],
  [25, 30, 17],
  [48, 55, 99],
  [351, 15, 100],
  [247, 91, 13],
  [48, 55, 99],
  [359, 90, 60],
  [204, 18, 80]
];

let variazioneCasualeLuminosita = 0;
let faseCasualeLuminosita = 0;
let rotazioneColori = 0;
let numeroRiquadri = 0;
let tonoSfondo = tonoSfondoOriginale;
let saturazioneSfondo = saturazioneSfondoOriginale;

function setup() {
  createCanvas(514, 600);
  noCursor();
  variazioneCasualeLuminosita = random(-2, 2);
  faseCasualeLuminosita = random(TWO_PI);
}

function draw() {
  colorMode(HSB, 360, 100, 100, 100);
  background(tonoSfondo, saturazioneSfondo, luminositaVariata(60));

  disegnaOpera();

  let scalaRiquadro = fattoreRiduzioneRiquadri;
  for (let riquadro = 0; riquadro < numeroRiquadri; riquadro++) {
    push();
    translate(width / 2, height / 2);
    scale(scalaRiquadro);
    translate(-width / 2, -height / 2);

    disegnaOpera();

    pop();

    scalaRiquadro *= fattoreRiduzioneRiquadri;
  }

  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    noFill();
    stroke(0, 0, 10);
    strokeWeight(3);
    rect(mouseX - latoCursore / 2, mouseY - latoCursore / 2, latoCursore, latoCursore);
    stroke(0, 0, 100);
    strokeWeight(1);
    rect(mouseX - latoCursore / 2, mouseY - latoCursore / 2, latoCursore, latoCursore);
  }
}

function disegnaOpera() {
  noStroke();

  riempiColore(0);
  rect(82, 126, 106, 73);

  riempiColore(1);
  rect(100, 94, 34, 32);
  riempiColore(2);
  rect(100, 126, 34, 17);

  riempiColore(3);
  rect(161, 49, 51, 77);
  riempiColore(3);
  rect(188, 126, 24, 10);
  riempiColore(3, opacitaSovrapposizioni);
  rect(161, 126, 27, 10);

  riempiColore(4);
  rect(273, 128, 87, 88);

  riempiColore(5);
  rect(172, 165, 101, 141);
  rect(273, 216, 36, 90);
  riempiColore(6);
  rect(273, 165, 36, 51);

  riempiColore(7);
  rect(172, 165, 16, 34);

  riempiColore(8);
  rect(360, 240, 17, 19);

  riempiColore(9);
  rect(145, 291, 54, 105);

  riempiColore(10);
  rect(172, 291, 27, 15);

  riempiColore(11);
  rect(197, 410, 17, 19);

  riempiColore(12);
  rect(160, 448, 37, 39);

  riempiColore(13);
  rect(292, 306, 69, 36);

  riempiColore(14);
  rect(361, 333, 27, 9);
  rect(335, 342, 53, 82);
  riempiColore(14, opacitaSovrapposizioni);
  rect(335, 333, 26, 9);

  riempiColore(15);
  rect(335, 333, 26, 9);

  riempiColore(16);
  rect(352, 424, 88, 88);

  riempiColore(17);
  rect(440, 512, 18, 19);
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    numeroRiquadri = (numeroRiquadri + 1) % (numeroMassimoRiquadri + 1);
    if (rotazioneColori === 0) {
      rotazioneColori = floor(random(4, coloriForme.length - 4));
      tonoSfondo = coloriForme[rotazioneColori][0];
      saturazioneSfondo = saturazioneSfondoVariato;
    } else {
      rotazioneColori = 0;
      tonoSfondo = tonoSfondoOriginale;
      saturazioneSfondo = saturazioneSfondoOriginale;
    }
  }
}

function luminositaVariata(luminositaBase) {
  const oscillazione = sin(frameCount * velocitaOscillazioneLuminosita + faseCasualeLuminosita)
    * ampiezzaOscillazioneLuminosita;

  return constrain(luminositaBase + variazioneCasualeLuminosita + oscillazione, 0, 100);
}

function riempiColore(indiceColore, opacita = 100) {
  const colore = coloriForme[(indiceColore + rotazioneColori) % coloriForme.length];

  fill(colore[0], colore[1], luminositaVariata(colore[2]), opacita);
}

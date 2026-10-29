// Esercitazione E1 — Illusioni in movimento
//
// Obiettivo: animare un'illusione ottica geometrica in bianco e nero,
// composta da molti elementi uguali ripetuti secondo una regola, in modo
// che il movimento conservi l'effetto percettivo (o lo annulli e lo ripristini).
//
// Vincoli (dalle specifiche):
// - tela 600x600 (nelle specifiche il riferimento è 800x600; un solo lato può essere inferiore);
// - solo bianco, nero e grigi, con un solo valore in background(), fill(), stroke();
// - ripetizioni con cicli for, non elementi disegnati a mano;
// - parametri numerici in variabili dichiarate inizio del file;
// - movimento in draw() su elementi o parametri critici (non sull'immagine intera);
// - preview.png con un fotogramma in cui l'effetto è visibile.
//
// Illusione: Bulging Checkerboard
// Fonte: https://michaelbach.de/ot/ang-KitaokaBulge/index.html
// Regola (consigliata): una scacchiera regolare di quadrati neri e bianchi,
//   sempre uguale a se stessa. In una zona a rombo al centro, ogni quadrato
//   ospita due quadratini minuscoli del colore opposto, affacciati sul proprio
//   lato: a sinistra della colonna centrale in verticale sul lato sinistro,
//   a destra in verticale sul lato destro, nella colonna centrale in
//   orizzontale ma verso il centro — in basso sopra il centro, in alto sotto.
//   Solo il quadrato
//   al centro del rombo resta senza puntini. Nelle tre righe sopra e nelle tre
//   righe sotto quella centrale, i primi quadrati a destra e a sinistra del
//   centro hanno invece i puntini in diagonale: a destra dall'alto-sinistra al
//   basso-destra, a sinistra riflessa, dall'alto-destra al basso-sinistra.
//   Lo sfasamento del contrasto fra i lati fa apparire la griglia gonfiata.
// Parametri critici: per ciascuno, il nome della variabile
//   scalaPunti = lato del puntino rispetto al lato del quadrato
//     effetto più evidente con scalaPunti piccola (puntino minuscolo)
//     nessun effetto con scalaPunti grande (il puntino copre il quadrato)
//   scartoPuntino = distanza del puntino dal lato del suo quadrato
//     effetto più evidente con scartoPuntino piccolo
//     nessun effetto con scartoPuntino grande (puntini verso il centro del riquadro)
//   raggioRombo = quanto è estesa la zona a rombo che ospita i puntini
//     effetto più evidente con raggioRombo esteso alla zona con il motivo
//     nessun effetto con raggioRombo molto piccolo (nessun puntino visibile)
//   colore del puntino = colore opposto a quello dell'ospite, deciso in draw()
//     effetto più evidente con colori opposti (bianco/nero)
//     nessun effetto con colore del puntino uguale a quello dell'ospite
//
// Movimento: il rombo centrale si gonfia dal centro verso i bordi e poi rientra,
//   come una superficie che sporge verso chi guarda. I quadrati neri ai margini
//   restano statici, tranne le griglie 3x3 agli angoli, che si gonfiano in
//   modo speculare dal centro verso l'esterno.

// --- tela ---
const larghezzaTela = 600;
const altezzaTela = 600;

// --- scacchiera ---
const numeroColonne = 13;
const numeroRighe = 13;
const latoQuadrato = larghezzaTela / numeroColonne;
const colonnaCentrale = Math.floor(numeroColonne / 2); // la colonna di mezzo ospita il motivo ruotato
const rigaCentrale = Math.floor(numeroRighe / 2); // il quadrato al centro di questa riga resta pulito
const colonnaDaEliminare = 9; // numerazione da 1
const rigaDaEliminare = 5;    // numerazione da 1
const primaColonnaZonaSinistra = 0;
const primaColonnaZonaAngolo = numeroColonne - 3;
const primaRigaZonaAngolo = 0;
const latoZonaAngolo = 3;
const ultimaRigaZonaAngolo = numeroRighe - latoZonaAngolo;

// --- parametri critici ---
const scalaPunti = 0.15;   // lato del puntino / lato del quadrato
const scartoPuntino = 3;   // quanto il puntino sta staccato dal lato del suo quadrato
const raggioRombo = 300;   // i puntini compaiono entro questa distanza a rombo dal centro
const quadratiDiagonali = 4; // quanti quadrati a destra del centro, nella riga sopra, hanno la diagonale
const righeDiagonali = 3;    // quante righe sopra e sotto il centro hanno la diagonale

// --- movimento ---
const fotogrammiPerPosizione = 300;   // ogni quanti fotogrammi i puntini cambiano posizione
const fotogrammiDiTransizione = 300;  // quanti fotogrammi dura lo spostamento graduale
const ampiezzaGonfiore = 0.75;        // intensità massima del rigonfiamento centrale
const velocitaGonfiore = 0.012;       // velocità del gonfiarsi e rientrare
const velocitaGonfioreEsterno = 0.03;  // velocità del movimento nei quadrati esterni
const raggioGonfioreAngolo = latoQuadrato * latoZonaAngolo;
const quadratiNeriPerMargine = 5;     // quadrati neri coinvolti su ogni margine
const primoQuadratoMargine = colonnaCentrale - quadratiNeriPerMargine + 1;
const distanzaTraQuadratiNeri = 2;    // distanza fra i quadrati neri consecutivi della scacchiera

const latoPuntino = latoQuadrato * scalaPunti;

function setup() {
  createCanvas(larghezzaTela, altezzaTela);
}

function draw() {
  background(255);
  const faseGonfiore = (frameCount * velocitaGonfiore) % (2 * Math.PI);
  const intensitaGonfiore = cos(faseGonfiore);
  const intensitaGonfioreEsterno = cos(frameCount * velocitaGonfioreEsterno);

  for (let riga = 0; riga < numeroRighe; riga++) {
    for (let colonna = 0; colonna < numeroColonne; colonna++) {
      const x = colonna * latoQuadrato;
      const y = riga * latoQuadrato;
      const nelRombo = dentroRombo(riga, colonna);
      const sopraIlBuco = colonna === colonnaDaEliminare - 1
        && riga === rigaDaEliminare - 2;
      const nelMovimento = nelRombo || sopraIlBuco;
      const nellaZonaAngolo = dentroZonaAngolo(colonna, riga);
      const intensitaElemento = nellaZonaAngolo ? intensitaGonfioreEsterno : intensitaGonfiore;
      if (quadratoMargine(colonna, riga)) {
        continue;
      }
      const scuro = (riga + colonna) % 2 === 0;

      const angoloAltoSinistra = coordElemento(x, y, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);
      const angoloAltoDestra = coordElemento(x + latoQuadrato, y, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);
      const angoloBassoDestra = coordElemento(x + latoQuadrato, y + latoQuadrato, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);
      const angoloBassoSinistra = coordElemento(x, y + latoQuadrato, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);

      noStroke();
      fill(scuro ? 0 : 255);
      beginShape();
      vertex(angoloAltoSinistra[0], angoloAltoSinistra[1]);
      vertex(angoloAltoDestra[0], angoloAltoDestra[1]);
      vertex(angoloBassoDestra[0], angoloBassoDestra[1]);
      vertex(angoloBassoSinistra[0], angoloBassoSinistra[1]);
      endShape(CLOSE);

      // il puntino compare solo nella zona centrale a rombo
      if (nelMovimento
          && !(colonna === colonnaCentrale && riga === rigaCentrale)) {
        // distanze dai lati del riquadro: il puntino resta staccato dal bordo
        const vicino = scartoPuntino;
        const lontano = latoQuadrato - latoPuntino - scartoPuntino;

        // posizione dei due puntini dentro il riquadro, secondo il motivo
        let primoX, primoY, secondoX, secondoY;
        if (colonna === colonnaCentrale) {
          // colonna centrale: motivo ruotato, due puntini affiancati in orizzontale
          // sul lato opposto a prima, verso il centro: in basso sopra il centro
          // e in alto sotto
          const latoY = riga < rigaCentrale ? lontano : vicino;
          primoX = vicino;    primoY = latoY;
          secondoX = lontano; secondoY = latoY;
        } else if (Math.abs(riga - rigaCentrale) <= righeDiagonali
                   && Math.abs(colonna - colonnaCentrale) <= quadratiDiagonali) {
          // nelle righe sopra e sotto il centro, i primi quadrati a destra e
          // a sinistra: diagonale, riflessa rispetto alla colonna centrale
          primoX = colonna > colonnaCentrale ? vicino : lontano;
          primoY = vicino;
          secondoX = colonna > colonnaCentrale ? lontano : vicino;
          secondoY = lontano;
        } else {
          // fuori dalla colonna centrale: due puntini in verticale,
          // sul lato sinistro a sinistra del centro e sul destro a destra
          const latoX = colonna < colonnaCentrale ? vicino : lontano;
          primoX = latoX;   primoY = vicino;
          secondoX = latoX; secondoY = lontano;
        }

        // i puntini alternano quattro posizioni con transizioni graduali
        const fase = Math.floor(frameCount / fotogrammiPerPosizione) % 4;
        const fotogrammiNellaFase = frameCount % fotogrammiPerPosizione;
        const partenza = coordinateFase((fase + 3) % 4, primoX, primoY, secondoX, secondoY, vicino, lontano);
        const arrivo = coordinateFase(fase, primoX, primoY, secondoX, secondoY, vicino, lontano);
        let t = Math.min(fotogrammiNellaFase / fotogrammiDiTransizione, 1);
        t = t * t * (3 - 2 * t);

        primoX = lerp(partenza[0], arrivo[0], t);
        primoY = lerp(partenza[1], arrivo[1], t);
        secondoX = lerp(partenza[2], arrivo[2], t);
        secondoY = lerp(partenza[3], arrivo[3], t);

        // i puntini seguono la stessa deformazione dei quadrati del rombo
        fill(scuro ? 255 : 0);
        const xPrimo = x + primoX + latoPuntino / 2;
        const yPrimo = y + primoY + latoPuntino / 2;
        const xSecondo = x + secondoX + latoPuntino / 2;
        const ySecondo = y + secondoY + latoPuntino / 2;
        const centroPrimo = coordElemento(xPrimo, yPrimo, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);
        const centroSecondo = coordElemento(xSecondo, ySecondo, colonna, riga, nelMovimento, nellaZonaAngolo, intensitaElemento);
        const scalaPrimo = fattoreElemento(xPrimo, yPrimo, colonna, nellaZonaAngolo, intensitaElemento);
        const scalaSecondo = fattoreElemento(xSecondo, ySecondo, colonna, nellaZonaAngolo, intensitaElemento);
        rect(centroPrimo[0] - latoPuntino * scalaPrimo / 2, centroPrimo[1] - latoPuntino * scalaPrimo / 2, latoPuntino * scalaPrimo, latoPuntino * scalaPrimo);
        rect(centroSecondo[0] - latoPuntino * scalaSecondo / 2, centroSecondo[1] - latoPuntino * scalaSecondo / 2, latoPuntino * scalaSecondo, latoPuntino * scalaSecondo);
      }
    }
  }
  disegnaQuadratiMargine();
}

function coordElemento(x, y, colonna, riga, nelRombo, nellaZonaAngolo, intensitaGonfiore) {
  if (nellaZonaAngolo) {
    return coordGonfiataAngolo(x, y, colonna, intensitaGonfiore);
  }
  return nelRombo ? coordGonfiata(x, y, intensitaGonfiore) : [x, y];
}

function coordGonfiataAngolo(x, y, colonna, intensitaGonfiore) {
  const primaColonnaZona = colonna < colonnaCentrale
    ? primaColonnaZonaSinistra
    : primaColonnaZonaAngolo;
  const primaRigaZona = y < altezzaTela / 2
    ? primaRigaZonaAngolo
    : ultimaRigaZonaAngolo;
  const centroZonaX = (primaColonnaZona + latoZonaAngolo / 2) * latoQuadrato;
  const centroZonaY = (primaRigaZona + latoZonaAngolo / 2) * latoQuadrato;
  return coordGonfiataConCentro(
    x,
    y,
    centroZonaX,
    centroZonaY,
    raggioGonfioreAngolo,
    intensitaGonfiore
  );
}

function dentroZonaAngolo(colonna, riga) {
  const nellaZonaSinistra = colonna >= primaColonnaZonaSinistra
    && colonna < primaColonnaZonaSinistra + latoZonaAngolo;
  const nellaZonaDestra = colonna >= primaColonnaZonaAngolo
    && colonna < primaColonnaZonaAngolo + latoZonaAngolo;
  const nellaRigaSuperiore = riga >= primaRigaZonaAngolo
    && riga < primaRigaZonaAngolo + latoZonaAngolo;
  const nellaRigaInferiore = riga >= ultimaRigaZonaAngolo
    && riga < ultimaRigaZonaAngolo + latoZonaAngolo;
  return (nellaRigaSuperiore || nellaRigaInferiore) && (nellaZonaSinistra || nellaZonaDestra);
}

function fattoreGonfiore(x, y, intensita) {
  const distanzaDalCentro = abs(x - larghezzaTela / 2) + abs(y - altezzaTela / 2);
  const influenzaCentrale = Math.max(0, 1 - distanzaDalCentro / raggioRombo);
  return 1 + ampiezzaGonfiore * intensita * influenzaCentrale * influenzaCentrale;
}

function quadratoMargine(colonna, riga) {
  const indiceNero = colonna >= primoQuadratoMargine
    && colonna < primoQuadratoMargine + 2 * quadratiNeriPerMargine
    && (colonna - primoQuadratoMargine) % 2 === 0;
  const rigaNera = riga >= primoQuadratoMargine
    && riga < primoQuadratoMargine + 2 * quadratiNeriPerMargine
    && (riga - primoQuadratoMargine) % 2 === 0;

  return !dentroZonaAngolo(colonna, riga)
      && (((riga === 0 || riga === numeroRighe - 1) && indiceNero)
      || ((colonna === 0 || colonna === numeroColonne - 1) && rigaNera));
}

function disegnaQuadratiMargine() {
  noStroke();
  fill(255);
  for (let indice = 0; indice < quadratiNeriPerMargine; indice++) {
    const coordinata = primoQuadratoMargine + 2 * indice;
    if (!dentroZonaAngolo(coordinata, 0) && !dentroZonaAngolo(coordinata, numeroRighe - 1)) {
      rect(coordinata * latoQuadrato, 0, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(coordinata, numeroRighe - 1)) {
      rect(coordinata * latoQuadrato, altezzaTela - latoQuadrato, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(0, coordinata)) {
      rect(0, coordinata * latoQuadrato, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(numeroColonne - 1, coordinata)) {
      rect(larghezzaTela - latoQuadrato, coordinata * latoQuadrato, latoQuadrato, latoQuadrato);
    }
  }

  fill(0);
  for (let indice = 0; indice < quadratiNeriPerMargine; indice++) {
    const coordinata = primoQuadratoMargine + 2 * indice;
    if (!dentroZonaAngolo(coordinata, 0) && !dentroZonaAngolo(coordinata, numeroRighe - 1)) {
      rect(coordinata * latoQuadrato, 0, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(coordinata, numeroRighe - 1)) {
      rect(coordinata * latoQuadrato, altezzaTela - latoQuadrato, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(0, coordinata)) {
      rect(0, coordinata * latoQuadrato, latoQuadrato, latoQuadrato);
    }
    if (!dentroZonaAngolo(numeroColonne - 1, coordinata)) {
      rect(larghezzaTela - latoQuadrato, coordinata * latoQuadrato, latoQuadrato, latoQuadrato);
    }
  }
}

function coordGonfiata(x, y, intensita) {
  return coordGonfiataConCentro(x, y, larghezzaTela / 2, altezzaTela / 2, raggioRombo, intensita);
}

function coordGonfiataConCentro(x, y, centroX, centroY, raggio, intensita) {
  const distanzaDalCentro = abs(x - centroX) + abs(y - centroY);
  const influenzaCentrale = Math.max(0, 1 - distanzaDalCentro / raggio);
  const fattore = 1 + ampiezzaGonfiore * intensita * influenzaCentrale * influenzaCentrale;
  return [
    centroX + (x - centroX) * fattore,
    centroY + (y - centroY) * fattore
  ];
}

function fattoreElemento(x, y, colonna, nellaZonaAngolo, intensitaGonfiore) {
  if (nellaZonaAngolo) {
    const primaColonnaZona = colonna < colonnaCentrale
      ? primaColonnaZonaSinistra
      : primaColonnaZonaAngolo;
    const primaRigaZona = y < altezzaTela / 2
      ? primaRigaZonaAngolo
      : ultimaRigaZonaAngolo;
    const centroZonaX = (primaColonnaZona + latoZonaAngolo / 2) * latoQuadrato;
    const centroZonaY = (primaRigaZona + latoZonaAngolo / 2) * latoQuadrato;
    return fattoreGonfioreConCentro(x, y, centroZonaX, centroZonaY, raggioGonfioreAngolo, intensitaGonfiore);
  }
  return fattoreGonfiore(x, y, intensitaGonfiore);
}

function fattoreGonfioreConCentro(x, y, centroX, centroY, raggio, intensita) {
  const distanzaDalCentro = abs(x - centroX) + abs(y - centroY);
  const influenzaCentrale = Math.max(0, 1 - distanzaDalCentro / raggio);
  return 1 + ampiezzaGonfiore * intensita * influenzaCentrale * influenzaCentrale;
}

function dentroRombo(riga, colonna) {
  const centroX = colonna * latoQuadrato + latoQuadrato / 2;
  const centroY = riga * latoQuadrato + latoQuadrato / 2;
  return abs(centroX - larghezzaTela / 2) + abs(centroY - altezzaTela / 2) <= raggioRombo;
}

function coordinateFase(fase, motivoX1, motivoY1, motivoX2, motivoY2, vicino, lontano) {
  if (fase === 1) {
    return [vicino, vicino, lontano, vicino];
  }
  if (fase === 2) {
    return [vicino, lontano, lontano, lontano];
  }
  if (fase === 3) {
    return [vicino, vicino, lontano, lontano];
  }
  return [motivoX1, motivoY1, motivoX2, motivoY2];
}

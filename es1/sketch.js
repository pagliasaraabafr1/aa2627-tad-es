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
//   Solo il quadrato al centro del rombo resta senza puntini. Fuori dalla riga
//   e dalla colonna centrali, i quadratini sono in diagonale e seguono il lato
//   corrispondente del rombo.
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
// Movimento: la scacchiera resta ferma, i puntini alternano quattro posizioni
//   passando dall'una all'altra con una transizione graduale. Lo spostamento
//   dei puntini dentro i quadrati tiene in vita l'effetto. Quando i puntini
//   tornano nella combinazione iniziale si fermano per qualche secondo
//   (fotogrammiDiPausa) prima di ripartire.

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

// --- parametri critici ---
const scalaPunti = 0.22;   // lato del puntino / lato del quadrato
const scartoPuntino = 3;   // quanto il puntino sta staccato dal lato del suo quadrato
const raggioRombo = 300;   // i puntini compaiono entro questa distanza a rombo dal centro
// --- movimento ---
const fotogrammiPerPosizione = 300;   // ogni quanti fotogrammi i puntini cambiano posizione
const fotogrammiDiTransizione = 300;  // quanti fotogrammi dura lo spostamento graduale
const fotogrammiDiPausa = 600;        // sosta sulla combinazione iniziale (circa 10 secondi)

// la prima fase dura anche la pausa, quindi il giro completo è più lungo
const durataPrimaFase = fotogrammiPerPosizione + fotogrammiDiPausa;
const cicloPuntini = durataPrimaFase + fotogrammiPerPosizione * 3;

const latoPuntino = latoQuadrato * scalaPunti;

function setup() {
  createCanvas(larghezzaTela, altezzaTela);
}

function draw() {
  background(255);

  for (let riga = 0; riga < numeroRighe; riga++) {
    for (let colonna = 0; colonna < numeroColonne; colonna++) {
      const x = colonna * latoQuadrato;
      const y = riga * latoQuadrato;
      const nelRombo = dentroRombo(riga, colonna);
      const nellaFasciaEsterna = dentroFasciaEsternaRombo(riga, colonna);
      const sopraIlBuco = colonna === colonnaDaEliminare - 1
        && riga === rigaDaEliminare - 2;
      const nelMovimento = nelRombo || sopraIlBuco;
      const scuro = (riga + colonna) % 2 === 0;

      noStroke();
      fill(scuro ? 0 : 255);
      rect(x, y, latoQuadrato, latoQuadrato);

      // il puntino compare solo nella zona centrale a rombo
      if ((nelMovimento || nellaFasciaEsterna)
          && !(colonna === colonnaCentrale && riga === rigaCentrale)) {
        // distanze dai lati del riquadro: il puntino resta staccato dal bordo
        const vicino = scartoPuntino;
        const lontano = latoQuadrato - latoPuntino - scartoPuntino;

        // posizione dei due puntini dentro il riquadro, secondo il motivo
        let primoX, primoY, secondoX, secondoY;
        if (nellaFasciaEsterna
            || (nelRombo && colonna !== colonnaCentrale && riga !== rigaCentrale)) {
          // la diagonale segue il lato del rombo, anche nei quadrati interni
          const diagonaleRiflessa = (colonna < colonnaCentrale) === (riga < rigaCentrale);
          primoX = diagonaleRiflessa ? lontano : vicino;
          primoY = vicino;
          secondoX = diagonaleRiflessa ? vicino : lontano;
          secondoY = lontano;
        } else if (colonna === colonnaCentrale) {
          // colonna centrale: motivo ruotato, due puntini affiancati in orizzontale
          // sul lato opposto a prima, verso il centro: in basso sopra il centro
          // e in alto sotto
          const latoY = riga < rigaCentrale ? lontano : vicino;
          primoX = vicino;    primoY = latoY;
          secondoX = lontano; secondoY = latoY;
        } else if (riga === rigaCentrale) {
          // riga centrale: due puntini in verticale sul lato rivolto al centro
          const latoX = colonna < colonnaCentrale ? lontano : vicino;
          primoX = latoX; primoY = vicino;
          secondoX = latoX; secondoY = lontano;
        } else {
          // fuori dalla colonna centrale: due puntini in verticale,
          // sul lato sinistro a sinistra del centro e sul destro a destra
          const latoX = colonna < colonnaCentrale ? vicino : lontano;
          primoX = latoX;   primoY = vicino;
          secondoX = latoX; secondoY = lontano;
        }

        // i puntini alternano quattro posizioni con transizioni graduali;
        // arrivati alla combinazione iniziale si fermano per qualche secondo
        const tempoNelCiclo = frameCount % cicloPuntini;
        let fase, fotogrammiNellaFase;
        if (tempoNelCiclo < durataPrimaFase) {
          fase = 0;
          // durante la pausa il tempo si blocca sull'ultimo fotogramma del movimento,
          // così i puntini restano fermi nella posizione di arrivo
          fotogrammiNellaFase = Math.min(tempoNelCiclo, fotogrammiPerPosizione);
        } else {
          const tempoDopoLaPrimaFase = tempoNelCiclo - durataPrimaFase;
          fase = 1 + Math.floor(tempoDopoLaPrimaFase / fotogrammiPerPosizione);
          fotogrammiNellaFase = tempoDopoLaPrimaFase % fotogrammiPerPosizione;
        }
        const partenza = coordinateFase((fase + 3) % 4, primoX, primoY, secondoX, secondoY, vicino, lontano);
        const arrivo = coordinateFase(fase, primoX, primoY, secondoX, secondoY, vicino, lontano);
        let t = Math.min(fotogrammiNellaFase / fotogrammiDiTransizione, 1);
        t = t * t * (3 - 2 * t);

        primoX = lerp(partenza[0], arrivo[0], t);
        primoY = lerp(partenza[1], arrivo[1], t);
        secondoX = lerp(partenza[2], arrivo[2], t);
        secondoY = lerp(partenza[3], arrivo[3], t);

        fill(scuro ? 255 : 0);
        rect(x + primoX, y + primoY, latoPuntino, latoPuntino);
        rect(x + secondoX, y + secondoY, latoPuntino, latoPuntino);
      }
    }
  }
}

function dentroRombo(riga, colonna) {
  const centroX = colonna * latoQuadrato + latoQuadrato / 2;
  const centroY = riga * latoQuadrato + latoQuadrato / 2;
  return abs(centroX - larghezzaTela / 2) + abs(centroY - altezzaTela / 2) <= raggioRombo;
}

function dentroFasciaEsternaRombo(riga, colonna) {
  const centroX = colonna * latoQuadrato + latoQuadrato / 2;
  const centroY = riga * latoQuadrato + latoQuadrato / 2;
  const distanzaDalCentro = abs(centroX - larghezzaTela / 2) + abs(centroY - altezzaTela / 2);
  return distanzaDalCentro > raggioRombo
    && distanzaDalCentro <= raggioRombo + latoQuadrato;
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

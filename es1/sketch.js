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
//   scalaPunti = lato del puntino rispetto al lato del quadrato:
//     effetto più evidente con scalaPunti piccola (puntino minuscolo),
//     nessun effetto con scalaPunti grande (il puntino copre il quadrato)
//   scartoPuntino = distanza del puntino dal lato del suo quadrato:
//     effetto più evidente con scartoPuntino piccolo,
//     effetto attenuato con scartoPuntino grande (puntini verso il centro del riquadro)
//   raggioRombo = quanto è estesa la zona a rombo che ospita i puntini
//   colore del puntino: sempre opposto a quello dell'ospite, deciso in draw():
//     nessun effetto se il puntino ha lo stesso colore del quadrato
//   forma quadrata e opacità piena: fisse, non variabili
//
// Movimento: ogni tanto i puntini lasciano il loro posto nel motivo e si
//   spostano in alto, in basso o in diagonale dentro lo stesso riquadro,
//   una posizione ogni fotogrammiPerPosizione fotogrammi. Lo spostamento
//   non è un salto: dura fotogrammiDiTransizione fotogrammi e procede
//   con uno smoothstep, più rapido al centro e morbido agli estremi.

// --- tela ---
const larghezzaTela = 600;
const altezzaTela = 600;

// --- scacchiera ---
const numeroColonne = 13;
const numeroRighe = 13;
const latoQuadrato = larghezzaTela / numeroColonne;
const colonnaCentrale = Math.floor(numeroColonne / 2); // la colonna di mezzo ospita il motivo ruotato
const rigaCentrale = Math.floor(numeroRighe / 2); // il quadrato al centro di questa riga resta pulito

// --- parametri critici ---
const scalaPunti = 0.15;   // lato del puntino / lato del quadrato
const scartoPuntino = 3;   // quanto il puntino sta staccato dal lato del suo quadrato
const raggioRombo = 300;   // i puntini compaiono entro questa distanza a rombo dal centro
const quadratiDiagonali = 4; // quanti quadrati a destra del centro, nella riga sopra, hanno la diagonale
const righeDiagonali = 3;    // quante righe sopra e sotto il centro hanno la diagonale

// --- movimento ---
const fotogrammiPerPosizione = 60;    // ogni quanti fotogrammi i puntini cambiano posizione
const fotogrammiDiTransizione = 40;   // quanti fotogrammi dura lo spostamento graduale

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
      // il quadrato è scuro o chiaro secondo la somma di riga e colonna
      const scuro = (riga + colonna) % 2 === 0;

      noStroke();
      fill(scuro ? 0 : 255);
      rect(x, y, latoQuadrato, latoQuadrato);

      // il puntino compare solo nella zona centrale a rombo
      const distanzaDalCentro = abs(x + latoQuadrato / 2 - larghezzaTela / 2)
                              + abs(y + latoQuadrato / 2 - altezzaTela / 2);
      if (distanzaDalCentro <= raggioRombo && !(colonna === colonnaCentrale && riga === rigaCentrale)) {
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

        // movimento: i puntini si spostano da una posizione del ciclo alla
        // successiva in modo graduale; la posizione di arrivo dipende dalla
        // fase corrente, quella di partenza dalla fase precedente
        const fase = Math.floor(frameCount / fotogrammiPerPosizione) % 4;
        const fotogrammiNellaFase = frameCount % fotogrammiPerPosizione;

        const partenza = coordinateFase((fase + 3) % 4, primoX, primoY, secondoX, secondoY, vicino, lontano);
        const arrivo = coordinateFase(fase, primoX, primoY, secondoX, secondoY, vicino, lontano);

        // lo smoothstep rende lo spostamento morbido all'inizio e alla fine;
        // al termine della transizione i puntini restano fermi fino alla fase dopo
        let t = fotogrammiNellaFase < fotogrammiDiTransizione ? fotogrammiNellaFase / fotogrammiDiTransizione : 1;
        t = t * t * (3 - 2 * t);

        primoX = lerp(partenza[0], arrivo[0], t);
        primoY = lerp(partenza[1], arrivo[1], t);
        secondoX = lerp(partenza[2], arrivo[2], t);
        secondoY = lerp(partenza[3], arrivo[3], t);

        // il puntino ha sempre il colore opposto a quello dell'ospite
        fill(scuro ? 255 : 0);
        rect(x + primoX, y + primoY, latoPuntino, latoPuntino);
        rect(x + secondoX, y + secondoY, latoPuntino, latoPuntino);
      }
    }
  }
}

// le quattro coordinate dei due puntini per una data fase del movimento;
// fase 0 = posizione del motivo, 1 = alto, 2 = basso, 3 = diagonale
function coordinateFase(fase, motivoX1, motivoY1, motivoX2, motivoY2, vicino, lontano) {
  if (fase === 1) {
    // alto: entrambi sul lato alto del riquadro
    return [vicino, vicino, lontano, vicino];
  }
  if (fase === 2) {
    // basso: entrambi sul lato basso
    return [vicino, lontano, lontano, lontano];
  }
  if (fase === 3) {
    // diagonale: agli estremi opposti del riquadro
    return [vicino, vicino, lontano, lontano];
  }
  // fase 0: i puntini restano al loro posto del motivo
  return [motivoX1, motivoY1, motivoX2, motivoY2];
}

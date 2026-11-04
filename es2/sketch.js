// Wassily Kandinsky, 13 Rechtecke, 1930 (60 x 70 cm)
// Fonte: https://www.copia-di-arte.com/a/wassily-kandinsky/13rechtecke.html
// Obiettivo: riprodurre un quadro astratto geometrico e creare varianti cromatiche dinamiche.
// Vincoli: canvas 800x600; colori in HSL, HSB o OKLCH; variazioni casuali limitate da una regola;
// parametri variabili dichiarati all'inizio; animazione o interazione sui colori o sulle aree.

function setup() {
  createCanvas(514, 600);
}

function draw() {
  colorMode(HSB, 360, 100, 100, 100);
  background(46, 52, 67);

  noStroke();

  fill(205, 91, 64);
  rect(82, 126, 106, 73);

  fill(351, 35, 85);
  rect(100, 94, 34, 54);

  fill(17, 74, 34);
  rect(161, 49, 51, 87);

  fill(47, 70, 96);
  rect(273, 128, 87, 88);

  fill(359, 88, 78);
  rect(172, 165, 137, 141);

  fill(8, 78, 40);
  rect(273, 166, 36, 49);

  fill(351, 34, 86);
  rect(360, 240, 17, 19);

  fill(224, 96, 68);
  rect(145, 291, 54, 105);

  fill(25, 30, 17);
  rect(197, 410, 17, 19);

  fill(48, 73, 99);
  rect(160, 448, 37, 39);

  fill(351, 29, 89);
  rect(292, 305, 69, 36);

  fill(48, 75, 96);
  rect(347, 334, 14, 8);

  fill(247, 91, 13);
  rect(335, 333, 53, 91);

  fill(359, 90, 72);
  rect(352, 423, 88, 88);

  fill(204, 18, 93);
  rect(440, 512, 18, 19);
}

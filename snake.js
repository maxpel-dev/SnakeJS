//Constantes
const TAILLE_CASE = 50;
const EMPTY = 0;
const SNAKE_BODY = 1;
const SNAKE_HEAD = 2;
const FOOD = 3;
//Pas de façon simple de récupérer une liste de fichiers en vanilla JS
const NB_NIVEAUX = 3;
var WORLD;

var zone = document.getElementById("zoneJeu");
var context = zone.getContext('2d');
generationNiveau(10, 10, TAILLE_CASE);
dessinerNourriture(0,0, 6)
dessinerQueue(1, 1, 3);
dessinerTete(1, 2, 0);

//--------------------FONCTIONS DE MENU--------------------\\
//Appelé quand la partie interne de l'url change
window.addEventListener("hashchange", function() {
    //Récupère le n° de niveau dans l'url
    var numNiv = this.window.location.href.split("#")[1];
    //Repasser à l'accueil si il n'y a pas de n°
    if(numNiv === undefined){
        retourAccueil();
    }
    console.log("Niveau "+numNiv);
    //Lance le niveau à partir de son numéro
    lireNiveau(numNiv);
});

function afficheListeNiveaux(){
    var listeNv = document.getElementById("listeNiveaux");
    for(let i = 1; i <= NB_NIVEAUX; i++) {
        var textNiv=document.createElement('li');
        var urlNiv=document.createElement('a');

        textNiv.textContent = "Niveau "+i;
        urlNiv.setAttribute("href", "#"+i);

        urlNiv.appendChild(textNiv);
        listeNv.appendChild(urlNiv);
    }
}

function retourAccueil() {
    zone.style.display = "none";
}
//---------------FONCTIONS DE GENERATION DU NIVEAU CHOISI---------------\\
function lireNiveau(num){
    var reqNiveau = new XMLHttpRequest();
    var url="niveaux/niveau"+num+".json";
    reqNiveau.open("GET", url);
    reqNiveau.onerror = function() {
        console.log("Erreur du chargement de l'url " + url);
    };
    reqNiveau.onload = function() {
        if(reqNiveau.status == 200){
            console.log(url);
            console.log("Chargement du niveau "+num);
            var data = JSON.parse(reqNiveau.responseText);
            placementElements(data);
        } else {
            console.log("Erreur du chargement du niveau");
        }
    };
    reqNiveau.send();
}

function placementElements(data) {
    
}

function generationNiveau(nbCasesL, nbCasesH, tailleCases) {
    dessinerZoneJeu(tailleCases*nbCasesL, tailleCases*nbCasesH, 0);
    var WORLD = genererWorldVide(nbCasesL, nbCasesH);
    console.log(WORLD);
}

//---------------FONCTIONS DE DESSIN/AFFCHAGE---------------\\
function dessinerZoneJeu(largeur, hauteur, padding) {
    zone.style.display = "";
    var context = zone.getContext('2d');

    var lCanvas = largeur + (padding*2) + 1;
    var hCanvas = hauteur + (padding*2) + 1;

    zone.setAttribute("width", lCanvas);
    zone.setAttribute("height", hCanvas);

    for (var x = 0; x <= lCanvas; x += TAILLE_CASE) {
        context.moveTo(0.5 + x + padding, padding);
        context.lineTo(0.5 + x + padding, hCanvas + padding);
    }

    for (var x = 0; x <= hCanvas; x += TAILLE_CASE) {
        context.moveTo(padding, 0.5 + x + padding);
        context.lineTo(lCanvas + padding, 0.5 + x + padding);
    }
    context.strokeStyle = "black";
    context.stroke();
}

function dessinerQueue(x, y, pad) {
    context.fillStyle='#067508';
    context.fillRect(TAILLE_CASE*(x)+pad, TAILLE_CASE*(y)+pad, //Position du coin supérieur gauche
     TAILLE_CASE-pad*2+1, TAILLE_CASE-pad*2+1); //Largeur et Hauteur
}

function dessinerTete(x, y, pad) {
    dessinerQueue(x, y, pad); //Pour différencier la tête de la queue, le padding
                              //passé en paramètre est plus faible pour la tête
}

function dessinerNourriture(x, y, pad) {
    context.beginPath();
    context.arc(TAILLE_CASE*(x+0.5)+0.5, TAILLE_CASE*(y+0.5)+0.5, //Position du centre
     TAILLE_CASE/2-pad, 0, 2 * Math.PI); //Taille et angle (cercle entier)
    context.fillStyle = '#d10a0a';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.stroke();
}

//---------------FONCTIONS DE GESTION DES CASES---------------\\
function genererWorldVide(x, y) {
    let i, j;
    let WORLD = new Array(i);
    for (i=0; i<x; i++) {
        WORLD[i] = new Array(j);
        for(j=0; j<y; j++) {
            WORLD[i][j] = EMPTY;
        }
    }
    return WORLD;
}


afficheListeNiveaux();
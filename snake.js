/* Maxime Peloutier

    Le code a été pensé pour être le plus modulaire possible,
notamment via la séparation des fonctions de logique et d'affichage.
    Des modifications on été apportées aux fichiers json pour ajouter
quelques propriétés supplémentaires, comme la direction initiale
et la taille des cases, et faciliter leur édition via un système de 
coordonnées au format [x, y] :
 - plus x est élevé, plus l'élément sera placé vers la droite,
 - plus y est élevé, plus l'élément sera placé vers le bas.
*/

//Constantes
const EMPTY = 0;
const SNAKE_BODY = 1;
const SNAKE_HEAD = 2;
const FOOD = 3;
const WALL = 4;
//Directions
var direction;
var tmp_dir;
const DIR_HAUT = "haut";
const DIR_BAS = "bas";
const DIR_GAUCHE = "gauche";
const DIR_DROITE = "droite";
//Etats du jeu
var ETAT_JEU;
const MENU = -1;
const GAME_OVER = 0;
const RUNNING = 1;
//TODO implémenter un système de pause
const PAUSE = 2
//Pas de façon simple de récupérer une liste de fichiers en vanilla JS
const NB_NIVEAUX = 3;
//Variables globales
var WORLD;
var SNAKE = [[],[]];
var TAILLE_CASE = 30;
var prochaine_case = [2];
var score = 0;
var tick;
//Récupère le canvas et son contexte pour pouvoir dessiner dessus
var zone = document.getElementById("zoneJeu");
var context = zone.getContext('2d');

//------------------------FONCTIONS DE MENU------------------------\\
//Appelé quand la partie interne de l'url change
window.addEventListener("hashchange", function() {
    //Récupère le n° de niveau dans l'url
    var numNiv = this.window.location.href.split("#")[1];
    //Repasser à l'accueil si il n'y a pas de n°
    if(numNiv == undefined || numNiv == 0){
        retourAccueil();
    } else {
        console.log("Niveau "+numNiv);
        cacherListeNiveaux();
        //Lance le niveau à partir de son numéro
        lireNiveau(numNiv);
    }
});

function afficheListeNiveaux(){
    let listeNv = document.getElementById("listeNiveaux");
    for(let i = 1; i <= NB_NIVEAUX; i++) {
        let textNiv=document.createElement('li');
        let urlNiv=document.createElement('a');
        let boutonNiv=document.createElement('button');

        textNiv.textContent = "Niveau "+i;
        urlNiv.setAttribute("href", "#"+i);
        
        urlNiv.appendChild(textNiv);
        boutonNiv.appendChild(urlNiv);
        listeNv.appendChild(boutonNiv);
    }
}


function retourAccueil() {
    reinitialiserNiveau();
    affichageAccueil();
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
    reinitialiserNiveau();
    TAILLE_CASE = data.taille_case;
    generationNiveau(data.dimensions[0], data.dimensions[1], TAILLE_CASE);
    data.food.forEach(f => {
        placerNourriture(f[0], f[1]);
    });
    data.walls.forEach(w => {
        placerMur(w[0], w[1]);
    })
    data.snake.forEach(function callback(s, index) {
        if(index == 0) {
            placerTete(s[0], s[1]);
        } else {
            placerQueue(s[0], s[1], index);
        }
        direction = DIR_HAUT;
    });
    direction = data.direction;
    ETAT_JEU = RUNNING;
    document.getElementById("UIJeu").style.display = "";
    document.getElementById("score").style.display = "block";
    //Lancement de l'écoulement du temps de jeu
    tick = setInterval(step, data.delay);
}

function generationNiveau(nbCasesL, nbCasesH, tailleCases) {
    dessinerGrilleJeu(tailleCases*nbCasesL, tailleCases*nbCasesH, 0);
    var WORLD = genererWorldVide(nbCasesL, nbCasesH);
    console.log(WORLD);
}

//-------------------------LOGIQUE DE JEU-------------------------\\
function step() {
    //Vérifier un input utilisateur : voir section écouteurs
    //Calculer la nouvelle position de la tête du serpent en fonction de sa direction
    tmp_dir = direction;
    checkDirection();
    //Vérifier si la tête du serpent rencontre de la nourriture, un mur, ou un morceau de son corps.
    let grandir = checkCollision();
    /*
    Mise à jour du tableau et de l'affichage du serpent
    Mes fonctions de mise à jour de tableau SNAKE et WORLD appellent elles-même 
    les fonctions de mise à jour visuelle, donc il est plus cohérent d'utliser 
    une même fonction pour la mise à jour simultanée "back" et "front"
    */
   if(ETAT_JEU != GAME_OVER) {
        majSnake(grandir);
   }
   additionScore(1);
}

function majSnake(grandir) {
    placerQueue(SNAKE[0][0], SNAKE[0][1], 0);
    SNAKE.unshift([prochaine_case[0], prochaine_case[1]]);
    placerTete(prochaine_case[0], prochaine_case[1]);

    if(!grandir) {
        let finQueue = SNAKE[SNAKE.length-1];
        placerVide(finQueue[0], finQueue[1]);
        SNAKE.pop();
    } else {
        additionScore(10);
        nouvelleNourriture();
    }
}

function checkDirection() {
    switch(direction) {
        case DIR_HAUT:
            prochaine_case[0] = SNAKE[0][0];
            prochaine_case[1] = SNAKE[0][1]-1;
            break;
        case DIR_BAS:
            prochaine_case[0] = SNAKE[0][0];
            prochaine_case[1] = SNAKE[0][1]+1;
            break;
        case DIR_GAUCHE:
            prochaine_case[0] = SNAKE[0][0]-1;
            prochaine_case[1] = SNAKE[0][1];
            break;
        case DIR_DROITE:
            prochaine_case[0] = SNAKE[0][0]+1;
            prochaine_case[1] = SNAKE[0][1];
            break;
        default:
            console.log("Erreur : direction non définie");
    }
}

//Retourne true si le serpent doir grandir, false sinon
function checkCollision() {
    let pro_x = prochaine_case[0];
    let pro_y = prochaine_case[1];
    if( pro_x < 0 || pro_y < 0
        || pro_x >= WORLD.length || pro_y >= WORLD.length
        || WORLD[pro_x][pro_y] == SNAKE_BODY
        || WORLD[pro_x][pro_y] == WALL) {
            gameOver();
    } else if (WORLD[pro_x][pro_y] == FOOD) {
        console.log("Nourriture mangée");
        return true;
    }
    return false;
}

function gameOver() {
    //Arrêter l'écoulement du temps de jeu
    clearInterval(tick);
    ETAT_JEU = GAME_OVER;
    document.getElementById("msgGameOver").style.display = "block";
}

function additionScore(valeur) {
    score += valeur;
    rafraichirScore(score);
}

//--------------------ECOUTEURS D'ENTREES CLAVIER--------------------\\
document.addEventListener('keydown', function(event) {
    /*L'entrée clavier n'est prise en compte que si elle ne correspond pas à
    l'opposé de la direction actuelle 
    Mise en mémore tampon de la direction actuelle pour éviter que le serpent
    fasse demi-tour sur lui-même si les entrées clavier sont suffisamment rapides*/
    if(event.key == "ArrowUp" && tmp_dir != DIR_BAS) direction = DIR_HAUT;
    if(event.key == "ArrowDown" && tmp_dir != DIR_HAUT) direction = DIR_BAS;
    if(event.key == "ArrowLeft" && tmp_dir != DIR_DROITE) direction = DIR_GAUCHE;
    if(event.key == "ArrowRight" && tmp_dir != DIR_GAUCHE) direction = DIR_DROITE;
});


//---------------FONCTIONS DE GESTION DES CASES---------------\\
function reinitialiserNiveau() {
    //Réinitialise les variables globales
    WORLD = [];
    SNAKE = [[],[]];
    prochaine_case = [2];
    additionScore(-score);
    clearInterval(tick);
    //Nettoie et cache le canvas
    context.clearRect(0, 0, zone.width, zone.height);
    zone.style.display = "none";
    //Cache le score
    document.getElementById("score").style.display = "none";
}

function genererWorldVide(x, y) {
    let i, j;
    WORLD = new Array(i);
    for (i=0; i<x; i++) {
        WORLD[i] = new Array(j);
        for(j=0; j<y; j++) {
            WORLD[i][j] = EMPTY;
        }
    }
    return WORLD;
}

function placerTete(x, y) {
    WORLD[x][y] = SNAKE_HEAD;
    SNAKE[0] = [x, y];
    dessinerTete(x, y, 1);
}
function placerQueue(x, y, section) {
    WORLD[x][y] = SNAKE_BODY;
    SNAKE[section] = [x, y];
    dessinerVide(x, y);
    dessinerQueue(x, y, TAILLE_CASE/10);
}
function placerNourriture(x, y) {
    WORLD[x][y] = FOOD;
    dessinerNourriture(x, y, TAILLE_CASE/5);
}
function placerMur(x, y) {
    WORLD[x][y] = WALL;
    dessinerMur(x, y);
}
function placerVide(x, y) {
    WORLD[x][y] = EMPTY;
    dessinerVide(x, y);
}

function nouvelleNourriture() {
    let placement = false;
    //Prend une case aléatoire jusqu'à en trouver une vide
    while(placement == false) {
        let rand_x = Math.floor(Math.random() * WORLD.length);
        let rand_y = Math.floor(Math.random() * WORLD[0].length);
        //Si la case est vide, place la nourriture et sort de la boucle
        if(WORLD[rand_x][rand_y] == EMPTY) {
            placerNourriture(rand_x, rand_y);
            placement = true;
        }
    }
}

//---------------FONCTIONS DE DESSIN/AFFICHAGE---------------\\
function rafraichirScore(nouvScore) {
    let nbScore = document.getElementById("nbScore");
    nbScore.textContent = nouvScore;
}

function cacherListeNiveaux() {
    document.getElementById("listeNiveaux").style.display = "none";
}

function affichageAccueil() {
    document.getElementById("listeNiveaux").style.display = "block";
    document.getElementById("msgGameOver").style.display = "none";
    document.getElementById("UIJeu").style.display = "none";
}

function dessinerGrilleJeu(largeur, hauteur, padding) {
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

function dessinerVide(x, y) {
    context.fillStyle='#FFFFFF';
    context.fillRect(TAILLE_CASE*(x)+1, TAILLE_CASE*(y)+1, //Position du coin supérieur gauche
     TAILLE_CASE-1, TAILLE_CASE-1);
}

function dessinerMur(x, y) {
    context.fillStyle='#2f2833';
    context.fillRect(TAILLE_CASE*(x)+1, TAILLE_CASE*(y)+1, //Position du coin supérieur gauche
     TAILLE_CASE-1, TAILLE_CASE-1);
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
     TAILLE_CASE/2-pad, 0, 2 * Math.PI); //Taille et angle (2*PI = cercle entier)
    context.fillStyle = '#d10a0a';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#000000';
    context.stroke();
}

afficheListeNiveaux();
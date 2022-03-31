//Constantes
const TAILLE_CASE = 50;
const EMPTY = 0;
const SNAKE_BODY = 1;
const SNAKE_HEAD = 2;
const FOOD = 3;
//Pas de façon simple de récupérer une liste de fichiers en vanilla JS
const NB_NIVEAUX = 1;

var zone = document.getElementById("zoneJeu");

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

async function lireNiveau(num){
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
            affichageNiveau(data);
        } else {
            console.log("Erreur du chargement du niveau");
        }
    };
    reqNiveau.send();
}
/*
function affichageNiveau(data){
    document.getElementById("paragraphe").textContent = data.txt;
    var ll = document.getElementById("listeLiens");
    //Supprime les liens à ne plus afficher
    while(ll.firstChild){
        ll.removeChild(ll.firstChild);
    }
    //Crée et ajoute les liens à afficher dans la liste des liens
    data.links.forEach(link => {
        var textNiv=document.createElement('li');
        var urlLien=document.createElement('a');

        textNiv.textContent = link.txt;
        urlLien.setAttribute("href", link.link);

        urlLien.appendChild(textNiv);
        ll.appendChild(urlLien);
    });
}
*/
function init(tab, dif){
    var i, j;
    for (i=0; i<dif; i++) {
        var tmp = [];
    }
}

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

function retourAccueil() {
    zone.style.display = "none";
}
//Les paramètres doivent etre des multiples de 40
dessinerZoneJeu(TAILLE_CASE*10, TAILLE_CASE*10, 0);
afficheListeNiveaux();
//console.log(niveaux);
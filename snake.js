var zone = document.getElementById("zoneJeu");

//Appelé quand la partie interne de l'url change
window.addEventListener("hashchange", function() {

});

function lireNiveau(num){
    var reqNiveau = new XMLHttpRequest();
    var url="Niveaux/niveau"+num+".json";
    reqNiveau.open("GET", url);
    reqNiveau.onerror = function() {
        console.log("Erreur du chargement de l'url " + url);
    };
    reqNiveau.onload = function() {
        if(reqNiveau.status == 200){
            console.log("Chargement du chapitre");
            var data = JSON.parse(reqNiveau.responseText);
            affichageChapitre(data);
        } else {
            console.log("Erreur du chargement du niveau");
        }
    };
    reqNiveau.send();
}

function affichageNiveau(data){
    document.getElementById("paragraphe").textContent = data.txt;
    var ll = document.getElementById("listeLiens");
    //Supprime les liens à ne plus afficher
    while(ll.firstChild){
        ll.removeChild(ll.firstChild);
    }
    //Crée et ajoute les liens à afficher dans la liste des liens
    data.links.forEach(link => {
        var textLien=document.createElement('li');
        var urlLien=document.createElement('a');

        textLien.textContent = link.txt;
        urlLien.setAttribute("href", link.link);

        urlLien.appendChild(textLien);
        ll.appendChild(urlLien);
    });
}

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

    for (var x = 0; x <= lCanvas; x += 40) {
        context.moveTo(0.5 + x + padding, padding);
        context.lineTo(0.5 + x + padding, hCanvas + padding);
    }

    for (var x = 0; x <= hCanvas; x += 40) {
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
dessinerZoneJeu(400, 400, 0);
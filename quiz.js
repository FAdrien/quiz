var recommencerButton = document.getElementById("recommencer");
var corrigerButton = document.getElementById("corriger");
var solutionButton = document.getElementById("solution");
var submitButton = document.getElementById("submit");

var selectList = document.getElementById("select");

var resultsContainer = document.getElementById("results");
var quizPanel = document.getElementById("quiz");

var questionTotale;

// Nombre de soumissions maximale.
var nombreSoumission;

var coefPlus; //coef bonne réponse
var coefMoins; //coef mauvaise réponse

var time = 0;
var temps;

recommencerButton.addEventListener("click", function() {init();});

corrigerButton.addEventListener("click", function() {
	corrigerButton.style.display = 'none';
	solutionButton.style.display = 'none';
	quizPanel.style.display = 'block';
	submitButton.style.display = 'inline-block';

	timer(temps[0], temps[1], temps[2]);
});

solutionButton.addEventListener("click", showSolution);

submitButton.addEventListener('click', function() {
	quizPanel.style.display = 'none';
	submitButton.style.display = 'none';
	corrigerButton.style.display = 'inline-block';
	solutionButton.style.display = 'inline-block';

	nombreSoumission++; // On incrémente le nombre de soumissions restantes.

	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;
	showResults(); // On actualise le score.
	if (nombreSoumission > 2) { // Au bout de trois soumissions effectuées.
		recommencerButton.style.display = 'inline-block'; // On propose de recommencer.
		corrigerButton.style.display = 'none'; // Plus possible de revoir ses réponses.
	};
});

// Construction du quiz.
function constructionQuiz(){
	document.getElementById('titre').innerHTML = quizParameters["name"];
	coefPlus = quizParameters["+"]; //coef bonne réponse
	coefMoins = quizParameters["-"]; //coef mauvaise réponse

	quizPanel.innerHTML = "";
	quizPanel.style.display = 'block';

	questionTotale = Object.keys(quizQuestions).length;
	quiz_key = shuffle(Object.keys(quizQuestions)).slice(0, 5);
	quiz = {};
	quiz_key.forEach((el) => {
		quiz[el] = quizQuestions[el];
	});

	// Pour chaque questions du quiz (on mélange au préalable les questions).
	quiz_key.forEach((question, i) => {
		// On va stocker les différentes réponses possibles dans une liste.
		var reponses = [];
		// Pour chaque réponse possible à la question on crée un bouton radio  (on mélange au préalable les réponses possibles).
		shuffle(Object.keys(quiz[question].answers)).forEach((number, j) => {
			// On crée la réponse.
			reponses.push(
				`<label>
					<table>
						<td width="10px" valign="middle">
							<input type="radio" name="${question}" value="${number}"> 
						</td>
						<td width="25px" valign="middle"> ${j+1} :  </td>
						<td valign="middle" id="${question}_${number}">
							${quiz[question].answers[number]}
						</td>
					</table>
				</label>`
			);
		});
		reponses.push(
				`<label>
					<table>
						<td width="10px" valign="middle">
							<input checked type="radio" name="${question}" value="${reponses.length+1}"> 
						</td>
						<td width="25px" valign="middle"> ${reponses.length+1} :  </td>
						<td valign="middle" id="${question}_${reponses.length+1}">
							Je passe.
						</td>
					</table>
				</label>`
			);
		quizPanel.innerHTML += 
			`<div>
				<p class="titre_question"><b>Question : ${i+1}/${questionTotale}</b></p>
				<div class="question">${quiz[question].question}</div>
				<div class="answers" id="${question}">${reponses.join("")}</div>
				<hr>
			</div>`
	});
	submitButton.style.display = 'inline-block';
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;

	// Mettre à jour l'affichage des formules LaTeX.
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
};
	
// Affichage des résultats.
function showResults(){
	// Le nombre de bonnes réponses de l'utilisateur.
	var numCorrect = 0;
	var numAbstention = 0;
	var numFausse = 0;

	// Pour chaque questions, on va chercher si l'utilisateur a correctement répondu.
	quiz_key.forEach((question) => {
		// On vérifie si l'utilisateur a répondu à toutes les questions.
		// On recherche les réponses données par l'utilisateur.
		var userAnswer = quizPanel.querySelector(`input[name="${question}"]:checked`).value;
		// Si l'utilisateur a correctement répondu, on incrémente son nombre de bonnes réponses.
		if (userAnswer == quiz[question].correctAnswer) {
			numCorrect++;
		} else if (userAnswer == Object.keys(quiz[question].answers).length+1) {
			numAbstention++;
		} else { // Une mauvaise réponse.
			numFausse++;
		};
	});
	// On affiche le nombre total de réponses justes.
	resultsContainer.innerHTML = "<b>Vous avez effectué " + nombreSoumission + " validation(s) sur 3.</b><br>";
	resultsContainer.innerHTML += "(bonne réponse : +" + coefPlus + " ; mauvaise réponse : " + coefMoins + ")<br><br>";
	resultsContainer.innerHTML += "Réponses correctes : " + numCorrect + "/" + questionTotale + "<br>Réponses fausses : " + numFausse + "/" + questionTotale + "<br>Sans réponse : " + numAbstention + "/" + questionTotale;
	resultsContainer.innerHTML += "<br><center><b>Score : " + (coefPlus*numCorrect+coefMoins*numFausse) + "/"+(coefPlus*questionTotale)+"</b></center>"; // On affiche le score.
	resultsContainer.style.display='inline-block';
};

function showSolution() {
	solutionButton.style.display = 'none'; // Plus de bouton pour accéder aux réponses.
	corrigerButton.style.display = 'none'; // Plus possible de revoir ses réponses.
	recommencerButton.style.display = 'inline-block'; // On propose de recommencer.

	[...document.getElementsByTagName("input")].forEach(element => element.disabled = "true");
	quizPanel.style.display = 'block';
	document.body.scrollTop = 0;
	document.documentElement.scrollTop = 0;

	// On affiche toutes les questions à l'écran.
	for (var i = 1; i <= quiz_key.length; i++) {
		var question = quiz[quiz_key[i - 1]];
		// La bonne réponse : on la colorie en vert.
		document.getElementById(quiz_key[i - 1] + `_` + question.correctAnswer).style.color = "green";
		document.getElementById(quiz_key[i - 1]).insertAdjacentHTML('afterend', "<u>Explication(s)</u>: <p class='comment'>" + question.commentAnswer + "</p>");
		// La réponse de l'utilisateur.
		var reponse = quizPanel.querySelector(`input[name="${quiz_key[i - 1]}"]:checked`).value;
		var userAnswer = document.getElementById(quiz_key[i - 1] + "_" + reponse);
		if (reponse == question.correctAnswer) {
			userAnswer.insertAdjacentHTML('beforeend', " \u2705");
		} else if (reponse != Object.keys(quiz[quiz_key[i - 1]].answers).length+1) {
			userAnswer.style.color = "red";
			userAnswer.insertAdjacentHTML('beforeend', " \u274C");
		};
	};
	// Mettre à jour l'affichage des formules LaTeX.
	MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
};

function shuffle(liste, dernier = 0) {
	// dernier : nombre d'éléments terminaux de la liste à na pas permuter.
	for (var i = liste.length - dernier - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[liste[i], liste[j]] = [liste[j], liste[i]];
	};
	return liste;
};

function getQuiz() {
	clearTimeout(time);
	time = 0;
	document.head.removeChild(document.head.children[0]);
	var script = document.createElement("script");
	script.onload = function() {init();}
	script.src = selectList.options[selectList.selectedIndex].value;
	document.head.prepend(script);
};

function init() {
	recommencerButton.style.display = 'none';
	corrigerButton.style.display = 'none';
	solutionButton.style.display = 'none';
	submitButton.style.display = 'none';
	resultsContainer.style.display = 'none';
	temps = [0, 1, 30];

	nombreSoumission = 0;
	document.activeElement.blur();

	constructionQuiz();
	timer(temps[0], temps[1], temps[2]);
};

getQuiz();

function timer(heure, minute, seconde) {
	if (seconde == 0) {
		seconde = 60;
		if (minute == 0) {
			minute = 60;
			if (heure == 0) {
				console.log("Terminé !");
				$("#submit").click();
				corrigerButton.style.display = 'none';
				recommencerButton.style.display = 'inline-block';
				return;
			} else {
				heure--;
			};
		} else {
			minute--;
		};
	};
	document.getElementById('titre').innerHTML = quizParameters["name"] + " | Temps restant : " + heure + ":" + minute + ":" + seconde;
	if (submitButton.style.display != 'none') {
		time = setTimeout(function() {timer(heure, minute, seconde - 1);}, 1000);
	};
	temps = [heure, minute, seconde];
};


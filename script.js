// Splash Page
const splashPageEl = document.getElementById("splash-page");
const formEl = document.getElementById("start-form");
const radioContainersEl = document.querySelectorAll(".radio-container");
const inputsEl = document.querySelectorAll("input");
const bestScoresEl = document.querySelectorAll(".best-score-value");
const selectionContainerEl = document.querySelector(".selection-container");

//Countdown Page
const countdownPageEl = document.getElementById("countdown-page");
const countdownEl = document.querySelector(".countdown");

//Game Page
const gamePageEl = document.getElementById("game-page");
const itemContainerEl = document.querySelector(".item-container");
const rightBtnEl = document.querySelector(".right");
const wrongBtnEl = document.querySelector(".wrong");
const itemFooterEl = document.querySelector(".item-footer");

//Score Page
const scorePageEl = document.getElementById("score-page");
const finalTimeEl = document.querySelector(".final-time");
const baseTimeEl = document.querySelector(".base-time");
const penaltyTimeEl = document.querySelector(".penalty-time");
const playAgainBtnEl = document.querySelector(".play-again");

//Variables
let questionAmount;
let countdownValue = 3;
let equationsArr = [];
let playerGuessArray = [];
let bestScoreArray = [];

//Game Page Variables
let firstNumber;
let secondNumber;
let equationObject = {};
const wrongFormat = [];

//Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = "0.0";

//refresh Splash Page Best Score
const bestScoresToDOM = () => {
  bestScoresEl.forEach((bestScore, i) => {
    bestScore.textContent = `${bestScoreArray[i].bestScore}s`;
  });
};

//Check local Storage for Best Score, set bestScoreArray
const getSavedBestScores = () => {
  if (localStorage.getItem("bestScores")) {
    bestScoreArray = JSON.parse(localStorage.getItem("bestScores"));
  } else {
    bestScoreArray = [
      { questions: 10, bestScore: finalTimeDisplay },
      { questions: 25, bestScore: finalTimeDisplay },
      { questions: 50, bestScore: finalTimeDisplay },
      { questions: 99, bestScore: finalTimeDisplay },
    ];

    localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
  }
  bestScoresToDOM();
};

//Update Best Score Array
const updateBestScore = () => {
  bestScoreArray.forEach((best) => {
    if (best.questions == questionAmount) {
      const savedBestScore = Number(best.bestScore);
      if (savedBestScore === 0 || savedBestScore > finalTimeDisplay) {
        best.bestScore = finalTimeDisplay;
      }
    }
  });
  bestScoresToDOM();
  localStorage.setItem("bestScores", JSON.stringify(bestScoreArray));
};

//Stop Timer, Process Results, go to Score Page
const checkTime = () => {
  if (playerGuessArray.length == questionAmount) {
    clearInterval(timer);
    playerGuessArray.forEach((guess, i) => {
      if (guess !== equationsArr[i].evaluated) {
        penaltyTime += 0.5;
      }
    });

    finalTime = timePlayed + penaltyTime;
    scoresToDOM();
  }
};

const addTime = () => {
  timePlayed += 0.1;
  checkTime();
};
//Start timer when game page is clicked
const startTimer = () => {
  //Reset times
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;
  timer = setInterval(addTime, 100);
  itemFooterEl.removeEventListener("click", startTimer);
};

//Scores to DOM
const scoresToDOM = () => {
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  finalTimeEl.textContent = `${finalTimeDisplay}s`;
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime.toFixed(1)}s`;
  updateBestScore();
  //Before going to the Score Page resetting the scroll functionalities of Game Page
  itemContainerEl.scrollTo({ top: 0, behavior: "instant" });
  setTimeout(() => {
    playAgainBtnEl.hidden = false;
  }, 1000);
  gamePageEl.hidden = true;
  scorePageEl.hidden = false;
};

//Scroll
let valueY = 0;

//Scroll, store user selection in playerGuessArray
const select = (guess) => {
  //Scroll 80 pixels
  valueY += 80;
  itemContainerEl.scroll(0, valueY);
  //Add player guess to Array
  return guess ? playerGuessArray.push("true") : playerGuessArray.push("false");
};

//Shuffle the equations Array to mix the Correct and Incorrect equations
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

//Get Random Number up to a max number
const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
};

const populateGamePage = () => {
  //Reset DOM, set Blank Space Above
  itemContainerEl.textContent = "";
  //Spacer
  const topSpacer = document.createElement("div");
  topSpacer.classList.add("height-240");
  //Selected Item
  const selectedItem = document.createElement("div");
  selectedItem.classList.add("selected-item");
  //Append
  itemContainerEl.append(topSpacer, selectedItem);

  //Create Equations, Build Elements in DOM
  createEquations();
  equationsToDOM();

  //Set Blank Space Below
  const bottomSpacer = document.createElement("div");
  bottomSpacer.classList.add("height-500");
  itemContainerEl.appendChild(bottomSpacer);
};

//Populating the Game Page with equations
const equationsToDOM = () => {
  equationsArr.forEach((equation) => {
    const div = document.createElement("div");
    div.classList.add("item");
    const h1 = document.createElement("h1");
    h1.textContent = equation.value;
    div.appendChild(h1);
    itemContainerEl.appendChild(div);
  });
};

//Create Correct/Incorrect Random Equations
const createEquations = () => {
  //Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount);
  //Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;

  //Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);

    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: "true" };
    equationsArr.push(equationObject);
  }

  //Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9);
    secondNumber = getRandomInt(9);

    const equationValue = firstNumber * secondNumber;
    //This method of making the equation wrong is not robust. Sometimes It may not work. For Example: If firstNumber = 0 and secondNumber = 6 and It chooses the first wrong format. The equation result will still be right(0x7=0). But based on our logic It will show us false.
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;

    const formatChoice = getRandomInt(3);
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: "false" };
    equationsArr.push(equationObject);
  }
  shuffle(equationsArr);
};

//function for getting Question Amount
const getQuestionAmount = () => {
  let inputValue;
  inputsEl.forEach((inputEl) => {
    if (inputEl.checked) {
      inputValue = inputEl.value;
    }
  });
  return inputValue;
};

//function to show countdown
const showCountdown = () => {
  splashPageEl.hidden = true;
  countdownPageEl.hidden = false;
  countdownEl.textContent = countdownValue;

  let intervalId = setInterval(() => {
    countdownValue--;
    if (countdownValue === 0) {
      countdownEl.textContent = "GO!";
      // setTimeout(() => {
      //   gamePageEl.hidden = false;
      //   countdownPageEl.hidden = true;
      //   clearInterval(intervalId);
      // }, 1000);
    } else if (countdownValue === -1) {
      gamePageEl.hidden = false;
      countdownPageEl.hidden = true;
      populateGamePage();
      clearInterval(intervalId);
    } else {
      // countdownValue--
      countdownEl.textContent = countdownValue;
    }
  }, 1000);
  // populateGamePage();
};

//Event Listners
selectionContainerEl.addEventListener("click", () => {
  radioContainersEl.forEach((radioEl) => {
    radioEl.classList.remove("selected-label");
    if (radioEl.children[1].checked) {
      radioEl.classList.add("selected-label");
    }
  });
});

formEl.addEventListener("submit", (e) => {
  e.preventDefault();
  questionAmount = getQuestionAmount();
  if (questionAmount) {
    showCountdown();
  }
});

rightBtnEl.addEventListener("click", () => {
  select(true);
});
wrongBtnEl.addEventListener("click", () => {
  select(false);
});

itemFooterEl.addEventListener("click", startTimer);

playAgainBtnEl.addEventListener("click", () => {
  itemFooterEl.addEventListener("click", startTimer);
  scorePageEl.hidden = true;
  splashPageEl.hidden = false;
  equationsArr = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtnEl.hidden = true;
  countdownValue = 3;
});

//On Load
getSavedBestScores();

// Initial References
const startScreen = document.querySelector(".start-screen");
const gameScreen = document.querySelector(".game-screen");
const endScreen = document.querySelector(".end-screen");

const startGameBtn = document.getElementById("startGame");
const restartGameBtn = document.getElementById("restart-game");
const restartBtn = document.getElementById("restart");
const nextQuestionBtn = document.getElementById("next-question");

const questionCountInput = document.getElementById("questionCount");
const scoreDisplay = document.getElementById("score");
const finalScoreDisplay = document.getElementById("final-score");

const dragContainer = document.querySelector(".draggable-objects");
const dropContainer = document.querySelector(".drop-points");
const questionTitle = document.getElementById("question-title");

let countriesData = [];
let totalQuestions = 5;
let currentQuestion = 0;
let score = 0;

// Fetch country data from API
const fetchCountries = async () => {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    const data = await response.json();
    countriesData = data
      .map((country) => ({
        name: country.name.common,
        flag: country.flags.svg,
      }))
      .filter((country) => country.flag);
  } catch (error) {
    console.error("Error fetching countries:", error);
  }
};

// Generate random countries
const getRandomCountries = (num) => {
  const selected = [];
  while (selected.length < num) {
    const randomIndex = Math.floor(Math.random() * countriesData.length);
    if (!selected.includes(countriesData[randomIndex])) {
      selected.push(countriesData[randomIndex]);
    }
  }
  return selected;
};

// Create a new question round (3 flags & 3 names)
const createQuestion = async () => {
  await fetchCountries();
  dragContainer.innerHTML = "";
  dropContainer.innerHTML = "";
  nextQuestionBtn.classList.add("hide"); // Hide "Next" button until all matches are made

  let randomData = getRandomCountries(3);
  questionTitle.innerText = `Round ${currentQuestion + 1} of ${totalQuestions}`;

  // Create draggable flag images
  randomData.forEach((country) => {
    const flagDiv = document.createElement("div");
    flagDiv.classList.add("draggable-image");
    flagDiv.setAttribute("draggable", "true");
    flagDiv.setAttribute("id", country.name);
    flagDiv.innerHTML = `<img src="${country.flag}" alt="${country.name}" draggable="false">`;
    flagDiv.addEventListener("dragstart", (e) => dragStart(e, country.name));
    dragContainer.appendChild(flagDiv);
  });

  // Shuffle before creating country name drop areas
  randomData.sort(() => 0.5 - Math.random());

  // Create country drop zones
  randomData.forEach((country) => {
    const countryDiv = document.createElement("div");
    countryDiv.classList.add("countries");
    countryDiv.setAttribute("data-id", country.name);
    countryDiv.innerText = country.name;
    countryDiv.addEventListener("dragover", dragOver);
    countryDiv.addEventListener("drop", drop);
    dropContainer.appendChild(countryDiv);
  });
};

// Start game
startGameBtn.addEventListener("click", () => {
  totalQuestions = parseInt(questionCountInput.value) || 5;
  score = 0;
  currentQuestion = 0;
  scoreDisplay.innerText = score;

  startScreen.classList.add("hide");
  gameScreen.classList.remove("hide");

  createQuestion();
});

// Next question button
nextQuestionBtn.addEventListener("click", () => {
  if (currentQuestion < totalQuestions - 1) {
    currentQuestion++;
    createQuestion();
    nextQuestionBtn.classList.add("hide");
  } else {
    gameScreen.classList.add("hide");
    endScreen.classList.remove("hide");
    finalScoreDisplay.innerText = score;
  }
});

// Restart Game (During the Game)
restartGameBtn.addEventListener("click", () => {
  gameScreen.classList.add("hide");
  startScreen.classList.remove("hide");
});

// Restart Game (After the Game)
restartBtn.addEventListener("click", () => {
  endScreen.classList.add("hide");
  startScreen.classList.remove("hide");
});

// Drag Functions
function dragStart(e, countryName) {
  e.dataTransfer.setData("text/plain", countryName);
  setTimeout(() => {
    e.target.style.opacity = "0.5";
  }, 0);
}

function dragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

function drop(e) {
  e.preventDefault();
  const draggedElementData = e.dataTransfer.getData("text/plain");
  const droppableElementData = e.target.getAttribute("data-id");

  const draggedElement = document.getElementById(draggedElementData);
  draggedElement.style.display = "none";

  e.target.innerHTML = `<img src="${draggedElement.children[0].src}" width="50px">`;

  if (draggedElementData === droppableElementData) {
    e.target.classList.add("correct");
    score += 10;
    scoreDisplay.innerText = score;
  } else {
    e.target.classList.add("wrong");
  }

  if (document.querySelectorAll(".draggable-image:not([style*='display: none'])").length === 0) {
    nextQuestionBtn.classList.remove("hide");
  }
}

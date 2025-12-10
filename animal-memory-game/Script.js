// 动物数据：一个动物会生成两张卡片：英文 + 中文
const animals = [
  { id: 1, en: "Cat", zh: "猫", emoji: "🐱" },
  { id: 2, en: "Dog", zh: "狗", emoji: "🐶" },
  { id: 3, en: "Panda", zh: "熊猫", emoji: "🐼" },
  { id: 4, en: "Tiger", zh: "老虎", emoji: "🐯" },
  { id: 5, en: "Rabbit", zh: "兔子", emoji: "🐰" },
  { id: 6, en: "Monkey", zh: "猴子", emoji: "🐵" },
  { id: 7, en: "Elephant", zh: "大象", emoji: "🐘" },
  { id: 8, en: "Lion", zh: "狮子", emoji: "🦁" }
];

const board = document.getElementById("game-board");
const movesSpan = document.getElementById("moves");
const timeSpan = document.getElementById("time");
const restartBtn = document.getElementById("restart-btn");

const winModal = document.getElementById("win-modal");
const finalTimeSpan = document.getElementById("final-time");
const finalMovesSpan = document.getElementById("final-moves");
const playAgainBtn = document.getElementById("play-again-btn");

let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedCount = 0;
let timer = null;
let elapsedTime = 0;
let gameStarted = false;

// Fisher-Yates 洗牌算法
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 创建卡片数据与 DOM
function generateCards() {
  // 把每个动物拆成两张卡片：英文卡、中文卡
  const cardData = [];
  animals.forEach((animal) => {
    cardData.push({
      pairId: animal.id,
      type: "en",
      text: animal.en,
      emoji: animal.emoji
    });
    cardData.push({
      pairId: animal.id,
      type: "zh",
      text: animal.zh,
      emoji: animal.emoji
    });
  });

  shuffle(cardData);

  board.innerHTML = "";
  cards = [];

  cardData.forEach((data, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.pairId = data.pairId;
    card.dataset.type = data.type;
    card.dataset.index = index;

    const inner = document.createElement("div");
    inner.classList.add("card-inner");

    const back = document.createElement("div");
    back.classList.add("card-face", "card-back");
    back.textContent = "🐾";

    const front = document.createElement("div");
    front.classList.add("card-face", "card-front");

    const emojiEl = document.createElement("div");
    emojiEl.classList.add("emoji");
    emojiEl.textContent = data.emoji;

    const textEl = document.createElement("div");
    textEl.classList.add("text");
    textEl.textContent = data.text;

    const langTag = document.createElement("div");
    langTag.classList.add("lang-tag");
    langTag.textContent = data.type === "en" ? "English" : "中文";

    front.appendChild(emojiEl);
    front.appendChild(textEl);
    front.appendChild(langTag);

    inner.appendChild(back);
    inner.appendChild(front);
    card.appendChild(inner);

    card.addEventListener("click", handleCardClick);

    board.appendChild(card);
    cards.push(card);
  });
}

// 处理点击卡片
function handleCardClick(e) {
  const card = e.currentTarget;

  if (lockBoard) return;
  if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

  // 开始计时
  if (!gameStarted) {
    startTimer();
    gameStarted = true;
  }

  flipCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;
  movesSpan.textContent = moves;

  checkForMatch();
}

// 翻开/翻回卡片
function flipCard(card) {
  card.classList.add("flipped");
}

// 匹配逻辑：pairId 相同 且 type 不同（英文 + 中文）
function checkForMatch() {
  const isMatch =
    firstCard.dataset.pairId === secondCard.dataset.pairId &&
    firstCard.dataset.type !== secondCard.dataset.type;

  if (isMatch) {
    handleMatch();
  } else {
    unflipCards();
  }
}

function handleMatch() {
  firstCard.classList.add("matched");
  secondCard.classList.add("matched");
  matchedCount += 2;

  resetSelection();

  // 检查是否全部匹配完成
  if (matchedCount === cards.length) {
    stopTimer();
    showWinModal();
  }
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetSelection();
  }, 700);
}

function resetSelection() {
  [firstCard, secondCard] = [null, null];
  lockBoard = false;
}

// 计时器
function startTimer() {
  elapsedTime = 0;
  timeSpan.textContent = elapsedTime;
  timer = setInterval(() => {
    elapsedTime++;
    timeSpan.textContent = elapsedTime;
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timer = null;
}

// 初始化游戏
function initGame() {
  stopTimer();
  elapsedTime = 0;
  timeSpan.textContent = "0";
  moves = 0;
  movesSpan.textContent = "0";
  matchedCount = 0;
  gameStarted = false;
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  generateCards();
}

// 胜利弹窗
function showWinModal() {
  finalTimeSpan.textContent = elapsedTime;
  finalMovesSpan.textContent = moves;
  winModal.classList.remove("hidden");
}

function hideWinModal() {
  winModal.classList.add("hidden");
}

// 事件绑定
restartBtn.addEventListener("click", () => {
  hideWinModal();
  initGame();
});

playAgainBtn.addEventListener("click", () => {
  hideWinModal();
  initGame();
});

// 页面加载后启动游戏
window.addEventListener("DOMContentLoaded", initGame);

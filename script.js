// --- Constants ---
const SUITS = ["hearts", "diamonds", "clubs", "spades"];
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const RANK_VALUES = {
    "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10,
    "J": 11, "Q": 12, "K": 13, "A": 14
};
const HAND_SIZE = 5;
const BASE_TARGET_SCORE = 100;
const TARGET_SCORE_INCREASE = 50;
const MAX_DISCARDS_PER_ROUND = 3;
const MAX_SUBMITS_PER_ROUND = 3; // Add below MAX_DISCARDS_PER_ROUND

// --- Scoring Constants ---
const SCORE_TABLE = {
    "Royal Flush": 1000, "Straight Flush": 500, "Four of a Kind": 300,
    "Full House": 150, "Flush": 100, "Straight": 80, "Three of a Kind": 50,
    "Two Pair": 25, "Pair": 10, "High Card": 0
};

// --- Buff ---
const BUFF_ACTIVE = true;
const BUFF_DESCRIPTION = "Pairs score +10 bonus points!";
const PAIR_BONUS = 10;

// --- DOM Elements ---
const playerHandElement = document.getElementById('player-hand');
const targetScoreElement = document.getElementById('target-score');
const currentScoreElement = document.getElementById('current-score');
const roundMessageElement = document.getElementById('round-message');
const buffDescriptionElement = document.getElementById('buff-description');
const startRoundButton = document.getElementById('start-round-btn');
const discardButton = document.getElementById('discard-btn');
const actionButtonsContainer = document.querySelector('.action-buttons');

// --- Dynamically Created Buttons ---
let submitButton = null;
let restartButton = null;

// --- Game State Variables ---
let deck = [];
let playerHand = [];
let currentScore = 0;
let targetScore = BASE_TARGET_SCORE;
let roundInProgress = false;
let currentRound = 0;
let gameOver = false;
let discardsUsed = 0;
let submitsUsed = 0; // Track submit attempts
let discardButtonText = `Discard Selected (${MAX_DISCARDS_PER_ROUND - discardsUsed} left)`;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    createSubmitButton();
    createRestartButton();
    setupEventListeners();
    updateGameInfo("Press 'Start Round' to begin!");
    updateBuffDisplay();
});

// --- Core Functions ---
function createDeck() {
    const newDeck = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            newDeck.push({ suit, rank, selected: false, value: RANK_VALUES[rank] });
        }
    }
    return newDeck;
}

function shuffleDeck(deckToShuffle) {
    for (let i = deckToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
    }
    return deckToShuffle;
}

function dealHand(deckSource, numCards) {
    const hand = [];
    for (let i = 0; i < numCards && deckSource.length > 0; i++) {
        hand.push(deckSource.pop());
    }
    return hand;
}

function renderHand() {
    playerHandElement.innerHTML = '';
    playerHand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.suit = card.suit;
        cardElement.dataset.rank = card.rank;
        cardElement.dataset.selected = card.selected;

        const rankSpan = document.createElement('span');
        rankSpan.classList.add('rank');
        rankSpan.textContent = card.rank;

        const suitSpan = document.createElement('span');
        suitSpan.classList.add('suit', card.suit);
        switch (card.suit) {
            case 'hearts': suitSpan.innerHTML = '&hearts;'; break;
            case 'diamonds': suitSpan.innerHTML = '&diams;'; break;
            case 'clubs': suitSpan.innerHTML = '&clubs;'; break;
            case 'spades': suitSpan.innerHTML = '&spades;'; break;
        }
        cardElement.appendChild(rankSpan);
        cardElement.appendChild(suitSpan);

        if (roundInProgress && !gameOver) {
            cardElement.addEventListener('click', () => toggleCardSelection(card, cardElement));
            cardElement.style.cursor = 'pointer';
        } else {
            cardElement.style.cursor = 'default';
        }
        playerHandElement.appendChild(cardElement);
    });
}

function toggleCardSelection(card, cardElement) {
    if (!roundInProgress || gameOver) return;

    card.selected = !card.selected;
    cardElement.dataset.selected = card.selected;

    const anySelected = playerHand.some(c => c.selected);
    discardButton.disabled = !anySelected || discardsUsed >= MAX_DISCARDS_PER_ROUND;
}

function updateGameInfo(message = roundMessageElement.textContent) {
    targetScoreElement.textContent = targetScore;
    currentScoreElement.textContent = currentScore;
    roundMessageElement.textContent = message;

    let startButtonText = "";
    let startButtonDisabled = false;
    let discardButtonDisabled = true;
    let discardButtonText = `Discard Selected (${MAX_DISCARDS_PER_ROUND - discardsUsed} left)`;
    let submitButtonText = `Submit Hand (${MAX_SUBMITS_PER_ROUND - submitsUsed} left)`;
    let showSubmitButton = false;
    let showRestartButton = false;

    if (gameOver) {
        startButtonText = "Game Over";
        startButtonDisabled = true;
        discardButtonDisabled = true;
        showRestartButton = true;
    } else if (roundInProgress) {
        startButtonText = `Round ${currentRound} in Progress`;
        startButtonDisabled = true;
        discardButtonText = `Discard Selected (${MAX_DISCARDS_PER_ROUND - discardsUsed} left)`;
        discardButtonDisabled = discardsUsed >= MAX_DISCARDS_PER_ROUND;
        showSubmitButton = true;
    } else {
        startButtonText = `Start Round ${currentRound + 1}`;
        startButtonDisabled = false;
        discardButtonDisabled = true;
    }

    startRoundButton.textContent = startButtonText;
    startRoundButton.disabled = startButtonDisabled;
    discardButton.textContent = discardButtonText;
    discardButton.disabled = discardButtonDisabled;

    if (submitButton) {
        submitButton.style.display = showSubmitButton ? 'inline-block' : 'none';
        submitButton.disabled = submitsUsed >= MAX_SUBMITS_PER_ROUND;
        submitButton.textContent = submitButtonText;
    }
    if (restartButton) {
        restartButton.style.display = showRestartButton ? 'inline-block' : 'none';
    }
}

function updateBuffDisplay() {
    if (BUFF_ACTIVE) {
        buffDescriptionElement.textContent = BUFF_DESCRIPTION;
    } else {
        buffDescriptionElement.textContent = "None";
    }
}

// --- Button Creation Functions ---
function createSubmitButton() {
    if (!submitButton) {
        submitButton = document.createElement('button');
        submitButton.id = 'submit-btn';
        submitButton.textContent = 'Submit Hand';
        submitButton.style.display = 'none';
        actionButtonsContainer.appendChild(submitButton);
    }
}

function createRestartButton() {
    if (!restartButton) {
        restartButton = document.createElement('button');
        restartButton.id = 'restart-btn';
        restartButton.textContent = 'Restart Game';
        restartButton.style.display = 'none';
        actionButtonsContainer.appendChild(restartButton);
    }
}

// --- Game Flow Functions ---
function startRound() {
    if (gameOver || roundInProgress) return;

    currentRound++;
    roundInProgress = true;
    discardsUsed = 0;
    submitsUsed = 0; // Reset here
    currentScore = 0;
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = dealHand(deck, HAND_SIZE);
    playerHand.forEach(card => card.selected = false);

    renderHand();
    updateGameInfo(`Round ${currentRound}: Select cards, discard (${MAX_DISCARDS_PER_ROUND} left), or submit (${MAX_SUBMITS_PER_ROUND} left).`);
}


function performDiscard() {
    if (!roundInProgress || gameOver || discardsUsed >= MAX_DISCARDS_PER_ROUND) return;

    const selectedCards = playerHand.filter(card => card.selected);
    if (selectedCards.length === 0) {
        updateGameInfo("Select cards first, then press Discard.");
        return;
    }

    const cardsToKeep = playerHand.filter(card => !card.selected);
    const cardsToDiscardCount = selectedCards.length;
    const newCards = dealHand(deck, cardsToDiscardCount);
    playerHand = cardsToKeep.concat(newCards);
    playerHand.forEach(card => card.selected = false);
    discardsUsed++;

    renderHand();
    let message = `Round ${currentRound}: Discard ${discardsUsed}/${MAX_DISCARDS_PER_ROUND} used. Select cards or submit hand.`;
    if (discardsUsed >= MAX_DISCARDS_PER_ROUND) {
        message = `Round ${currentRound}: All discards used (${discardsUsed}/${MAX_DISCARDS_PER_ROUND}). Submit hand.`;
    }
    updateGameInfo(message);
}

function submitHand() {
    if (!roundInProgress || gameOver || submitsUsed >= MAX_SUBMITS_PER_ROUND) return;

    let cardsToEvaluate = playerHand.filter(card => card.selected);
    if (cardsToEvaluate.length < 1) {
        updateGameInfo("Select at least 2 cards to submit.");
        return;
    }

    const evaluationResult = evaluateHand(cardsToEvaluate);
    const roundScore = calculateScore(evaluationResult);
    currentScore += roundScore;
    submitsUsed++;

    // Discard selected cards and replace with new ones
    const cardsToKeep = playerHand.filter(card => !card.selected);
    const newCards = dealHand(deck, playerHand.length - cardsToKeep.length);
    playerHand = cardsToKeep.concat(newCards);
    playerHand.forEach(card => card.selected = false);

    renderHand();

    let message = `Submit ${submitsUsed}/${MAX_SUBMITS_PER_ROUND}: Scored ${roundScore} from ${evaluationResult.rankName}. Current Score: ${currentScore}.`;

    if (submitsUsed >= MAX_SUBMITS_PER_ROUND) {
        endRound(currentScore, evaluationResult.rankName);
    } else {
        updateGameInfo(message);
    }
}


function endRound(finalScore, handRankName) {
    roundInProgress = false;

    let message = `Round ${currentRound} Over! Hand: ${handRankName}. Score: ${finalScore}. `;
    if (finalScore >= targetScore) {
        message += `Beat the blind! (${targetScore})`;
        targetScore += TARGET_SCORE_INCREASE + (currentRound * 5);
        gameOver = false;
    } else {
        message += `Game Over! Failed blind (${targetScore}). Reached Round ${currentRound}.`;
        gameOver = true;
    }

    updateGameInfo(message);
}

function restartGame() {
    gameOver = false;
    roundInProgress = false;
    currentRound = 0;
    discardsUsed = 0;
    targetScore = BASE_TARGET_SCORE;
    currentScore = 0;
    playerHand = [];
    deck = [];
    renderHand();
    updateGameInfo("Game Restarted. Press 'Start Round' to begin.");
}

// --- Hand Evaluation & Scoring ---
function calculateScore(evaluation) {
    let score = SCORE_TABLE[evaluation.rankName] || 0;

    // Add bonus for pairs if buff is active
    if (BUFF_ACTIVE && (evaluation.rankName === "Pair" || evaluation.rankName === "Two Pair")) {
        score += PAIR_BONUS * evaluation.pairCount;
    }

    return score;
}

function evaluateHand(hand) {
    const sortedHand = [...hand].sort((a, b) => b.value - a.value);
    const rankCounts = countRanks(sortedHand);
    const isFlush = checkFlush(sortedHand);
    const isStraight = checkStraight(sortedHand);

    // Check for Royal Flush
    if (
        sortedHand.length >= 5 &&
        isFlush && isStraight &&
        sortedHand[0].rank === "A" &&
        sortedHand[4].rank === "10"
    ) {
        return { rankName: "Royal Flush", rankCounts };
    }

    // Check for Straight Flush
    if (isFlush && isStraight) {
        return { rankName: "Straight Flush", rankCounts };
    }

    // Check for Four of a Kind
    if (rankCounts.some(count => count === 4)) {
        return { rankName: "Four of a Kind", rankCounts };
    }

    // Check for Full House
    if (rankCounts.includes(3) && rankCounts.includes(2)) {
        return { rankName: "Full House", rankCounts };
    }

    // Check for Flush
    if (isFlush) {
        return { rankName: "Flush", rankCounts };
    }

    // Check for Straight
    if (isStraight) {
        return { rankName: "Straight", rankCounts };
    }

    // Check for Three of a Kind
    if (rankCounts.some(count => count === 3)) {
        return { rankName: "Three of a Kind", rankCounts };
    }

    // Check for Two Pair
    const pairCount = rankCounts.filter(count => count === 2).length;
    if (pairCount >= 2) {
        return { rankName: "Two Pair", rankCounts, pairCount };
    }

    // Check for One Pair
    if (pairCount === 1) {
        return { rankName: "Pair", rankCounts, pairCount: 1 };
    }

    // Otherwise it's High Card
    return { rankName: "High Card", rankCounts };
}

function checkFlush(hand) {
    const firstSuit = hand[0].suit;
    return hand.every(card => card.suit === firstSuit);
}

function checkStraight(sortedHand) {
    for (let i = 0; i < sortedHand.length - 1; i++) {
        if (sortedHand[i].value - 1 !== sortedHand[i + 1].value) {
            return false;
        }
    }
    return true;
}

function countRanks(hand) {
    const counts = {};
    hand.forEach(card => {
        counts[card.rank] = (counts[card.rank] || 0) + 1;
    });
    return Object.values(counts);
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    if (startRoundButton) {
        startRoundButton.addEventListener('click', startRound);
    }

    if (discardButton) {
        discardButton.addEventListener('click', performDiscard);
    }

    if (submitButton) {
        submitButton.addEventListener('click', submitHand);
    }

    if (restartButton) {
        restartButton.addEventListener('click', restartGame);
    }
}
"use strict";
class Card {
    rank;
    suit;
    static SUITS = ["Clubs", "Diamonds", "Hearts", "Spades"];
    static RANKS = [
        "2", "3", "4", "5", "6", "7", "8", "9", "10",
        "Jack", "Queen", "King", "Ace"
    ];
    constructor(rank, suit) {
        this.rank = rank;
        this.suit = suit;
    }
    get name() {
        return `${this.rank} of ${this.suit}`;
    }
    get filename() {
        return `${this.name.replaceAll(" ", "_")}.svg`;
    }
}
class Deck {
    static ALL = Deck.createAll();
    static BY_NAME = new Map(Deck.ALL.map((card) => [card.name.toLowerCase(), card]));
    static createAll() {
        const cards = [];
        for (const suit of Card.SUITS) {
            for (const rank of Card.RANKS) {
                cards.push(new Card(rank, suit));
            }
        }
        return cards;
    }
    static allCards() {
        return Deck.ALL;
    }
    static find(input) {
        return Deck.BY_NAME.get(input.trim().toLowerCase());
    }
    static randomCard() {
        const card = Deck.ALL[Math.floor(Math.random() * Deck.ALL.length)];
        if (card === undefined) {
            throw new Error("No cards available");
        }
        return card;
    }
    cards = [...Deck.ALL];
    constructor() {
        this.shuffle();
    }
    get size() {
        return this.cards.length;
    }
    draw() {
        return this.cards.pop();
    }
    // Fisher-Yates
    shuffle() {
        for (let i = this.size - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const a = this.cards[i];
            const b = this.cards[j];
            if (a === undefined || b === undefined) {
                throw new Error("Shuffle index out of range");
            }
            this.cards[i] = b;
            this.cards[j] = a;
        }
    }
}
class Game {
    static EXACT_GUESS_POINTS = 3;
    static PARTIAL_GUESS_POINTS = 1;
    deck = new Deck();
    revealed = [];
    hitCount = 0;
    pointTotal = 0;
    total = Deck.allCards().length;
    get hits() {
        return this.hitCount;
    }
    get points() {
        return this.pointTotal;
    }
    get revealedCards() {
        return this.revealed;
    }
    get isOver() {
        return this.deck.size === 0;
    }
    guess(card) {
        const revealed = this.deck.draw();
        if (revealed === undefined) {
            throw new Error("The game is over");
        }
        this.revealed.push(revealed);
        const hit = revealed === card;
        if (hit)
            this.hitCount++;
        const points = Game.score(card, revealed);
        this.pointTotal += points;
        return { revealed, hit, points };
    }
    static score(guess, revealed) {
        if (guess === revealed)
            return Game.EXACT_GUESS_POINTS;
        if (guess.rank === revealed.rank || guess.suit === revealed.suit) {
            return Game.PARTIAL_GUESS_POINTS;
        }
        return 0;
    }
}
class GameView {
    game;
    static CARDS_DIR = "playing cards/";
    static CARD_BACK = `${GameView.CARDS_DIR}Card_back_red.svg`;
    static SIMULATION_DELAY_MS = 200;
    input;
    datalist;
    deckImg;
    revealedImg;
    progress;
    feedback;
    restartButton;
    simulateButton;
    simulating = false;
    constructor(game) {
        this.game = game;
        this.input = GameView.require("#guess");
        this.datalist = GameView.require("#card-names");
        this.deckImg = GameView.require("#deck-img");
        this.revealedImg = GameView.require("#revealed-img");
        this.progress = GameView.require("#progress");
        this.feedback = GameView.require("#feedback");
        this.restartButton = GameView.require("#restart");
        this.simulateButton = GameView.require("#simulate-btn");
        this.deckImg.src = GameView.CARD_BACK;
        this.fillDatalist();
        this.input.addEventListener("keydown", (event) => this.onKeyDown(event));
        this.restartButton.addEventListener("click", () => this.restart());
        this.simulateButton.addEventListener("click", () => this.simulate());
        this.updateProgress();
    }
    static require(selector) {
        const element = document.querySelector(selector);
        if (element === null) {
            throw new Error(`${selector} not found`);
        }
        return element;
    }
    static setVisible(element, visible) {
        element.classList.toggle("is-hidden", !visible);
    }
    fillDatalist() {
        for (const card of Deck.allCards()) {
            const option = document.createElement("option");
            option.value = card.name;
            this.datalist.append(option);
        }
    }
    onKeyDown(event) {
        if (event.key !== "Enter" || this.game.isOver)
            return;
        const card = Deck.find(this.input.value);
        if (card === undefined) {
            alert("Not a valid card");
            return;
        }
        this.input.value = "";
        this.play(card);
    }
    play(card) {
        const { revealed, hit, points } = this.game.guess(card);
        this.showRevealed(revealed);
        this.updateProgress();
        this.showFeedback(hit, points);
        this.updateControls();
    }
    showRevealed(card) {
        this.revealedImg.src = GameView.CARDS_DIR + card.filename;
        this.revealedImg.alt = card.name;
        GameView.setVisible(this.revealedImg, true);
        GameView.setVisible(this.deckImg, !this.game.isOver);
    }
    updateProgress() {
        const { revealedCards, total, hits, points } = this.game;
        this.progress.textContent = `Revealed: ${revealedCards.length} of ${total} | Hits: ${hits} | Points: ${points}`;
    }
    showFeedback(hit, points) {
        this.feedback.textContent = `${hit ? "Hit! 🔮" : "Miss 🤷"} +${points}`;
    }
    updateControls() {
        GameView.setVisible(this.input, !this.game.isOver && !this.simulating);
        GameView.setVisible(this.restartButton, this.game.isOver);
    }
    restart() {
        this.game = new Game();
        GameView.setVisible(this.deckImg, true);
        GameView.setVisible(this.revealedImg, false);
        this.feedback.textContent = "";
        this.updateProgress();
        this.updateControls();
        this.input.focus();
    }
    simulate() {
        this.restart();
        this.simulating = true;
        this.simulateButton.disabled = true;
        this.updateControls();
        const timer = window.setInterval(() => {
            this.play(Deck.randomCard());
            if (this.game.isOver) {
                window.clearInterval(timer);
                this.simulating = false;
                this.simulateButton.disabled = false;
            }
        }, GameView.SIMULATION_DELAY_MS);
    }
}
new GameView(new Game());
//# sourceMappingURL=logic.js.map
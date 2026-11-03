type Suit = typeof Card.SUITS[number];
type Rank = typeof Card.RANKS[number];

class Card {
    static readonly SUITS = ["Clubs", "Diamonds", "Hearts", "Spades"] as const;
    static readonly RANKS = [
        "2", "3", "4", "5", "6", "7", "8", "9", "10",
        "Jack", "Queen", "King", "Ace"
    ] as const;

    constructor(
        readonly rank: Rank,
        readonly suit: Suit,
    ) {}

    get name(): string {
        return `${this.rank} of ${this.suit}`;
    }

    get filename(): string {
        return `${this.name.replaceAll(" ", "_")}.svg`;
    }
}

class Deck {
    private static readonly ALL: readonly Card[] = Deck.createAll();

    private static readonly BY_NAME = new Map<string, Card>(
        Deck.ALL.map((card): [string, Card] => [card.name.toLowerCase(), card])
    );

    private static createAll(): Card[] {
        const cards: Card[] = [];
        for (const suit of Card.SUITS) {
            for (const rank of Card.RANKS) {
                cards.push(new Card(rank, suit));
            }
        }
        return cards;
    }

    static allCards(): readonly Card[] {
        return Deck.ALL;
    }

    static find(input: string): Card | undefined {
        return Deck.BY_NAME.get(input.trim().toLowerCase());
    }

    static randomCard(): Card {
        const card = Deck.ALL[Math.floor(Math.random() * Deck.ALL.length)];
        if (card === undefined) {
            throw new Error("No cards available");
        }
        return card;
    }

    private cards: Card[] = [...Deck.ALL];

    constructor() {
        this.shuffle();
    }

    get size(): number {
        return this.cards.length;
    }

    draw(): Card | undefined {
        return this.cards.pop();
    }

    // Fisher-Yates
    private shuffle(): void {
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
    private readonly deck = new Deck();
    private readonly revealed: Card[] = [];
    private hitCount = 0;
    readonly total = Deck.allCards().length;

    get hits(): number {
        return this.hitCount;
    }

    get revealedCards(): readonly Card[] {
        return this.revealed;
    }

    get isOver(): boolean {
        return this.deck.size === 0;
    }

    guess(card: Card): { revealed: Card; hit: boolean } {
        const revealed = this.deck.draw();
        if (revealed === undefined) {
            throw new Error("The game is over");
        }

        this.revealed.push(revealed);
        const hit = revealed === card;
        if (hit) this.hitCount++;

        return { revealed, hit };
    }
}

class GameView {
    static readonly CARDS_DIR = "playing cards/";
    static readonly CARD_BACK = `${GameView.CARDS_DIR}Card_back_red.svg`;
    
    private static readonly SIMULATION_DELAY_MS = 200;

    private readonly input: HTMLInputElement;
    private readonly datalist: HTMLDataListElement;
    private readonly deckImg: HTMLImageElement;
    private readonly revealedImg: HTMLImageElement;
    private readonly progress: HTMLElement;
    private readonly feedback: HTMLElement;
    private readonly restartButton: HTMLButtonElement;
    private readonly simulateButton: HTMLButtonElement;

    private simulating = false;

    constructor(private game: Game) {
        this.input = GameView.require<HTMLInputElement>("#guess");
        this.datalist = GameView.require<HTMLDataListElement>("#card-names");
        this.deckImg = GameView.require<HTMLImageElement>("#deck-img");
        this.revealedImg = GameView.require<HTMLImageElement>("#revealed-img");
        this.progress = GameView.require<HTMLElement>("#progress");
        this.feedback = GameView.require<HTMLElement>("#feedback");
        this.restartButton = GameView.require<HTMLButtonElement>("#restart");
        this.simulateButton = GameView.require<HTMLButtonElement>("#simulate-btn");
        
        this.deckImg.src = GameView.CARD_BACK;
        
        this.fillDatalist();
        this.input.addEventListener("keydown", (event) => this.onKeyDown(event));
        this.restartButton.addEventListener("click", () => this.restart());
        this.simulateButton.addEventListener("click", () => this.simulate());
        this.updateProgress();
    }

    private static require<T extends Element>(selector: string): T {
        const element = document.querySelector<T>(selector);
        if (element === null) {
            throw new Error(`${selector} not found`);
        }
        return element;
    }

    private static setVisible(element: HTMLElement, visible: boolean): void {
        element.classList.toggle("is-hidden", !visible);
    }

    private fillDatalist(): void {
        for (const card of Deck.allCards()) {
            const option = document.createElement("option");
            option.value = card.name;
            this.datalist.append(option);
        }
    }

    private onKeyDown(event: KeyboardEvent): void {
        if (event.key !== "Enter" || this.game.isOver) return;

        const card = Deck.find(this.input.value);
        if (card === undefined) {
            alert("Not a valid card");
            return;
        }

        this.input.value = "";
        this.play(card);
    }

    private play(card: Card): void {
        const { revealed, hit } = this.game.guess(card);
        this.showRevealed(revealed);
        this.updateProgress();
        this.showFeedback(hit);
        this.updateControls();
    }

    private showRevealed(card: Card): void {
        this.revealedImg.src = GameView.CARDS_DIR + card.filename;
        this.revealedImg.alt = card.name;
        GameView.setVisible(this.revealedImg, true);
        GameView.setVisible(this.deckImg, !this.game.isOver);
    }

    private updateProgress(): void {
        const { revealedCards, total, hits } = this.game;
        this.progress.textContent = `Revealed: ${revealedCards.length} of ${total} | Hits: ${hits}`;
    }

    private showFeedback(hit: boolean): void {
        this.feedback.textContent = hit ? "Hit! 🔮" : "Miss 🤷";
    }

    private updateControls(): void {
        GameView.setVisible(this.input, !this.game.isOver && !this.simulating);
        GameView.setVisible(this.restartButton, this.game.isOver);
    }

    private restart(): void {
        this.game = new Game();
        GameView.setVisible(this.deckImg, true);
        GameView.setVisible(this.revealedImg, false);
        this.feedback.textContent = "";
        this.updateProgress();
        this.updateControls();
        this.input.focus();
    }

    private simulate(): void {
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
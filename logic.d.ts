type Suit = typeof Card.SUITS[number];
type Rank = typeof Card.RANKS[number];
declare class Card {
    readonly rank: Rank;
    readonly suit: Suit;
    static readonly SUITS: readonly ["Clubs", "Diamonds", "Hearts", "Spades"];
    static readonly RANKS: readonly ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"];
    constructor(rank: Rank, suit: Suit);
    get name(): string;
    get filename(): string;
}
declare class Deck {
    private static readonly ALL;
    private static readonly BY_NAME;
    private static createAll;
    static allCards(): readonly Card[];
    static find(input: string): Card | undefined;
    static randomCard(): Card;
    private cards;
    constructor();
    get size(): number;
    draw(): Card | undefined;
    private shuffle;
}
declare class Game {
    private readonly deck;
    private readonly revealed;
    private hitCount;
    readonly total: number;
    get hits(): number;
    get revealedCards(): readonly Card[];
    get isOver(): boolean;
    guess(card: Card): {
        revealed: Card;
        hit: boolean;
    };
}
declare class GameView {
    private game;
    static readonly CARDS_DIR = "playing cards/";
    static readonly CARD_BACK: string;
    private static readonly SIMULATION_DELAY_MS;
    private readonly input;
    private readonly datalist;
    private readonly deckImg;
    private readonly revealedImg;
    private readonly progress;
    private readonly feedback;
    private readonly restartButton;
    private readonly simulateButton;
    private simulating;
    constructor(game: Game);
    private static require;
    private static setVisible;
    private fillDatalist;
    private onKeyDown;
    private play;
    private showRevealed;
    private updateProgress;
    private showFeedback;
    private updateControls;
    private restart;
    private simulate;
}
//# sourceMappingURL=logic.d.ts.map
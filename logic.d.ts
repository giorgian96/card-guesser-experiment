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
    get hits(): number;
    get revealedCards(): readonly Card[];
    get isOver(): boolean;
    guess(card: Card): {
        revealed: Card;
        hit: boolean;
    };
}
declare class GameView {
    private readonly game;
    static readonly CARDS_DIR = "playing cards/";
    static readonly CARD_BACK: string;
    private readonly input;
    private readonly datalist;
    constructor(game: Game);
    private static require;
    private fillDatalist;
    private onKeyDown;
}
//# sourceMappingURL=logic.d.ts.map
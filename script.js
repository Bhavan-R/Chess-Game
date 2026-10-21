/**
 * Grandmaster Chess - Premium Edition
 * Architecture:
 *  - GameEngine: Wrapper for chess.js
 *  - GameUI: Handles DOM, Rendering, and Animations
 *  - GameController: Interaction Glue
 */

// Premium Piece SVG Assets
const PIECE_SVGS = {
    'wP': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 11.5C18 11.5 15 15 15 20S18 28.5 22.5 28.5 30 25 30 20 27 11.5 22.5 11.5Z" fill="#fff" stroke="#000" stroke-width="1.5"/><path d="M22.5 28.5V34M18 34H27" stroke="#000" stroke-width="1.5"/></svg>',
    'wR': '<svg viewBox="0 0 45 45" class="piece"><path d="M9 39H36M12 39V10H33V39M15 10V5H30V10M18 10V7H27V10M12 15V10M33 15V10" stroke="#fff" stroke-width="1.5" fill="none"/></svg>',
    'wN': '<svg viewBox="0 0 45 45" class="piece"><path d="M22 10C22 10 18 12 18 18V25H25V18S25 10 22 10Z" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M15 35H30V25L22 22" stroke="#fff" stroke-width="1.5" fill="none"/></svg>',
    'wB': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 10C18 10 15 15 15 22C15 30 22.5 35 22.5 35S30 30 30 22C30 15 27 10 22.5 10Z" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M22.5 15V20M20 18H25" stroke="#fff" stroke-width="1.5" fill="none"/></svg>',
    'wQ': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 8V35M12 20V35H33V20M15 12L22.5 8L30 12" stroke="#fff" stroke-width="1.5" fill="none"/></svg>',
    'wK': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 6V35M12 18V35H33V18M15 12L22.5 6L30 12" stroke="#fff" stroke-width="1.5" fill="none"/><path d="M20 6H25" stroke="#fff" stroke-width="1.5" fill="none"/></svg>',

    'bP': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 11.5C18 11.5 15 15 15 20S18 28.5 22.5 28.5 30 25 30 20 27 11.5 22.5 11.5Z" fill="#000" stroke="#fff" stroke-width="1.5"/><path d="M22.5 28.5V34M18 34H27" stroke="#fff" stroke-width="1.5"/></svg>',
    'bR': '<svg viewBox="0 0 45 45" class="piece"><path d="M9 39H36M12 39V10H33V39M15 10V5H30V10M18 10V7H27V10M12 15V10M33 15V10" stroke="#000" stroke-width="1.5" fill="none"/></svg>',
    'bN': '<svg viewBox="0 0 45 45" class="piece"><path d="M22 10C22 10 18 12 18 18V25H25V18S25 10 22 10Z" stroke="#000" stroke-width="1.5" fill="none"/><path d="M15 35H30V25L22 22" stroke="#000" stroke-width="1.5" fill="none"/></svg>',
    'bB': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 10C18 10 15 15 15 22C15 30 22.5 35 22.5 35S30 30 30 22C30 15 27 10 22.5 10Z" stroke="#000" stroke-width="1.5" fill="none"/><path d="M22.5 15V20M20 18H25" stroke="#000" stroke-width="1.5" fill="none"/></svg>',
    'bQ': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 8V35M12 20V35H33V20M15 12L22.5 8L30 12" stroke="#000" stroke-width="1.5" fill="none"/></svg>',
    'bK': '<svg viewBox="0 0 45 45" class="piece"><path d="M22.5 6V35M12 18V35H33V18M15 12L22.5 6L30 12" stroke="#000" stroke-width="1.5" fill="none"/><path d="M20 6H25" stroke="#000" stroke-width="1.5" fill="none"/></svg>',
};

class ChessEngine {
    constructor() {
        this.game = new Chess();
    }

    makeMove(from, to) {
        return this.game.move({ from, to, promotion: 'q' });
    }

    getLegalMoves(square) {
        return this.game.moves({ square, verbose: true }).map(m => m.to);
    }

    getBoard() {
        return this.game.board();
    }

    getTurn() {
        return this.game.turn() === 'w' ? 'White' : 'Black';
    }

    getStatus() {
        if (this.game.in_checkmate()) return 'Checkmate! Game Over.';
        if (this.game.in_draw()) return 'Draw! Game Over.';
        if (this.game.in_check()) return 'Check!';
        return 'Ready to play';
    }

    getHistory() {
        return this.game.history();
    }

    reset() {
        this.game.reset();
    }
}

class GameUI {
    constructor(engine, controller) {
        this.engine = engine;
        this.controller = controller;
        this.boardEl = document.getElementById('chess-board');
        this.turnEl = document.getElementById('turn-indicator');
        this.statusEl = document.getElementById('game-status');
        this.logEl = document.getElementById('move-log');

        this.initBoard();
    }

    initBoard() {
        this.boardEl.innerHTML = '';
        const board = this.engine.getBoard();

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const square = document.createElement('div');
                square.className = `square ${(r + c) % 2 === 0 ? 'light' : 'dark'}`;

                const coord = this.getCoord(r, c);
                square.dataset.coord = coord;
                square.onclick = () => this.controller.handleSquareClick(coord);

                this.boardEl.appendChild(square);
            }
        }
        this.updatePieces();
    }

    getCoord(r, c) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[c] + ranks[r];
    }

    updatePieces() {
        const board = this.engine.getBoard();
        const squares = this.boardEl.querySelectorAll('.square');

        squares.forEach(sq => {
            const coord = sq.dataset.coord;
            const r = 8 - parseInt(coord[1]);
            const c = coord.charCodeAt(0) - 97;
            const piece = board[r][c];

            sq.innerHTML = '';
            if (piece) {
                const pieceCode = piece.color + piece.type.toUpperCase();
                sq.innerHTML = PIECE_SVGS[pieceCode] || '';
            }
        });
    }

    highlightSelection(coord) {
        this.boardEl.querySelectorAll('.square').forEach(sq => {
            sq.classList.remove('selected');
            if (sq.dataset.coord === coord) sq.classList.add('selected');
        });
    }

    highlightMoves(moves) {
        this.boardEl.querySelectorAll('.legal-dot').forEach(dot => dot.remove());
        moves.forEach(coord => {
            const sq = this.boardEl.querySelector(`[data-coord="${coord}"]`);
            if (sq) {
                const dot = document.createElement('div');
                dot.className = 'legal-dot';
                sq.appendChild(dot);
            }
        });
    }

    highlightLastMove(from, to) {
        this.boardEl.querySelectorAll('.square').forEach(sq => sq.classList.remove('last-move'));
        const fromSq = this.boardEl.querySelector(`[data-coord="${from}"]`);
        const toSq = this.boardEl.querySelector(`[data-coord="${to}"]`);
        if (fromSq) fromSq.classList.add('last-move');
        if (toSq) toSq.classList.add('last-move');
    }

    updatePanel() {
        this.turnEl.innerText = `${this.engine.getTurn()}'s Turn`;
        this.statusEl.innerText = this.engine.getStatus();

        const history = this.engine.getHistory();
        this.logEl.innerHTML = history.map((move, i) =>
            `<div class="move-entry"><strong class="move-num">${Math.floor(i/2) + 1}${i%2 === 0 ? '.w' : '.b'}:</strong> ${move}</div>`
        ).join('');
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }
}

class GameController {
    constructor() {
        this.engine = new ChessEngine();
        this.ui = new GameUI(this.engine, this);
        this.selectedSquare = null;

        this.setupEventListeners();
        this.ui.updatePanel();
    }

    setupEventListeners() {
        document.getElementById('reset-btn').onclick = () => {
            this.engine.reset();
            this.selectedSquare = null;
            this.ui.initBoard();
            this.ui.updatePieces();
            this.ui.updatePanel();
        };
    }

    handleSquareClick(coord) {
        const piece = this.engine.game.get(coord);
        const turn = this.engine.game.turn();

        if (this.selectedSquare) {
            if (this.selectedSquare === coord) {
                this.selectedSquare = null;
                this.ui.highlightSelection(null);
                this.ui.highlightMoves([]);
                return;
            }

            const move = this.engine.makeMove(this.selectedSquare, coord);
            if (move) {
                this.ui.highlightLastMove(this.selectedSquare, coord);
                this.selectedSquare = null;
                this.ui.highlightSelection(null);
                this.ui.highlightMoves([]);
                this.ui.updatePieces();
                this.ui.updatePanel();
                return;
            }
        }

        if (piece && piece.color === turn) {
            this.selectedSquare = coord;
            this.ui.highlightSelection(coord);
            const moves = this.engine.getLegalMoves(coord);
            this.ui.highlightMoves(moves);
        } else {
            this.selectedSquare = null;
            this.ui.highlightSelection(null);
            this.ui.highlightMoves([]);
        }
    }
}

window.onload = () => {
    new GameController();
};

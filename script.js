// Chess Game Logic
class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameOver = false;
        this.winner = null;
    }

    initializeBoard() {
        // Initialize 8x8 chess board
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Set up pawns
        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: 'pawn', color: 'black' };
            board[6][i] = { type: 'pawn', color: 'white' };
        }
        
        // Set up other pieces
        const backRow = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
        for (let i = 0; i < 8; i++) {
            board[0][i] = { type: backRow[i], color: 'black' };
            board[7][i] = { type: backRow[i], color: 'white' };
        }
        
        return board;
    }

    getPieceSymbol(piece) {
        if (!piece) return '';
        const symbols = {
            king: { white: '♔', black: '♚' },
            queen: { white: '♕', black: '♛' },
            rook: { white: '♖', black: '♜' },
            bishop: { white: '♗', black: '♝' },
            knight: { white: '♘', black: '♞' },
            pawn: { white: '♙', black: '♟' }
        };
        return symbols[piece.type][piece.color];
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece || piece.color !== this.currentPlayer) return false;
        if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return false;
        
        const targetPiece = this.board[toRow][toCol];
        if (targetPiece && targetPiece.color === piece.color) return false;

        const rowDiff = toRow - fromRow;
        const colDiff = toCol - fromCol;

        switch (piece.type) {
            case 'pawn':
                const direction = piece.color === 'white' ? -1 : 1;
                const startRow = piece.color === 'white' ? 6 : 1;
                
                if (colDiff === 0 && !targetPiece) {
                    if (rowDiff === direction) return true;
                    if (fromRow === startRow && rowDiff === 2 * direction && !this.board[fromRow + direction][fromCol]) return true;
                }
                if (Math.abs(colDiff) === 1 && rowDiff === direction && targetPiece && targetPiece.color !== piece.color) {
                    return true;
                }
                return false;

            case 'rook':
                if (rowDiff === 0 || colDiff === 0) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'knight':
                return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) || 
                       (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);

            case 'bishop':
                if (Math.abs(rowDiff) === Math.abs(colDiff)) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'queen':
                if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
                    return this.isPathClear(fromRow, fromCol, toRow, toCol);
                }
                return false;

            case 'king':
                return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
        }

        return false;
    }

    isPathClear(fromRow, fromCol, toRow, toCol) {
        const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
        const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
        
        let currentRow = fromRow + rowStep;
        let currentCol = fromCol + colStep;
        
        while (currentRow !== toRow || currentCol !== toCol) {
            if (this.board[currentRow][currentCol]) return false;
            currentRow += rowStep;
            currentCol += colStep;
        }
        
        return true;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        if (!this.isValidMove(fromRow, fromCol, toRow, toCol)) return false;
        
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // Check if king was captured
        if (capturedPiece && capturedPiece.type === 'king') {
            this.gameOver = true;
            this.winner = this.currentPlayer;
        }
        
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        return true;
    }

    getAllPossibleMoves(color) {
        const moves = [];
        for (let fromRow = 0; fromRow < 8; fromRow++) {
            for (let fromCol = 0; fromCol < 8; fromCol++) {
                const piece = this.board[fromRow][fromCol];
                if (piece && piece.color === color) {
                    for (let toRow = 0; toRow < 8; toRow++) {
                        for (let toCol = 0; toCol < 8; toCol++) {
                            if (this.isValidMove(fromRow, fromCol, toRow, toCol)) {
                                moves.push({ fromRow, fromCol, toRow, toCol });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }

    makeBadAIMove() {
        const possibleMoves = this.getAllPossibleMoves('black');
        if (possibleMoves.length === 0) {
            this.gameOver = true;
            this.winner = 'white';
            return null;
        }
        
        // Very bad AI: just pick a random move
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        this.makeMove(randomMove.fromRow, randomMove.fromCol, randomMove.toRow, randomMove.toCol);
        return randomMove;
    }
}

// Story configuration
const story = [
    {
        text: "You wake up in a mysterious room. The walls are covered with strange symbols, and there's a faint humming sound in the distance.\n\nYou notice a control panel on the wall with three buttons.",
        interaction: {
            type: "dropdown",
            label: "Which button do you press?",
            options: ["Red Button", "Blue Button", "Green Button"],
            variable: "buttonChoice"
        }
    },
    {
        text: (vars) => {
            if (vars.buttonChoice === "Red Button") {
                return "The red button glows as you press it. Suddenly, a holographic display appears before you.\n\n'Welcome, traveler. To prove your worth, you must defeat the Training Bot in a game of chess.'";
            } else if (vars.buttonChoice === "Blue Button") {
                return "The blue button clicks softly. A calming melody fills the room, and a chess board materializes before you.\n\n'Challenge the Novice AI to proceed.'";
            } else {
                return "The green button pulses with energy. The room illuminates, revealing a chess table.\n\n'Defeat the beginner opponent to unlock your path.'";
            }
        },
        interaction: {
            type: "chess",
            label: "Play chess against the AI. Click on a piece to select it, then click on a square to move it.",
            variable: "chessResult"
        }
    },
    {
        text: (vars) => {
            if (vars.chessResult === 'win') {
                return `Congratulations! You've defeated the AI player!\n\nThe door slides open, revealing a corridor of infinite possibilities.\n\nYour strategic mind has proven worthy. The adventure continues...\n\n[END OF PROTOTYPE]`;
            } else {
                return `The game ends. Perhaps you can try again another time...\n\n[END OF PROTOTYPE]`;
            }
        },
        interaction: null
    }
];

// Game state
let currentStoryIndex = 0;
let storyVariables = {};
let isTyping = false;
let chessGame = null;

// DOM elements
const storyTextElement = document.getElementById('story-text');
const interactionContainer = document.getElementById('interaction-container');

// Typing effect
function typeText(text, element, speed = 30) {
    return new Promise((resolve) => {
        element.textContent = '';
        let index = 0;
        isTyping = true;

        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            } else {
                isTyping = false;
                resolve();
            }
        }

        type();
    });
}

// Create interaction UI elements
function createInteraction(interaction) {
    interactionContainer.innerHTML = '';
    
    if (!interaction) {
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'fade-in';

    if (interaction.label) {
        const label = document.createElement('div');
        label.className = 'interaction-label';
        label.textContent = interaction.label;
        wrapper.appendChild(label);
    }

    let inputElement;
    let submitButton;

    switch (interaction.type) {
        case 'chess':
            createChessBoard(wrapper, interaction.variable);
            interactionContainer.appendChild(wrapper);
            return;

        case 'dropdown':
            inputElement = document.createElement('select');
            inputElement.innerHTML = '<option value="">-- Select an option --</option>';
            interaction.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                inputElement.appendChild(optionElement);
            });
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = e.target.value === '';
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'date':
            inputElement = document.createElement('input');
            inputElement.type = 'date';
            inputElement.min = '2024-01-01';
            inputElement.max = '2099-12-31';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = !e.target.value;
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'time':
            inputElement = document.createElement('input');
            inputElement.type = 'time';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('change', (e) => {
                submitButton.disabled = !e.target.value;
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value) {
                    handleInteraction(interaction.variable, inputElement.value);
                }
            });
            break;

        case 'text':
            inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.placeholder = 'Type here...';
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            submitButton.disabled = true;
            
            inputElement.addEventListener('input', (e) => {
                submitButton.disabled = e.target.value.trim() === '';
            });
            
            inputElement.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inputElement.value.trim()) {
                    handleInteraction(interaction.variable, inputElement.value.trim());
                }
            });
            
            submitButton.addEventListener('click', () => {
                if (inputElement.value.trim()) {
                    handleInteraction(interaction.variable, inputElement.value.trim());
                }
            });
            break;

        case 'number':
            inputElement = document.createElement('input');
            inputElement.type = 'number';
            inputElement.min = interaction.min || 0;
            inputElement.max = interaction.max || 100;
            inputElement.value = interaction.min || 0;
            
            submitButton = document.createElement('button');
            submitButton.textContent = 'Continue';
            
            submitButton.addEventListener('click', () => {
                const value = parseInt(inputElement.value);
                if (!isNaN(value)) {
                    handleInteraction(interaction.variable, value);
                }
            });
            break;
    }

    wrapper.appendChild(inputElement);
    wrapper.appendChild(submitButton);
    interactionContainer.appendChild(wrapper);
    
    // Focus on the input element
    setTimeout(() => inputElement.focus(), 100);
}

// Create chess board UI
function createChessBoard(container, variable) {
    chessGame = new ChessGame();
    
    const boardContainer = document.createElement('div');
    boardContainer.className = 'chess-board-container';
    
    const board = document.createElement('div');
    board.className = 'chess-board';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'chess-square';
            square.dataset.row = row;
            square.dataset.col = col;
            
            if ((row + col) % 2 === 0) {
                square.classList.add('light');
            } else {
                square.classList.add('dark');
            }
            
            square.addEventListener('click', () => handleChessClick(row, col, variable));
            board.appendChild(square);
        }
    }
    
    boardContainer.appendChild(board);
    
    const status = document.createElement('div');
    status.className = 'chess-status';
    status.id = 'chess-status';
    status.textContent = "White's turn - Select a piece to move";
    boardContainer.appendChild(status);
    
    container.appendChild(boardContainer);
    
    // Update chess board after DOM is rendered
    setTimeout(() => updateChessBoard(), 0);
}

function handleChessClick(row, col, variable) {
    if (chessGame.gameOver) return;
    if (chessGame.currentPlayer !== 'white') return;
    
    const statusElement = document.getElementById('chess-status');
    
    if (chessGame.selectedSquare === null) {
        const piece = chessGame.board[row][col];
        if (piece && piece.color === 'white') {
            chessGame.selectedSquare = { row, col };
            updateChessBoard();
            statusElement.textContent = `Selected ${piece.type} - Click destination square`;
        }
    } else {
        const fromRow = chessGame.selectedSquare.row;
        const fromCol = chessGame.selectedSquare.col;
        
        if (chessGame.makeMove(fromRow, fromCol, row, col)) {
            chessGame.selectedSquare = null;
            updateChessBoard();
            
            if (chessGame.gameOver) {
                statusElement.textContent = `You win! You captured the black king!`;
                setTimeout(() => {
                    handleInteraction(variable, 'win');
                }, 1500);
                return;
            }
            
            statusElement.textContent = "AI is thinking...";
            
            setTimeout(() => {
                const aiMove = chessGame.makeBadAIMove();
                updateChessBoard();
                
                if (chessGame.gameOver) {
                    if (chessGame.winner === 'white') {
                        statusElement.textContent = `You win! The AI has no moves left!`;
                        setTimeout(() => {
                            handleInteraction(variable, 'win');
                        }, 1500);
                    } else {
                        statusElement.textContent = `You lose! The AI captured your king!`;
                        setTimeout(() => {
                            handleInteraction(variable, 'lose');
                        }, 1500);
                    }
                } else {
                    statusElement.textContent = "White's turn - Select a piece to move";
                }
            }, 500);
        } else {
            chessGame.selectedSquare = null;
            updateChessBoard();
            statusElement.textContent = "Invalid move - Try again";
        }
    }
}

function updateChessBoard() {
    const squares = document.querySelectorAll('.chess-square');
    squares.forEach((square) => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = chessGame.board[row][col];
        
        square.textContent = piece ? chessGame.getPieceSymbol(piece) : '';
        
        square.classList.remove('selected', 'valid-move');
        
        if (chessGame.selectedSquare && 
            chessGame.selectedSquare.row === row && 
            chessGame.selectedSquare.col === col) {
            square.classList.add('selected');
        }
    });
}

// Handle user interaction
function handleInteraction(variable, value) {
    storyVariables[variable] = value;
    currentStoryIndex++;
    displayStory();
}

// Display current story segment
async function displayStory() {
    if (currentStoryIndex >= story.length) {
        return;
    }

    const currentStory = story[currentStoryIndex];
    let text = typeof currentStory.text === 'function' 
        ? currentStory.text(storyVariables) 
        : currentStory.text;

    // Clear interaction while typing
    interactionContainer.innerHTML = '';

    // Type the text
    await typeText(text, storyTextElement);

    // Show interaction after text is done
    if (currentStory.interaction) {
        createInteraction(currentStory.interaction);
    }
}

// Start the game
displayStory();


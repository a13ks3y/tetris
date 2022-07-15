setTimeout(() => document.getElementsByClassName('pause-hint')[0].style.display = 'none', 5000);
//todo: OPTIMIZATION!!!
//todo: OOP, refactoring.
//todo: scores
//todo: change size when window changes
//todo: store scores in localStorage/cookies.
//todo: pause indicator, effect
var CELL_WIDTH = Math.floor(document.body.clientHeight / 25);
var CELL_HEIGHT = Math.floor(document.body.clientHeight / 25);
var ctx = document.getElementById('ctx').getContext('2d');
var cells = [];
var staticCells = [];
var piece = null;
var paused = false;

var FIELD_WIDTH = 12;
var FIELD_HEIGHT = 25;

ctx.canvas.width = CELL_WIDTH * FIELD_WIDTH;
ctx.canvas.height = CELL_HEIGHT * FIELD_HEIGHT;

var keyMap = {
    37 : false,
    38 : false,
    39 : false,
    40 : false
};

var clearKeyMap = function () {
    keyMap = {
        37 : false,
        38 : false,
        39 : false,
        40 : false
    };
}


var pieceNatures = {
    'O' : [[
        [1,1],
        [1,1]
    ]],
    'I' : [
        [
            [1,1,1,1]
        ],
        [
            [1],
            [1],
            [1],
            [1]				
        ]
    ],
    'S' : [
        [
            [0,1],
            [1,1],
            [1,0]				
        ],
        [
            [1,1,0],
            [0,1,1]
        ]
    ],

    'Z' : [
        [
            [1,0],
            [1,1],
            [0,1]				
        ],
        [
            [0,1,1],
            [1,1,0]
        ]
    ],
    'T' : [
        [
            [0,1,0],
            [1,1,1]
        ],
        [
            [1,0],
            [1,1],
            [1,0]	
        ],
        [
            [1,1,1],
            [0,1,0]
        ],
        [
            [0,1],
            [1,1],
            [0,1]	
        ]
    ],
    'L' : [
        [
            [1,0],
            [1,0],
            [1,1]	
        ],
        [
            [1,1,1],
            [1,0,0]
        ],
        [
            [1,1],
            [0,1],
            [0,1]	
        ],
        [
            [0,0,1],
            [1,1,1]				
        ]
    ],
    'J' : [
        [
            [0,1],
            [0,1],
            [1,1]	
        ],
        [
            [1,0,0],
            [1,1,1]
        ],
        [
            [1,1],
            [1,0],
            [1,0]	
        ],
        [
            [1,1,1],
            [0,0,1]				
        ]
    ]		
};

var fieldHeight = function () {
    return Math.floor(ctx.canvas.height / CELL_HEIGHT);
};
var fieldWidth = function () {
    return Math.floor(ctx.canvas.width / CELL_WIDTH);
};

var pieceWidth = function (piece) {
    var pieceNature = pieceNatures[piece.pieceNature][piece.rotationIndex];
    var width = 0;
    for (var x = 0; x < pieceNature.length; x ++) {
        for (var y = 0; y < pieceNature[x].length; y++) {
            if (pieceNature[x][y] !=0) {
                if (width < x) {
                    width = x;
                }
            }
        }
    }
    return width + 1;
};
var pieceHeight = function (piece) {
    var pieceNature = pieceNatures[piece.pieceNature][piece.rotationIndex];
    var height = 0;
    for (var x = 0; x < pieceNature.length; x ++) {
        for (var y = 0; y < pieceNature[x].length; y++) {
            if (pieceNature[x][y] !=0) {
                if (height < y) {
                    height = y;
                }
            }
        }
    }
    return height + 1;
};

// Fill cells with empty values
var clearCells = function (cells) {
    for (var x = 0; x < Math.floor(ctx.canvas.width / CELL_WIDTH); x ++ ) {
        cells[x] = [];
        for (var y = 0; y < Math.floor(ctx.canvas.height / CELL_HEIGHT); y++) {
            cells[x][y] = 0;
        }
    };
};

var clearScreen = function () {
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    for (var x = 0; x < Math.floor(ctx.canvas.width / CELL_WIDTH); x ++ ) {
        for (var y = 0; y < Math.floor(ctx.canvas.height / CELL_HEIGHT); y++) {
          ctx.beginPath();
          ctx.rect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
          ctx.fillStyle = 'white';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#aaa';
          ctx.stroke();
        }
    };
};

var renderCells = function (cells) {
    for (var x = 0; x < cells.length; x++) {
        for (var y = 0; y < cells[x].length; y++) {
            if (cells[x][y] != 0) {
                ctx.fillStyle = 'black';
                ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);					
            }
        }
    }
};	

var checkLines = function () {
    for (var y = 0; y < staticCells[0].length; y ++) {
        var line = true;
        for (var x=0; x < staticCells.length; x ++) {
            if (staticCells[x][y] === 0) {
                line = false;
            }
        }
        if (line) {
            for (var ny = y; ny > 1; ny --) {
                for (var nx = 0; nx < staticCells.length; nx ++ ) {
                    staticCells[nx][ny] = staticCells[nx][ny - 1];
                }					
            }
        }
    }		
};

var createRandomPiece = function () {
    return {
        x : Math.floor(FIELD_WIDTH / 2),
        y : 0,
        pieceNature: 'LJITOSZ'[Math.floor(Math.random() * 7)],
        rotationIndex: 0
    }
};

var renderPiece = function (piece, cells) {
    var pieceNature = pieceNatures[piece.pieceNature][piece.rotationIndex];		
    for (var x = 0; x < pieceNature.length; x++) {
        for (var y = 0; y < pieceNature[x].length; y++) {
            if ( pieceNature[x][y] != 0) {
                if (piece.x < 0) {
                    cells[FIELD_WIDTH + piece.x][y + piece.y] = pieceNature[x][y];                            
                } else if (piece.x > FIELD_WIDTH) {
                    cells[FIELD_WIDTH - piece.x][y + piece.y] = pieceNature[x][y];                            
                } else {
                    cells[x + piece.x][y + piece.y] = pieceNature[x][y];
                }
            }
        }
    }
};

var checkPiece = function (piece) {
    var cells = staticCells;
    var pieceNature = pieceNatures[piece.pieceNature][piece.rotationIndex];		
    for (var x = 0; x < pieceNature.length; x++) {
        for (var y = 0; y < pieceNature[x].length; y++) {
            if (pieceNature[x][y] != 0) {
                if (cells[x + piece.x][y + piece.y + 1] != 0) {
                    return false;
                }
            }
        }
    }
    return true;
};

var rotatePiece = function (piece) {
    var oldRotationIndex = piece.rotationIndex;
    piece.rotationIndex ++;
    var pieceNature = pieceNatures[piece.pieceNature]
    if (piece.rotationIndex >= pieceNature.length) {
        piece.rotationIndex = 0;
    }
    var pWidth = pieceWidth(piece);
    var pHeight = pieceHeight(piece);
    if (pWidth + piece.x > fieldWidth()
        || pHeight + piece.y > fieldHeight() || !checkPiece(piece)) {
        piece.rotationIndex = oldRotationIndex;
    } 
};


document.body.onkeydown = function (e) {
    for (var key in keyMap) {
        if (e.which == key) {
            keyMap[key] = true;
        }
    }
    if (e.which == 40) {
        stepInterval = 10;
    }
};

document.body.onkeyup = function (e) {
    if (e.which == 40) {
        stepInterval = 500;
    }
    if (e.which == 80) {
        paused = !paused;
        if (!paused) {
            startGame();
        }
    }
};
document.body.onclick = function(e) {
    var x = e.clientX;
    var y = e.clientY;
    if (y < document.body.clientHeight / 2) {
        keyMap[38] = true;
    } else {
        if (x > document.body.clientWidth / 2) {
            keyMap[39] = true;
        } else {
            keyMap[37] = true;
        }
    }
};

var lastTime = Date.now();
var currentTime = Date.now();
var timeDiff = currentTime - lastTime;
var stepInterval = 500;

piece = createRandomPiece();
clearCells(cells);
clearCells(staticCells);

var render = function () {
    clearCells(cells);
    if (piece) {
        renderPiece(piece, cells);
    }
    clearScreen();
    renderCells(staticCells);
    renderCells(cells);
};

var handleKeyboard = function () {
    if (keyMap[37]) {
        if (piece.x - 1 >= 0) {
            piece.x --;
            if (!checkPiece(piece)) {
                piece.x ++;
            }
        }
    }
    if (keyMap[39]) {
        if (piece.x + 1 <= fieldWidth() - pieceWidth(piece)) {
            piece.x ++;
            if (!checkPiece(piece)) {
                piece.x --;
            }
        }
    }
    if (keyMap[38]) {
        rotatePiece(piece);
    }
    clearKeyMap();
};


var startGame = function () {
    requestAnimationFrame(function loop () {
        if (paused) {
            return;
        }
        currentTime = Date.now();
        timeDiff = currentTime - lastTime;

        handleKeyboard();
        render();

        if (timeDiff >= stepInterval) {
    

            // LOGIC
            if (checkPiece(piece) && piece.y < fieldHeight() - pieceHeight(piece)) {
                piece.y ++ ;
            } else {
                renderPiece(piece, staticCells);
                piece = createRandomPiece();
                if (!checkPiece(piece)) {
                    //todo game over
                    clearCells(cells);
                    clearCells(staticCells);
                    piece = createRandomPiece();
                }
                checkLines();
            }

            lastTime = currentTime;
        }
        requestAnimationFrame(loop, ctx.canvas);
    }, ctx.canvas);

};

startGame();

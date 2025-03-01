// vsnilla on document loaded
document.addEventListener('DOMContentLoaded', function () {
    setup();
    window.requestAnimationFrame(gameLoop);
});

let grid = [];
let newgrid = [];
const tilesize = 8;
let canvasWidth = 0;
let canvasHeight = 0;
let w = 0;
let h = 0;
let ispaused = true;
let lastTime = Date.now();

let cv;
let canvas;

let fps = 20;

function initializeGrid() {
    grid = Array.from({ length: h }, () => new Uint8Array(w));
    newgrid = Array.from({ length: h }, () => new Uint8Array(w));
}

let itemsChangedThisClick = [];
let oldIsPaused = ispaused;
function setup() {
    canvas = document.getElementById("tela");
    cv = canvas.getContext("2d");
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    canvas.width = windowWidth;
    canvas.height = windowHeight;

    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    w = Math.floor(canvasWidth / tilesize);
    h = Math.floor(canvasHeight / tilesize);

    initializeGrid();

    function handleMouse(evt) {
        const mx = evt.clientX;
        const my = evt.clientY;

        const i = Math.floor(my / tilesize);
        const j = Math.floor(mx / tilesize);

        // if not changed this click
        if (itemsChangedThisClick.some(([x, y]) => x === i && y === j)) {
            return;
        }

        grid[i][j] = grid[i][j] === 1 ? 0 : 1;
        itemsChangedThisClick.push([i, j]);
    }

    canvas.addEventListener("mousedown", (event) => {
        itemsChangedThisClick = [];
        oldIsPaused = ispaused;
        ispaused = true;
        handleMouse(event);
    });
    canvas.addEventListener("mouseup", () => {
        ispaused = oldIsPaused
    });
    canvas.addEventListener("mousemove", (evt) => {
        if (evt.buttons === 1) {
            handleMouse(evt);
        }
    });

    const button = document.getElementById("play");
    button.addEventListener("click", () => {
        ispaused = !ispaused;
        button.innerText = ispaused ? "Play" : "Pause";
    });

    const resetBtn = document.getElementById("reset");
    resetBtn.addEventListener("click", initializeGrid);

    const saveBtn = document.getElementById("save");
    saveBtn.addEventListener("click", () => {
        const data = JSON.stringify(grid);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "save.json";
        a.click();
    });

    const loadBtn = document.getElementById("load");
    loadBtn.addEventListener("change", (evt) => {
        const file = evt.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = JSON.parse(e.target.result);
            grid = data;
        };
        reader.readAsText(file);
    });

    const fpsInput = document.getElementById("fps");
    fpsInput.addEventListener("input", (evt) => {
        fps = parseInt(evt.target.value);
    });

    const shiftUp = document.getElementById("shiftUp");
    shiftUp.addEventListener("click", () => {
        grid.unshift(new Uint8Array(w));
        grid.pop();
    });
    const shiftDown = document.getElementById("shiftDown");
    shiftDown.addEventListener("click", () => {
        grid.push(new Uint8Array(w));
        grid.shift();
    });
    
}

function draw() {
    
    cv.fillStyle = "black";
    cv.clearRect(0, 0, canvasWidth, canvasHeight);
    cv.strokeStyle = "#050505";


    cv.fillStyle ="#00FF00";
    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            if (grid[i][j] === 1) {
                cv.fillRect(j * tilesize, i * tilesize, tilesize, tilesize);
            }
            if(i == h-1){
                cv.beginPath();
                cv.moveTo(j * tilesize, 0);
                cv.lineTo(j * tilesize, canvasHeight);
                cv.stroke();
            }
        }
        cv.beginPath();
        cv.moveTo(0, i * tilesize);
        cv.lineTo(canvasWidth, i * tilesize);
        cv.stroke(); 
    }


    
}

function update() {
    if (ispaused) return;

    for (let i = 0; i < h; i++) {
        for (let j = 0; j < w; j++) {
            const vizinhos = contarvizinhos(i, j);
            newgrid[i][j] = (grid[i][j] === 0 && vizinhos === 3) || (grid[i][j] === 1 && (vizinhos === 2 || vizinhos === 3)) ? 1 : 0;
        }
    }

    [grid, newgrid] = [newgrid, grid];
}

function contarvizinhos(i, j) {
    let total = 0;

    for (let l = Math.max(i - 1, 0); l <= Math.min(i + 1, h - 1); l++) {
        for (let c = Math.max(j - 1, 0); c <= Math.min(j + 1, w - 1); c++) {
            if (!(l === i && c === j) && grid[l][c] === 1) {
                total++;
            }
        }
    }
    return total;
}

function gameLoop() {
    const init = Date.now();
    draw();
    update();

    const end = Date.now();
    const delta = end - init;
    

    let delay = 1000 / fps - delta;
    if(ispaused){
        delay = 0
    }

    cv.fillStyle = "#0F0";
    cv.font = "20px Arial";
    const currenstFPS = Math.floor(1000 / (end - lastTime));
    cv.fillText(`FPS: ${currenstFPS}`, 10, 30);
    lastTime = end;
    
    setTimeout(() => {
        window.requestAnimationFrame(gameLoop);
    }, delay);
}
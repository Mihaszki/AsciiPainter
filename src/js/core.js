// Initialize canvas and other values
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const grid = [];

const tileSize = 16;
const padding = 2;
let activeFgColor = 'White';
let activeBgColor = 'Black';

// Basic canvas settings
ctx.font = `${tileSize - 4}px sans-serif`;
ctx.fillStyle = '#000000';
ctx.textAlign = 'center'; 
ctx.textBaseline = 'middle';

let activeCharacter = null;
let activeCharButton = null;
let activeFgColorButton = null;
let activeBgColorButton = null;

// Calculate how many tiles you want to draw
const tilesNumber = Math.round(canvas.width / (tileSize + padding));

// ANSI escape codes for color change
const colorTableFg = {
  'FgBlack': '\\x1b[30m',
  'FgRed': '\\x1b[31m',
  'FgGreen': '\\x1b[32m',
  'FgYellow': '\\x1b[33m',
  'FgBlue': '\\x1b[34m',
  'FgMagenta': '\\x1b[35m',
  'FgCyan': '\\x1b[36m',
  'FgWhite': '\\x1b[37m',
};
const colorTableBg = {
  'BgBlack': '\\x1b[40m',
  'BgRed': '\\x1b[41m',
  'BgGreen': '\\x1b[42m',
  'BgYellow': '\\x1b[43m',
  'BgBlue': '\\x1b[44m',
  'BgMagenta': '\\x1b[45m',
  'BgCyan': '\\x1b[46m',
  'BgWhite': '\\x1b[47m',
};

// Draw the tiles and fill the 2D array
for(let i = 0; i < tilesNumber; i++) {
  const tmp = [];
  for(let j = 0; j < tilesNumber; j++) {
    const x = (tileSize + padding) * i;
    const y = (tileSize + padding) * j;
    tmp.push({
      x: x,
      y: y,
      char: null,
      fg: 'White',
      bg: 'Black',
    });
    ctx.fillStyle = '#2b2b2b';
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.fillStyle = activeFgColor;
    ctx.fillText(' ', x + (tileSize / 2), y + (tileSize / 2));
  }
  grid.push(tmp);
}
console.log(grid);

// Return a new button
function createButton(id, text) {
  const button = document.createElement('button');
  button.setAttribute('id', id);
  button.classList.add('btn');
  button.textContent = text;
  return button;
}

// Create an array of characters and create buttons based on it
const characters = '#@!?$%^&*()[]{}<>~=+.,/|:;\'"-_░▓█▀╚╔╩╦╠═╬╣║╗╝'.split('');
activeCharacter = characters[0];
const charsButtonsElement = document.getElementById('characters-buttons');
for(let i = 0; i < characters.length; i++) {
  const button = createButton(`btn-${i}`, characters[i]);
  button.addEventListener('click', function() {
    activeCharacter = this.textContent;
    // Add class to active button
    activeCharButton.classList.toggle('active');
    this.classList.toggle('active');
    activeCharButton = this;
  });
  charsButtonsElement.appendChild(button);
}
activeCharButton = document.getElementById('btn-0');
activeCharButton.classList.toggle('active');

// Create buttons for fg color changing
const fgColorsButtonsElement = document.getElementById('fg-colors-buttons');
for (const key in colorTableFg) {
  const button = createButton(key, key.slice(2));
  button.classList.add('width40');
  button.addEventListener('click', function() {
    activeFgColor = this.textContent;
    // Add class to active button
    activeFgColorButton.classList.toggle('active');
    this.classList.toggle('active');
    activeFgColorButton = this;
  });
  fgColorsButtonsElement.appendChild(button);
}
activeFgColorButton = document.getElementById('FgWhite');
activeFgColorButton.classList.toggle('active');

// Create buttons for bg color changing
const bgColorsButtonsElement = document.getElementById('bg-colors-buttons');
for (const key in colorTableBg) {
  const button = createButton(key, key.slice(2));
  button.classList.add('width40');
  button.addEventListener('click', function() {
    activeBgColor = this.textContent;
    // Add class to active button
    activeBgColorButton.classList.toggle('active');
    this.classList.toggle('active');
    activeBgColorButton = this;
  });
  bgColorsButtonsElement.appendChild(button);
}
activeBgColorButton = document.getElementById('BgBlack');
activeBgColorButton.classList.toggle('active');

// Create a button for grid reset
const fillbutton = createButton(`btn-fill`, 'Fill the screen with the selected character');
fillbutton.classList.add('width90');
fillbutton.addEventListener('click', function() {
  for (let j = 0; j < grid.length; j++) {
    for (let i = 0; i < grid[j].length; i++) {
      grid[i][j].char = activeCharacter;
      grid[i][j].fg = activeFgColor;
      grid[i][j].bg = activeBgColor;
      ctx.fillStyle = activeBgColor;
      ctx.fillRect(grid[i][j].x, grid[i][j].y, tileSize, tileSize);
      ctx.fillStyle = activeFgColor;
      ctx.fillText(grid[i][j].char, grid[i][j].x + (tileSize / 2), grid[i][j].y + (tileSize / 2));
    }
  }
  generateCode();
});
charsButtonsElement.appendChild(fillbutton);

// Get {x,y} of cursor
function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {x: e.clientX - rect.left, y: e.clientY - rect.top};
};

// Code generator
function generateCode() {
  const resetCode = '\\x1b[0m';
  let plainTextCode = '';
  let jsCode = '';
  let previewCode = '';
  let lastFg = '';
  let lastBg = '';
  let firstChar = false;
  for (let j = 0; j < grid.length; j++) {
      for (let i = 0; i < grid[j].length; i++) {
          if(grid[i][j].char) {
            plainTextCode += grid[i][j].char;
            previewCode += `<span style="background:${grid[i][j].bg};color:${grid[i][j].fg}">${grid[i][j].char}</span>`;
            if(!firstChar) {
              jsCode += resetCode + colorTableBg['Bg' + grid[i][j].bg] + colorTableFg['Fg' + grid[i][j].fg];
              firstChar = true;
            }
            // Check if the colors are the same to not repeat them in code
            if(lastFg != grid[i][j].fg || lastBg != grid[i][j].bg) {
              jsCode += resetCode + colorTableBg['Bg' + grid[i][j].bg] + colorTableFg['Fg' + grid[i][j].fg];
            }
            jsCode += grid[i][j].char;
            lastFg = grid[i][j].fg;
            lastBg = grid[i][j].bg;
          }
      }
      if(grid[j + 1]) {
        plainTextCode += '\n';
        jsCode += resetCode + '\\n';
        previewCode += '<br>';
      }
      firstChar = false;
  }
  // Regex hell. Remove unnecessary new lines
  jsCode = jsCode.replace(/(\\x1b\[0m\\n){2,}/g, '\\x1b\[0m\\n').replace(/^\\x1b\[0m\\n|\\x1b\[0m\\n$/g, '');
  document.getElementById('plainTextCode').value = plainTextCode.replace(/\s+/g, '\n').trim();
  document.getElementById('jsCode').value = `console.log(\`${jsCode + resetCode}\`)`;
  document.getElementById('previewCode').innerHTML = previewCode.replace(/(<br>){2,}/g, '<br>').replace(/^<br>|<br>$/g, '');
}

// Draw function
function mouseClick(e) {
  const pos = getMousePos(e);
  const x = pos.x;
  const y = pos.y;

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      // Check if user clicked somewhere on tile
      if(x > grid[i][j].x && x < grid[i][j].x + tileSize + padding
        && y > grid[i][j].y && y < grid[i][j].y + tileSize + padding) {
        grid[i][j].char = activeCharacter;
        grid[i][j].fg = activeFgColor;
        grid[i][j].bg = activeBgColor;
        ctx.fillStyle = activeBgColor;
        ctx.fillRect(grid[i][j].x, grid[i][j].y, tileSize, tileSize);
        ctx.fillStyle = activeFgColor;
        ctx.fillText(grid[i][j].char, grid[i][j].x + (tileSize / 2), grid[i][j].y + (tileSize / 2));
        return;
      }
    }
  }
}

// Setup mouse events
let isMouseDown = false;
canvas.addEventListener('mousedown', () => {
  isMouseDown = true;
});

canvas.addEventListener('mouseup', e => {
  if(isMouseDown) mouseClick(e);
  generateCode();
  isMouseDown = false;
});

canvas.addEventListener('mousemove', e => {
  if(!isMouseDown) return;
  mouseClick(e);
  return false;
});
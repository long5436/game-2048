const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const { innerHeight, innerWidth } = window;
canvas.height = innerHeight;
canvas.width = innerWidth;

class Game {
  constructor(context, sizeGame, width, height) {
    this.registeredClick = {};
    this.gameOver = false;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.context = context;
    this.spacing = 10;
    this.sizeItem = 100;
    this.sizeGame = sizeGame;
    this.sizeContainer =
      this.sizeItem * this.sizeGame + this.spacing * (this.sizeGame + 1);
    this.arr2D = [];
    this.arrZero = [];
    // color
    this.colors = {
      background: 'rgb(187,173,160)',
      textDark: 'rgb(116,105,99)',
      textLight: 'rgb(255,255,255)',
      0: 'rgb(214,205,196)',
      2: 'rgb(239,229,219)',
      4: 'rgb(237,225,201)',
      8: 'rgb(243,178,124)',
      16: 'rgb(240,142,96)',
      32: 'rgb(241,121,96)',
      64: 'rgb(245,95,60)',
      128: 'rgb(224,201,117)',
      256: 'rgb(237,204,97)',
      512: 'rgb(237,197,80)',
      1024: 'rgb(237,197,80)',
      2048: 'rgb(236,194,48)',
      4096: 'rgb(254,61,62)',
      unknown: 'rgb(237,42,30)',
    };

    this.createArr2D();
    this.getAllItemHaveZeroValue();
  }

  createArr2D() {
    const arr = new Array();
    let x = 0;
    let y = 0;

    for (let index = 0; index < this.sizeGame; index++) {
      arr.push(new Array(this.sizeGame));
    }

    for (let i = 0; i < arr.length; i++) {
      for (let k = 0; k < arr[i].length; k++) {
        x = this.spacing + k * (this.sizeItem + this.spacing);
        y = this.spacing + i * (this.sizeItem + this.spacing);

        arr[i][k] = { x, y, value: 0 };
      }
    }

    this.arr2D = arr;
  }

  testMode() {
    for (let i = 0; i < this.sizeGame; i++) {
      for (let k = 0; k < this.sizeGame; k++) {
        if (this.ramdomIndex(0, 1) == 1) {
          this.arr2D[i][k].value = this.randomValueItem(65536);
        }
      }
    }

    this.drawGame();
  }

  renderItem(x, y, value) {
    // draw background
    this.context.beginPath();
    this.context.fillStyle = this.colors[0];

    if (value > 0 && this.colors[value]) {
      this.context.fillStyle = this.colors[value];
    } else if (value > 4096) {
      this.context.fillStyle = this.colors.unknown;
    }

    this.context.roundRect(x + 100, y + 100, this.sizeItem, this.sizeItem, [4]);
    this.context.fill();

    // draw text
    let textFit = 0;
    this.context.font = '48px sans-serif';
    this.context.fillStyle =
      value > 4 ? this.colors.textLight : this.colors.textDark;

    const text = this.context.measureText(value);
    const textWidth = Math.round(text.width);

    if (this.colors[value]) {
      this.context.fillStyle = this.colors[value].color;
    }
    // this.context.textAlign = 'center';
    this.context.textBaseline = 'top';

    if (textWidth > this.sizeItem) {
      textFit = textWidth - this.sizeItem;
      this.context.font = `${48 - textFit / 2}px sans-serif`;
    }

    this.context.fillText(
      value === 0 ? '' : value,
      x + 100 + (this.sizeItem - textWidth) / 2 + textFit / 2,
      y + 100 + 30
    );
  }

  clearDraw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.registeredClick = {};
  }

  drawScore(x, y) {
    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(x + 10, y + 10, 80, 50, [8]);
    this.context.fill();

    this.context.font = '18px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText('Score', x + 23, y + 15);

    this.context.font = '20px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText(this.score, x + 23, y + 35);
  }

  drawHighScore(x, y) {
    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(x + 10, y + 10, 115, 50, [8]);
    this.context.fill();

    this.context.font = '18px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText('High Score', x + 23, y + 15);

    this.context.font = '20px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText(this.score, x + 23, y + 35);
  }

  drawButton(x, y) {
    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(x + 10, y + 10, 120, 50, [8]);
    this.context.fill();

    const img = new Image();
    img.src = './assets/rotate.svg';
    img.onload = () => {
      this.context.drawImage(img, x + 20, y + 20, 30, 30);
    };

    this.context.font = '18px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText('Restart', x + 60, y + 27);

    // register click
    this.registeredClick.btnRestart = {
      positionX: x + 10,
      positionY: y + 10,
      width: 120,
      height: 50,
      callback: () => {
        this.score = 0;
        this.gameOver = false;
        this.createArr2D();
        this.startGame();
      },
    };
  }

  drawGameOver(x, y) {
    this.context.fillStyle = 'rgba(255,255,255,0.7)';
    this.context.fillRect(0, 0, this.width, this.height);

    this.context.beginPath();
    this.context.fillStyle = this.colors[0];
    this.context.roundRect(x, y, 400, 400, [10]);
    this.context.fill();

    this.context.font = '50px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    this.context.fillText('Game over!', x + 60, y + 27);

    this.context.font = '30px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    this.context.fillText('Your score is', x + 100, y + 100);

    this.context.font = '70px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    const text = this.context.measureText(this.score);
    const textWidth = Math.round(text.width);

    this.context.fillText(this.score, x + (400 - textWidth) / 2, y + 150);

    this.drawButton(x + 125, y + 300);
  }

  drawInfo() {
    this.context.beginPath();
    this.context.fillStyle = 'rgba(0,0,0,0.05)';
    this.context.roundRect(600, 100, 300, 200);
    this.context.fill();

    this.drawScore(600, 100);
    this.drawHighScore(700, 100);
    this.drawButton(600, 170);

    // this.drawGameOver(200, 100);
  }

  drawGame() {
    this.clearDraw();
    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(100, 100, this.sizeContainer, this.sizeContainer, [
      10,
    ]);
    this.context.fill();

    for (let i = 0; i < this.arr2D.length; i++) {
      for (let k = 0; k < this.arr2D[i].length; k++) {
        const { x, y, value } = this.arr2D[i][k];
        this.renderItem(x, y, value);
      }
    }

    this.getAllItemHaveZeroValue();

    this.drawInfo();

    if (this.gameOver) this.drawGameOver(200, 100);

    // https://stackoverflow.com/questions/49197700/es6-class-this-in-callback-of-requestanimationframe
    // requestAnimationFrame(this.drawGame.bind(this));
  }

  getAllItemHaveZeroValue() {
    const arr = [];

    for (let i = 0; i < this.arr2D.length; i++) {
      for (let k = 0; k < this.arr2D[i].length; k++) {
        if (this.arr2D[i][k].value === 0) {
          arr.push({ x: i, y: k });
        }
      }
    }

    this.arrZero = arr;
  }

  randomValueItem(max) {
    const items = [];
    for (let i = 2; i <= max; i *= 2) {
      items.push(i);
    }

    return items[this.ramdomIndex(0, items.length)] || 0;
  }

  ramdomIndex(min = 0, max) {
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  randomNewItem() {
    const index1 = this.ramdomIndex(0, this.arrZero.length - 1);

    try {
      this.arr2D[this.arrZero[index1].x][this.arrZero[index1].y].value = 2;
      // this.drawGame();
    } catch (error) {
      console.log(error);
      this.gameOver = true;
    }
  }

  startGame() {
    this.getAllItemHaveZeroValue();
    this.randomNewItem();
    this.getAllItemHaveZeroValue();
    this.randomNewItem(); //max =8;

    game.drawGame();
    game.handleKeyDown();
  }

  HandlingAndCalculatingItemValue(key) {
    // convert arr row to col
    const converArrRowToCol = [];
    for (let h = 0; h < this.sizeGame; h++) {
      const newCol = [];

      for (let k = 0; k < this.sizeGame; k++) {
        if (key === 'up' || key === 'down') {
          newCol[k] = this.arr2D[k][h].value;
        } else {
          newCol[k] = this.arr2D[h][k].value;
        }
      }

      converArrRowToCol.push(newCol.reverse());
    }

    // remove all zero
    converArrRowToCol.forEach((row, index) => {
      converArrRowToCol[index] = row.filter((item) => item > 0);
    });

    // calculator value
    converArrRowToCol.forEach((row, index) => {
      const arrCalculated = row
        .map((item, indexRow) => {
          if (indexRow === row.length - 1) {
            return item;
          } else if (row[indexRow] === row[indexRow + 1]) {
            row[indexRow] = row[indexRow] + row[indexRow + 1];
            row[indexRow + 1] = 0;

            this.score += row[indexRow];

            return row[indexRow];
          } else if (row[indexRow] > 0) {
            return row[indexRow];
          } else {
            return (row[indexRow] = 0);
          }
        })
        .filter((e) => e > 0)
        .reverse();

      const sizeWithoutEmpty = arrCalculated.length;

      if (key === 'up' || key === 'left') {
        arrCalculated.length += this.sizeGame - arrCalculated.length;
        arrCalculated.fill(0, sizeWithoutEmpty, this.sizeGame);
      } else {
        let sizeLoop = this.sizeGame - sizeWithoutEmpty;
        while (sizeLoop > 0) {
          arrCalculated.unshift(0);

          sizeLoop = sizeLoop - 1;
        }
      }

      converArrRowToCol[index] = arrCalculated;
    });

    // merge value to arr2D
    for (let h = 0; h < this.sizeGame; h++) {
      for (let k = 0; k < this.sizeGame; k++) {
        if (key === 'up' || key === 'down') {
          this.arr2D[k][h].value = converArrRowToCol[h][k];
        } else {
          this.arr2D[k][h].value = converArrRowToCol[k][h];
        }
      }
    }

    // console.log(converArrRowToCol);
  }

  logTableArr2D() {
    const arr = [];

    for (let i = 0; i < this.sizeGame; i++) {
      const arrItem = [];
      arr.push(arrItem);
      for (let k = 0; k < this.sizeGame; k++) {
        if (this.arr2D[i][k].value > 0) {
          arrItem.push(this.arr2D[i][k].value);
        } else {
          arrItem.push(null);
        }
      }
    }

    console.table(arr);
  }

  handleKeyDown() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          this.HandlingAndCalculatingItemValue('up'); // up = true
          break;
        case 'ArrowRight':
          this.HandlingAndCalculatingItemValue('right'); // right = true
          break;
        case 'ArrowLeft':
          this.HandlingAndCalculatingItemValue('left'); // right = false
          break;
        case 'ArrowDown':
          this.HandlingAndCalculatingItemValue('down'); // up = true
          break;
        default:
          break;
      }
      this.getAllItemHaveZeroValue();
      this.randomNewItem();
      // this.drawGame();

      // this.logTableArr2D();
      requestAnimationFrame(this.drawGame.bind(this));
    });
  }

  addClick(canvas) {
    canvas.addEventListener('click', (e) => {
      const x = e.offsetX;
      const y = e.offsetY;

      for (const key in this.registeredClick) {
        if (Object.hasOwnProperty.call(this.registeredClick, key)) {
          const element = this.registeredClick[key];
          const { callback, height, positionX, positionY, width } = element;

          if (
            x <= positionX + width &&
            y <= positionY + height &&
            x >= positionX &&
            y >= positionY
          ) {
            if (callback) callback();
          }
        }
      }
    });
  }
}

const game = new Game(ctx, 4, innerWidth, innerHeight);

game.startGame();
// game.testMode();
game.addClick(canvas);

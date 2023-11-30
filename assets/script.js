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
    this.xStart = 0;
    this.yStart = 0;
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

    //

    this.xStart = (this.width - this.sizeContainer) / 2;
    this.yStart = 150;

    if (width <= 480) {
      this.xStart = this.spacing / 2;

      this.sizeItem =
        Math.round(this.width / this.sizeGame) -
        (this.spacing + this.spacing / 2);
      console.log(this.sizeItem);

      //   // this.sizeItem = width / (4 + 10 * 5);
      //   this.sizeItem = 80;
      this.sizeContainer =
        this.sizeItem * this.sizeGame + this.spacing * (this.sizeGame + 1);
      //   console.log(canvas.width);
    }

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

  drawItem(x, y, value) {
    // draw background
    this.context.beginPath();
    this.context.fillStyle = this.colors[0];

    if (value > 0 && this.colors[value]) {
      this.context.fillStyle = this.colors[value];
    } else if (value > 4096) {
      this.context.fillStyle = this.colors.unknown;
    }

    this.context.roundRect(
      x + this.xStart,
      y + this.yStart,
      this.sizeItem,
      this.sizeItem,
      [4]
    );
    this.context.fill();

    // draw text
    let textFit = 0;
    this.context.font = '3rem sans-serif';
    this.context.fillStyle =
      value > 4 ? this.colors.textLight : this.colors.textDark;

    let text = this.context.measureText(value);
    let textWidth = Math.round(text.width);

    if (this.colors[value]) {
      this.context.fillStyle = this.colors[value].color;
    }
    // this.context.textAlign = 'center';
    this.context.textBaseline = 'top';

    if (text.actualBoundingBoxRight > this.sizeItem) {
      textFit = text.width - this.sizeItem;
      this.context.font = `${3 - (textFit * 3) / 100}rem sans-serif`;
      text = this.context.measureText(value);
      textWidth = Math.round(text.width);
    }

    this.context.fillText(
      value === 0 ? '' : value,
      x + this.xStart + ((text.width - this.sizeItem) / 2) * -1,
      y + this.yStart + (this.sizeItem - Math.abs(text.alphabeticBaseline)) / 2
    );

    // if (text.actualBoundingBoxRight > this.sizeItem) {
    //   textFit = text.actualBoundingBoxRight - this.sizeItem;
    //   this.context.font = `${48 - textFit / 2}px sans-serif`;
    //   text = this.context.measureText(value);
    //   textWidth = Math.round(text.width);
    // }

    // this.context.fillText(
    //   value === 0 ? '' : value,
    //   x +
    //     this.xStart +
    //     (this.sizeItem - text.actualBoundingBoxRight) / 2 +
    //     textFit / 2,
    //   y + this.yStart + (this.sizeItem - Math.abs(text.alphabeticBaseline)) / 2
    // );
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
    this.context.roundRect(x, y, this.sizeContainer, 400, [10]);
    this.context.fill();

    this.context.font = '50px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    this.context.fillText(
      'Game over!',
      x + (this.sizeContainer - 260) / 2,
      y + 27
    );

    this.context.font = '30px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    this.context.fillText(
      'Your score is',
      x + (this.sizeContainer - 180) / 2,
      y + 100
    );

    this.context.font = '70px sans-serif';
    this.context.fillStyle = this.colors.textDark;
    const text = this.context.measureText(this.score);
    const textWidth = Math.round(text.width);

    this.context.fillText(
      this.score,
      x + (this.sizeContainer - textWidth) / 2,
      y + 150
    );

    this.drawButton(x + (this.sizeContainer - 150) / 2, y + 300);
  }

  drawInfo() {
    const sizeInfoWidth = 225;
    const xInfo = this.xStart + (this.sizeContainer - sizeInfoWidth) / 2;

    this.context.beginPath();
    this.context.fillStyle = 'rgba(0,0,0,0.05)';
    this.context.roundRect(xInfo, 10, sizeInfoWidth, 130);
    this.context.fill();

    this.drawScore(xInfo, 10);
    this.drawHighScore(xInfo + 180 / 2, 10);
    this.drawButton(xInfo, 70);

    // this.drawGameOver(200, 100);
  }

  drawControlButton(direction) {
    const width = 80;
    let x = this.xStart + (this.sizeContainer - width) / 2;
    let y = this.yStart;
    let textBtn = '';

    switch (direction) {
      case 'up':
        y = y + 450;
        textBtn = '🡡';
        break;
      case 'down':
        y = y + 550;
        textBtn = '🡣';
        break;
      case 'left':
        x = x - 100;
        y = y + 500;
        textBtn = '🡠';
        break;
      case 'right':
        x = x + 100;
        y = y + 500;
        textBtn = '🡢';
        break;
      default:
        break;
    }

    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(x, y, width, 50, [8]);
    this.context.fill();

    this.context.font = '38px sans-serif';
    this.context.fillStyle = this.colors.textLight;
    this.context.fillText(textBtn, x + 23, y + 10);

    // register click
    this.registeredClick['btnControl' + direction] = {
      positionX: x,
      positionY: y,
      width: width,
      height: 50,
      callback: () => {
        this.handlingAndCalculatingItemValue(direction);
      },
    };
  }

  drawControl() {
    this.drawControlButton('up');
    this.drawControlButton('down');
    this.drawControlButton('left');
    this.drawControlButton('right');
  }

  drawGame() {
    this.clearDraw();
    this.context.beginPath();
    this.context.fillStyle = this.colors.background;
    this.context.roundRect(
      this.xStart,
      this.yStart,
      this.sizeContainer,
      this.sizeContainer,
      [10]
    );
    this.context.fill();

    for (let i = 0; i < this.arr2D.length; i++) {
      for (let k = 0; k < this.arr2D[i].length; k++) {
        const { x, y, value } = this.arr2D[i][k];
        this.drawItem(x, y, value);
      }
    }

    this.getAllItemHaveZeroValue();

    this.drawInfo();
    this.drawControl();

    if (this.gameOver) {
      this.drawGameOver(this.xStart, 100);
    }

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

    this.drawGame();
    this.handleKeyDown();
    this.handleTouch();
  }

  handlingAndCalculatingItemValue(key) {
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

    this.getAllItemHaveZeroValue();
    this.randomNewItem();
    requestAnimationFrame(this.drawGame.bind(this));
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
          this.handlingAndCalculatingItemValue('up');
          break;
        case 'ArrowRight':
          this.handlingAndCalculatingItemValue('right');
          break;
        case 'ArrowLeft':
          this.handlingAndCalculatingItemValue('left');
          break;
        case 'ArrowDown':
          this.handlingAndCalculatingItemValue('down');
          break;
        default:
          break;
      }
    });
  }

  handleTouch() {
    let x = 0;
    let y = 0;

    window.addEventListener('touchstart', (e) => {
      const { clientX, clientY } = e.targetTouches[0];
      x = clientX;
      y = clientY;
    });

    window.addEventListener('touchend', (e) => {
      const { clientX, clientY } = e.changedTouches[0];

      const x1 = clientX - x;
      const y1 = clientY - y;

      if (y1 <= 50 && x1 <= 50) return;

      if (Math.abs(x1) > Math.abs(y1)) {
        if (x1 > 0) {
          // console.log('right');
          this.handlingAndCalculatingItemValue('right');
        } else {
          // console.log('left');
          this.handlingAndCalculatingItemValue('left');
        }
      } else {
        if (y1 > 0) {
          // console.log('up');
          this.handlingAndCalculatingItemValue('up');
        } else {
          // console.log('down');
          this.handlingAndCalculatingItemValue('down');
        }
      }
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

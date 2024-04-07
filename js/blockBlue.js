const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Boundary {
  static width = 40;
  static height = 40;

  constructor({ position }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.color = "blue";
    // this.image = image;
  }

  draw() {
    canvasContext.fillStyle = this.color;
    canvasContext.fillRect(
      this.position.x,
      this.position.y,
      this.width,
      this.height
    );
  }
}

class Cell {
  constructor(x, y, dist, prev) {
    this.x = x;
    this.y = y;
    this.dist = dist; // distance
    this.prev = prev; // parent cell in the path
  }
  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }
}

let path = [];
let vel = [];

class Maze {
  shortestPath(labyrint, start, end) {
    const sx = start[0];
    const sy = start[1];
    const dx = end[0];
    const dy = end[1];

    // if start or end value is 0, then return
    if (labyrint[sx][sy] != "." || labyrint[dx][dy] != ".") {
      console.log("start or end point cannot reached.");
      return;
    }

    // initialize the cells
    const row = labyrint.length;
    const col = labyrint[0].length;

    const cells = [];
    for (let i = 0; i < row; i++) {
      cells[i] = [];
      for (let j = 0; j < col; j++) {
        if (labyrint[i][j] === ".") {
          cells[i][j] = new Cell(i, j, Number.MAX_VALUE, null);
        }
      }
    }

    // BFS
    let queue = [],
      dest = null,
      p;
    const src = cells[sx][sy];

    src.dist = 0;
    queue.push(src);
    while ((p = queue.shift()) != null) {
      // find destination
      if (p.x == dx && p.y == dy) {
        dest = p;
        break;
      }

      this.visit(cells, queue, p.x - 1, p.y, p, row, col);
      this.visit(cells, queue, p.x, p.y - 1, p, row, col);
      this.visit(cells, queue, p.x + 1, p.y, p, row, col);
      this.visit(cells, queue, p.x, p.y + 1, p, row, col);
    }

    // compose the path if path exists
    if (dest == null) {
      console.log("dest is null. there is no path.");
      return;
    } else {
      p = dest;
      do {
        path.unshift(p);
      } while ((p = p.prev) != null);

      path.forEach((now) => console.log(now.x, now.y));
      console.log(`path length: ${path.length}`);
    }
  }

  // function to update cell visiting status, Time O(1), Space O(1)
  visit(cells, queue, x, y, parent, row, col) {
    if (x < 0 || x >= row || y < 0 || y >= col || cells[x][y] == null) return;

    const dist = parent.dist + 1;
    const p = cells[x][y];

    if (dist < p.dist) {
      p.dist = dist;
      p.prev = parent;
      queue.push(p);
    }
  }
}

const map = [
  ["-", "-", "-", "-", "-", "-"],
  ["-", ".", ".", ".", ".", "-"],
  ["-", ".", "-", "-", ".", "-"],
  ["-", ".", ".", ".", ".", "-"],
  ["-", "-", "-", "-", "-", "-"],
];

const boundaries = [];

const maze = new Maze();

let start, end;
const tc = 1;

for (let i = 0; i < tc; i++) {
  start = [1, 1];
  end = [3, 1];
  console.log(`CASE ${i}: `);
  maze.shortestPath(map, start, end);
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: { x: Boundary.width * j, y: Boundary.height * i },
          })
        );
        break;
    }
  });
});

class Player {
  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = "yellow";
  }

  draw() {
    canvasContext.beginPath();
    canvasContext.arc(
      this.position.x,
      this.position.y,
      this.radius,
      0,
      Math.PI * 2
    );
    canvasContext.fillStyle = this.color;
    canvasContext.fill();
    canvasContext.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: { x: 0, y: 0 },
});

function animate() {
  requestAnimationFrame(animate);
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  player.update();

  // buat harus pressed
  player.velocity.x = 0;
  player.velocity.y = 0;

  // if (keys.w.pressed && lastKey === "w") player.velocity.y = -40;
  // if (keys.a.pressed && lastKey === "a") player.velocity.x = -40;
  // if (keys.s.pressed && lastKey === "s") player.velocity.y = 40;
  // if (keys.d.pressed && lastKey === "d") player.velocity.x = 40;
}

for (let i = 0; i < path.length - 1; i++) {
  const xNow = path[i + 1].x - path[i].x;
  const yNow = path[i + 1].y - path[i].y;

  console.log(`xNow: ${xNow}, yNow: ${yNow}`);

  if (xNow < 0) player.velocity.x = -40;
  else if (xNow > 0) player.velocity.x = 40;
  else if (yNow < 0) player.velocity.y = -40;
  else if (yNow > 0) player.velocity.y = 40;
}

addEventListener("keydown", ({ key }) => {
  if (key === "w") player.velocity.y = -40;
  else if (key === "a") player.velocity.x = -40;
  else if (key === "s") player.velocity.y = 40;
  else if (key === "d") player.velocity.x = 40;
});

animate();

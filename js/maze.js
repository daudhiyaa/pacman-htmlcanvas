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

class Maze {
  // BFS, Time O(n^2), Space O(n^2)
  shortestPath(labyrint, start, end) {
    // console.log(`labyrint: ${labyrint}, start: ${start}, end: ${end}`);
    const sx = start[0];
    const sy = start[1];
    const dx = end[0];
    const dy = end[1];
    // console.log(labyrint[sx][sy]);

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
          // console.log("1");
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
    // console.log(`cells: ${cells}`);
    while ((p = queue.shift()) != null) {
      // console.log(`p = ${p}`);
      // find destination
      if (p.x == dx && p.y == dy) {
        // console.log("tes");
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
      let path = [];
      p = dest;
      do {
        path.unshift(p);
      } while ((p = p.prev) != null);

      path.forEach((now) => console.log(now.x, now.y));
      console.log(`path length: ${path.length}`);
      // console.log(`${path}`);
    }
  }

  // function to update cell visiting status, Time O(1), Space O(1)
  visit(cells, queue, x, y, parent, row, col) {
    // console.log(`cells: ${cells}`);
    // console.log(`x: ${x}`);
    // console.log(`y: ${y}`);
    // console.log(`cells.length: ${cells.length}`);
    // console.log(`cells[0].length: ${cells[0].length}`);
    // console.log(`cells[x][y]: ${cells[x][y]}`);

    // out of boundary
    if (x < 0 || x >= row || y < 0 || y >= col || cells[x][y] == null) return;

    // update distance, and previous node
    const dist = parent.dist + 1;
    // console.log(`distance: ${dist}`);
    const p = cells[x][y];

    if (dist < p.dist) {
      p.dist = dist;
      p.prev = parent;
      queue.push(p);
    }
  }
}

const labyrint = [
  ["1", "-", "-", "-", "-", "-", "-", "-", "-", "-", "2"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "7", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "+", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", "_", ".", ".", ".", ".", "|"],
  ["|", ".", "[", "]", ".", ".", ".", "[", "]", ".", "|"],
  ["|", ".", ".", ".", ".", "^", ".", ".", ".", ".", "|"],
  ["|", ".", "b", ".", "[", "5", "]", ".", "b", ".", "|"],
  ["|", ".", ".", ".", ".", ".", ".", ".", ".", "p", "|"],
  ["4", "-", "-", "-", "-", "-", "-", "-", "-", "-", "3"],
];

// const matrix = [
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//   [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
//   [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
//   [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
//   [0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0],
//   [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
//   [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
//   [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
//   [0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0],
//   [0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
//   [0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0],
//   [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
//   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
// ];

const maze = new Maze();

let start, end;
const tc = 1;

for (let i = 0; i < tc; i++) {
  start = [1, 1];
  end = [7, 9];
  console.log(`CASE ${i}: `);
  maze.shortestPath(labyrint, start, end);
}

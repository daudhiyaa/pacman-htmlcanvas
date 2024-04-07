const canvas = document.querySelector("canvas");
const canvasContext = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreEl");
const gameStatus = document.getElementById("gameStatus");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/**
 * CLASSES
 */

class Boundary {
  static width = 40;
  static height = 40;

  constructor({ position, image }) {
    this.position = position;
    this.image = image;
    this.width = Boundary.width;
    this.height = Boundary.height;
  }

  draw() {
    canvasContext.drawImage(this.image, this.position.x, this.position.y);
  }
}

class Player {
  static speed = 4;

  constructor({ position, velocity }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75;
    this.openRate = 0.05;
    this.rotation = 0;

    this.color = "yellow";
    this.speed = Player.speed;
  }

  draw() {
    canvasContext.save();
    canvasContext.translate(this.position.x, this.position.y);
    canvasContext.rotate(this.rotation);
    canvasContext.translate(-this.position.x, -this.position.y);
    canvasContext.beginPath();
    canvasContext.lineTo(this.position.x, this.position.y);
    canvasContext.arc(
      this.position.x,
      this.position.y,
      this.radius,
      this.radians,
      Math.PI * 2 - this.radians,
      false
    );
    canvasContext.fillStyle = this.color;
    canvasContext.fill();
    canvasContext.closePath();
    canvasContext.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.radians < 0 || this.radians > 0.75) this.openRate = -this.openRate;

    this.radians += this.openRate;
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
    this.color = "white";
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
}

class Ghost {
  static speed = 2;
  constructor({ position, velocity, color = "red" }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.color = color;
    this.prevCollisions = [];
    this.speed = Ghost.speed;
    this.scared = false;
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
    canvasContext.fillStyle = this.scared ? "blue" : this.color;
    canvasContext.fill();
    canvasContext.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class PowerUp {
  constructor({ position }) {
    this.position = position;
    this.radius = 7;
    this.color = "white";
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

/**
 * VARIABLES
 */

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};
let lastKey = "";

const boundaries = [];
const map = [
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

const player = new Player({
  position: {
    x: Boundary.width + Boundary.width / 2,
    y: Boundary.height + Boundary.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
});
let score = 0;

const pellets = [];
const ghosts = [
  new Ghost({
    position: {
      x:
        Boundary.width * Math.floor(Math.random() * (map[0].length - 4) + 2) +
        Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: Ghost.speed,
      y: 0,
    },
  }),
  new Ghost({
    position: {
      x: Boundary.width * 6 + Boundary.width / 2,
      y: Boundary.height * 4 + Boundary.height / 2,
    },
    velocity: {
      x: 0,
      y: Ghost.speed,
    },
    color: "pink",
  }),
];

const powerUps = [];

/**
 * FUNCTIONS
 */

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

// Additional cases (does not include the power up pellet that's inserted later in the vid)
map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case "-":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeHorizontal.png"),
          })
        );
        break;
      case "|":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeVertical.png"),
          })
        );
        break;
      case "1":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner1.png"),
          })
        );
        break;
      case "2":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner2.png"),
          })
        );
        break;
      case "3":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner3.png"),
          })
        );
        break;
      case "4":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCorner4.png"),
          })
        );
        break;
      case "b":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/block.png"),
          })
        );
        break;
      case "[":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/capLeft.png"),
          })
        );
        break;
      case "]":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/capRight.png"),
          })
        );
        break;
      case "_":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/capBottom.png"),
          })
        );
        break;
      case "^":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/capTop.png"),
          })
        );
        break;
      case "+":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeCross.png"),
          })
        );
        break;
      case "5":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            // color: "blue",
            image: createImage("./img/pipeConnectorTop.png"),
          })
        );
        break;
      case "6":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            // color: "blue",
            image: createImage("./img/pipeConnectorRight.png"),
          })
        );
        break;
      case "7":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            // color: "blue",
            image: createImage("./img/pipeConnectorBottom.png"),
          })
        );
        break;
      case "8":
        boundaries.push(
          new Boundary({
            position: {
              x: Boundary.width * j,
              y: Boundary.height * i,
            },
            image: createImage("./img/pipeConnectorLeft.png"),
          })
        );
        break;

      // PELLETS
      case ".":
        pellets.push(
          new Pellet({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * i + Boundary.height / 2,
            },
          })
        );
        break;

      // POWER UPS
      case "p":
        powerUps.push(
          new PowerUp({
            position: {
              x: Boundary.width * j + Boundary.width / 2,
              y: Boundary.height * i + Boundary.height / 2,
            },
          })
        );
        break;
    }
  });
});

function isCollision({ player, boundary }) {
  const padding = Boundary.width / 2 - player.radius - 1;
  return (
    player.position.x + player.radius + player.velocity.x >=
      boundary.position.x - padding &&
    player.position.y + player.radius + player.velocity.y >=
      boundary.position.y - padding &&
    player.position.x - player.radius + player.velocity.x <=
      boundary.position.x + boundary.width + padding &&
    player.position.y - player.radius + player.velocity.y <=
      boundary.position.y + boundary.height + padding
  );
}

function isTouching(touchedObject, player) {
  return (
    Math.hypot(
      touchedObject.position.x - player.position.x,
      touchedObject.position.y - player.position.y
    ) <
    touchedObject.radius + player.radius
  );
}

let animationID;
function animate() {
  animationID = requestAnimationFrame(animate);
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === "w") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        isCollision({
          player: {
            ...player,
            velocity: {
              x: 0,
              y: -Player.speed,
            },
          },
          boundary: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else player.velocity.y = -Player.speed;
    }
  } else if (keys.a.pressed && lastKey === "a") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        isCollision({
          player: {
            ...player,
            velocity: {
              x: -Player.speed,
              y: 0,
            },
          },
          boundary: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else player.velocity.x = -Player.speed;
    }
  } else if (keys.s.pressed && lastKey === "s") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        isCollision({
          player: {
            ...player,
            velocity: {
              x: 0,
              y: Player.speed,
            },
          },
          boundary: boundary,
        })
      ) {
        player.velocity.y = 0;
        break;
      } else player.velocity.y = Player.speed;
    }
  } else if (keys.d.pressed && lastKey === "d") {
    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        isCollision({
          player: {
            ...player,
            velocity: {
              x: Player.speed,
              y: 0,
            },
          },
          boundary: boundary,
        })
      ) {
        player.velocity.x = 0;
        break;
      } else player.velocity.x = Player.speed;
    }
  }

  // eats pellets or touch pellets
  for (let i = pellets.length - 1; i >= 0; i--) {
    const pellet = pellets[i];
    pellet.draw();

    if (isTouching(pellet, player)) {
      pellets.splice(i, 1);
      score++;
      scoreEl.innerHTML = score;
    }
  }

  // WIN GAME
  if (!pellets.length) {
    gameStatus.innerHTML = "You Win";
    cancelAnimationFrame(animationID);
  }

  // make ghosts scared
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i];
    powerUp.draw();

    if (isTouching(powerUp, player)) {
      powerUps.splice(i, 1);

      ghosts.forEach((ghost) => {
        ghost.scared = true;

        setTimeout(() => {
          ghost.scared = false;
        }, 25000);
      });
    }
  }

  // GAME OVER
  for (let i = ghosts.length - 1; i >= 0; i--) {
    const ghost = ghosts[i];

    if (isTouching(ghost, player)) {
      if (ghost.scared) ghosts.splice(i, 1);
      else {
        cancelAnimationFrame(animationID);
        gameStatus.innerHTML = "Game Over";
      }
    }
  }

  // reset player velocitiy when collision
  boundaries.forEach((boundary) => {
    boundary.draw();

    if (isCollision({ player: player, boundary: boundary })) {
      player.velocity.x = 0;
      player.velocity.y = 0;
    }
  });

  player.update();

  ghosts.forEach((ghost) => {
    ghost.update();

    const collisions = [];
    boundaries.forEach((boundary) => {
      if (
        !collisions.includes("right") &&
        isCollision({
          player: {
            ...ghost,
            velocity: {
              x: ghost.speed,
              y: 0,
            },
          },
          boundary: boundary,
        })
      ) {
        collisions.push("right");
      }
      if (
        !collisions.includes("left") &&
        isCollision({
          player: {
            ...ghost,
            velocity: {
              x: -ghost.speed,
              y: 0,
            },
          },
          boundary: boundary,
        })
      ) {
        collisions.push("left");
      }
      if (
        !collisions.includes("down") &&
        isCollision({
          player: {
            ...ghost,
            velocity: {
              x: 0,
              y: ghost.speed,
            },
          },
          boundary: boundary,
        })
      ) {
        collisions.push("down");
      }
      if (
        !collisions.includes("up") &&
        isCollision({
          player: {
            ...ghost,
            velocity: {
              x: 0,
              y: -ghost.speed,
            },
          },
          boundary: boundary,
        })
      ) {
        collisions.push("up");
      }
    });

    if (collisions.length > ghost.prevCollisions.length)
      ghost.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
      if (ghost.velocity.x > 0) ghost.prevCollisions.push("right");
      else if (ghost.velocity.x < 0) ghost.prevCollisions.push("left");
      else if (ghost.velocity.y > 0) ghost.prevCollisions.push("down");
      else if (ghost.velocity.y < 0) ghost.prevCollisions.push("up");

      const pathways = ghost.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      const direction =
        pathways[
          Math.floor(Math.random() * pathways.length)
          // / pathways.length) % pathways.length
        ];

      switch (direction) {
        case "right":
          ghost.velocity.x = ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "left":
          ghost.velocity.x = -ghost.speed;
          ghost.velocity.y = 0;
          break;
        case "down":
          ghost.velocity.x = 0;
          ghost.velocity.y = ghost.speed;
          break;
        case "up":
          ghost.velocity.x = 0;
          ghost.velocity.y = -ghost.speed;
          break;
      }

      ghost.prevCollisions = [];
    }
  });
}

animate();

/**
 * EVENTS LISTENER
 */

addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "w":
      keys.w.pressed = true;
      player.rotation = Math.PI * 1.5;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      player.rotation = Math.PI * 1;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      player.rotation = Math.PI * 0.5;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      player.rotation = Math.PI * 0;
      lastKey = "d";
      break;
  }
});

addEventListener("keyup", ({ key }) => {
  if (key === "w") keys.w.pressed = false;
  else if (key === "a") keys.a.pressed = false;
  else if (key === "s") keys.s.pressed = false;
  else if (key === "d") keys.d.pressed = false;
});

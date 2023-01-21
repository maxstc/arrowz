const http = require("http");
const ws = require("ws");
const fs = require("fs");

////////// GAME LOGIC //////////

let lines = [];
const colors = ["red", "blue", "green", "yellow", "magenta", "cyan"];
let orders = [];

//  0
//3   1
//  2

//type == -1 is left, 1 is right
//type == 2 is gameover
//type == 4,5,6,7 is new player with direction type%4
function turn(player, type) {
    console.log("turning!");
    if (type === 2) { //game over
        //end the line
        last_line(player).direction += 4;
    }
    else {
        //add a new line
        lines[player].push({
            x1: last_line(player).x2,
            y1: last_line(player).y2,
            x2: last_line(player).x2,
            y2: last_line(player).y2,
            direction: (last_line(player).direction + type + 4) % 4
        });
    }
    notify(player, type, last_line(player).x1, last_line(player).y1);
}

function last_line(player) {
    return lines[player][lines[player].length - 1];
}

function is_game_over(player) {
    if (last_line(player).direction >= 8) {
        return false;
    }

    if (last_line(player).x2 <= 0 || last_line(player).x2 >= 800 || last_line(player).y2 <= 0 || last_line(player).y2 >= 800) {
        return true;
    }
    // for(let i = 0; i < lines.length; i++) {
    //     let limit = lines[i].length - ((i === player) ? 1 : 0);
    //     for(let j = 0; j < limit; j++) {
    //         let line_direction = lines[i][j].direction % 8;
    //         if (line_direction % 2 === last_line(player).direction % 2) {
    //             return false;
    //         }

    //         if (line_direction === 0) {

    //         }
    //     }
    // }
    return false;
}

function loop() {
    for (let i = 0; i < orders.length; i++) {
        if (orders[i] != 0) {
            turn(i, orders[i]);
        }
        orders[i] = 0;
    }

    for (let i = 0; i < lines.length; i++) {
        let direction = last_line(i).direction;

        if (direction === 0) {
            last_line(i).y2--;
        }
        else if (direction === 1) {
            last_line(i).x2++;
        }
        else if (direction === 2) {
            last_line(i).y2++;
        }
        else if (direction === 3) {
            last_line(i).x2--;
        }
    }

    for(let i = 0; i < lines.length; i++) {
        if (is_game_over(i)) {
            console.log(i + " lost via an aburpt braking maneuver!");
            turn(i, 2);
        }
    }
}

function start() {
    setInterval(loop, 50);
}

function add_player() {
    let id = lines.length;
    lines.push([]);
    lines[id].push({
        x1: 50,
        y1: 50,
        x2: 50,
        y2: 50,
        direction: 0
    });
    return id;
}

////////// HTTP SERVER //////////

let index_html = 0;
fs.readFile("../client/index.html", (err, data) => {
    if (!err) {
        index_html = data;
    }
});

let index_css = 0;
fs.readFile("../client/index.css", (err, data) => {
    if (!err) {
        index_css = data;
    }
});

let index_js = 0;
fs.readFile("../client/index.js", (err, data) => {
    if (!err) {
        index_js = data;
    }
});

const http_server = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(index_html);
    }
    else if (req.url === "/index.html") {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(index_html);
    }
    else if (req.url === "/index.css") {
        res.writeHead(200, {"Content-Type": "text/css"});
        res.end(index_css);
    }
    else if (req.url === "/index.js") {
        res.writeHead(200, {"Content-Type": "application/javascript"});
        res.end(index_js);
    }
    else {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.end("404");
    }
});

////////// WEBSOCKETS //////////

const ws_server = new ws.WebSocketServer({ server: http_server });

let websockets = [];

ws_server.on("connection", (websocket) => {
    let id = add_player();
    console.log(id + " connected");
    websocket.on("message", (data) => {
        let msg = "" + data;
        if (msg === "l") {
            orders[id] = -1;
        }
        else if (msg === "r") {
            orders[id] = 1;
        }
        else {
            console.log(msg);
        }
    });
    websocket.send("hello!");
    websockets.push(websocket);
    turn(id, 5);
});

function notify(player, type, x, y) {
    console.log("notifying!");
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send(player + "," + type + "," + x + "," + y);
    }
}

start();

http_server.listen(41399);
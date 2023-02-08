const LEFT = -1;
const RIGHT = 1;
const END_OF_LINE = 4;
const LINE_SPEED = 1;

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

function turn(player, type) {
    //add a new line
    let dir = (last_line(player).direction + type + 4) % 4;
    lines[player].push({
        x1: last_line(player).x2,
        y1: last_line(player).y2,
        x2: last_line(player).x2,
        y2: last_line(player).y2,
        direction: dir
    });
    notify(player, dir, last_line(player).x1, last_line(player).y1);
}

function end_line(player) {
    last_line(player).direction += END_OF_LINE;
    notify(player, END_OF_LINE, last_line(player).x2, last_line(player).y2);
}

function start_line() {
    let id = lines.length;
    lines.push([]);
    if (id === 0) {
        lines[id].push({
            x1: 350,
            y1: 350,
            x2: 350,
            y2: 350,
            direction: 1
        });
    }
    else if (id === 1) {
        lines[id].push({
            x1: 450,
            y1: 350,
            x2: 450,
            y2: 350,
            direction: 2
        });
    }
    else if (id === 2) {
        lines[id].push({
            x1: 450,
            y1: 450,
            x2: 450,
            y2: 450,
            direction: 3
        });
    }
    else if (id === 3) {
        lines[id].push({
            x1: 350,
            y1: 450,
            x2: 350,
            y2: 450,
            direction: 0
        });
    }
    else {
        lines[id].push({
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            direction: 0
        });
    }
    notify(id, last_line(id).direction, last_line(id).x1, last_line(id).y1);
}

function last_line(player) {
    return lines[player][lines[player].length - 1];
}

function is_between(a, b, c) {
    return (b <= a && a <= c) || (c <= a && a <= b);
}

function is_game_over(player) {
    if (last_line(player).direction >= END_OF_LINE || isNaN(last_line(player).direction)) {
        // if (isNaN(last_line(player).direction)) {
        //     console.log("WAAAAAAAAAAA");
        // }
        return false;
    }

    if (last_line(player).x2 <= 0 || last_line(player).x2 >= 800 || last_line(player).y2 <= 0 || last_line(player).y2 >= 800) {
        return true;
    }

    let current_line = last_line(player);

    for (let i = 0; i < lines.length; i++) {
        for (let j = 0; j < (lines[i].length - (i === player ? 1 : 0)); j++) {
            if (lines[i][j].x1 === lines[i][j].x2) {
                if (current_line.x2 === lines[i][j].x2) {
                    if (is_between(current_line.y2, lines[i][j].y1, lines[i][j].y2)) {
                        return true;
                    }
                }
            }
            else {
                if (current_line.y2 === lines[i][j].y2) {
                    if (is_between(current_line.x2, lines[i][j].x1, lines[i][j].x2)) {
                        return true;
                    }
                }
            }
        }
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
        if (orders[i] != 0 && last_line(i).direction < END_OF_LINE && !isNaN(last_line(i).direction)) {
            turn(i, orders[i]);
        }
        orders[i] = 0;
    }

    for (let i = 0; i < lines.length; i++) {
        let direction = last_line(i).direction;
        let id = lines.length;
        if (direction === 0) {
            last_line(i).y2 -= LINE_SPEED;
        }
        else if (direction === 1) {
            last_line(i).x2 += LINE_SPEED;
        }
        else if (direction === 2) {
            last_line(i).y2 += LINE_SPEED;
        }
        else if (direction === 3) {
            last_line(i).x2 -= LINE_SPEED;
        }
    }

    for(let i = 0; i < lines.length; i++) {
        if (is_game_over(i)) {
            console.log(i + " lost via an aburpt braking maneuver!");
            end_line(i);
            console.log(last_line(i));
        }
    }
}

function start() {
    setInterval(loop, 50);
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
    websockets.push(websocket);
    let id = websockets.length - 1;
    start_line();
    send_players_to_newest_player();
    console.log(id + " connected");
    websocket.on("message", (data) => {
        let msg = "" + data;
        if (msg === "l") {
            orders[id] = -1;
        }
        else if (msg === "r") {
            orders[id] = 1;
        }
        else if (msg === "start") {
            console.log("starting");
            for (let i = 0; i < websockets.length; i++) {
                websockets[i].send("start");
            }
        }
        else if (msg === "stop") {
            console.log("starting");
            for (let i = 0; i < websockets.length; i++) {
                websockets[i].send("stop");
            }
        }
        else {
            console.log("bad message:" + msg);
        }
    });
});

function notify(player, dir, x, y) {
    console.log("notifying!%s,%s,%s,%s", player, dir, x, y);
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send(player + "," + dir + "," + x + "," + y);
    }
}

function send_players_to_newest_player() {
    console.log("catching newest player up");
    console.log(lines);
    let player = websockets.length - 1;
    for (let i = 0; i < lines.length - 1; i++) {
        
        websockets[player].send(i + "," + (lines[i][0].direction % 4) + "," + lines[i][0].x1 + "," + lines[i][0].y1);
        for (let j = 0; j < lines[i].length - 1; j++) {
            websockets[player].send(i + "," + (lines[i][j + 1].direction % 4) + "," + lines[i][j].x2 + "," + lines[i][j].y2);
        }
        websockets[player].send(i + "," + last_line(i).direction + "," + last_line(i).x2 + "," + last_line(i).y2);
    }
}

start();

http_server.listen(41399);
const LEFT = -1;
const RIGHT = 1;
const END_OF_LINE = 4;
const LINE_SPEED = 1;

const OBSERVER_ID = -2;

const READY_MSG = "y";
const UNREADY_MSG = "n";
const LEFT_MSG = "l";
const RIGHT_MSG = "r";

const READY_PREFIX = "r";

const http = require("http");
const ws = require("ws");
const fs = require("fs");

////////// GAME LOGIC //////////

let running = false;

let lines = [];
const colors = ["red", "blue", "green", "yellow", "magenta", "cyan"];
let orders = [];
const starting_positions = [
    [1, 350, 350],
    [2, 450, 350],
    [3, 450, 450],
    [0, 350, 450]
];

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

function last_line(player) {
    return lines[player][lines[player].length - 1];
}

function is_between(a, b, c) {
    return (b <= a && a <= c) || (c <= a && a <= b);
}

function is_game_over(player) {
    if (last_line(player).direction >= END_OF_LINE) {
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

    return false;
}

function loop() {
    if (running) {
        for (let i = 0; i < orders.length; i++) {
            if (orders[i] === undefined) {
                orders[i] = 0;
            }
            if (orders[i] != 0 && last_line(i).direction < END_OF_LINE) {
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
    
        for (let i = 0; i < lines.length; i++) {
            if (is_game_over(i)) {
                console.log(i + " lost via an aburpt braking maneuver!");
                end_line(i);
                console.log(last_line(i));
            }
        }

        let alive_player = -1;
        let game_is_over = true;
        for (let i = 0; i < lines.length; i++) {
            if (last_line(i).direction < END_OF_LINE) {
                if (alive_player != -1) {
                    game_is_over = false;
                }
                else {
                    alive_player = i;
                }
            }
        }

        if (game_is_over === true) {
            stop(alive_player);
        }
    }
}

function start_loop() {
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
let ready = [];

function get_num_ready() {
    let total = 0;
    for (let i = 0; i < ready.length; i++) {
        if (ready[i] != undefined) {
            if (ready[i]) {
                total++;
            }
        }
    }
    return total;
}

function send_to_all(msg) {
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send(msg);
    }
}

function start() {
    running = true;
    console.log("starting");

    for (let i = 0; i < websockets.length; i++) {
        let id = i;
        set_ws_game(id, websockets[i]);
    }

    for (let i = 0; i < websockets.length; i++) {
        lines.push([]);
        lines[i].push({
            x1: starting_positions[i][1],
            y1: starting_positions[i][2],
            x2: starting_positions[i][1],
            y2: starting_positions[i][2],
            direction: starting_positions[i][0]
        });
    }
    
    for (let i = 0; i < websockets.length; i++) {
        websockets[i].send("ur" + i);
    }

    for (let i = 0; i < websockets.length; i++) {
        notify(i, lines[i][0].direction, lines[i][0].x1, lines[i][0].y1);
    }

    send_to_all("start");
}

function stop(winner) {
    running = false;
    
    console.log("stop, winner is:" + winner);
    if (winner == -1) {
        send_to_all("stop");
    }
    else {
        send_to_all("stop" + winner);
    }

    lines = [];
    ready = [];

    for (let i = 0; i < websockets.length; i++) {
        ready.push(false);
        set_ws_ready(i, websockets[i]);
    }

    let num_ready = get_num_ready();
    send_to_all("r" + num_ready + "/" + ready.length);
}

ws_server.on("connection", (websocket) => {
    if (!running && websockets.length < 4) {
        websockets.push(websocket);
        let id = websockets.length - 1;
        console.log(id + " connected");
        ready.push(false);
        let num_ready = get_num_ready();
        send_to_all("r" + num_ready + "/" + ready.length);
        set_ws_ready(id, websocket);
    }
    else {
        websocket.send("plzwait");
    }
});

function set_ws_game(id, websocket) {
    websocket.removeAllListeners()
    websocket.on("message", (data) => {
        let msg = data + "";
        if (msg === LEFT_MSG) {
            orders[id] = -1;
        }
        else if (msg === RIGHT_MSG) {
            orders[id] = 1;
        }
        else {
            console.log("bad ingame message:" + msg);
        }
    });
    websocket.on("close", () => {
        console.log(id + " disconnected");
        websockets.splice(id, 1);
    });
    websocket.on("error", () => {
        console.log(id + " error, disconnected");
        websockets.splice(id, 1);
    });
}

function set_ws_ready(id, websocket) {
    websocket.removeAllListeners()
    websocket.on("message", (data) => {
        let msg = "" + data;
        if (msg === READY_MSG) {
            ready[id] = true;
            let num_ready = get_num_ready();
            if (num_ready === ready.length) {
                send_to_all("r" + "!");
                setTimeout(start, 3000);
            }
            else {
                send_to_all("r" + num_ready + "/" + ready.length);
            }
        }
        else if (msg === UNREADY_MSG) {
            ready[id] = false;
            let num_ready = get_num_ready();
            send_to_all("r" + num_ready + "/" + ready.length);
        }
        else {
            console.log("bad ready message:" + msg);
        }
    });
    websocket.on("close", () => {
        console.log(id + " disconnected");
        websockets.splice(id, 1);
        ready.splice(id, 1);
    });
    websocket.on("error", () => {
        console.log(id + " error, disconnected");
        websockets.splice(id, 1);
        ready.splice(id, 1);
    });
}

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

start_loop();

http_server.listen(41399);
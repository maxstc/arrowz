const LEFT = -1;
const RIGHT = 1;
const END_OF_LINE = 4;

let my_id = -1;
let lines = [];
const colors = ["red", "blue", "green", "yellow", "magenta", "cyan"];
let ctx = 0;

// function turn(player, type) {
//     console.log("turning!" + player + "," + type);
//     if (type === 2) {
//         //end the line
//         last_line(player).direction += 4;
//     }
//     else {
//         //add a new line
//         let dir = (last_line(player).direction + type + 4) % 4;
//         console.log(last_line(player).direction);
//         console.log
//         console.log(dir);
//         lines[player].push({
//             x1: last_line(player).x2,
//             y1: last_line(player).y2,
//             x2: last_line(player).x2,
//             y2: last_line(player).y2,
//             direction: dir
//         });
//     }
// }

function set_line(player, new_dir, x, y) {
    if (my_id === -1) {
        console.log("Connected as:" + player);
        my_id = player;
        for(let i = 0; i < my_id + 1; i++) {
            lines.push([]);
        }
    }
    console.log("set_line(%s,%s,%s,%s)", player, new_dir, x, y);
    if (new_dir === END_OF_LINE) {
        console.log("Line ended: " + player);
        last_line(player).direction += END_OF_LINE;
    }
    else if (player > lines.length) {
        //add a new line
        console.log("Line started: " + player);
        lines.push([]);
        lines[player].push({
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            direction: new_dir
        });
    }
    else {
        let dir;
        if (lines[player].length > 0) {
            dir = (last_line(player).direction + new_dir + 4) % 4;
            last_line(player).x2 = x;
            last_line(player).y2 = y;
        }
        else {
            dir = new_dir;
        }
        lines[player].push({
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            direction: dir
        });
    }
}

function last_line(player) {
    return lines[player][lines[player].length - 1];
}

function is_game_over(player) {
    if (last_line(player).direction >= END_OF_LINE_ADDITION) {
        return false;
    }

    if (last_line(player).x2 <= 0 || last_line(player).x2 >= 800 || last_line(player).y2 <= 0 || last_line(player).y2 >= 800) {
        end_line(i);
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

    // for(let i = 0; i < lines.length; i++) {
    //     if (is_game_over(i)) {
    //         console.log(i + " lost via an aburpt braking maneuver!");
    //     }
    // }
    
    draw();
}

function start() {
    setInterval(loop, 50);
}

function read_notify(notification) {
    let parts = notification.split(",");
    parts[0] = Number(parts[0]);
    parts[1] = Number(parts[1]);
    parts[2] = Number(parts[2]);
    parts[3] = Number(parts[3]);
    console.log("notif:" + notification);
    set_line(parts[0], parts[1], parts[2], parts[3]);
}

function draw() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, 800, 800);
    for (let i = 0; i < lines.length; i++) {
        ctx.fillStyle = colors[i];
        ctx.strokeStyle = colors[i];
        for (let j = 0; j < lines[i].length; j++) {
            ctx.beginPath();
            ctx.moveTo(lines[i][j].x1, lines[i][j].y1);
            ctx.lineTo(lines[i][j].x2, lines[i][j].y2);
            ctx.stroke();
        }
    }
}

let socket = 0;

function openSocket() {
    socket = new WebSocket("ws://" + window.location.host);

    socket.onopen = function(e) {
        console.log("started");
    };

    socket.onmessage = function(e) {
        read_notify(e.data);
    };

    socket.onclose = function(e) {
        if (e.wasClean) {
            alert("Connection closed cleanly");
        }
        else {
            alert("Connection closed uncleanly");
        }
    }

    socket.onerror = function(e) {
        alert(`Error: ${e.message}`);
    }
}

let left_key = "KeyA";
let right_key = "KeyD";

window.onload = () => {
    ctx = document.getElementById("canvas").getContext("2d");
    openSocket();
    window.onkeydown = (key) => {
        if (key.code === left_key) {
            socket.send("l");
        }
        else if (key.code === right_key) {
            socket.send("r");
        }
    }
    start();
}
const LEFT = -1;
const RIGHT = 1;
const END_OF_LINE = 4;
const LINE_SPEED = 1;

let running = false;

let ready = false;

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

function start() {
    console.log("starting");
    running = true;
}

function stop() {
    console.log("stopping");
    running = false;
    lines = [];
}

function set_line(player, new_dir, x, y) {
    if (my_id === -1) {
        console.log("Connected as:" + player);
        my_id = player;
        for(let i = 0; i < my_id + 1; i++) {
            lines.push([]);
        }
    }
    if (new_dir >= END_OF_LINE) {
        console.log("Line ended: " + player);
        last_line(player).x2 = x;
        last_line(player).y2 = y;
        last_line(player).direction += END_OF_LINE;
    }
    else if (player >= lines.length) {
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
        if (lines[player].length > 0) {
            last_line(player).x2 = x;
            last_line(player).y2 = y;
        }
        lines[player].push({
            x1: x,
            y1: y,
            x2: x,
            y2: y,
            direction: new_dir
        });
    }
}

function last_line(player) {
    return lines[player][lines[player].length - 1];
}

function is_game_over(player) {
    if (last_line(player).direction >= END_OF_LINE) {
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
    //             return false;conso
    //         }

    //         if (line_direction === 0) {

    //         }
    //     }
    // }
    return false;
}

function loop() {
    if (running) {
        for (let i = 0; i < lines.length; i++) {
            let direction = last_line(i).direction;
    
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
    
        // for(let i = 0; i < lines.length; i++) {
        //     if (is_game_over(i)) {
        //         console.log(i + " lost via an aburpt braking maneuver!");
        //     }
        // }
        
        draw();
    }
}

function start_loop() {
    setInterval(loop, 50);
}

function read_notify(notification) {
    console.log(notification);
    let parts = notification.split(",");
    parts[0] = Number(parts[0]);
    parts[1] = Number(parts[1]);
    parts[2] = Number(parts[2]);
    parts[3] = Number(parts[3]);
    set_line(parts[0], parts[1], parts[2], parts[3]);
}

function draw() {
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, 800, 800);
    for (let i = 0; i < lines.length; i++) {
        if (i < 4) {
            ctx.fillStyle = colors[i];
            ctx.strokeStyle = colors[i];
            if (last_line(i).direction === 0) {
                ctx.beginPath();
                ctx.moveTo(last_line(i).x2 - 2.5, last_line(i).y2 + 2.5);
                ctx.lineTo(last_line(i).x2 + 2.5, last_line(i).y2 + 2.5);
                ctx.lineTo(last_line(i).x2, last_line(i).y2 - 2.5);
                ctx.fill();
            }
            else if (last_line(i).direction === 1) {
                ctx.beginPath();
                ctx.moveTo(last_line(i).x2 - 2.5, last_line(i).y2 - 2.5);
                ctx.lineTo(last_line(i).x2 - 2.5, last_line(i).y2 + 2.5);
                ctx.lineTo(last_line(i).x2 + 2.5, last_line(i).y2);
                ctx.fill();
            }
            else if (last_line(i).direction === 2) {
                ctx.beginPath();
                ctx.moveTo(last_line(i).x2 - 2.5, last_line(i).y2 - 2.5);
                ctx.lineTo(last_line(i).x2 + 2.5, last_line(i).y2 - 2.5);
                ctx.lineTo(last_line(i).x2, last_line(i).y2 + 2.5);
                ctx.fill();
            }
            else if (last_line(i).direction === 3) {
                ctx.beginPath();
                ctx.moveTo(last_line(i).x2 + 2.5, last_line(i).y2 - 2.5);
                ctx.lineTo(last_line(i).x2 + 2.5, last_line(i).y2 + 2.5);
                ctx.lineTo(last_line(i).x2 - 2.5, last_line(i).y2);
                ctx.fill();
            }
        }
        for (let j = 0; j < lines[i].length; j++) {
            ctx.beginPath();
            ctx.moveTo(lines[i][j].x1 + 0.5, lines[i][j].y1 + 0.5);
            ctx.lineTo(lines[i][j].x2 + 0.5, lines[i][j].y2 + 0.5);
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
        if (e.data + "" === "start") {
            start();
        }
        else if (e.data + "" === "stop") {
            stop();
        }
        else {
            read_notify(e.data);
        }
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
    let ready_button = document.getElementById("readybutton");
    ready_button.style.color = "red";
    ready_button.innerHTML = "Not Ready";
    ready_button.removeAttribute("disabled");

    ready_button.onclick = () => {
        ready_button.setAttribute("disabled", "");
        if (ready) {
            ready_button.style.color = "red";
            ready_button.innerHTML = "Not Ready";
            ready = false;
        }
        else {
            ready_button.style.color = "green";
            ready_button.innerHTML = "Ready";
            ready = true;
        }
        ready_button.removeAttribute("disabled");
    }

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
    start_loop();
}
let lines = [];
const colors = ["red", "blue", "green", "yellow", "magenta", "cyan"];
let ctx = 0;

function turn(player, type) {
    console.log("turning!");
    if (type === 2) {
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
    
    draw();
}

function start() {
    setInterval(loop, 50);
}

function add_player(dir, x, y) {
    let id = lines.length;
    lines.push([]);
    lines[id].push({
        x1: x,
        y1: y,
        x2: x,
        y2: y,
        direction: dir
    });
    return id;
}

function read_notify(notification) {
    let parts = notification.split(",");
    if (parts[1] >= 4) { //new player
        add_player(parts[1] - 4, parts[2], parts[3]);
    }
    else {
        turn(parts[0], parts[1]);
    }
    console.log(parts);
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
        socket.send("test");
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
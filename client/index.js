const LEFT = -1;
const RIGHT = 1;
const END_OF_LINE = 4;
const LINE_SPEED = 1;

const READY_MSG = "y";
const UNREADY_MSG = "n";
const LEFT_MSG = "l";
const RIGHT_MSG = "r";

let countdown_timer = 0;

let running = false;

let ready = false;

let my_id = -1;
let lines = [];
const colors = ["red", "blue", "green", "yellow", "magenta", "cyan"];
let ctx = 0;
let player_info = 0;

let ready_button;

function start() {
    console.log("starting");
    ready_button.style.color = "gray";
    ready_button.setAttribute("disabled", "");
    ready_button.innerHTML = "In Game";
    running = true;
}

function stop() {
    console.log("stopping");
    running = false;
    lines = [];
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, 800, 800);
}

function set_line(player, new_dir, x, y) {
    if (my_id === -1) {
        console.log("Connected as:" + player);
        my_id = player;
        document.getElementById("canvas").style.borderColor = colors[my_id];
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

    //Should be able to just reassign socket.onopen and socket.onmessage as needed

    socket.onopen = function(e) {
        console.log("started");
    };

    socket.onmessage = function(e) {
        let msg = e.data + "";
        console.log("MSG:" + msg);
        if (msg === "start") {
            start();
        }
        else if (msg.substring(0,4) === "stop") {
            let winner = msg.substring(4)
            if (winner === "") {
                console.log("Tie");
                player_info.innerHTML = "Game ended in a tie";
                countdown_timer = 3;
                countdown();
            }
            else {
                console.log("Winner:" + winner);
                let winner_color = colors[parseInt(winner)];
                player_info.innerHTML = "Winner is: " + winner_color;
                countdown_timer = 3;
                countdown();
            }
            stop();
        }
        else if (msg === "reset") {
            console.log("resetting!");
            ready_button.removeAttribute("disabled");
            ready_button.style.color = "red";
            ready_button.innerHTML = "Not Ready";
        }
        else if (msg.charAt(0) === "r") {
            if ((e.data + "").charAt(1) == "!") {
                player_info.innerHTML = "Game will start in 3 seconds";
                ready_button.setAttribute("disabled", "");
                ready_button.style.color = "gray";
                countdown_timer = 3;
                countdown();
            }
            else {
                player_info.innerHTML = (e.data + "").substring(1) + " players ready";
            }
        }
        else if (msg === "plzwait") {
            alert("Game is already running, please try again after it ends");
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
    ready_button = document.getElementById("readybutton");
    ready_button.style.color = "red";
    ready_button.innerHTML = "Not Ready";
    ready_button.removeAttribute("disabled");

    player_info = document.getElementsByTagName("p")[0];

    ready_button.onclick = () => {
        ready_button.setAttribute("disabled", "");
        if (ready) {
            ready_button.style.color = "red";
            ready_button.innerHTML = "Not Ready";
            ready = false;
            socket.send(UNREADY_MSG);
        }
        else {
            ready_button.style.color = "green";
            ready_button.innerHTML = "Ready";
            ready = true;
            socket.send(READY_MSG);
        }
        ready_button.removeAttribute("disabled");
    }

    ctx = document.getElementById("canvas").getContext("2d");
    openSocket();
    window.onkeydown = (key) => {
        console.log("KEY");
        if (key.code === left_key) {
            console.log("LEFT");
            socket.send(LEFT_MSG);
        }
        else if (key.code === right_key) {
            console.log("RIGHT");
            socket.send(RIGHT_MSG);
        }
    }
    start_loop();
}

function countdown() {
    if (countdown_timer >= 0) {
        ready_button.innerHTML = countdown_timer + "";
        countdown_timer--;
        setTimeout(countdown, 1000);
    }

}
## How to Play
Default controls:
    Press `a` to turn left, press `d` to turn right
Absolute controls:
    Press `w` to go up, `a` to go left, `s` to go down, or `d` to go right
Arrow keys:
    Use arrow keys instead of `wasd`

If your triangle hits a wall or a line (yours or your opponents'), you are out.

Be the last one to get out and you win!

## How to run
0. port forward port 41399 if necessary
1. install node.js
2. run `npm install ws` from `arrowz/`
3. run `node server.js` or `node server.js <port>` from `arrowz/server/`
4. connect via `<your ip>:<port>` or `localhost:<port>` in your web browser (default port is `41399`)

## Todo
1. store settings in cookies (might not bc cookies are evil apparently)
requires `ws` from npm

runs on port 41399

## How to run
0. port forward port 41399 if necessary
1. install node.js
2. run `npm install ws` from `arrowz/`
3. run `node server.js` from `arrowz/server/`
4. connect via `<your_ip>:41399` or `localhost:41399` in your web browser

## How to play
press `a` to turn left, and `d` to turn right

if your triangle hits a line (yours or your enemies') then you lose

try to avoid the line behind your enemies and get your enemies to run into your line

## Todo
1. button for wasd
2. menu to set settings that are stored as cookies
3. cli arg to choose what port server runs on
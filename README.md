# arrowz: a web game by maxstc
requires `ws` from npm

runs on port 41399

## how to run
0. port forward port 41399 if necessary
1. install node.js
2. run `npm install ws` from `arrowz/`
3. run `node server.js` from `arrowz/server/`
4. connect via `<your_ip>:41399` or `localhost:41399` in your web browser

## how to play
press `a` to turn left, and `d` to turn right

if your triangle hits a line (yours or your enemies') then you lose

try to avoid the line behind your enemies and get your enemies to run into your line

## todo
1. display winner after everyone dies
2. auto reset lobby 3 seconds after everyone dies
3. nicer countdowns
4. show starting position before game start
5. menu where you can set settings (stored in cookies?)
6. cookie to reconnect?
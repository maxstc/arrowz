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
1. fix multiple connection NaN direction issue
2. change controls to wasd
3. menu where you can set settings (stored in cookies?)
4. cookie to reconnect?

## known issues
if you connect to the server more than once on the same systems sometimes it thinks your direction is NaN (I think it has to do with having two websocket connections in two windows on the same browser to the same server)

to reproduce this, connect to the server in firefox with two windows open, then turn in one of the windows
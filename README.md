# arrowz: a web game by maxstc
requires `ws` from npm

runs on port 41399

## how to run
0. port forward port 41399 if necessary
1. install node.js
2. run `npm install ws` from `arrowz/`
3. run `node server.js` from `arrowz/server/`
4. connect via `<your_ip>:41399` or `localhost:41399` in your web browser

## todo
1. fix issue where refreshing makes the server notify NaN to the clients (type is undefined when passed to notify so x + undefined = NaN?)
2. add small trangle thing to represent players
3. waiting room and start game button/restart game when everyone is gone
4. cookie to reconnect?

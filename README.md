# storm-twitter-interface

## Redis setup
To be able to run this project you will need to have redis running in the background with some sample data.
First make sure that the `dump.rdb` file is in the current directory and then run:
```bash
redis-server
```
To check if everything is working you need to open the command line interface in a new terminal:
```bash
redis-cli
keys *
```
This should return a list of keys in database. This needs to contain a key named 'tweetList'.
If you want to stop running the redis server you can shut it down gracefully using the redis-cli's `shutdown` command.

## Installation
Run git clone to get a local version of this repository, then run npm install to install dependencies:
```bash
git clone https://github.com/tjallingt/storm-twitter-interface.git
cd storm-twitter-interface
npm install
```
To build and run the project you first need to create the folder for the static files (one time only) and then run the build script:
(direction of slash differs for operating systems; `/` for linux/mac, `\` for windows)
```bash
mkdir static/js/
npm run build
```
Finally to run the node server and view the project in the browser:
```bash
npm start
```

## Development
When working on the project use the watch script to automatically generate new builds when changes are made and run the linter regularly to check for style errors.
When presented with linter errors googling them will usually result in an in-depth description of the problem and solution(s).
```bash
npm run watch
npm run lint
```
### IDE Linter integration
I use Sublime Text 3 in combination with [Sublime Linter](http://sublimelinter.readthedocs.io/en/latest/installation.html) to highlight my style errors immediately.
To make Sublime Linter work with eslint you need the [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint#installation) plugin.
Installing all these packages very easy using [Package Control](https://packagecontrol.io/installation)

## Git and Github
When you make changes that you want to lock down you need to commit the changes to git, usually you want to pull first (to see if someone elses changes interfere with yours).
(note leaving out the m(essage) option from the commit command will open a text editor which can allow for easier writing)
```bash
git pull
git status
git add [filenames | --all]
git commit -m "commit message"
git push [origin master]
```

## Twitter API sample response
https://gist.github.com/hrp/900964

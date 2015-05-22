#! /usr/bin/env node
"use strict";

var argvParser = require("minimist");
var argv = argvParser(process.argv.slice(2), {
  boolean: ["r", "b", "h"],
  alias: {
    r: "recursive",
    b: "body",
    h: "help",
    p: "path"
  }
});
var printLine = function printLine(text) {
  console.log(text);
};

if (argv.h) {
  printLine("Usage: dq [options] query");
  printLine(" ");
  printLine("Options:");
  printLine("  -p, --path <path>    Path to search");
  printLine("  -r, --recursive      Search sub directories");
  printLine("  -b, --body           Include document body in search result");
  printLine("  -h, --help           Show dq help");
  process.exit(0);
}

var DocQuery = require("./DocQuery");
var execPath = argv.p ? argv.p : process.cwd();
var options = {
  recursive: argv.r,
  includeBody: argv.b,
  persistent: false
};
var dq = new DocQuery(execPath, options);
var delay = function delay(fn) {
  setTimeout(fn, 500);
};
delay(function () {
  var results = dq.search(argv._.join(" "));
  var output = JSON.stringify(results, null, 2);
  printLine(output);
  dq.watcher.close();
});
#! /usr/bin/env node

let argvParser = require("minimist")
let argv = argvParser(process.argv.slice(2), {
  boolean: ["r", "b", "h"],
  alias: {
    r: "recursive",
    b: "body",
    h: "help",
    p: "path"
  }
})
let printLine = function(text) {
  console.log(text)
}

if(argv.h) {
  printLine("Usage: dq [options] query")
  printLine(" ")
  printLine("Options:")
  printLine("  -p, --path <path>    Path to search")
  printLine("  -r, --recursive      Search sub directories")
  printLine("  -b, --body           Include document body in search result")
  printLine("  -h, --help           Show dq help")
  process.exit(0)
}

let DocQuery = require("./DocQuery")
let execPath = argv.p ? argv.p : process.cwd()
let options = {
  recursive: argv.r,
  includeBody: argv.b,
  persistent: false
}
let dq = new DocQuery(execPath, options)
let delay = function(fn) {
  setTimeout(fn, 500)
}
delay(function() {
  let results = dq.search(argv._.join(" "))
  let output = JSON.stringify(results, null, 2)
  printLine(output)
  dq.watcher.close()
})

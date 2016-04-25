var si = require("search-index")({
  fieldsToStore: ["title", "body"],
  logLevel: "info",
  indexPath: "experiment:1"
})

var data = [
  {id: "/a/b/c/foo", title: "foo", body: "pizza has sauce, baz", other: "foo bar baz"},
  {id: "/a/b/c/bar", title: "bar", body: "hamburgers have pickles, foo", other: "foo bar baz"},
  {id: "/a/b/c/baz", title: "baz", body: "babies love to scream", other: "foo bar baz"}
]

var batchOptions = {
  fieldOptions: [
    {fieldName: "title", weight: 10}
  ]
}

si.add(data, batchOptions, function(err) {
  if(!err) {
    console.log("added")
  }
})

var sync = require("synchronize")
sync(si, "search")
var q = {query: {"*": ["foo"]}}

var search = function(q) {
  var results = null

  sync.fiber(function() {
    results = si.search(q)
  })

  return results
}

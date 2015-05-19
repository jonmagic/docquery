let assert = require("assert")
let touch = require("touch")
let DocQuery = require("../src/DocQuery")

// Ensure there is a file with a recent timestamp for sorting tests.
touch.sync(`${__dirname}/fixtures/top-5/movies.md`)

describe("DocQuery", ()=>{
  var dq = new DocQuery("~/Projects/docquery/test/fixtures", {recursive: true})

  describe("#search", ()=>{
    it("returns search result for query", ()=>{
      var docs = dq.search("star")
      assert.equal(1, docs.length)
      var doc = docs[0]
      assert.equal("/Users/jonmagic/Projects/docquery/test/fixtures/top-5/movies.md", doc.filePath)
      assert.equal("movies.md", doc.fileName)
      assert.equal("movies", doc.title)
      assert.equal("Date", doc.modifiedAt.constructor.name)
      assert.equal(true, doc.body.length > 0)
    })
  })

  describe("#documents", ()=>{
    it("returns all documents", ()=>{
      assert.equal(4, dq.documents.length)
    })

    it("returns documents sorted newest first", ()=>{
      assert.equal(true, dq.documents[0].modifiedAt > dq.documents[3].modifiedAt)
    })
  })
})

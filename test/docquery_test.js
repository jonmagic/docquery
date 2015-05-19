var assert = require("assert")
var DocQuery = require("../src/DocQuery")

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
      assert.equal("foo", doc.body)
    })
  })

  describe("#documents", ()=>{
    it("returns all documents", ()=>{
      assert.equal(2, dq.documents.length)
    })

    it("returns documents sorted newest first", ()=>{
      assert.equal(true, dq.documents[0].modifiedAt > dq.documents[1].modifiedAt)
    })
  })
})

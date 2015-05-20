let assert = require("assert")
let touch = require("touch")
let DocQuery = require("../src/DocQuery")
let fs = require("fs")
let delay = function(fn) {
  setTimeout(fn, 205)
}

// Ensure there is a file with a recent timestamp for sorting tests.
touch.sync(`${__dirname}/fixtures/top-5/movies.md`)

describe("DocQuery", ()=>{
  var dq = new DocQuery("~/Projects/docquery/test/fixtures", {recursive: true})
  var tempFilePath = `${__dirname}/fixtures/tempfile.md`
  var tempSubDirFilePath = `${__dirname}/fixtures/top-5/foo.md`

  afterEach(()=>{
    if(fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath)
    if(fs.existsSync(tempSubDirFilePath)) fs.unlinkSync(tempSubDirFilePath)
  })

  describe("#search", ()=>{
    it("returns search result for query", (done)=>{
      delay(()=>{
        var docs = dq.search("star")
        assert.equal(1, docs.length)
        var doc = docs[0]
        assert.equal("/Users/jonmagic/Projects/docquery/test/fixtures/top-5/movies.md", doc.filePath)
        assert.equal("movies.md", doc.fileName)
        assert.equal("movies", doc.title)
        assert.equal("Date", doc.modifiedAt.constructor.name)
        assert.equal(true, doc.body.length > 0)
        done()
      })
    })

    it("returns new documents in search results", (done)=>{
      delay(()=>{
        fs.writeFileSync(tempFilePath, "temp file")
        delay(()=>{
          var docs = dq.search("temp")
          assert.equal(1, docs.length)
          var doc = docs[0]
          assert.equal("/Users/jonmagic/Projects/docquery/test/fixtures/tempfile.md", doc.filePath)
          assert.equal("tempfile.md", doc.fileName)
          assert.equal("tempfile", doc.title)
          assert.equal("Date", doc.modifiedAt.constructor.name)
          assert.equal("temp file", doc.body)
          done()
        })
      })
    })

    it("does not return document in search results after it has been deleted", (done)=>{
      delay(()=>{
        assert.equal(0, dq.search("temp").length)
        fs.writeFileSync(tempFilePath, "hello world")
        delay(()=>{
          assert.equal(1, dq.search("temp").length)
          fs.unlinkSync(tempFilePath)
          delay(()=>{
            assert.equal(0, dq.search("temp").length)
            done()
          })
        })
      })
    })
  })

  describe("#documents", ()=>{
    it("returns all documents", (done)=>{
      delay(()=>{
        assert.equal(4, dq.documents.length)
        done()
      })
    })

    it("returns documents sorted newest first", (done)=>{
      delay(()=>{
        assert.equal(true, dq.documents[0].modifiedAt > dq.documents[3].modifiedAt)
        done()
      })
    })

    it("returns new documents as they are added", (done)=>{
      delay(()=>{
        fs.writeFileSync(tempFilePath, "hello world")
        delay(()=>{
          assert.equal(5, dq.documents.length)
          assert.equal("tempfile", dq.documents[0].title)
          done()
        })
      })
    })

    it("does not return document after it has been deleted", (done)=>{
      delay(()=>{
        assert.equal("movies", dq.documents[0].title)
        fs.writeFileSync(tempFilePath, "hello world")
        delay(()=>{
          assert.equal("tempfile", dq.documents[0].title)
          fs.unlinkSync(tempFilePath)
          delay(()=>{
            assert.equal("movies", dq.documents[0].title)
            done()
          })
        })
      })
    })
  })
})

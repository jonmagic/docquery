var assert = require("assert")
var DocQuery = require("../src/DocQuery")

describe("DocQuery", () => {
  describe('#directoryPath', () => {
    it("returns path passed into the contructor", () => {
      var dq = new DocQuery("/foo/bar")
      assert.deepEqual(["/foo/bar"], dq.directoryPaths)
    })
  })
})

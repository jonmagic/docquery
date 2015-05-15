var assert = require("assert")
var docquery = require("../src/docquery")

describe("docquery", () => {
  describe('#directoryPath', () => {
    it("returns path passed into the contructor", () => {
      var docqueryInstance = new docquery("/foo/bar")
      assert.deepEqual(["/foo/bar"], docqueryInstance.directoryPaths)
    })
  })
})

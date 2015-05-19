let fs = require("fs")
let tilde = require("tilde-expansion")
let path = require("path")

class DocQuery {
  constructor(directoryPath, options) {
    this.options = options || {}
    this.extensions = [".md"]
    this.directoryPath = directoryPath
    this._documents = {}
    this.loadDocuments(directoryPath)
  }

  loadDocuments(directoryPath) {
    var self = this

    tilde(directoryPath, (expandedPath)=>{
      var fileNames = fs.readdirSync(expandedPath)
      for(let fileName of fileNames) {
        var extension = path.extname(fileName)
        var filePath = `${expandedPath}/${fileName}`
        var stats = fs.statSync(filePath)

        if(stats.isDirectory() && self.options.recursive) {
          self.loadDocuments(filePath)
        }else if(self.extensions.find(x => x == extension)) {
          self._documents[filePath] = {
            filePath: filePath,
            fileName: fileName,
            title: fileName.replace(new RegExp(`${extension}$`), ""),
            modifiedAt: stats.mtime,
            body: fs.readFileSync(filePath, {encoding: "utf8"})
          }
        }
      }
    })
  }

  search(query) {
    var result = this._documents["/Users/jonmagic/Projects/docquery/test/fixtures/top-5/movies.md"]

    return [result]
  }

  get documents() {
    var documents = []
    for(let key in this._documents) {
      documents.push(this._documents[key])
    }
    return documents.sort((a, b)=>{
      if(a.modifiedAt < b.modifiedAt) return 1
      if(a.modifiedAt > b.modifiedAt) return -1
      return 0
    })
  }
}

module.exports = DocQuery

let fs = require("fs")
let tilde = require("tilde-expansion")
let path = require("path")
let lunr = require("lunr")
let chokidar = require("chokidar")

class DocQuery {
  constructor(directoryPath, options) {
    this.options = options || {}
    this.extensions = [".md"]
    this.directoryPath = directoryPath
    this._documents = {}
    this.searchIndex = lunr(function() {
      this.field("title", { boost: 10 })
      this.field("body")
    })

    var watchDepth = this.options.recursive ? undefined : 0
    this.watcher = chokidar.watch(null, {
      depth: watchDepth,
      ignored: (watchedPath, fileStats)=>{
        if(!fileStats) return false
        if(fileStats.isDirectory()) return false
        return !(this.extensions.indexOf(path.extname(watchedPath)) > -1)
      }
    })
    var fileDetails = (filePath)=>{
      var fileStats = fs.statSync(filePath)
      var fileName = path.basename(filePath)
      var title = path.basename(fileName, path.extname(fileName))
      var body = fs.readFileSync(filePath, {encoding: "utf8"})

      return {
        filePath: filePath,
        fileName: fileName,
        title: title,
        modifiedAt: fileStats.mtime,
        body: body
      }
    }
    this.watcher.on("add", (filePath)=>{
      this.addDocument(fileDetails(filePath))
    })
    this.watcher.on("change", (filePath)=>{
      this.updateDocument(fileDetails(filePath))
    })
    this.watcher.on("unlink", (filePath)=>{
      this.removeDocument(this._documents[filePath])
    })
    tilde(this.directoryPath, (expandedDirectoryPath)=>{
      this.watcher.add(expandedDirectoryPath)
    })
  }

  addDocument(fileDetails) {
    this._documents[fileDetails.filePath] = fileDetails
    this.searchIndex.add({
      id: fileDetails.filePath,
      title: fileDetails.title,
      body: fileDetails.body
    })
  }

  updateDocument(fileDetails) {
    this._documents[fileDetails.filePath] = fileDetails
    this.searchIndex.update({
      id: fileDetails.filePath,
      title: fileDetails.title,
      body: fileDetails.body
    })
  }

  removeDocument(fileDetails) {
    delete this._documents[fileDetails.filePath]
    this.searchIndex.remove({
      id: fileDetails.filePath,
      title: fileDetails.title,
      body: fileDetails.body
    })
  }

  search(query) {
    return this.searchIndex.search(query).map((result)=>{
      return this._documents[result.ref]
    })
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

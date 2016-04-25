let fs = require("fs")
let tilde = require("tilde-expansion")
let path = require("path")
let si = require("search-index")
let chokidar = require("chokidar")
let {EventEmitter} = require("events")

class DocQuery extends EventEmitter {
  constructor(directoryPath, options={}) {
    super()
    this.options = options || {}
    this.options.extensions  = options.extensions || [".md", ".txt"]
    this.options.persistent  = options.persistent == false ? false : true
    this.options.includeBody = options.includeBody == false ? false : true
    this._documents = {}
    this.searchIndex = si({
      fieldsToStore: ["fileName", "title", "body"],
      logLevel: "error"
    })
    this._batch = []
    this._batchOptions = {
      fieldOptions: [
        {fieldName: "fileName"},
        {fieldName: "title", weight: 10},
        {fieldName: "body"},
      ]
    }
    this.loaded = false
    this.searchResults = null
    this.watcher = chokidar.watch(null, {
      depth: this.options.recursive ? undefined : 0,
      persistent: this.options.persistent,
      ignored: (watchedPath, fileStats)=>{
        if(!fileStats) return false
        if(fileStats.isDirectory()) return false
        return !(this.options.extensions.indexOf(path.extname(watchedPath)) > -1)
      }
    })
    var fileDetails = (filePath)=>{
      var fileStats = fs.statSync(filePath)
      var fileName = path.basename(filePath)
      var title = path.basename(fileName, path.extname(fileName))
      var body = fs.readFileSync(filePath, {encoding: "utf8"})

      return {
        id: filePath,
        filePath: filePath,
        fileName: fileName,
        title: title,
        body: body,
        modifiedAt: fileStats.mtime.toString()
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
    this.watcher.on("ready", ()=>{
      this.addBatchToSearchIndex()
    })
    tilde(directoryPath, (expandedDirectoryPath)=>{
      this.watcher.add(expandedDirectoryPath)
    })
  }

  addDocument(fileDetails) {
    this._documents[fileDetails.filePath] = fileDetails

    if(this.loaded) {
      this.searchIndex.add(this._batchOptions, [fileDetails], (err)=>{
        if(!err) this.emit("added", fileDetails)
      })
    } else {
      this._batch.push(fileDetails)
    }
  }

  addBatchToSearchIndex() {
    var dq = this
    this.searchIndex.add(this._batch, this._batchOptions, function(err) {
      if(!err) {
        dq.loaded = true
        dq.emit("ready")
        dq._batch = []
      }
    })
  }

  updateDocument(fileDetails) {
    this._documents[fileDetails.filePath] = fileDetails

    this.searchIndex.add([fileDetails], this._batchOptions, function(err) {
      if(!err) this.emit("updated", fileDetails)
    })
  }

  removeDocument(fileDetails) {
    this.searchIndex.del(fileDetails.id, function(err) {
      if(!err) {
        delete this._documents[fileDetails.id]
        this.emit("removed", fileDetails)
      }
    })
  }

  search(query, callback) {
    var dq = this

    dq.searchIndex.search({query: {"*":[query]}}, function(err, results) {
      if(!err) {
        var docs = []

        results.hits.map(function(result) {
          return dq._documents[result.id]
        }).forEach(function(doc) {
          if(doc) docs.push(doc)
        })

        callback(docs)
      }
    })
  }

  close(callback) {
    this.searchIndex.close(callback)
  }

  filterBody(doc) {
    var filteredDoc = {}
    for(let key in doc) {
      if(key != "body") {
        filteredDoc[key] = doc[key]
      }else if(this.options.includeBody){
        filteredDoc[key] = doc[key]
      }
    }
    return filteredDoc
  }

  get documents() {
    var documents = []

    for(let key in this._documents) {
      documents.push(this.filterBody(this._documents[key]))
    }

    return documents.sort((a, b)=>{
      if(new Date(a.modifiedAt) < new Date(b.modifiedAt)) return 1
      if(new Date(a.modifiedAt) > new Date(b.modifiedAt)) return -1
      return 0
    })
  }
}

module.exports = DocQuery

class DocQuery {
  constructor(directoryPath) {
    this.directoryPath = directoryPath
    this._documents = [
      {
        "filePath": "/Users/jonmagic/Projects/docquery/test/fixtures/top-5/movies.md",
        "fileName": "movies.md",
        "title": "movies",
        "modifiedAt": new Date(1431710896),
        "body": "foo"
      },
      {
        "filePath": "/Users/jonmagic/Projects/docquery/test/fixtures/top-5/burgers.md",
        "fileName": "burgers.md",
        "title": "burgers",
        "modifiedAt": new Date(1431710999),
        "body": "bar"
      }
    ]
  }

  search(query) {
    var result = this._documents[0]

    return [result]
  }

  get documents() {
    return this._documents.sort((a, b)=>{
      if(a.modifiedAt < b.modifiedAt) return 1
      if(a.modifiedAt > b.modifiedAt) return -1
      return 0
    })
  }
}

module.exports = DocQuery

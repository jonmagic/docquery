class DocQuery {
  constructor(directoryPath) {
    this.directoryPath = directoryPath
  }

  get directoryPaths() {
    return [this.directoryPath]
  }
}

module.exports = DocQuery

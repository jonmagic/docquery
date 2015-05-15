class docquery {
  constructor(directoryPath) {
    this.directoryPath = directoryPath
  }

  get directoryPaths() {
    return [this.directoryPath]
  }
}

module.exports = docquery

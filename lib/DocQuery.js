"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var tilde = require("tilde-expansion");
var path = require("path");
var lunr = require("lunr");
var chokidar = require("chokidar");

var DocQuery = (function () {
  function DocQuery(directoryPath, options) {
    var _this = this;

    _classCallCheck(this, DocQuery);

    this.options = options || {};
    this.extensions = this.options.extensions || [".md"];
    this.directoryPath = directoryPath;
    this._documents = {};
    this.searchIndex = lunr(function () {
      this.field("title", { boost: 10 });
      this.field("body");
    });

    var watchDepth = this.options.recursive ? undefined : 0;
    this.watcher = chokidar.watch(null, {
      depth: watchDepth,
      ignored: function ignored(watchedPath, fileStats) {
        if (!fileStats) return false;
        if (fileStats.isDirectory()) return false;
        return !(_this.extensions.indexOf(path.extname(watchedPath)) > -1);
      }
    });
    var fileDetails = function fileDetails(filePath) {
      var fileStats = fs.statSync(filePath);
      var fileName = path.basename(filePath);
      var title = path.basename(fileName, path.extname(fileName));
      var body = fs.readFileSync(filePath, { encoding: "utf8" });

      return {
        filePath: filePath,
        fileName: fileName,
        title: title,
        modifiedAt: fileStats.mtime,
        body: body
      };
    };
    this.watcher.on("add", function (filePath) {
      _this.addDocument(fileDetails(filePath));
    });
    this.watcher.on("change", function (filePath) {
      _this.updateDocument(fileDetails(filePath));
    });
    this.watcher.on("unlink", function (filePath) {
      _this.removeDocument(_this._documents[filePath]);
    });
    tilde(this.directoryPath, function (expandedDirectoryPath) {
      _this.watcher.add(expandedDirectoryPath);
    });
  }

  _createClass(DocQuery, [{
    key: "addDocument",
    value: function addDocument(fileDetails) {
      this._documents[fileDetails.filePath] = fileDetails;
      this.searchIndex.add({
        id: fileDetails.filePath,
        title: fileDetails.title,
        body: fileDetails.body
      });
    }
  }, {
    key: "updateDocument",
    value: function updateDocument(fileDetails) {
      this._documents[fileDetails.filePath] = fileDetails;
      this.searchIndex.update({
        id: fileDetails.filePath,
        title: fileDetails.title,
        body: fileDetails.body
      });
    }
  }, {
    key: "removeDocument",
    value: function removeDocument(fileDetails) {
      delete this._documents[fileDetails.filePath];
      this.searchIndex.remove({
        id: fileDetails.filePath,
        title: fileDetails.title,
        body: fileDetails.body
      });
    }
  }, {
    key: "search",
    value: function search(query) {
      var _this2 = this;

      return this.searchIndex.search(query).map(function (result) {
        return _this2._documents[result.ref];
      });
    }
  }, {
    key: "documents",
    get: function () {
      var documents = [];
      for (var key in this._documents) {
        documents.push(this._documents[key]);
      }
      return documents.sort(function (a, b) {
        if (a.modifiedAt < b.modifiedAt) return 1;
        if (a.modifiedAt > b.modifiedAt) return -1;
        return 0;
      });
    }
  }]);

  return DocQuery;
})();

module.exports = DocQuery;
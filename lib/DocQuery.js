"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");
var tilde = require("tilde-expansion");
var path = require("path");
var lunr = require("lunr");
var chokidar = require("chokidar");

var DocQuery = (function () {
  function DocQuery(directoryPath) {
    var _this = this;

    var options = arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, DocQuery);

    this.options = options || {};
    this.options.extensions = options.extensions || [".md", ".txt"];
    this.options.persistent = options.persistent == false ? false : true;
    this.options.includeBody = options.includeBody == false ? false : true;
    this._documents = {};
    this.searchIndex = lunr(function () {
      this.field("title", { boost: 10 });
      this.field("body");
    });
    this.watcher = chokidar.watch(null, {
      depth: this.options.recursive ? undefined : 0,
      persistent: this.options.persistent,
      ignored: function ignored(watchedPath, fileStats) {
        if (!fileStats) return false;
        if (fileStats.isDirectory()) return false;
        return !(_this.options.extensions.indexOf(path.extname(watchedPath)) > -1);
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
    tilde(directoryPath, function (expandedDirectoryPath) {
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
        return _this2.filterBody(_this2._documents[result.ref]);
      });
    }
  }, {
    key: "filterBody",
    value: function filterBody(doc) {
      var filteredDoc = {};
      for (var key in doc) {
        if (key != "body") {
          filteredDoc[key] = doc[key];
        } else if (this.options.includeBody) {
          filteredDoc[key] = doc[key];
        }
      }
      return filteredDoc;
    }
  }, {
    key: "documents",
    get: function () {
      var documents = [];

      for (var key in this._documents) {
        documents.push(this.filterBody(this._documents[key]));
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
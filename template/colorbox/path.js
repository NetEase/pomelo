
__resources__["/__builtin__/path.js"] = {meta: {mimetype: "application/javascript"}, data: function(exports, require, module, __filename, __dirname) {
/** @namespace */
var path = {
  /**
   * Returns full directory path for the filename given. The path must be formed using forward slashes '/'.
   *
   * @param {String} path Path to return the directory name of
   * @returns {String} Directory name
   */
  dirname: function(path) 
  {
    var tokens = path.split('/');
    tokens.pop();
    return tokens.join('/');
  },

  /**
   * Returns just the filename portion of a path.
   *
   * @param {String} path Path to return the filename portion of
   * @returns {String} Filename
   */
  basename: function(path) 
  {
    var tokens = path.split('/');
    return tokens[tokens.length-1];
  },

  /**
   * Joins multiple paths together to form a single path
   * @param {String} ... Any number of string arguments to join together
   * @returns {String} The joined path
   */
  join: function () 
  {
    return module.exports.normalize(Array.prototype.join.call(arguments, "/"));
  },

  /**
   * Tests if a path exists
   *
   * @param {String} path Path to test
   * @returns {Boolean} True if the path exists, false if not
   */
  exists: function(path) 
  {
    return (__resources__[path] !== undefined);
  },

  /**
   * @private
   */
  normalizeArray: function (parts, keepBlanks) 
  {
    var directories = [], prev;
    for (var i = 0, l = parts.length - 1; i <= l; i++) 
    {
      var directory = parts[i];

      // if it's blank, but it's not the first thing, and not the last thing, skip it.
      if (directory === "" && i !== 0 && i !== l && !keepBlanks) continue;

      // if it's a dot, and there was some previous dir already, then skip it.
      if (directory === "." && prev !== undefined) continue;

      // if it starts with "", and is a . or .., then skip it.
      if (directories.length === 1 && directories[0] === "" && (
        directory === "." || directory === "..")) continue;

      if (
        directory === ".."
          && directories.length
          && prev !== ".."
          && prev !== "."
          && prev !== undefined
          && (prev !== "" || keepBlanks)
      ) 
      {
        directories.pop();
        prev = directories.slice(-1)[0]
      } else 
      {
        if (prev === ".") directories.pop();
        directories.push(directory);
        prev = directory;
      }
    }
    return directories;
  },

  /**
   * Returns the real path by expanding any '.' and '..' portions
   *
   * @param {String} path Path to normalize
   * @param {Boolean} [keepBlanks=false] Whether to keep blanks. i.e. double slashes in a path
   * @returns {String} Normalized path
   */
  normalize: function (path, keepBlanks) 
  {
    return module.exports.normalizeArray(path.split("/"), keepBlanks).join("/");
  }
};

module.exports = path;

}};
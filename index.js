var schema = require('protocol-buffers-schema')
var fs = require('fs')
var path = require('path')

var merge = function(a, b) {
  a.messages = a.messages.concat(b.messages)
  a.enums = a.enums.concat(b.enums)
  return a
}

var readSync = function(filename, protoPaths) {
  protoPaths = protoPaths || []
  protoPaths = protoPaths.concat(path.dirname(filename))
  if (!/\.proto$/i.test(filename) && !fs.existsSync(filename)) filename += '.proto'

  var sch = schema(fs.readFileSync(filename, 'utf-8'))
  var imports = [].concat(sch.imports || [])

  imports.forEach(function(i) {
    var resolved = null
    protoPaths.every(function(protoPath) {
      resolved = path.resolve(protoPath, i)
      return !fs.existsSync(resolved)
    })
    sch = merge(sch, readSync(resolved, protoPaths))
  })

  return sch
}

function resolveImport(importFile, protoPaths, cb) {
  var paths = [].concat(protoPaths || [])
  var resolvedFile = null

  var resolveLoop = function(resolved) {
    if (resolved) return cb(resolvedFile)
    if (!paths.length) return cb(null)

    resolvedFile = path.resolve(paths.shift(), importFile)
    fs.exists(resolvedFile, resolveLoop)
  }
  resolveLoop()
}

var read = function(filename /*, protoPaths, cb */) {
  var args = [].slice.call(arguments)
  var protoPaths = args.slice(1, -1)[0]
  var cb = args.slice(-1)[0]

  protoPaths = protoPaths || []
  protoPaths = protoPaths.concat([path.dirname(filename)])

  fs.exists(filename, function(exists) {
    if (!exists && !/\.proto$/i.test(filename)) filename += '.proto'

    fs.readFile(filename, 'utf-8', function(err, proto) {
      if (err) return cb(err)

      var sch = schema(proto)
      var imports = [].concat(sch.imports || [])

      var loop = function() {
        if (!imports.length) return cb(null, sch)

        resolveImport(imports.shift(), protoPaths, function(resolvedFile) {
          read(resolvedFile, protoPaths, function(err, ch) {
            if (err) return cb(err)
            sch = merge(sch, ch)
            loop()
          })
        })
      }

      loop()
    })
  })
}

module.exports = read
module.exports.sync = readSync

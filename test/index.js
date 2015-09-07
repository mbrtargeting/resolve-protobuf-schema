var tape = require('tape')
var schema = require('../')

var test = function(name, fn) {
  tape(name, function(t) {
    fn(t, schema)
  })
  tape(name+' sync', function(t) {
    fn(t, function(name /*, protoPaths, cb */) {
      var args = [].slice.call(arguments)
      var protoPaths = args.slice(1, -1)[0]
      var cb = args.slice(-1)[0]

      cb(null, schema.sync(name, protoPaths))
    })
  })
}

test('c', function(t, schema) {
  schema(__dirname+'/c.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 1)
    schema(__dirname+'/c', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 1)
      t.end()
    })
  })
})

test('b imports c', function(t, schema) {
  schema(__dirname+'/b.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 2)
    schema(__dirname+'/b', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 2)
      t.end()
    })
  })
})

test('a imports b imports c', function(t, schema) {
  schema(__dirname+'/a.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 3)
    schema(__dirname+'/a', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 3)
      t.end()
    })
  })
})

test('G references f.F', function(t, schema) {
  schema(__dirname+'/g.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch, require('./g.json'))
    schema(__dirname+'/g', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 3)
      t.end()
    })
  })
})

test('d imports e imports f from external proto paths', function(t, schema) {
  var protoPaths = [__dirname+'/include_e', __dirname+'/include_f']
  schema(__dirname+'/d.proto', protoPaths, function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 3)
    schema(__dirname+'/d', protoPaths, function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 3)
      t.end()
    })
  })
})

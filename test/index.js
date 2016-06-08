var tape = require('tape')
var schema = require('../')

var test = function(name, fn) {
  tape(name, function(t) {
    fn(t, schema)
  })
  tape(name+' sync', function(t) {
    fn(t, function(name /*, options, cb */) {
      var args = [].slice.call(arguments)
      var options = args.slice(1, -1)[0]
      var cb = args.slice(-1)[0]

      cb(null, schema.sync(name, options))
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
  var options = {
    protoPaths: [__dirname+'/include_e', __dirname+'/include_f'],
  }
  schema(__dirname+'/d.proto', options, function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 3)
    schema(__dirname+'/d', options, function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 3)
      t.end()
    })
  })
})

test('h', function(t, schema) {
  schema(__dirname+'/h.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 1)
    schema(__dirname+'/h', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 1)
      t.end()
    })
  })
})

test('i extends h', function(t, schema) {
  schema(__dirname+'/i.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 2)
    schema(__dirname+'/i', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 2)
      t.end()
    })
  })
})

test('j extends h', function(t, schema) {
  schema(__dirname+'/j.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch.messages.length, 2)
    schema(__dirname+'/j', function(err, sch) {
      t.notOk(err, 'no err')
      t.same(sch.messages.length, 2)
      t.end()
    })
  })
})

test('k has field of type i and j', function(t, schema) {
  function check(sch) {
    var messageH = sch.messages.filter(function(message) {
     return message.fullName === 'H'
    })
    t.same(messageH.length, 1)
    var hMessages = messageH[0].fields.map(function(message) {
      return message.name
    })
    t.deepEqual(hMessages.sort(), ['h', 'i', 'j']);
  }

  schema(__dirname+'/k.proto', function(err, sch) {
    t.notOk(err, 'no err')
    check(sch)
    schema(__dirname+'/k', function(err, sch) {
      t.notOk(err, 'no err')
      check(sch)
      t.end()
    })
  })
})

test('enums are not duplicated', function(t, schema) {
  schema(__dirname+'/o.proto', function(err, sch) {
    t.notOk(err, 'no err')
    t.same(sch, require('./o.json'))
    schema(__dirname+'/o', function(err, sch) {
      t.notOk(err, 'no err')
      t.end()
    })
  })
})

test('includes are resolved relative to proto file', function(t, schema) {
  function check(sch) {
    var fullNames = sch.messages.map(function(message) {
     return message.fullName
    })
    t.deepEqual(fullNames.sort(), ['P', 'Q', 'R1', 'R2'])
  }

  schema(__dirname+'/p.proto', function(err, sch) {
    t.notOk(err, 'no err')
    check(sch)
    schema(__dirname+'/p', function(err, sch) {
      t.notOk(err, 'no err')
      check(sch)
      t.end()
    })
  })
})

test('includes are resolved relative to proto root', function(t, schema) {
  function check(sch) {
    var fullNames = sch.messages.map(function(message) {
     return message.fullName
    })
    t.deepEqual(fullNames.sort(), ['R1', 'R2'])
  }

  schema(__dirname+'/subdir_r/r1.proto', {protoRoot: __dirname}, function(err, sch) {
    t.notOk(err, 'no err')
    check(sch)
    schema(__dirname+'/subdir_r/r1', {protoRoot: __dirname}, function(err, sch) {
      t.notOk(err, 'no err')
      check(sch)
      t.end()
    })
  })
})

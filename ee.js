'use strict';

const emitter = () => {
  const events = {
    before: new Map(),
    after: new Map()
  };
  const wrapped = {
    before: new Map(),
    after: new Map()
  };
  const ee = {
    on: {
      before: (name, f) => {
        const event = events.before.get(name);
        if (!event) {
          events.before.set(name, [f]);
        } else {
          event.push(f);
          events.before.set(name, event);
        }
      },
      after: (name, f) => {
        const event = events.after.get(name);
        if (!event) {
          events.after.set(name, [f]);
        } else {
          event.push(f);
          events.after.set(name, event);
        }
      }
    },
    emit: {
      before: (name, ...data) => {
        const event = events.before.get(name);
        if (event) event.forEach(f => f(...data));
      },
      after: (name, ...data) => {
        const event = events.after.get(name);
        if (event) event.forEach(f => f(...data));
      }
    },
    once: {
      before: (name, f) => {
        const g = (...a) => {
          ee.remove.before(name, g);
          f(...a);
        };
        wrapped.before.set(f, g);
        ee.on.before(name, g);
      },
      after: (name, f) => {
        const g = (...a) => {
          ee.remove.after(name, g);
          f(...a);
        };
        wrapped.after.set(f, g);
        ee.on.after(name, g);
      }
    },
    remove: {
      before: (name, f) => {
        const event = events.before.get(name);
        if (!event) return;
        let i = event.indexOf(f);
        if (i !== -1) {
          event.splice(i, 1);
          return;
        }
        const g = wrapped.before.get(f);
        if (g) {
          i = event.indexOf(g);
          if (i !== -1) event.splice(i, 1);
          if (!event.length) events.before.delete(name);
        }
      },
      after: (name, f) => {
        const event = events.after.get(name);
        if (!event) return;
        let i = event.indexOf(f);
        if (i !== -1) {
          event.splice(i, 1);
          return;
        }
        const g = wrapped.after.get(f);
        if (g) {
          i = event.indexOf(g);
          if (i !== -1) event.splice(i, 1);
          if (!event.length) events.after.delete(name);
        }
      }
    },
    clear: {
      before: (name) => {
        if (name) events.before.delete(name);
        else events.before.clear();
      },
      after: (name) => {
        if (name) events.after.delete(name);
        else events.after.clear();
      }
    },
    count: {
      before: (name) => {
        const event = events.before.get(name);
        return event ? event.length : 0;
      },
      after: (name) => {
        const event = events.after.get(name);
        return event ? event.length : 0;
      }
    },
    listeners: {
      before: (name) => {
        const event = events.before.get(name);
        return event.slice();
      },
      after: (name) => {
        const event = events.after.get(name);
        return event.slice();
      }
    },
    names: {
      before: () => [...events.before.keys()],
      after: () => [...events.after.keys()]
    }
  };
  return ee;
};

module.exports = emitter;

// Usage

const ee = emitter();

// on and emit

ee.on.after('e1', (data) => {
  console.dir(data);
});

ee.emit.after('e1', { msg: 'e1 ok' });

// once

ee.once.after('e2', (data) => {
  console.dir(data);
});

ee.emit.after('e2', { msg: 'e2 ok' });
ee.emit.after('e2', { msg: 'e2 not ok' });

// remove

const f3 = (data) => {
  console.dir(data);
};

ee.on.before('e3', f3);
ee.remove.before('e3', f3);
ee.emit.before('e3', { msg: 'e3 not ok' });

// count

ee.on.before('e4', () => {});
ee.on.before('e4', () => {});
console.log('e4 count', ee.count.before('e4'));

// clear

ee.clear.after('e4');
ee.emit.after('e4', { msg: 'e4 not ok' });
ee.emit.after('e1', { msg: 'e1 ok' });

ee.clear.after();
ee.emit.after('e1', { msg: 'e1 not ok' });

// listeners and names

ee.on.before('e5', () => {});
ee.on.after('e5', () => {});
ee.on.after('e6', () => {});
ee.on.after('e7', () => {});

console.log('listeners.before', ee.listeners.before('e5'));
console.log('listeners.after', ee.listeners.after('e5'));
console.log('names', ee.names.after());

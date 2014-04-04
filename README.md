native-tasks
============

Using ES6 generator instead of callbacks on promises. 100% native.

Before
------

```js
function who() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("world");
        }, 1000);
    });
}

function hello() {
    who().then(function(name) {
        alert("Hello " + name + "!");
    });
}
```

After
-----

```js
function who() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve("world");
        }, 1000);
    });
}

var hello = async(function*() {
    var name = yield who();
    alert("Hello " + name + "!");
});

// Or even...

var hello = async(function*() {
    alert("Hello " + (yield who()) + "!");
});

// And also...

function returnAsync(value) {
    return new Promise(function(resolve, reject) {
        process.nextTick(function() {
            resolve(value);
        });
    });
}

function throwAsync() {
    return new Promise(function(resolve, reject) {
        process.nextTick(function() {
            reject(new Error("Something is wrong"));
        });
    });
}

var foobar = async(function*() {
    if((yield returnAsync(42)) > 23) {
        try {
            var maybe    = yield returnAsync(true); // This will return
            var maybenot = yield throwAsync();      // But this won't
            var afterall = yield returnAsync(3.14); // Never even called
            return true;
        } catch(e) {
            console.error(e);   // "Error: Something is wrong"
            return false;
        }
    } else {
        throw new Error("Wait, what?");
    }
});

// (Almost) Equivalent promises code

function foobar() {
    return returnAsync(42)
    .then(function(number) {
        if(number > 23)
            return;
        else
            throw new Error("Wait, what?");
    })
    .then(function() {
        return returnAsync(true);
    })
    .then(function() {
        return throwAsync();
    })
    .then(function() {
        return returnAsync(3.14);
    })
    .then(function() {
        return true;
    })
    // --> THIS ALSO CATCHES "Error: Wait, what?" ...
    .catch(function(e) {
        console.error(e);   // "Error: Something is wrong"
        return false;
    });
}
```

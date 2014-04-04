/*
    Copyright (c) 2014 Bastien Clément

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be included
    in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
    OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * Async function run immediatly
 */
function task(gen, _args) {
    // The task is itself a promise
    return new Promise(function(resolve, reject) {
        // Initialize the generator
        var generator = gen.apply(this, _args);
        
        function handle(ret) {
            // Yielding is always async
            process.nextTick(function() {
                if(ret.done) {
                    // Generator returned
                    (Array.isArray(ret.value)
                        ? Promise.all(ret.value)
                        : Promise.resolve(ret.value))
                    .then(function(res) {
                        resolve(res);
                    }, function(e) {
                        reject(e);
                    });
                } else {
                    // Generator yielded
                    (Array.isArray(ret.value)
                        ? Promise.all(ret.value)
                        : Promise.resolve(ret.value))
                    .then(function(res) {
                        try { handle(generator.next(res)); } catch(e) { reject(e); }
                    }, function(e) {
                        try { handle(generator.throw(e)); } catch(e) { reject(e); }
                    });
                }
            });
        }

        // Run the first chunk of the function
        handle(generator.next());
    });
}

/**
 * Generate new task when a function is called
 */
function async(gen) {
    return function() {
        return task(gen, arguments);
    }
}

// BONUS !

/**
 * Because deferred are even flatter!
 */
function defer() {
    var resolve;
    var reject;
    
    var promise = new Promise(function(res, rej) {
        // Closures usually didn't work this way..
        resolve = res;
        reject = rej;
    });
    
    // Very simple deferred
    return {
        promise: promise,
        resolve: resolve,
        reject: reject
    };
}

/**
 * We like finally!
 */
Promise.prototype.finally = function(finFn) {
    return this.then(finFn, finFn);
};

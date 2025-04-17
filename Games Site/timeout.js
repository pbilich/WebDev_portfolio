function doit() {
    console.log(msg);
}

let num_secs = 5
setTimeout(doit, num_secs * 1000, msg = `after ${num_secs} seconds all done`);
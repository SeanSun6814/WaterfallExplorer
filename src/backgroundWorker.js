const { workerData, parentPort } = require("node:worker_threads");
const childProcess = require("child_process");
console.log("Worker thread: received command: " + workerData);
childProcess.exec(workerData);
parentPort.postMessage({ msg: "Worker thread: done running command" });
console.log("Worker thread: exiting...");

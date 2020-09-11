export default class PreviewJsRunner {
  constructor() {}

  onWorkerError() {
    throw new Error("Worker error handler must be assigned");
  }
  onWorkerMessage() {
    throw new Error("Worker message handler must be assigned");
  }
  onWorkerTerminate() {
    throw new Error("Worker terminate handler must be assigned");
  }

  // mode = preview | test
  async *run({code}) {

    // we only terminate the worker when running something else
    // no termination for timeout/hangup, cause the user may be debugging the code
    if (this.worker){
      this.worker.terminate();
      this.onWorkerTerminate({type: 'terminate'});
    }

    // type module - to support potential imports?
    // TODO: replace this link to correct
    this.worker = new Worker('http://localhost:9080/client/evalWorker.js', {type: 'module'});

    console.error('this.worker', this.worker);

    await new Promise(resolve => {
      this.worker.addEventListener('message', event => {
        if (event.data.type == 'ready') resolve();
      }, {once: true});
    });

    this.worker.addEventListener('error', error => this.onWorkerError(error));

    this.worker.addEventListener('message', message => this.onWorkerMessage(message.data));

    this.worker.postMessage({
      command: 'run',
      code
    });

    // detect syntax error in js by using onerror? use babel in case of syntax error to show it?
    // what happens if SyntaxError in worker?
    while(true) {

      let resultEvent = await Promise.race([
        new Promise(resolve => this.onWorkerMessage = resolve),
        // worker terminated (by a new invocation of run)
        new Promise(resolve => this.onWorkerTerminate = resolve),
        // syntax error OR throw in our code
        new Promise(resolve => this.onWorkerError = resolve)
      ]);

      yield resultEvent;

      if (resultEvent.type == 'error') {
         // syntax error OR throw in our code
        break;
      }

      if (resultEvent.type == 'terminate') {
        // worker terminated
        break;
      }

      if (resultEvent.type == 'result') {
        // result
        break;
      }
    }

  }

};


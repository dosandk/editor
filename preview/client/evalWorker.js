import './lib/runners/testEnvironment.js';
import ExceptionFormatter from './lib/formatters/exceptionFormatter.js';

const exceptionFormatter = new ExceptionFormatter();

self.onmessage = async event => {
  let {command, code} = event.data;

  console.log("GOT", command, code);

  if (command == 'run') {
    // clear stack
    queueMicrotask(() => run(code));
  }
};

async function run(code) {
  console.error('evalWorker run');

  try {
    proxyConsoleLog();
    eval(code);
  } catch(err) {
    self.postMessage({type: 'error', error: exceptionFormatter.format(err)});
  } finally {
    stopProxyConsoleLog();
  }
}

self.postMessage({ type: 'ready' });

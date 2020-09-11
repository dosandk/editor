import jasmineRequire from './jasmine-core/lib/jasmine-core/jasmine.js';

import ExceptionFormatter from '../formatters/exceptionFormatter';
import getFunctionBody from '../formatters/getFunctionBody';
import format from '../formatters/format';

const isWorker = typeof window == 'undefined';

// by default clearStack uses MessageChannel/setTimeout, they are throttled if iframe not visible
// so tests take a lot of time
jasmineRequire.clearStack = function() {
  return global => queueMicrotask.bind(global);
};

/* add test body to spec result */
let Spec = jasmineRequire.Spec;

jasmineRequire.Spec = function(j$) {
  let SpecOriginal = Spec(j$);

  return class Spec extends SpecOriginal {
    constructor(attrs) {
      super(attrs);
      this.result.body = getFunctionBody(attrs.queueableFn && attrs.queueableFn.fn);
    }
  }
}

let postMessage = isWorker ?
  message => globalThis.postMessage(message) :
  message => window.parent.postMessage(message, '*');

/* adapted from jasmine-core/boot.js */
let jasmine = jasmineRequire.core(jasmineRequire);

jasmine.ExceptionFormatter = ExceptionFormatter;

globalThis.jasmine = jasmine;

let jasmineEnv = jasmine.getEnv();

let jasmineInterface = jasmineRequire.interface(jasmine, jasmineEnv);

Object.assign(globalThis, jasmineInterface);

jasmineEnv.addReporter(jasmineInterface.jsApiReporter);

jasmineEnv.addReporter({
  jasmineDone() {
    let result = jsApiReporter.specs();

    postMessage({type: "result", result});
  }
});

let nativeConsoleLog = console.log;

globalThis.proxyConsoleLog = () => {
  let nativeLog = nativeConsoleLog.bind(console);
  console.log = function(...args) {

    nativeLog('nativeLog', ...args);

    let postArgs = args.map(format);
    postMessage({type: 'log', args: postArgs});
  }
}

globalThis.stopProxyConsoleLog = () => {
  console.log = nativeConsoleLog;
}

if (!isWorker) {
  proxyConsoleLog();
  window.addEventListener('load', () => {
    if (jasmineEnv.topSuite().children.length == 0) return; // no tests
    jasmineEnv.execute();
  });
}

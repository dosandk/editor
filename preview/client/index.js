import ServiceWorkerManager from './lib/serviceWorkerManager.js';
import PreviewJsRunner from './lib/runners/previewJsRunner.js';
import PreviewHtmlRunner from './lib/runners/previewHtmlRunner.js';

const serviceWorkerManager = ServiceWorkerManager.instance();

const previewJsRunner = new PreviewJsRunner();
const previewHtmlRunner = new PreviewHtmlRunner();

export default class PreviewManager {
  constructor() {
    this.addEventListeners();
  }

  addEventListeners () {
    window.addEventListener('message', event => {
      console.error('First event', event);

      this.onWindowMessage(event);
    });
  }

  // command: 'run'
  // type: 'js' | 'html'
  // mode: 'preview' | 'test'
  // for HTML:
  //   sandbox: { [path]: content ]
  // for JS
  //   code: 'just js for js mode'
  // timeout: number
  async onWindowMessage(event) {
    console.error('onWindowMessage');

    // only accept commands from the parent window here
    if (event.source !== window.parent) return;

    const {type, command} = event.data;
    // const [port] = event.ports;


    console.time(`previewManager ${command} ${type}`);

    if (command == 'run' && type == 'js') {
      console.error('run && js');

      let resultGenerator = previewJsRunner.run(event.data);
      await generator2postMessage(resultGenerator, event);
    } else if (command == 'run' && type == 'html') {


      await previewHtmlRunner.run(event.data.sandbox);


    } else if (command == 'ready') {
      console.error('ready');

      // NOTE: need to remove from this file
      await serviceWorkerManager.ready();

      // NOTE: why we need this check?
      if (type == 'js') {
        // await js preview babel loaded?
      }

      event.source.postMessage({type: 'done'});
    }

    console.timeEnd(`previewManager ${command} ${type}`);
  }

}

async function generator2postMessage(asyncGenerator, event) {
  for await (let value of asyncGenerator) {
    event.source.postMessage(value);
  }
}


// TODO: instantiate this after service worker will be ready?
new PreviewManager();

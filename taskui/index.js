import template from './templates/index.pug';

import debounce from 'lodash.debounce';
import TASK from './__mocks__/task.js';

import Editor from './components/editor/index.js';
import Output from './components/output.js';
import AsidePanel from './components/aside-panel.js';

import Preview from './components/preview.js';
import Tests from './components/tests.js';

import { normalizeHtml } from './components/utils';

const PREVIEW_WORKER_URL = ' http://localhost:9080';
const TEST_ENVIRONMENT_SCRIPT_URL = 'http://localhost:9080/testEnvironment.js';

export default class TaskUi {
  constructor({ elem, task }) {
    this.components = {};
    this.subElements = {};

    this.elem = elem;
    this.task = task;

    this.onResizePanel = this.onResizePanel.bind(this);
    this.render();

    this.getSubElements();
    this.initializeComponents();
    this.addEventListeners();
  }

  // async *run(args) {
  //   const { previewIframe } = this.components.preview.subElements;
  //   const { port1, port2 } = new MessageChannel();
  //
  //   console.error('previewIframe', previewIframe);
  //
  //   // .querySelector('#previewWorkerManagerFrame')
  //   previewIframe.contentWindow.postMessage({
  //       command: 'run',
  //       type: this.task.type,
  //       ...args
  //     },
  //     '*',
  //     [port2]
  //   );
  //
  //   while(true) {
  //     let resultEvent = await new Promise((resolve) => {
  //       port1.onmessage = (event) => {
  //         resolve(event.data);
  //       };
  //     });
  //
  //     yield resultEvent;
  //   }
  // }

  render () {
    const elem = document.createElement('div');

    elem.innerHTML = template();

    this.elem.append(elem.firstElementChild);
  }

  getSubElements () {
    const elements = this.elem.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  initializeComponents () {
    const { editor, output, asidePanel } = this.subElements;

    this.components.editor = new Editor({
      elem: editor,
      sandbox: this.task.source
    });

    this.components.output = new Output();

    output.append(this.components.output.elem);

    this.components.preview = new Preview({
      previewWorkerUrl: PREVIEW_WORKER_URL
    });

    this.components.asidePanel = new AsidePanel({
      preview: this.components.preview.elem,
      tests: new Tests().elem,
    }, { activeTab: 'preview' });

    asidePanel.append(this.components.asidePanel.elem);
  }

  onResizePanel ({ clientX }) {
    const { main, content, resizer, asidePanel } = this.subElements;
    const firstWidth = content.offsetWidth;
    const totalPanelsWidth = main.offsetWidth;
    const MIN_PERCENT = 0;
    const MAX_PERCENT = 100;
    const { left } = resizer.getBoundingClientRect();
    const shiftX = clientX - left;

    const onPointerMove = event => {
      const delta = event.clientX - clientX + shiftX;
      const leftWidth = Math.round((firstWidth + delta) / totalPanelsWidth * MAX_PERCENT);
      const rightWidth = MAX_PERCENT - leftWidth;

      if (leftWidth >= MIN_PERCENT && leftWidth <= MAX_PERCENT) {
        content.style.width = `${leftWidth}%`;
      }

      if (rightWidth >= MIN_PERCENT && rightWidth <= MAX_PERCENT) {
        asidePanel.style.width = `${rightWidth}%`;
      }

      this.components.editor.layout();
    };

    const onPointerUp = () => {
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    }

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  }

  sendMessage (data, command = 'run') {
    const { previewIframe } = this.components.preview.subElements;
    const { type } = this.task;

    previewIframe.contentWindow.postMessage({
      type,
      ...data,
      command
    },
      '*'
    );
  }

  receiveMessage (event) {
    const { type } = event;
    console.error('Message was received', event, type);

    if (type === 'log') {
      // this.components.output.log(resultEvent.args);
      console.error('log');
    }
    if (type === 'error') {
      // this.components.log(resultEvent.error.stack);
      console.error('error');
    }
    if (type === 'result') {
      // this.components.tests.showResult(resultEvent.result);
      console.error('result');
    }
  }

  addEventListeners () {
    const { resizer } = this.subElements;
    const { previewIframe } = this.components.preview.subElements;

    resizer.addEventListener('pointerdown', this.onResizePanel);

    previewIframe.addEventListener('load', () => {
      this.preview();
    }, { once: true });

    this.components.editor.elem.addEventListener('onDidChangeContent', debounce(() => {
      this.preview();
    }), 100);

    document.addEventListener('message', this.receiveMessage);

    const asidePanelElem = this.components.asidePanel.elem;
    const toggleBtn = asidePanelElem.querySelector('[data-element="toggleBtn"]');

    toggleBtn.addEventListener('click', event => {
      const tabs = asidePanelElem.querySelector(".tabs");
      const aside = event.target.closest(".tasks-layout__aside");

      // NOTE: if aside panel was resized - set default value to "width" property
      aside.style.width = '';
      tabs.classList.toggle("tabs_rotate");
      aside.classList.toggle("tasks-layout__aside_open")

      this.components.editor.layout();
    });
  }

  runTests () {
    // TODO: move logic, connected with tests
    // let sandbox = this.components.editor.getSandbox();
    //   let testsItem = sandbox.find(item => item.model.uri.path == '/test.js');
    //
    //   code += '\n\n;// Tests are under this line\n\n' +
    //     testsItem.model.getValue() +
    //     `\njasmine.getEnv().execute();` +
    //     // Вынести ниже if
    //     `\n//# sourceURL=preview:///index.js`; // exceptionFormatter.stack uses this

  }

  previewHTMLTask () {
    const sandboxResources = {};
    const sandbox = this.components.editor.getSandbox();
    const testEnvScripts = `<script src="${TEST_ENVIRONMENT_SCRIPT_URL}" type="module"></script>`;

    for (let sandboxItem of sandbox) {
      let code = sandboxItem.model.getValue();

      const { path } = sandboxItem.model.uri;

      if (path.endsWith('.html')) {
        code = normalizeHtml(code);
      }

      if (path === '/index.html') {
        code = code.replace(/<body.*?>/i, match => `${match}\n${testEnvScripts}`);
      }

      sandboxResources[path] = code;
    }

    this.sendMessage({
      sandbox: sandboxResources
    });

    console.error('sandboxResources', sandboxResources);
  }

  previewJsTask () {
    const sandbox = this.components.editor.getSandbox();

    const sandboxItem = sandbox.find(item => item.model.uri.path === '/index.js');
    const parseError = sandboxItem.esReport.find(error => error.fatal);

    if (parseError) {
      // TODO: Maybe this logic should be inside "output" component
      this.components.output.log(`${parseError.message} at line ${parseError.line} column ${parseError.column}`);
      return;
    }

    // NOTE: exceptionFormatter.stack uses this
    const sourceMap = `\n//# sourceURL=preview:///index.js`;
    const code = sandboxItem.model.getValue() + sourceMap;

    this.sendMessage({
      code
    })
  }

  preview () {
    const { type } = this.task;

    if (type === 'js') {
      this.previewJsTask()
    }

    if (type === 'html') {
      this.previewHTMLTask()
    }
  }

  // async previewOld({withTests = false} = {}) {
  //   const sandbox = this.components.editor.getSandbox();
  //
  //   let resultEventsGenerator;
  //
  //   this.components.output.clear();
  //
  //   if (this.task.type === 'js') {
  //     const sandboxItem = sandbox.find(item => item.model.uri.path === '/index.js');
  //     const parseError = sandboxItem.esReport.find(err => err.fatal);
  //
  //
  //     if (parseError) {
  //       // TODO: Maybe this logic should be inside "output" component
  //       this.components.output.log(`${parseError.message} at line ${parseError.line} column ${parseError.column}`);
  //       return;
  //     }
  //
  //     let code = sandboxItem.model.getValue();
  //
  //     if (withTests) {
  //       let testsItem = sandbox.find(item => item.model.uri.path == '/test.js');
  //
  //       code += '\n\n;// Tests are under this line\n\n' +
  //         testsItem.model.getValue() +
  //         `\njasmine.getEnv().execute();` +
  //         // Вынести ниже if
  //         `\n//# sourceURL=preview:///index.js`; // exceptionFormatter.stack uses this
  //     }
  //
  //     code += `\n//# sourceURL=preview:///index.js`; // exceptionFormatter.stack uses this
  //
  //     resultEventsGenerator = this.run({
  //       code
  //     });
  //   } else if (this.task.type === 'html') {
  //     let runSandbox = {};
  //     let scripts = `<script src="${TEST_ENVIRONMENT_SCRIPT_URL}" type="module"></script>`;
  //
  //     if (withTests) {
  //       scripts += `\n<script src="/test.js"></script>`;
  //     }
  //
  //     for (let sandboxItem of sandbox) {
  //       let code = sandboxItem.model.getValue();
  //
  //       if (sandboxItem.model.uri.path.endsWith('.html')) {
  //         code = normalizeHtml(code);
  //       }
  //
  //       if (sandboxItem.model.uri.path === '/index.html') {
  //         code = code.replace(/<body.*?>/i, match => `${match}\n${scripts}`);
  //       }
  //
  //       runSandbox[sandboxItem.model.uri.path] = code;
  //     }
  //
  //     resultEventsGenerator = this.run({
  //       sandbox: runSandbox
  //     });
  //   }
  //
  //   for await (let resultEvent of resultEventsGenerator) {
  //     console.log("EVENT", resultEvent);
  //
  //     if (resultEvent.type == 'log') {
  //       this.components.output.log(resultEvent.args);
  //     }
  //     if (resultEvent.type == 'error') {
  //       this.components.log(resultEvent.error.stack);
  //     }
  //     if (resultEvent.type == 'result') {
  //       this.components.tests.showResult(resultEvent.result);
  //     }
  //   }
  // }
}

const root = document.body.querySelector('.taskui');

new TaskUi({
  elem: root,
  task: TASK
});


// if shipping only a subset of the features & languages is desired
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {Linter} from 'eslint/lib/linter/linter';
import eslintConfig from './eslint-config.js';
import debounce from 'lodash.debounce';

export default class Editor {
  constructor({ sandbox, elem }) {
    this.elem = elem;

    this.monacoEditor = monaco.editor.create(this.elem, {
      minimap: {enabled: false}
    });

    this.linter = new Linter();
    this.setContent(sandbox);

    this.layout = debounce(() => {
      this.monacoEditor.layout();
    }, 500);

    this.layout();
  }

  createModel(uri, content) {
    let model = monaco.editor.createModel(content, null, uri);

    model.onDidChangeContent(
      debounce(event => this.onDidChangeContent(model, event), 20)
    );

    return model;
  }

  validate(model) {
    let content = model.getValue();

    // for files up to 500 lines the speed is <10ms, no need for worker
    // todo: eslint-html-plugin doesn't work in the browser, so no validation in HTML
    let esReport = this.linter.verify(content, eslintConfig, model.uri.path);

    // console.log(esReport);

    const markers = esReport.map(err => ({
      startLineNumber: err.line,
      endLineNumber: err.line,
      startColumn: err.column,
      endColumn: err.column,
      message: `${err.message} (${err.ruleId})`,
      // severity mapping ESLint -> Monaco
      // 1 (warn) -> 4, 2 (error) -> 8
      severity: err.severity == 1 ? 4 : 8,
      source: 'ESLint',
    }));

    monaco.editor.setModelMarkers(model, 'eslint', markers);

    let sandboxItem = this.sandbox.find(item => item.model == model);
    sandboxItem.esReport = esReport;
    console.log("ERRORS", esReport)
  }


  hasErrors() {
    return this.sandbox.some(item => item.hasErrors);
  }

  onDidChangeContent(model, event) {
    this.validate(model);
    this.elem.dispatchEvent(new CustomEvent('onDidChangeContent'));
  }

  setContent(sandbox) {
    this.sandbox = [];

    for(let path in sandbox) {
      let uri = new monaco.Uri().with({ path });
      let model = this.createModel(uri, sandbox[path]);
      this.sandbox.push({
        model,
        viewState: null
      })
    }

    let firstModel = this.sandbox[0].model;
    this.monacoEditor.setModel(firstModel);

    // console.error('firstModel', firstModel);
    this.validate(firstModel);
  }

  getSandbox() {
    return this.sandbox;
    /*.map(({model}) => {
      return {
        path: model.uri.path,
        content: model.getValue()
      }
    })*/
  }
}

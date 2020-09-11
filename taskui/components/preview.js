import template from '../templates/_blocks/preview/index.pug';

export default class Preview {
  constructor ({ previewWorkerUrl = ''} = {}) {
    this.subElements = {};

    this.previewWorkerUrl = previewWorkerUrl;
    this.render();
    this.getSubElements();
  }

  getSubElements () {
    const elements = this.elem.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  render () {
    const elem = document.createElement('div');

    elem.innerHTML = template({
      previewWorkerUrl: this.previewWorkerUrl
    });

    this.elem = elem.firstElementChild;
  }
}

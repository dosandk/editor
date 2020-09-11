import template from '../templates/_blocks/output/index.pug';
// import clientRender from 'client/clientRender';

export default class Output {
  constructor () {
    this.subElements = {};

    this.render();
    this.getSubElements();
    this.addEventListeners();
  }

  render () {
    const elem = document.createElement('div');

    elem.innerHTML = template();

    this.elem = elem.firstElementChild;
  }

  addEventListeners() {
    const { toggleBtn } = this.subElements;

    toggleBtn.addEventListener('click', event => {
      console.error('click');
      const output = event.target.closest(".tasks-layout__console");

      output.classList.toggle('tasks-layout__console_open');
    });
  }

  getSubElements () {
    const elements = this.elem.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      this.subElements[subElement.dataset.element] = subElement;
    }
  }

  clear () {
    // console.error('Output: clear');
  }

  log () {
    // console.error('Output: log');
  }
}

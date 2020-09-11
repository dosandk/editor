import TASK from './__mocks__/task.js';
import template from './templates/index.pug';
// import styles from './templates/_blocks/00-index.styl';

console.error('TASK', TASK);
// console.error('styles', styles);

export default class Task {
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
    // const { toggleBtn } = this.subElements;
    //
    // toggleBtn.addEventListener('click', event => {
    //   console.error('click');
    //   const output = event.target.closest(".tasks-layout__console");
    //
    //   output.classList.toggle('tasks-layout__console_open');
    // });
  }

  getSubElements () {
    // const elements = this.elem.querySelectorAll('[data-element]');
    //
    // for (const subElement of elements) {
    //   this.subElements[subElement.dataset.element] = subElement;
    // }
  }

  clear () {
    console.error('Output: clear');
  }

  log () {
    console.error('Output: log');
  }
}

const root = document.getElementById('root');
const task = new Task();

root.append(task.elem);

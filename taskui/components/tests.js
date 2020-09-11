import template from '../templates/_blocks/tests/index.pug';
// import clientRender from 'client/clientRender';

export default class Tests {
  constructor () {
    this.subElements = {};

    this.render();
    this.addEventListeners();
  }

  render () {
    const elem = document.createElement('div');

    elem.innerHTML = template();

    this.elem = elem.firstElementChild;
  }

  addEventListeners () {
    this.elem.addEventListener("click", event => {
      const test = event.target.closest(".test");

      if (test) {
        test.classList.toggle("test_opened");
      }
    });
  }

  // TODO: This is method from prev realization. Rethink it
  showResult (result) {
    this.elem.innerHTML = '';

    for(let spec of result) {
      let el = document.createElement('div');

      el.innerHTML = `${spec.status} ${spec.fullName}`;

      for (let failedExpectation of spec.failedExpectations) {
        el.innerHTML += `<div>${failedExpectation.message}</div>`;
        el.innerHTML += `<div>${failedExpectation.stack}</div>`;
      }

      el.innerHTML += `<div>${spec.body}</div>`;

      this.elem.append(el);
    }
    console.log(result);
  }
}

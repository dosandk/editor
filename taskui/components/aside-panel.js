import template from '../templates/_blocks/aside-panel/index.pug';
// import clientRender from 'client/clientRender';

export default class AsidePanel {
  constructor (
    tabs = {},
    { activeTab = '' } = {}
  ) {
    this.tabs = tabs;
    this.activeTab = activeTab;
    this.subElements = {};

    this.render();
    this.getSubElements();
    this.addEventListeners();
    this.renderComponents();
  }

  getSubElements () {
    const elements = this.elem.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      this.subElements[name] = subElement;
    }
  }

  renderComponents () {
    const { tabsContent } = this.subElements;
    const panels = tabsContent.querySelectorAll('[data-id]');

    for (const panel of panels) {
      const content = this.tabs[panel.dataset.id];

      panel.append(content);
    }
  }

  addEventListeners () {
    const { tabsNavigation } = this.subElements;

    tabsNavigation.addEventListener('click', event => {
      this.changePanel(event);
    });
  }

  changePanel (event) {
    const { tabsNavigation, tabsContent } = this.subElements;
    const currentTab = event.target.closest('.tabs__tab');

    if (currentTab) {
      const tabs = tabsNavigation.querySelectorAll('.tabs__tab');

      for (const tab of tabs) {
        tab.classList.remove('active');
      }

      currentTab.classList.add('active');

      const panelName = currentTab.dataset.panel;
      const currentTabPanel = tabsContent.querySelector(`[data-id="${panelName}"]`);
      const tabPanels = tabsContent.querySelectorAll(".tab-content");

      for (const panel of tabPanels) {
        panel.classList.remove('active');
      }

      currentTabPanel.classList.add('active');
    }
  }

  render () {
    const elem = document.createElement('div');
    const tabs = Object.keys(this.tabs);

    elem.innerHTML = template({
      tabs,
      activeTab: this.activeTab
    });

    this.elem = elem.firstElementChild;
  }
}

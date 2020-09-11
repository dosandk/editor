import ServiceWorkerManager from '../serviceWorkerManager.js';

let serviceWorkerManager = ServiceWorkerManager.instance();

export default class PreviewHtmlRunner {
  constructor() {
    this.isDetached = false;
    this.createIframe();
    // window.addEventListener('message', this.onWindowMessage.bind(this));
  }

  createIframe () {
    // this.previewFrame = document.getElementById('preview-frame');

    if (!this.previewFrame) {
      this.previewFrame = document.createElement('iframe');
      this.previewFrame.id = 'preview-frame';
      this.previewFrame.style.cssText = 'width:100%;height:100%;border:0;margin:0;position:fixed;left:0;top:0';

      document.body.append(this.previewFrame);
    }
  }

  // setDetached(isDetached) {
  //   if (this.isDetached != isDetached) {
  //     if (isDetached = true) {
  //       // frame to window
  //       this.previewWindow = window.open(this.previewFrame.getAttribute('src'));
  //       this.isDetached = true;
  //     } else {
  //       this.previewWindow.close();
  //       this.previewWindow = null;
  //       this.isDetached = false;
  //     }
  //   }
  // }

  // NOTE: does we really need this?
  getWindow() {
    if (this.isDetached) {
      return this.previewWindow;
    } else {
      return this.previewFrame.contentWindow;
    }
  }

  // async onWindowMessage(event) {
  //   if (event.source === this.getWindow()) {
  //     await this.saveSandboxResourcesToCache(event.data);
  //     this.reloadIframe();
  //   } else {
  //     /* ignore message from parent or from an old, replaced (maybe?) window */
  //   }
  // }

  reloadIframe () {
    // const targetWindow = this.getWindow();
    const { contentWindow } = this.previewFrame;
    // targetWindow.location = window.PREVIEW_URL_BASE + '/index.html';
    contentWindow.location = '/index.html';
  }

  async saveSandboxResourcesToCache (resources) {
    return await serviceWorkerManager.saveSandboxResourcesToCache(resources);
  }

  async run (resources) {
    await this.saveSandboxResourcesToCache(resources);
    this.reloadIframe();
  }

  // onWindowMessage(event) {
  //   if (event.source == this.getWindow()) {
  //     this.onPreviewMessage(event.data);
  //   } else {
  //     console.error('ignored');
  //     /* ignore message from parent or from an old, replaced (maybe?) window */
  //   }
  // }

  // mode = preview | test
  // async *run({sandbox}) {
  //   await serviceWorkerManager.saveSandboxToCache(sandbox);
  //
  //   let targetWindow = this.getWindow();
  //
  //   console.error('sandbox', sandbox);
  //
  //   // targetWindow.location = window.PREVIEW_URL_BASE + '/index.html';
  //   targetWindow.location = '/index.html';
  //
  //   while(true) {
  //     let result = await new Promise(resolve => {
  //       this.onPreviewMessage = resolve;
  //     });
  //
  //     yield result;
  //   }
  //
  // }
}


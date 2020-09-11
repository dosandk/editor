const ignoredProperties = new Set([
  'name',
  'message',
  'stack',
  'fileName',
  'sourceURL',
  'line',
  'lineNumber',
  'column',
  'description',
  'jasmineMessage'
]);

export default class ExceptionFormatter {

  constructor() {
    // jasmine borrows these methods
    this.message = this.message.bind(this);
    this.stack = this.stack.bind(this);
  }

  format(error) {
    return {
      message: this.message(error),
      stack: this.stack(error)
    }
  }

  // used by Jasmine
  message(error) {
    let message = '';

    if (error.jasmineMessage) {
      message += error.jasmineMessage;
    } else if (error.name && error.message) {
      message += error.name + ': ' + error.message;
    } else if (error.message) {
      message += error.message;
    } else {
      message += error.toString() + ' thrown';
    }

    if (error.fileName || error.sourceURL) {
      message += ' in ' + (error.fileName || error.sourceURL);
    }

    if (error.line || error.lineNumber) {
      message += ' (line ' + (error.line || error.lineNumber) + ')';
    }

    return message;
  };

  // used by Jasmine
  stack(error) {
    if (!error || !error.stack) {
      return null;
    }

    let stackTrace = new jasmine.StackTrace(error);

    let lines = [];

    // take lines until we're outside of the worker
    for(let i = 0; i < stackTrace.frames.length; i++) {
      let frame = stackTrace.frames[i];
      let nextFrame = stackTrace.frames[i + 1];
      if (nextFrame && nextFrame.file && !nextFrame.file.startsWith('preview://')) {
        break;
      } else {
        lines.push(frame.raw);
      }
    }

    let result = '';

    if (stackTrace.message) {
      lines.unshift(stackTrace.message);
    }

    result += this.formatProperties(error);
    result += lines.join('\n');

    return result;
  };

  formatProperties(error) {
    if (!(error instanceof Object)) {
      return;
    }

    let result = {};
    let empty = true;

    for (let prop in error) {
      if (ignoredProperties.has(prop)) {
        continue;
      }
      result[prop] = error[prop];
      empty = false;
    }

    if (!empty) {
      return 'error properties: ' + jasmine.pp(result) + '\n';
    }

    return '';
  }
}

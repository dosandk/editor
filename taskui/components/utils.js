export const normalizeHtml = code => {
  if (code.match(/^\s*<!doctype/i)) return code;

  let result = '';

  if (!code.match(/<body/i)) {
    result = `<body>\n${code}\n</body>`;
  }

  return `<!doctype html>\n${result}`;
}

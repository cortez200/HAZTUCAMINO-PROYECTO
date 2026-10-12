/* Ejecutor de código en el navegador, aislado en un Web Worker.
   - NO se ejecuta código en el servidor.
   - El código del estudiante corre dentro de un Worker (sin acceso al DOM),
     con un límite de tiempo: si se cuelga, el Worker se termina.
   - Las pruebas se definen como datos (args -> expect); no se usa `eval`. */

const WORKER_SRC = `
function casiIgual(a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 0.005;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((x, i) => casiIgual(x, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    return ka.every((k) => casiIgual(a[k], b[k]));
  }
  return a === b;
}

self.onmessage = function (e) {
  var data = e.data || {};
  var code = String(data.code || '');
  var fnName = data.fnName;
  var tests = data.tests || [];
  var results = [];
  var error = null;
  var fn = null;

  try {
    var factory = new Function(
      '"use strict";\\n' + code + '\\n; return (typeof ' + fnName + " === 'function') ? " + fnName + ' : null;'
    );
    fn = factory();
    if (!fn) {
      error = 'No encontramos una función llamada "' + fnName + '". Revisa que el nombre sea exacto.';
    }
  } catch (err) {
    error = String((err && err.message) || err);
  }

  if (fn) {
    for (var i = 0; i < tests.length; i += 1) {
      var t = tests[i];
      try {
        var got = fn.apply(null, Array.isArray(t.args) ? t.args : []);
        var pass = casiIgual(got, t.expect);
        results.push({ id: t.id, label: t.label, pass: pass, got: formatear(got), expect: formatear(t.expect) });
      } catch (err) {
        results.push({ id: t.id, label: t.label, pass: false, error: String((err && err.message) || err) });
      }
    }
  }

  self.postMessage({ results: results, error: error });
};

function formatear(v) {
  try {
    if (typeof v === 'number') return (Math.round(v * 1000) / 1000);
    return JSON.parse(JSON.stringify(v === undefined ? null : v));
  } catch (e) {
    return String(v);
  }
}
`;

let workerUrl = null;
function getWorkerUrl() {
  if (!workerUrl) workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'application/javascript' }));
  return workerUrl;
}

/**
 * Ejecuta el código del estudiante contra las pruebas.
 * @returns {Promise<{results: Array, error: string|null, testError?: boolean}>}
 */
export function runCode({ code, fnName, tests, timeoutMs = 2500 }) {
  return new Promise((resolve) => {
    let worker;
    try {
      worker = new Worker(getWorkerUrl());
    } catch (err) {
      resolve({ results: [], error: 'Tu navegador no pudo iniciar el entorno de pruebas.', testError: true });
      return;
    }
    let settled = false;
    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve(payload);
    };
    const timer = setTimeout(
      () => finish({ results: [], error: 'El código tardó demasiado en ejecutarse. Revisa si hay un bucle infinito.', testError: true }),
      timeoutMs
    );
    worker.onmessage = (e) => finish(e.data || { results: [], error: null });
    worker.onerror = (e) => finish({ results: [], error: String(e.message || 'Error al ejecutar el código.'), testError: true });
    worker.postMessage({ code, fnName, tests });
  });
}

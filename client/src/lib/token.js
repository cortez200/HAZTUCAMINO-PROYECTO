let _token = null;
export function getToken(){
  try { return _token || localStorage.getItem('htc_token'); }
  catch(e){ return _token || null; }
}
export function setToken(t){
  _token = t;
  try {
    if (t) { localStorage.setItem('htc_token', t); }
    else { localStorage.removeItem('htc_token'); }
  } catch(e){}
}

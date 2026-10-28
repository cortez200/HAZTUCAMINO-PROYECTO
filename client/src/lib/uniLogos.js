// Logos de universidades auto-hospedados en client/public/logos
// Fuente: Wikimedia Commons / Wikipedia y sitios oficiales.
// Si una universidad no esta aqui, UniLogo cae al favicon y luego a las iniciales.
// Las rutas se resuelven contra BASE_URL para funcionar en raíz y en subcarpetas
// (por ejemplo GitHub Pages /HAZTUCAMINO-PROYECTO/).
const B = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
const logo = (file) => B + 'logos/' + file;

export const UNI_LOGOS = {
  "pucp": logo("pucp.png"),
  "uac": logo("uac.svg"),
  "ucontinental": logo("ucontinental.png"),
  "ucsm": logo("ucsm.png"),
  "ucsp": logo("ucsp.png"),
  "ucsur": logo("ucsur.png"),
  "udep": logo("udep.png"),
  "ulima": logo("ulima.png"),
  "unalm": logo("unalm.png"),
  "unap": logo("unap.png"),
  "unc": logo("unc.png"),
  "undac": logo("undac.png"),
  "une": logo("une.png"),
  "unheval": logo("unheval.png"),
  "uni": logo("uni.jpg"),
  "unjbg": logo("unjbg.png"),
  "unmsm": logo("unmsm.png"),
  "unp": logo("unp.png"),
  "unsa": logo("unsa.png"),
  "unsaac": logo("unsaac.png"),
  "unsch": logo("unsch.png"),
  "unt": logo("unt.png"),
  "unu": logo("unu.png"),
  "up": logo("up.png"),
  "upao": logo("upao.jpg"),
  "upc": logo("upc.png"),
  "upch": logo("upch.svg"),
  "upn": logo("upn.png"),
  "urp": logo("urp.png"),
  "usat": logo("usat.png"),
  "usil": logo("usil.gif"),
  "usmp": logo("usmp.png"),
  "utec": logo("utec.jpg"),
  "utp": logo("utp.png"),
};

export default UNI_LOGOS;

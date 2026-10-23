const fs=require("fs"),cp=require("child_process");
global.window={};
eval(fs.readFileSync("/tmp/claude-0/-home-claude/b26f37fc-ac9b-55b3-8812-47b1d702782b/scratchpad/lf.js","utf8"));
const LEG=window.MelungaLegacyFree.pairs;
const html=cp.execSync("git show origin/main:melunga_deploy/app.html",{maxBuffer:1e9}).toString();
let i=html.indexOf("var DECKS = ")+12,j=html.indexOf("\n",i);
const DECKS=JSON.parse(html.slice(i,j).replace(/;$/,""));
console.log("Cout du filtrage gratuit, tel qu'il est implemente en production\n");
console.log("langue   cartes   temps du filtre   comparaisons d'identite");
for(const [pair,lang] of Object.entries({"fr-en":"en","fr-zh":"zh","fr-ja":"ja"})){
  const deck=DECKS[lang], legacy=LEG[pair];
  let scans=0;
  function isLegacy(d){ const k=deck.indexOf(d); scans+=k<0?deck.length:k+1; return k>=0 && legacy.indexOf(k)>=0; }
  function isFree(d){ return d.lv===1 ? true : isLegacy(d); }
  const t0=process.hrtime.bigint();
  deck.filter(isFree);
  const t1=process.hrtime.bigint();
  const ms=Number(t1-t0)/1e6;
  console.log(lang.padEnd(8)+String(deck.length).padStart(7)+(ms.toFixed(0)+" ms").padStart(18)+String(scans.toLocaleString("fr-FR")).padStart(24));
}
console.log("\nUn telephone est environ 3 a 6 fois plus lent que cette machine.");

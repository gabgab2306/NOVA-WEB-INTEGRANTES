const SUPABASE_URL="https://hogbjrbaeedlyglegjle.supabase.co";
const SUPABASE_KEY="sb_publishable_NWG23rPztabdaFhEyNtN5w_rrCeMTC5";
const db=supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,storage:window.localStorage}});
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const firstName=v=>String(v||"").trim().split(/\s+/)[0]||"Integrante";
const initials=v=>String(v||"NOVA").trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();
const houseMeta={
 Pegaso:{symbol:"✦",color:"#e8dfc7"},
 Cronos:{symbol:"◷",color:"#55b7ff"},
 Fénix:{symbol:"✧",color:"#d8ad4d"},
 Argos:{symbol:"◉",color:"#65d49a"},
 Olimpo:{symbol:"ϟ",color:"#e56d78"}
};
let member=null;

async function getMember(){
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user) return null;
 const {data,error:e}=await db.from("integrantes").select("*").eq("user_id",user.id).maybeSingle();
 if(e||!data||data.activo===false) return null;
 return data;
}
async function requireMember(){
 member=await getMember();
 if(!member){await db.auth.signOut({scope:"local"});window.location.replace("./index.html");return false}
 return true;
}
function renderShell(active,title,kicker){
 document.body.innerHTML='<div class="app-shell">'+
 '<header class="app-header">'+
 '<a class="nova-wordmark" href="./home.html" aria-label="NOVA Inicio"><span>N</span><b>OVA</b></a>'+
 '<div class="app-title"><small>'+esc(kicker)+'</small><strong>'+esc(title)+'</strong></div>'+
 '<div class="account"><div class="avatar">'+esc(initials(member.nombre_completo))+'</div><div class="account-copy"><strong>'+esc(member.nombre_completo)+'</strong><small>@'+esc(member.username||"member")+'</small></div><button id="logout" type="button" aria-label="Cerrar sesión">↗</button></div>'+
 '</header>'+
 '<main id="page" class="app-page"></main>'+
 '<nav class="bottom-nav" aria-label="Navegación">'+
 navItem("home","Inicio","⌂",active)+navItem("profile","Perfil","○",active)+navItem("areas","Áreas","✦",active)+navItem("activities","Actividades","◫",active)+navItem("community","Logros","◇",active)+
 '</nav></div>';
 $("#logout").onclick=async()=>{await db.auth.signOut({scope:"local"});window.location.replace("./index.html")};
}
function navItem(page,label,icon,active){return '<a href="./'+page+'.html" class="'+(page===active?"active":"")+'"><span>'+icon+'</span><small>'+label+'</small></a>'}
async function boot(active,title,kicker,render){if(await requireMember()){renderShell(active,title,kicker);try{await render()}catch(e){console.error(e);$("#page").innerHTML='<section class="error-panel"><p class="eyebrow">NOVA · AVISO</p><h1>No pudimos cargar esta sección.</h1><p>Tu acceso sigue protegido. Recarga la página o vuelve al Inicio.</p><a class="button secondary" href="./home.html">Volver al Inicio</a></section>'}}}
function empty(text){return '<div class="empty"><span>✦</span><p>'+esc(text)+'</p></div>'}
function dateText(v){if(!v)return "Fecha por anunciar";const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"})}

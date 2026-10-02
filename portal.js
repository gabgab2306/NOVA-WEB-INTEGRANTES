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
let member=null, socialProfile=null;
function portalStatus(message){const el=document.querySelector("#portal-status");if(el) el.innerHTML="<span>●</span>"+esc(message);console.info("[NOVA]",message)}
function portalTimeout(promise,ms,label){return Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label+" tardó demasiado")),ms))])}

async function getMember(){
 try{
  portalStatus("Verificando tu sesión…");
  const {data:{user},error}=await portalTimeout(db.auth.getUser(),8000,"La sesión");
  if(error||!user) return null;
  portalStatus("Buscando tu perfil de integrante…");
  const {data,error:e}=await portalTimeout(db.from("integrantes").select("*").eq("user_id",user.id).maybeSingle(),8000,"El perfil");
  if(e||!data||data.activo===false) return null;
  portalStatus("Perfil encontrado. Preparando tu espacio…");
  return data;
 }catch(e){console.error("NOVA getMember:",e);portalStatus("No pudimos verificar tu cuenta.");return null}
}
async function requireMember(){
 member=await getMember();
 if(!member){portalStatus("No encontramos tu registro de integrante.");await db.auth.signOut({scope:"local"});window.location.replace("./index.html");return false}
 // El perfil social es complementario. Nunca debe impedir que cargue el portal principal.
 try{
  const profileSeed={integrante_id:member.id,user_id:member.user_id,nombre_visible:member.nombre_completo,username:member.username||"nova"};
  const {data:profileData,error:profileError}=await db.from("integrante_perfiles").upsert(profileSeed,{onConflict:"integrante_id",ignoreDuplicates:true}).select("*").maybeSingle();
  if(profileError) console.warn("Perfil social omitido:",profileError.message);
  socialProfile=profileData||null;
 }catch(e){console.warn("Perfil social omitido:",e)}
 return true;
}
function renderShell(active,title,kicker){
 document.body.innerHTML='<div class="app-shell">'+
 '<header class="app-header">'+
 '<a class="nova-wordmark" href="./home.html" aria-label="NOVA Inicio"><span>N</span><b>OVA</b></a>'+
 '<div class="app-title"><small>'+esc(kicker)+'</small><strong>'+esc(title)+'</strong></div>'+
 '<div class="account"><div class="avatar">'+(socialProfile?.avatar_url?'<img src="'+esc(socialProfile.avatar_url)+'" alt="">':esc(initials(member.nombre_completo)))+'</div><div class="account-copy"><strong>'+esc(member.nombre_completo)+'</strong><small>@'+esc(member.username||"member")+'</small></div><button id="logout" type="button" aria-label="Cerrar sesión">↗</button></div>'+
 '</header>'+
 '<main id="page" class="app-page page-'+active+'"><section class="portal-loading"><div class="portal-loading-mark">N</div><p class="eyebrow">NOVA · PORTAL</p><h1>Cargando tu espacio…</h1><p id="portal-status"><span>●</span>Preparando tu información</p></section></main>'+
 '<nav class="bottom-nav" aria-label="Navegación">'+
 navItem("home","Inicio","⌂",active)+navItem("profile","Perfil","○",active)+navItem("areas","Áreas","✦",active)+navItem("activities","Agenda","◫",active)+navItem("community","Foro","◎",active)+
 '</nav></div>';
 $("#logout").onclick=async()=>{await db.auth.signOut({scope:"local"});window.location.replace("./index.html")};
}
function navItem(page,label,icon,active){return '<a href="./'+page+'.html" class="'+(page===active?"active":"")+'"><span>'+icon+'</span><small>'+label+'</small></a>'}
async function boot(active,title,kicker,render){
 try{
  if(await requireMember()){renderShell(active,title,kicker);portalStatus("Cargando tu página…");await portalTimeout(render(),12000,"La página");portalStatus("Portal listo.")}
 }catch(e){
  console.error("NOVA portal:",e);
  const page=$("#page");
  if(page) page.innerHTML='<section class="error-panel"><p class="eyebrow">NOVA · AVISO</p><h1>No pudimos cargar esta sección.</h1><p>El portal sí abrió, pero una consulta o función se quedó esperando. Puedes reintentar.</p><small class="diagnostic-detail">'+esc(e?.message||"Error desconocido")+'</small><button class="button secondary" onclick="location.reload()">Reintentar</button></section>';
 }
}
function empty(text){return '<div class="empty"><span>✦</span><p>'+esc(text)+'</p></div>'}
function dateText(v){if(!v)return "Fecha por anunciar";const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleDateString("es-DO",{day:"2-digit",month:"short",year:"numeric"})}

const bg=document.getElementById("background-effects");
if(bg)for(let i=0;i<35;i++){const p=document.createElement("div");p.className="particle";p.style.left=Math.random()*100+"%";p.style.animationDuration=(Math.random()*10+8)+"s";p.style.animationDelay=Math.random()*8+"s";p.style.width=p.style.height=(Math.random()*5+2)+"px";bg.appendChild(p);}
const area=document.getElementById("qrcode");
// Aviso de login separado da área do QR Code.
let intervaloBloqueioLogin = null;
let fimBloqueioLogin = 0;
function avisoLogin(texto) {
  const aviso = document.getElementById("aviso-login");
  if (!aviso) return;
  aviso.textContent = texto;
  aviso.style.display = texto ? "block" : "none";
}
function mostrarBloqueioLogin(segundos) {
  clearInterval(intervaloBloqueioLogin);
  fimBloqueioLogin = Date.now() + Math.max(1, segundos) * 1000;
  const botao = document.querySelector('#formstudent button[type="submit"]');
  function atualizar() {
    const restante = Math.max(0, Math.ceil((fimBloqueioLogin - Date.now()) / 1000));
    if (!restante) {
      clearInterval(intervaloBloqueioLogin);
      intervaloBloqueioLogin = null;
      fimBloqueioLogin = 0;
      if (botao) botao.disabled = false;
      avisoLogin("");
      return;
    }
    if (botao) botao.disabled = true;
    const minutos = Math.floor(restante / 60);
    const segundosRestantes = String(restante % 60).padStart(2, "0");
    avisoLogin(`🔒 Muitas tentativas incorretas. Tente novamente em ${minutos}:${segundosRestantes}.`);
  }
  atualizar();
  intervaloBloqueioLogin = setInterval(atualizar, 1000);
}
let qrAtual=null,consultaAtiva=false;
let geracaoSessaoAluno=0;
function alternarEstadoLogin(logado){
  const form=document.getElementById("formstudent");
  const botaoSair=document.getElementById("btn-logout-aluno");
  const ra=document.getElementById("ra");
  const senha=document.getElementById("password");
  if(form)form.querySelectorAll('input').forEach(el=>el.disabled=logado);
  const botaoEntrar=form?.querySelector('button[type="submit"]');
  if(botaoEntrar)botaoEntrar.style.display=logado?'none':'';
  if(botaoSair){botaoSair.hidden=!logado;botaoSair.style.display=logado?'block':'none';}
  if(!logado){if(ra)ra.value='';if(senha)senha.value='';}
}
async function sairDaContaAluno(){
  // Invalida consultas pendentes antes de chamar o servidor.
  consultaAtiva=false;
  geracaoSessaoAluno++;
  const botaoSair=document.getElementById("btn-logout-aluno");
  if(botaoSair)botaoSair.disabled=true;
  try{
    const resp=await fetch('/alunos/logout',{method:'POST',credentials:'same-origin'});
    if(!resp.ok)throw new Error('Não foi possível encerrar a sessão. Tente novamente.');
    qrAtual=null;
    mensagemQr('QR Code bloqueado. Entre com RA e senha para continuar.');
    alternarEstadoLogin(false);
    avisoLogin('Você saiu da sua conta com segurança.');
  }catch(erro){
    avisoLogin(erro.message||'Falha ao sair. Tente novamente.');
  }finally{if(botaoSair)botaoSair.disabled=false;}
}
document.getElementById('btn-logout-aluno')?.addEventListener('click',sairDaContaAluno);

let qrExpiraEm=0, relogioQr=null;
function pararRelogioQr(){
  clearInterval(relogioQr);
  relogioQr=null;
  qrExpiraEm=0;
}
function atualizarRelogioQr(){
  const el=document.getElementById("qr-contador");
  if(!el)return;
  const restante=Math.max(0,Math.ceil((qrExpiraEm-Date.now())/1000));
  el.textContent=restante>0?`QR Code expira em ${restante}s`:"QR Code expirado. Aguarde um novo código da gestão.";
  if(restante===0){
    clearInterval(relogioQr);relogioQr=null;qrAtual=null;
    if(area)area.replaceChildren();
  }
}
function iniciarRelogioQr(segundos){
  pararRelogioQr();
  qrExpiraEm=Date.now()+Math.max(0,Number(segundos)||0)*1000;
  atualizarRelogioQr();
  if(qrExpiraEm>Date.now())relogioQr=setInterval(atualizarRelogioQr,250);
}
function mensagemQr(msg){
  pararRelogioQr();
  if(area)area.textContent=msg;
  const el=document.getElementById("qr-contador");
  if(el)el.textContent="";
}
function enderecoQr(token){
  // Ao acessar pelo IP local, o QR aponta automaticamente para o mesmo servidor.
  // Para login no PC via localhost, configure GEA_PUBLIC_URL no .env e a URL será fornecida pelo servidor.
  const base=window.GEA_PUBLIC_URL || location.origin;
  return base.replace(/\/$/,"")+"/presenca.html?token="+encodeURIComponent(token);
}
async function consultarQr(){
  if(!consultaAtiva)return;
  const sessaoDaConsulta=geracaoSessaoAluno;
  try{
    const resp=await fetch("/qr/meu",{cache:"no-store",credentials:"same-origin"});
    if(resp.status===401){consultaAtiva=false;geracaoSessaoAluno++;alternarEstadoLogin(false);mensagemQr("Sua sessão expirou. Faça login novamente.");return;}
    const d=await resp.json();
    if(!consultaAtiva || sessaoDaConsulta!==geracaoSessaoAluno)return;
    if(!resp.ok)throw new Error(d.mensagem||"Falha ao consultar código.");
    if(d.situacao==="registrada"){
      consultaAtiva=false;qrAtual=null;mensagemQr("Sua presença já foi registrada hoje.");return;
    }
    if(d.situacao!=="liberado"){
      qrAtual=null;mensagemQr("Login realizado. Aguardando a gestão liberar seu QR Code...");
    }else if(qrAtual!==d.token){
      if(typeof QRCode!=="function"){mensagemQr("Biblioteca de QR Code indisponível.");return;}
      qrAtual=d.token;area.replaceChildren();
      new QRCode(area,{text:enderecoQr(d.token),width:170,height:170});
      iniciarRelogioQr(d.validadeSegundos);
    }else if(!relogioQr){
      iniciarRelogioQr(d.validadeSegundos);
    }
  }catch(err){if(consultaAtiva && sessaoDaConsulta===geracaoSessaoAluno)mensagemQr(err.message||"Não foi possível consultar o código.");}
  if(consultaAtiva && sessaoDaConsulta===geracaoSessaoAluno)setTimeout(consultarQr,2500);
}
document.getElementById("formstudent")?.addEventListener("submit",async e=>{
  e.preventDefault();
  if (fimBloqueioLogin > Date.now()) return;
  const ra=document.getElementById("ra").value.trim(),senha=document.getElementById("password").value;
  const botao=document.querySelector('#formstudent button[type="submit"]');
  if (botao) botao.disabled=true;
  try{
    avisoLogin("");
    const resp=await fetch("/alunos/login",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({ra,senha})});
    const d=await resp.json();
    if(resp.status===429){
      const cabecalho=Number(resp.headers.get("Retry-After"));
      const segundos=Number.isFinite(cabecalho)&&cabecalho>0?cabecalho:900;
      mostrarBloqueioLogin(segundos);
      return;
    }
    if(!resp.ok)throw Error(d.mensagem||"Falha no login.");
    avisoLogin("");
    const pending=sessionStorage.getItem("gea_qr_pendente");
    if(pending){sessionStorage.removeItem("gea_qr_pendente");location.href="/presenca.html?token="+encodeURIComponent(pending);return;}
    geracaoSessaoAluno++;consultaAtiva=true;qrAtual=null;alternarEstadoLogin(true);mensagemQr("Aguardando liberação pela gestão...");
    consultarQr();
  }catch(err){avisoLogin(err.message||"Falha no login.");}
  finally{if(botao && fimBloqueioLogin<=Date.now())botao.disabled=false;}
});

// Reconstitui a interface quando a página é atualizada com sessão ainda válida.
(async function restaurarSessaoAluno(){
  try{
    const resp=await fetch('/qr/meu',{cache:'no-store',credentials:'same-origin'});
    if(resp.ok && !consultaAtiva){
      geracaoSessaoAluno++;
      consultaAtiva=true;
      alternarEstadoLogin(true);
      consultarQr();
    }
  }catch(_){/* A tela de login continua disponível se o servidor estiver indisponível. */}
})();

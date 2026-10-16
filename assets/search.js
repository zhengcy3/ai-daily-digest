nav('search');
const m=$('#main');const q0=(qs.get('q')||'').trim(),scope=qs.get('scope')||'all';
const TOPICS=['模型发布','Agent/开发','企业应用','研究','产品工具','其他/闲聊','非AI'];const tp=qs.get('topic')||'';
m.innerHTML=`<h1>搜索所有期</h1><form class="big-search" role="search"><label class="sr" for="sq">关键词</label><input id="sq" name="q" type="search" value="${esc(q0)}" placeholder="如 Claude、沙箱、Muse" autofocus><button class="btn btn-primary">搜索</button></form>
<div class="chips" style="margin-top:12px" role="group" aria-label="时间范围">${[['all','全部'],['7','最近 7 天'],['30','最近 30 天']].map(([k,t])=>`<button type="button" class="chip" aria-pressed="${scope===k}" data-scope="${k}">${t}</button>`).join('')}
<label class="sr" for="tp">主题</label><select id="tp" class="chip" style="padding-right:8px">${['',...TOPICS].map(t=>`<option value="${t}" ${t===tp?'selected':''}>${t||'全部主题'}</option>`).join('')}</select></div>
<div id="st" aria-live="polite"></div><div id="res"></div>`;
const goScope=k=>{const p=new URLSearchParams(location.search);p.set('q',q0);k&&k!=='all'?p.set('scope',k):p.delete('scope');tp?p.set('topic',tp):p.delete('topic');location.search=p};
document.querySelectorAll('[data-scope]').forEach(b=>b.onclick=()=>goScope(b.dataset.scope));
$('#tp').onchange=e=>{const p=new URLSearchParams(location.search);e.target.value?p.set('topic',e.target.value):p.delete('topic');location.search=p};
(async()=>{
 if(!q0){$('#st').innerHTML=`<div class="state" role="status"><div class="ico" aria-hidden="true">${ICON.search}</div><h2>输入关键词搜索全部期</h2><p>会同时搜索帖子结论、译文、原文、博主、标签和学习海绵见解。</p><div class="acts">${['Claude','Agent','沙箱','开源'].map(k=>`<a class="chip" href="?q=${k}">${k}</a>`).join('')}</div></div>`;return}
 let idx;try{idx=await loadJSON('index.json')}catch(e){$('#st').innerHTML=stateHTML({kind:'err',icon:'!',title:'搜索暂时不可用',text:'期刊列表加载失败。',acts:'<button class="btn btn-primary" onclick="location.reload()">重试</button>'});return}
 let ds=(idx||[]).map(x=>x.date).sort().reverse();
 if(scope!=='all'&&ds.length){const lim=new Date(ds[0]+'T00:00:00Z');lim.setUTCDate(lim.getUTCDate()-(+scope)+1);const L=lim.toISOString().slice(0,10);ds=ds.filter(d=>d>=L)}
 const ql=q0.toLowerCase(),has=v=>String(v||'').toLowerCase().includes(ql);let done=0,total=0,out={};
 const prog=()=>{$('#st').innerHTML=`<p class="meta" style="margin:16px 0 0">已搜索 ${done} / ${ds.length} 期 · 找到 ${total} 条</p>${done<ds.length?`<div class="progress" role="progressbar" aria-valuenow="${done}" aria-valuemax="${ds.length}"><i style="width:${done/ds.length*100}%"></i></div>`:''}`};
 const draw=()=>{const ks=Object.keys(out).sort().reverse();$('#res').innerHTML=ks.map(d=>{const {ins,posts}=out[d];return `<section class="res-group"><h2>${d} <span class="meta" style="font-weight:400">${wd(d)} · ${ins.length+posts.length} 条命中</span></h2>
  ${ins.map(x=>`<a class="card res ins-hit" href="issue.html?d=${d}#insight-${x.n}"><span class="badge">见解</span><div class="t">${hl(x.title,q0)}</div><div class="meta">${hl(snip(x.body),q0)}</div></a>`).join('')}
  ${posts.map(p=>`<a class="card res" href="issue.html?d=${d}&q=${encodeURIComponent(q0)}#post-${esc(p.id)}"><div class="t">${hl(p.conclusion||p.zh||p.text,q0)}</div><div class="meta">${esc(p.name)} · ${esc(p.topic)} · ♥ ${p.likes||0}</div></a>`).join('')}</section>`}).join('');
  if(done===ds.length&&!total)$('#res').innerHTML=stateHTML({icon:'∅',title:`没有找到「${esc(q0)}」`,text:'试试更短的关键词、英文名，或扩大时间范围。',acts:`<a class="btn" href="?q=${encodeURIComponent(q0)}">搜索全部时间</a>`})};
 const snip=b=>{const i=String(b).toLowerCase().indexOf(ql);return i<0?String(b).slice(0,60)+'…':(i>20?'…':'')+String(b).slice(Math.max(0,i-20),i+50)+'…'};
 prog();const queue=ds.slice();
 const worker=async()=>{while(queue.length){const d=queue.shift();try{const j=await loadJSON(d+'.json');if(j){const ins=(j.insights||[]).map((x,n)=>({...x,n:n+1})).filter(x=>has(x.title)||has(x.body));const posts=(j.posts||[]).filter(p=>(!tp||p.topic===tp)&&[p.conclusion,p.zh,p.text,p.name,p.handle,...(p.tags||[]),...(p.keypoints||[])].some(has)).sort((a,b)=>(b.likes||0)-(a.likes||0));if(ins.length||posts.length){out[d]={ins:tp?[]:ins,posts};total+=out[d].ins.length+posts.length}}}catch(e){}done++;prog();draw()}};
 await Promise.all([1,2,3,4].map(worker));
})();

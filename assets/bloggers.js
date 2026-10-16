nav('bloggers');
const m=$('#main');
(async()=>{let B;try{B=await loadJSON('bloggers.json')}catch(e){B=undefined}
 if(!B){m.innerHTML=stateHTML({kind:'err',icon:'!',title:'博主数据加载失败',text:'请稍后重试。',acts:'<button class="btn btn-primary" onclick="location.href=location.pathname">重试</button>'});return}
 const L=B.bloggers||[],groups=[...new Set(L.map(b=>b.group))];
 let st={q:qs.get('q')||'',g:qs.get('group')||'',s:qs.get('sort')||'total'};
 m.innerHTML=`<h1>博主</h1><p class="meta" style="margin:4px 0 0">共 ${L.length} 位 · 已收录 ${B.issues} 期</p>
 <div class="legend"><span><b class="never">红色</b> = 收录以来从未发帖</span><span>点「最近发帖」直达该期并只看此人</span></div>
 <div class="bl-tools"><div><label class="sr" for="bq">搜索博主</label><input id="bq" type="search" placeholder="搜索姓名 / @handle / 简介" value="${esc(st.q)}"></div>
 <div><label class="sr" for="bg">分组</label><select id="bg"><option value="">全部分组</option>${groups.map(g=>`<option ${g===st.g?'selected':''} value="${esc(g)}">${esc(g.split('：')[0])}（${L.filter(b=>b.group===g).length}）</option>`).join('')}</select></div>
 <div><label class="sr" for="bs">排序</label><select id="bs">${[['total','累计帖 ↓'],['days','活跃天 ↓'],['last','最近发帖 ↓'],['name','姓名 A–Z']].map(([k,t])=>`<option value="${k}" ${k===st.s?'selected':''}>${t}</option>`).join('')}</select></div></div>
 <p class="meta" id="bc" aria-live="polite"></p><div id="bl"></div>`;
 const lastLink=b=>b.last?`<a class="last-link" href="issue.html?d=${b.last}&view=blogger&q=${encodeURIComponent(b.handle)}">${b.last}</a>`:'<span class="never">从未</span>';
 const draw=()=>{const q=st.q.toLowerCase();let r=L.filter(b=>(!st.g||b.group===st.g)&&(!q||[b.name,b.handle,b.bio].some(v=>String(v||'').toLowerCase().includes(q))));
  const S={total:(a,b)=>b.total-a.total,days:(a,b)=>b.days_active-a.days_active,last:(a,b)=>String(b.last).localeCompare(String(a.last)),name:(a,b)=>a.name.localeCompare(b.name)};r.sort(S[st.s]);
  $('#bc').textContent=`显示 ${r.length} 位`;
  if(!r.length){$('#bl').innerHTML=stateHTML({icon:'∅',title:'没有匹配的博主',text:'换个关键词或分组试试。'});return}
  $('#bl').innerHTML=`<table class="bl"><thead><tr><th><button data-s="name">博主</button></th><th>分组</th><th class="num-c"><button data-s="total" style="text-align:right">累计帖</button></th><th class="num-c"><button data-s="days" style="text-align:right">活跃天</button></th><th><button data-s="last">最近发帖</button></th></tr></thead><tbody>
  ${r.map(b=>`<tr><td><b class="${b.total?'':'never'}">${hl(b.name,st.q)}</b> <a class="meta" href="https://x.com/${esc(b.handle)}" target="_blank" rel="noopener">@${hl(b.handle,st.q)}</a><div class="meta" style="max-width:520px">${esc(b.bio)}</div></td><td class="grp">${esc(b.group.split('：')[0])}</td><td class="num-c">${b.total}</td><td class="num-c">${b.days_active}</td><td>${lastLink(b)}</td></tr>`).join('')}</tbody></table>
  <div class="bl-cards">${r.map(b=>`<article class="card bl-card"><div class="top"><div><b class="${b.total?'':'never'}">${hl(b.name,st.q)}</b> <span class="meta">@${hl(b.handle,st.q)}</span></div><span class="meta">${esc(b.group.split('：')[0])}</span></div>
  <div class="stats"><span>累计 <b>${b.total}</b> 帖</span><span>活跃 <b>${b.days_active}</b> 天</span><span>最近 ${lastLink(b)}</span></div>${b.bio?`<details><summary class="bio-sum">简介</summary><p class="meta" style="margin:0">${esc(b.bio)}</p></details>`:''}</article>`).join('')}</div>`;
  const p=new URLSearchParams();st.q&&p.set('q',st.q);st.g&&p.set('group',st.g);st.s!=='total'&&p.set('sort',st.s);history.replaceState(null,'','?'+p)};
 $('#bq').oninput=e=>{st.q=e.target.value.trim();draw()};$('#bg').onchange=e=>{st.g=e.target.value;draw()};$('#bs').onchange=e=>{st.s=e.target.value;draw()};
 m.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(b){st.s=b.dataset.s;$('#bs').value=st.s;draw()}});draw()})();

const $=s=>document.querySelector(s);const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bj=t=>{const d=new Date(new Date(t).getTime()+8*3600e3);return d.toISOString().slice(5,16).replace('T',' ')};
const nav=()=>`<header class="nav"><a href="index.html">📚 各期日报</a><a href="bloggers.html">👤 博主</a></header>`;
document.addEventListener('DOMContentLoaded',()=>document.body.insertAdjacentHTML('afterbegin',nav()));

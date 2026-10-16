#!/usr/bin/env python3
"""把 /workspace/learning 的当日原始数据+注释 转成 data/<date>.json，并更新 data/index.json、data/bloggers.json
用法: python3 scripts/build_data.py 2026-10-16 [--learning /workspace/learning]
需要: learning/raw/all.json, learning/ann/*.json, learning/meta.json(含 summary/highlights/insights 可选 topic_overrides)
"""
import json,glob,csv,re,sys,os,datetime
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
date=sys.argv[1]; L=sys.argv[sys.argv.index('--learning')+1] if '--learning' in sys.argv else '/workspace/learning'
meta=json.load(open(f'{L}/meta.json')); A={}
for f in sorted(glob.glob(f'{L}/ann/*.json')): A.update(json.load(open(f)))
P=json.load(open(f'{L}/raw/all.json'))
rows={r['handle'].lower():r for r in csv.DictReader(open(f'{L}/x_bloggers.csv',encoding='utf-8-sig'))}
TOP=[('非AI',r'非 AI|Roadster|特斯拉|Tesla|飞行汽车|马斯克男孩|Starlink|石油|裸辞|人生'),
 ('模型发布',r'发布|上线|open-weight|开源权重|Muse Spark|Muse Wonder|Gemini 4 Argon|Nemotron|Kling|OmniHuman|GPT-Live|lfm|基座|Argon|开源模型|Qwen|DeepSeek V4'),
 ('Agent/开发',r'[Aa]gent|Claude Code|Codex|Cursor|subagent|Skill|skill|MCP|SDK|harness|编排|沙箱|SPACE|CLI|OpenCode|Magpie|CC Switch|prompt injection|eval|LangSmith|Daemons|Orca'),
 ('企业应用',r'企业|Enterprise|FDE|银行|data residency|数据驻留|团队|RBAC|营收|客户|风控'),
 ('研究',r'论文|研究|Scientist|benchmark|Bench|ARC-AGI|数学|量子|蒸馏|METR|安全|Fellow|CERN|物理|ASR|SynthID'),
 ('产品工具',r'工具|插件|App|扩展|Chrome|开源|GitHub|提示词|Prompt|视频|图|Mac|Ollama|ollama|教程|额度|订阅|封号|Claude|Gemini|ChatGPT')]
TAGS=['Claude','Codex','Gemini','OpenAI','Meta','Muse','DeepSeek','Agent','开源','本地部署','视频','提示词','评测','安全','自媒体','Grok','Kimi','NVIDIA','Cursor']
ov=meta.get('topic_overrides',{})
def topic(c,t,i):
    if i in ov: return ov[i]
    s=c+' '+t
    for k,rx in TOP:
        src=c if k=='非AI' else s
        if re.search(rx,src): return k
    return '其他/闲聊'
def is_en(t):
    t=re.sub(r'https?://\S+|@\w+','',t); return len(re.findall(r'[A-Za-z]',t))>3 and len(re.findall(r'[\u4e00-\u9fff]',t))<3
posts=[]
for p in P:
    c,zh,kp=A.get(p['id'],['（未注释）','',[]]); full=p['full']; r=rows.get(p['u'].lower(),{})
    s=c+' '+full
    posts.append({'id':p['id'],'handle':r.get('handle',p['u']),'name':r.get('显示名',p['u']),'group':r.get('分组',''),
      'time':p['created_at'],'likes':p['public_metrics']['like_count'],'url':f"https://x.com/{p['u']}/status/{p['id']}",
      'conclusion':c,'zh':zh if (zh and is_en(full)) else '','text':full,'en':is_en(full),'keypoints':kp,
      'topic':topic(c,full,p['id']),'tags':[t for t in TAGS if t.lower() in s.lower()],'highlight':p['id'] in meta['highlights']})
handles=[r['handle'] for r in rows.values()]
posted={p['handle'] for p in posts}
day={'date':date,'window':meta.get('window',''),'summary':meta['summary'],'insights':meta.get('insights',[]),
     'post_count':len(posts),'blogger_count':len(posted),'silent':[h for h in handles if h not in posted],'posts':posts}
json.dump(day,open(f'{R}/data/{date}.json','w'),ensure_ascii=False)
# index
ip=f'{R}/data/index.json'; idx=json.load(open(ip)) if os.path.exists(ip) else []
idx=[x for x in idx if x['date']!=date]+[{'date':date,'summary':meta['summary'],'post_count':len(posts),'blogger_count':len(posted)}]
idx.sort(key=lambda x:x['date'],reverse=True); json.dump(idx,open(ip,'w'),ensure_ascii=False,indent=1)
# bloggers cumulative
stats={r['handle']:{'handle':r['handle'],'name':r['显示名'],'group':r['分组'],'bio':r['简介/领域'],'user_id':r.get('user_id',''),'total':0,'days_active':0,'last':'','daily':{}} for r in rows.values()}
for x in idx:
    d=json.load(open(f"{R}/data/{x['date']}.json"))
    for p in d['posts']:
        s=stats.get(p['handle']); 
        if not s: continue
        s['total']+=1; s['daily'][d['date']]=s['daily'].get(d['date'],0)+1
for s in stats.values():
    s['days_active']=len(s['daily']); s['last']=max(s['daily']) if s['daily'] else ''
json.dump({'issues':len(idx),'bloggers':list(stats.values())},open(f'{R}/data/bloggers.json','w'),ensure_ascii=False)
from collections import Counter
print(date,len(posts),'posts',len(posted),'bloggers',Counter(p['topic'] for p in posts))

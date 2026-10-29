import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {caseDefaults} from './case-defaults.js';
import { siteSeeds, legacySiteSeeds, sampleArticles } from './seed.js';

export function openStore(dir) {
  mkdirSync(dir,{recursive:true}); mkdirSync(path.join(dir,'uploads'),{recursive:true});
  const keyPath=path.join(dir,'secret.key');
  if(!existsSync(keyPath)) writeFileSync(keyPath,randomBytes(32),{mode:0o600});
  const key=readFileSync(keyPath);
  const db=new DatabaseSync(path.join(dir,'studio.sqlite'));
  db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,name TEXT NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,csrf TEXT NOT NULL,expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS languages(code TEXT PRIMARY KEY,name TEXT NOT NULL,enabled INTEGER NOT NULL DEFAULT 0,sort INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,type TEXT NOT NULL,slug TEXT UNIQUE NOT NULL,created TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS translations(content_id TEXT REFERENCES content(id) ON DELETE CASCADE,locale TEXT REFERENCES languages(code),draft TEXT NOT NULL,live TEXT,revision INTEGER NOT NULL DEFAULT 1,source_revision INTEGER NOT NULL DEFAULT 1,updated TEXT NOT NULL,PRIMARY KEY(content_id,locale));
    CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY,at TEXT NOT NULL,day TEXT NOT NULL,path TEXT NOT NULL,locale TEXT NOT NULL,browser_language TEXT NOT NULL,country TEXT NOT NULL,visitor TEXT NOT NULL);
    CREATE INDEX IF NOT EXISTS visits_day ON visits(day);
    CREATE TABLE IF NOT EXISTS inquiries(id TEXT PRIMARY KEY,name TEXT,email TEXT,company TEXT,message TEXT,locale TEXT,created TEXT,status TEXT DEFAULT 'new');
    CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY,actor TEXT,action TEXT,target TEXT,at TEXT);
  `);
  const get=(sql,...args)=>db.prepare(sql).get(...args);
  const all=(sql,...args)=>db.prepare(sql).all(...args);
  const run=(sql,...args)=>db.prepare(sql).run(...args);
  const setting=(name,fallback='')=>{const row=get('SELECT value FROM settings WHERE key=?',name);return row?JSON.parse(row.value):fallback;};
  const set=(name,value)=>run('INSERT INTO settings VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',name,JSON.stringify(value));
  const transaction=(fn)=>{db.exec('BEGIN IMMEDIATE');try{const result=fn();db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}};
  if(!get('SELECT 1 FROM settings WHERE key=?','initialized')) transaction(()=>{
    for(const [code,name,sort] of [['zh-CN','简体中文',0],['en','English',1],['ja','日本語',2]])run('INSERT INTO languages VALUES(?,?,1,?)',code,name,sort);
    run('INSERT INTO content VALUES(?,?,?,?)','site','site','home',new Date().toISOString());
    for(const [locale,data] of Object.entries(siteSeeds))run('INSERT INTO translations VALUES(?,?,?,?,1,1,?)','site',locale,JSON.stringify(data),JSON.stringify(data),new Date().toISOString());
    for(const article of sampleArticles){
      const id=randomBytes(12).toString('hex');run('INSERT INTO content VALUES(?,?,?,?)',id,'article',article.slug,new Date().toISOString());
      for(const [locale,data] of Object.entries(article.translations)){const payload=JSON.stringify({...data,image:'/assets/world.webp'});run('INSERT INTO translations VALUES(?,?,?,?,1,1,?)',id,locale,payload,payload,new Date().toISOString());}
    }
    for(const [i,title] of ['雾境远征','星海回声'].entries()){
      const id=randomBytes(12).toString('hex');run('INSERT INTO content VALUES(?,?,?,?)',id,'case',`demo-world-${i+1}`,new Date().toISOString());
      const names={'zh-CN':title,en:i?'Echoes of the stars':'Beyond the mist',ja:i?'星々のこだま':'霧の向こうへ'};
      for(const locale of Object.keys(names)){const payload=JSON.stringify({...caseDefaults(locale),title:names[locale],excerpt:locale==='zh-CN'?'演示案例 / 请替换为授权项目':locale==='ja'?'デモ事例 / 実際の顧客案件ではありません':'Illustrative case / not a client project',category:i?'SCI-FI':'FANTASY',body:locale==='zh-CN'?'这是用于展示页面布局的示例，可在后台替换项目介绍、配图及服务内容。':'Illustrative layout. Replace with an authorized project description.',image:'/assets/world.webp'});run('INSERT INTO translations VALUES(?,?,?,?,1,1,?)',id,locale,payload,payload,new Date().toISOString());}
    }
    set('defaultLanguage','en');set('timezone','Asia/Shanghai');set('initialized',true);
  });
  // Upgrade untouched template fields while preserving editorial changes.
  if(!setting('word2worldCopyV1',false))transaction(()=>{
    for(const row of all("SELECT * FROM translations WHERE content_id='site'")){
      const upgrade=value=>{
        if(!value)return value;
        const data=JSON.parse(value),previous=legacySiteSeeds[row.locale],next=siteSeeds[row.locale];
        if(!previous||!next)return value;
        for(const key of Object.keys(next))if(JSON.stringify(data[key])===JSON.stringify(previous[key]))data[key]=next[key];
        return JSON.stringify(data);
      };
      run('UPDATE translations SET draft=?,live=? WHERE content_id=? AND locale=?',upgrade(row.draft),upgrade(row.live),row.content_id,row.locale);
    }
    set('word2worldCopyV1',true);
  });
  if(!setting('caseLayoutV2',false))transaction(()=>{
    const rows=all("SELECT t.* FROM translations t JOIN content c ON c.id=t.content_id WHERE c.type='case' AND c.slug IN ('demo-world-1','demo-world-2')");
    for(const row of rows){
      const enrich=value=>{if(!value)return value;const data=JSON.parse(value);const known=['这是用于展示页面布局的示例，可在后台替换项目介绍、配图及服务内容。','Illustrative layout. Replace with an authorized project description.'];return !data.sections&&known.includes(data.body)?JSON.stringify({...caseDefaults(row.locale),...data}):value;};
      run('UPDATE translations SET draft=?,live=? WHERE content_id=? AND locale=?',enrich(row.draft),enrich(row.live),row.content_id,row.locale);
    }
    set('caseLayoutV2',true);
  });
  // User-supplied sample video: attach once to the first demo, without replacing custom videos.
  if(!setting('demoVideoV1',false)&&existsSync(path.resolve('public/assets/videoplay.mp4')))transaction(()=>{
    const rows=all("SELECT t.* FROM translations t JOIN content c ON c.id=t.content_id WHERE c.slug='demo-world-1'");
    for(const row of rows){
      const attach=value=>{if(!value)return value;const content=JSON.parse(value);return content.video?value:JSON.stringify({...content,video:'/assets/videoplay.mp4'});};
      const draft=attach(row.draft),live=attach(row.live);
      if(draft!==row.draft||live!==row.live)run('UPDATE translations SET draft=?,live=?,revision=revision+1,source_revision=source_revision+1,updated=? WHERE content_id=? AND locale=?',draft,live,new Date().toISOString(),row.content_id,row.locale);
    }
    set('demoVideoV1',true);
  });
  const setupPath=path.join(dir,'setup-token.txt');
  if(!get('SELECT 1 FROM users LIMIT 1')&&!existsSync(setupPath))writeFileSync(setupPath,randomBytes(24).toString('hex'),{mode:0o600});
  return {db,get,all,run,setting,set,transaction,key,setupPath,dir};
}

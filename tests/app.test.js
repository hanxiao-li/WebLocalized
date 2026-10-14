import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createApp} from '../server/app.js';

test('Local CMS: auth, drafts, publication, permissions, languages, analytics and persistence',async t=>{
  const dir=mkdtempSync(path.join(tmpdir(),'localization-test-'));
  let aiMode='success';
  const {app,store,resolveLocale}=createApp({dataDir:dir,enableRateLimit:false,fetchAI:async(url,options)=>{
    if(aiMode==='failure')return new Response('unavailable',{status:503});
    const source=JSON.parse(JSON.parse(options.body).messages[1].content);
    return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify({...source,title:'Translated case',image:'changed',video:'changed',sections:source.sections.map(s=>({...s,type:'changed',image:'changed',video:'changed'}))})}}]}));
  }});
  const server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
  let cookie='',csrf='';
  const call=async(url,method='GET',body,override={})=>{const response=await fetch(base+'/api'+url,{method,headers:{'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf,...override},body:body?JSON.stringify(body):undefined});return {status:response.status,data:await response.json(),headers:response.headers};};
  t.after(()=>{server.close();store.db.close();rmSync(dir,{recursive:true,force:true});});
  await t.test('setup is one-time and token protected',async()=>{
    assert.equal((await call('/admin/content')).status,401);
    assert.equal((await call('/setup','POST',{token:'invalid',email:'owner@example.test',name:'Owner',password:'testing-password-2026'})).status,403);
    const auth=await call('/setup','POST',{token:readFileSync(store.setupPath,'utf8'),email:'owner@example.test',name:'Owner',password:'testing-password-2026'});assert.equal(auth.status,200);cookie=auth.headers.get('set-cookie').split(';')[0];csrf=auth.data.csrf;
    assert.equal((await call('/setup','POST',{})).status,409);assert.equal((await call('/me')).data.user.role,'owner');
  });
  await t.test('CSRF and cross-site requests are rejected',async()=>{
    assert.equal((await call('/admin/content','POST',{},{'X-CSRF-Token':''})).status,403);
    assert.equal((await call('/admin/content','POST',{},OriginHeader())).status,403);
  });
  let id,original;
  await t.test('drafts stay private and concurrent saves are rejected',async()=>{
    const created=await call('/admin/content','POST',{type:'article',slug:'qa-article',title:'未公开标题'});assert.equal(created.status,200);id=created.data.id;
    assert.ok(!(await call('/public?lang=zh-CN')).data.articles.some(x=>x.id===id));
    original=(await call(`/admin/content/${id}/zh-CN`)).data.translation.draft;
    const saved=await call(`/admin/content/${id}/zh-CN`,'PUT',{data:{...original,body:'## 测试内容'},revision:1,sourceRevision:1});assert.equal(saved.status,200);
    assert.equal((await call(`/admin/content/${id}/zh-CN`,'PUT',{data:original,revision:1,sourceRevision:1})).status,409);
    assert.equal((await call(`/admin/content/${id}/zh-CN/publish`,'POST',{revision:1})).status,409);
    assert.equal((await call(`/admin/content/${id}/zh-CN/publish`,'POST',{revision:2})).status,200);
    assert.equal((await call('/public?lang=zh-CN')).data.articles.find(x=>x.id===id).body,'## 测试内容');
    await call(`/admin/content/${id}/zh-CN`,'PUT',{data:{...original,body:'不应公开的新草稿'},revision:2,sourceRevision:2});
    assert.equal((await call('/public?lang=zh-CN')).data.articles.find(x=>x.id===id).body,'## 测试内容');
    assert.ok(!(await call('/public?lang=en')).data.articles.some(x=>x.id===id));
  });
  await t.test('language matching, activation guards and extensibility',async()=>{
    assert.equal(resolveLocale(null,'ja-JP, en;q=0.8'),'ja');assert.equal(resolveLocale(null,'fr-FR'),'en');assert.equal(resolveLocale(null,'zh-TW'),'zh-CN');assert.equal(resolveLocale(null,'ja;q=0, en;q=0.9'),'en');
    assert.equal((await call('/admin/languages','POST',{code:'de',name:'Deutsch'})).status,200);
    assert.equal((await call('/admin/languages/de','PUT',{enabled:true,name:'Deutsch',sort:3})).status,400);
    const source=(await call('/admin/content/site/zh-CN')).data.translation.draft;
    assert.equal((await call('/admin/content/site/de','PUT',{data:{...source,brand:'Test'},revision:0,sourceRevision:1})).status,200);
    await call('/admin/content/site/de/publish','POST',{revision:1});
    assert.equal((await call('/admin/languages/de','PUT',{enabled:true,name:'Deutsch',sort:3})).status,200);
    assert.equal(resolveLocale(null,'de-DE'),'de');
    assert.equal((await call('/admin/content/site/de/unpublish','POST')).status,400);
    assert.equal((await call('/admin/languages/en','PUT',{enabled:false,name:'English',sort:1})).status,400);
    await call('/admin/default-language','POST',{code:'zh-CN'});await call('/admin/languages/en','PUT',{enabled:false,name:'English',sort:1});assert.equal(resolveLocale('en','fr'),'zh-CN');
  });
  await t.test('AI is real configuration-gated, never fake success',async()=>{
    const before=(await call(`/admin/content/${id}/en`)).data.translation;
    assert.equal((await call(`/admin/content/${id}/en/translate`,'POST',{revision:0})).status,400);
    assert.equal((await call(`/admin/content/${id}/en`)).data.translation,before);
  });
  await t.test('case modules and optional video publish independently; AI preserves media and live content',async()=>{
    const caseId=(await call('/admin/content','POST',{type:'case',slug:'module-test',title:'分区测试'})).data.id;
    const draft=(await call(`/admin/content/${caseId}/zh-CN`)).data.translation.draft;
    const video='/uploads/11111111-1111-4111-8111-111111111111.mp4';
    const body={...draft,video,storyTitle:'项目介绍',facts:[{label:'语种',value:'中文 / 英文'}],story:[{title:'需求',text:'项目说明'}],metrics:[],sections:[{type:'split',title:'图文分区',text:'说明',image:'/assets/world.webp',video:''}]};
    assert.equal((await call(`/admin/content/${caseId}/zh-CN`,'PUT',{data:body,revision:1,sourceRevision:1})).status,200);
    await call(`/admin/content/${caseId}/zh-CN/publish`,'POST',{revision:2});
    const live=(await call('/public?lang=zh-CN')).data.cases.find(c=>c.id===caseId);assert.equal(live.video,video);assert.equal(live.sections[0].type,'split');
    assert.equal((await call(`/admin/content/${caseId}/zh-CN`,'PUT',{data:{...body,video:'https://untrusted.example/video.mp4'},revision:2,sourceRevision:2})).status,400);
    await call('/admin/settings','PUT',{endpoint:'https://ai.example.test/v1',model:'test-model',key:'test-key',timezone:'Asia/Shanghai'});
    assert.equal((await call(`/admin/content/${caseId}/ja/translate`,'POST',{revision:0})).status,200);
    const translated=(await call(`/admin/content/${caseId}/ja`)).data.translation;
    assert.equal(translated.draft.title,'Translated case');assert.equal(translated.draft.video,video);assert.equal(translated.draft.sections[0].type,'split');assert.equal(translated.draft.sections[0].image,'/assets/world.webp');assert.equal(translated.live,null);
    aiMode='failure';assert.equal((await call(`/admin/content/${caseId}/ja/translate`,'POST',{revision:1})).status,502);
    assert.deepEqual((await call(`/admin/content/${caseId}/ja`)).data.translation,translated);
    assert.equal((await call(`/admin/content/${caseId}/zh-CN`,'PUT',{data:{...body,video:''},revision:2,sourceRevision:2})).status,200);
    await call(`/admin/content/${caseId}/zh-CN/publish`,'POST',{revision:3});assert.equal((await call('/public?lang=zh-CN')).data.cases.find(c=>c.id===caseId).video,'');
    const form=new FormData();form.append('file',new Blob(['not a video'],{type:'video/mp4'}),'fake.mp4');
    assert.equal((await fetch(base+'/api/admin/upload-video',{method:'POST',headers:{Cookie:cookie,'X-CSRF-Token':csrf},body:form})).status,400);
  });
  await t.test('real visits deduplicate browser, count locales and unknown local regions',async()=>{
    const v=await call('/visit','POST',{path:'/',locale:'zh-CN',browserLanguage:'zh-CN'});assert.equal(v.status,200);const visitor=v.headers.get('set-cookie').split(';')[0];
    await call('/visit','POST',{path:'/articles',locale:'ja',browserLanguage:'ja-JP'},{Cookie:cookie+'; '+visitor});
    const d=(await call('/admin/stats?from=2020-01-01&to=2020-01-02')).data;assert.equal(d.total.pv,0);
    const day=store.get('SELECT day FROM visits LIMIT 1').day;
    const stats=(await call('/admin/stats?from='+day+'&to='+day)).data;assert.equal(stats.total.pv,2);assert.equal(stats.total.uv,1);assert.equal(stats.countries[0].label,'Unknown');
    assert.equal((await call('/admin/stats?from='+day+'&to='+day+'&locale=ja')).data.total.pv,1);
    assert.equal((await call('/visit','POST',{path:'/admin',locale:'zh-CN',browserLanguage:'en'})).status,400);
  });
  await t.test('inquiries persist and image/script injection is not accepted',async()=>{
    assert.equal((await call('/inquiries','POST',{name:'Test',email:'test@example.test',company:'Test',message:'测试项目需求',locale:'zh-CN'})).status,200);
    assert.equal((await call('/admin/inquiries')).data.length,1);
    assert.equal((await call(`/admin/content/${id}/zh-CN`,'PUT',{data:{...original,image:'javascript:alert(1)'},revision:3,sourceRevision:3})).status,400);
  });
  await t.test('role boundaries and disabled accounts enforced on the server',async()=>{
    const ownerCookie=cookie,ownerCsrf=csrf;
    await call('/admin/users','POST',{email:'editor@example.test',name:'Editor',password:'editor-password-2026',role:'editor'});
    const editor=(await call('/admin/users')).data.find(u=>u.role==='editor');
    const auth=await call('/login','POST',{email:editor.email,password:'editor-password-2026'});cookie=auth.headers.get('set-cookie').split(';')[0];csrf=auth.data.csrf;
    assert.equal((await call('/admin/content')).status,200);assert.equal((await call('/admin/users')).status,403);assert.equal((await call('/admin/settings')).status,403);assert.equal((await call(`/admin/content/${id}/zh-CN/publish`,'POST',{revision:3})).status,403);assert.equal((await call('/admin/stats?from=2026-01-01&to=2026-01-02')).status,403);
    const editorCookie=cookie,editorCsrf=csrf;cookie=ownerCookie;csrf=ownerCsrf;
    await call('/admin/users/'+editor.id,'PUT',{role:'editor',active:false});cookie=editorCookie;csrf=editorCsrf;assert.equal((await call('/me')).status,401);cookie=ownerCookie;csrf=ownerCsrf;
    const owner=(await call('/me')).data.user;assert.equal((await call('/admin/users/'+owner.id,'PUT',{role:'analyst',active:true})).status,400);
  });
  await t.test('data survives a new database connection',async()=>{const second=createApp({dataDir:dir,enableRateLimit:false});assert.equal(second.store.get('SELECT count(*) AS n FROM inquiries').n,1);assert.ok(second.store.get('SELECT 1 FROM content WHERE id=?',id));second.store.db.close();});
});
function OriginHeader(){return {Origin:'https://untrusted.example'};}

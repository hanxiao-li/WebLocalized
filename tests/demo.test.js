import test from 'node:test';
import assert from 'node:assert/strict';
import {demoApi} from '../src/demo.js';

test('Pages demo stays browser-local and preserves draft/publication behavior',async()=>{
  const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)};
  Object.defineProperty(globalThis,'navigator',{configurable:true,value:{languages:['zh-CN']}});
  const first=await demoApi('/public');assert.equal(first.locale,'zh-CN');assert.match(first.cases[0].video,/videoplay.mp4$/);
  const {id}=await demoApi('/admin/content',{method:'POST',body:{type:'article',slug:'local-only',title:'演示测试'}});
  const record=await demoApi(`/admin/content/${id}/zh-CN`);
  await demoApi(`/admin/content/${id}/zh-CN`,{method:'PUT',body:{revision:1,sourceRevision:1,data:{...record.translation.draft,body:'演示正文'}}});
  assert.ok(!(await demoApi('/public')).articles.some(a=>a.id===id));
  await demoApi(`/admin/content/${id}/zh-CN/publish`,{method:'POST',body:{revision:2}});
  assert.equal((await demoApi('/public')).articles.find(a=>a.id===id).body,'演示正文');
  await assert.rejects(demoApi(`/admin/content/${id}/zh-CN`,{method:'PUT',body:{revision:1,data:{}}}),/更新/);
  await assert.rejects(demoApi(`/admin/content/${id}/en/translate`,{method:'POST'}),/不调用 AI/);
  await assert.rejects(demoApi('/admin/settings',{method:'PUT',body:{key:'do-not-save'}}),/不提供/);
  assert.ok(![...memory.values()].join('').includes('do-not-save'));
  await demoApi('/admin/languages',{method:'POST',body:{code:'de',name:'Deutsch'}});
  await assert.rejects(demoApi('/admin/languages/de',{method:'PUT',body:{enabled:true}}),/发布/);
  assert.equal((await demoApi('/public?lang=fr')).locale,'zh-CN');
  memory.clear();assert.ok(!(await demoApi('/public')).articles.some(a=>a.id===id));
});

import {caseCopy,casePayload} from '../server/editorial-content.js';
import {siteSeeds,legacySiteSeeds,sampleArticles} from '../server/seed.js';
import {caseDefaults} from '../server/case-defaults.js';
import {asset} from './runtime.js';

const KEY='web-localized-demo-v1';
const user={id:'demo',name:'演示管理员',email:'demo@example.test',role:'owner',active:true,permissions:['read','write','publish','stats','inquiries','users','settings']};
const copy=value=>structuredClone(value),now=()=>new Date().toISOString();
const media=value=>typeof value==='string'?asset(value):Array.isArray(value)?value.map(media):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,media(v)])):value;
function seed(){
  const contents=[{id:'site',type:'site',slug:'home',created:now(),translations:{}}];
  const add=(item,locale,data)=>{item.translations[locale]={draft:media(data),live:media(data),revision:1,source_revision:1,updated:now()};};
  for(const [locale,site] of Object.entries(siteSeeds))add(contents[0],locale,{...site,contactSuccess:locale==='zh-CN'?'演示提交成功，仅存于你的浏览器，未发送给公司。':locale==='ja'?'デモとして保存しました。このブラウザーのみで保存され、送信されません。':'Demo saved in this browser only. Nothing was sent to the company.'});
  for(const article of sampleArticles){const item={id:article.slug,type:'article',slug:article.slug,created:now(),translations:{}};for(const [locale,data] of Object.entries(article.translations))add(item,locale,{...data,image:'/assets/world.webp'});contents.push(item);}
  for(let i=1;i<=3;i++){
    const item={id:'demo-world-'+i,type:'case',slug:'demo-world-'+i,created:now(),translations:{}};
    for(const locale of ['zh-CN','en','ja'])add(item,locale,{...caseDefaults(locale),title:locale==='zh-CN'?(i===1?'雾境远征':'星海回声'):locale==='ja'?(i===1?'霧の向こうへ':'星々のこだま'):(i===1?'Beyond the mist':'Echoes of the stars'),excerpt:locale==='zh-CN'?'演示案例 / 请替换为授权项目':'Illustrative case / not a client project',category:i===1?'FANTASY':'SCI-FI',body:'Illustrative layout.',image:'/assets/world.webp',video:i===1?'/assets/videoplay.mp4':''});contents.push(item);
  }
  for(const c of caseCopy){const item=contents.find(x=>x.slug===c.slug);for(const locale of Object.keys(item.translations)){for(const field of ['draft','live'])Object.assign(item.translations[locale][field],casePayload(c,locale),{title:locale==='zh-CN'?c.title:item.translations[locale][field].title});}}
  return {version:1,contents,languages:[{code:'zh-CN',name:'简体中文',enabled:true,sort:0},{code:'en',name:'English',enabled:true,sort:1},{code:'ja',name:'日本語',enabled:true,sort:2}],defaultLanguage:'en',visits:[],inquiries:[],audit:[]};
}
function load(){try{const value=JSON.parse(localStorage.getItem(KEY));if(value?.version===1){if(!value.word2worldCopyV1){for(const [locale,t] of Object.entries(value.contents[0].translations)){for(const state of ['draft','live']){if(!t[state])continue;for(const [key,next] of Object.entries(siteSeeds[locale]||{}))if(JSON.stringify(t[state][key])===JSON.stringify(legacySiteSeeds[locale]?.[key]))t[state][key]=copy(next);}}value.word2worldCopyV1=true;}return value;}}catch{}return seed();}
function save(state){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{throw new Error('浏览器存储空间不足或不可用。请减少上传图片，或恢复演示数据。');}}
const fail=message=>{throw new Error(message);};
export function resetDemo(){localStorage.removeItem(KEY);location.href=import.meta.env.BASE_URL;}
export async function demoApi(path,{method='GET',body={}}={}){
  const state=load(),url=new URL(path,'https://demo.local'),route=url.pathname;
  const active=()=>state.languages.filter(l=>l.enabled&&state.contents[0].translations[l.code]?.live).sort((a,b)=>a.sort-b.sort);
  const log=(action,target)=>{state.audit.unshift({id:crypto.randomUUID(),at:now(),actor:user.name,action,target});state.audit=state.audit.slice(0,200);save(state);};
  if(route==='/setup')return {required:false};
  if(route==='/me'||route==='/login')return {user,csrf:'demo'};
  if(route==='/logout')return {ok:true};
  if(route==='/public'){
    const languages=active(),requested=url.searchParams.get('lang');
    const match=code=>languages.find(l=>l.code.toLowerCase()===code.toLowerCase())||languages.find(l=>l.code.split('-')[0]===code.split('-')[0]);
    const locale=(requested&&match(requested)||navigator.languages.map(match).find(Boolean)||languages.find(l=>l.code==='en')||languages.find(l=>l.code===state.defaultLanguage)||languages[0]).code;
    const list=type=>state.contents.filter(c=>c.type===type&&c.translations[locale]?.live).map(c=>({id:c.id,slug:c.slug,...copy(c.translations[locale].live)}));
    return {locale,languages,site:{...copy(state.contents[0].translations[locale].live),logo:state.contents[0].translations['zh-CN']?.live?.logo||asset('/assets/company-logo.png')},articles:list('article'),cases:list('case')};
  }
  if(route==='/admin/inquiry-count')return {count:state.inquiries.filter(i=>i.status==='new').length};
  if(route==='/visit'){state.visits.push({...body,day:now().slice(0,10)});state.visits=state.visits.slice(-500);save(state);return {ok:true};}
  if(route==='/inquiries'){state.inquiries.unshift({...body,id:crypto.randomUUID(),created:now(),status:'new'});save(state);return {ok:true};}
  if(route==='/admin/languages'){
    if(method==='POST'){if(!/^[a-z]{2,3}(-[A-Za-z0-9]{2,8})*$/.test(body.code))fail('请填写有效语言代码');if(state.languages.some(l=>l.code===body.code))fail('语言已存在');state.languages.push({...body,enabled:false,sort:state.languages.length});log('添加演示语言',body.code);}
    return {languages:copy(state.languages),defaultLanguage:state.defaultLanguage};
  }
  if(route.startsWith('/admin/languages/')){const lang=state.languages.find(l=>l.code===route.split('/').at(-1));if(!lang)fail('语言不存在');if(body.enabled&&!state.contents[0].translations[lang.code]?.live)fail('请先保存并发布该语言的网站内容');if(!body.enabled&&lang.code===state.defaultLanguage)fail('请先切换默认语言');Object.assign(lang,body);log('修改演示语言',lang.code);return {ok:true};}
  if(route==='/admin/default-language'){if(!active().some(l=>l.code===body.code))fail('请选择已启用的语言');state.defaultLanguage=body.code;log('修改默认语言',body.code);return {ok:true};}
  if(route==='/admin/content'){
    if(method==='POST'){if(!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(body.slug)||state.contents.some(c=>c.slug===body.slug))fail('网址标识无效或重复');const id=crypto.randomUUID(),draft={...(body.type==='case'?caseDefaults('zh-CN'):{}),title:body.title,excerpt:'',category:'',body:'',image:''};state.contents.push({id,type:body.type,slug:body.slug,created:now(),translations:{'zh-CN':{draft,live:null,revision:1,source_revision:1,updated:now()}}});log('创建演示内容',body.title);return {id};}
    return state.contents.map(c=>({...c,translations:Object.entries(c.translations).map(([locale,t])=>({locale,title:t.draft.title,published:!!t.live,synced:JSON.stringify(t.draft)===JSON.stringify(t.live)}))}));
  }
  const contentRoute=route.match(/^\/admin\/content\/([^/]+)\/([^/]+)(?:\/(publish|unpublish|translate))?$/);
  if(contentRoute){const [,id,locale,action]=contentRoute,c=state.contents.find(c=>c.id===id);if(!c)fail('内容不存在');const t=c.translations[locale],source=c.translations['zh-CN'];
    if(action==='translate')fail('GitHub 演示版不调用 AI。请手动编辑译文；真实 AI 翻译需运行服务器版。');
    if(method==='GET')return {content:{id:c.id,type:c.type,slug:c.slug},translation:copy(t||null),source:copy(source.draft),sourceRevision:source.revision};
    if(action==='unpublish'){if(id==='site'&&state.languages.find(l=>l.code===locale)?.enabled)fail('先停用该语言再下架');if(t)t.live=null;}
    else if(action==='publish'){if(!t||t.revision!==body.revision)fail('请刷新后确认发布');t.live=copy(t.draft);}
    else{if((t?.revision||0)!==body.revision)fail('内容已在另一窗口更新，请刷新');c.translations[locale]={draft:copy(body.data),live:t?.live||null,revision:(t?.revision||0)+1,source_revision:body.sourceRevision,updated:now()};}
    log(action==='publish'?'发布到当前浏览器':action==='unpublish'?'演示下架':'保存演示草稿',id+':'+locale);return {ok:true};
  }
  if(route==='/admin/upload'){const file=body.get('file');if(!file||!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>800000)fail('演示版仅支持 800KB 以内的 JPG、PNG、WebP 图片；正式版支持 8MB');return {url:await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('图片读取失败'));reader.readAsDataURL(file);})};}
  if(route==='/admin/upload-video')fail('演示版已内置示例视频；上传大视频需要运行服务器版。');
  if(route==='/admin/users'&&method==='GET')return [user];
  if(route.startsWith('/admin/users')||route==='/password'||route==='/admin/settings')fail('公开演示不提供真实账号、密码或 AI 密钥配置。请使用服务器版。');
  if(route==='/admin/inquiries')return copy(state.inquiries);
  if(route.startsWith('/admin/inquiries/')){const item=state.inquiries.find(i=>i.id===route.split('/').at(-1));if(item)item.status=body.status;log('修改演示咨询',item?.id);return {ok:true};}
  if(route==='/admin/audit')return copy(state.audit);
  if(route==='/admin/stats'){
    const rows=state.visits.filter(v=>v.day>=url.searchParams.get('from')&&v.day<=url.searchParams.get('to')&&(!url.searchParams.get('locale')||v.locale===url.searchParams.get('locale')));
    const group=key=>Object.entries(Object.groupBy(rows,v=>v[key])).map(([label,vs])=>({label,pv:vs.length,uv:1}));
    return {total:{pv:rows.length,uv:rows.length?1:0},daily:group('day'),countries:rows.length?[{label:'Unknown',pv:rows.length,uv:1}]:[],languages:group('locale'),browserLanguages:group('browserLanguage'),pages:group('path'),timezone:'UTC',countryOptions:['Unknown'],languageOptions:state.languages};
  }
  fail('此功能需要服务器版。');
}

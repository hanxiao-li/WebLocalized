import React,{useEffect,useState} from 'react';
import {Theme,Button,Badge,Callout} from '@radix-ui/themes';
import '@radix-ui/themes/styles.css';
import {ChartBar,Article,Globe,Users,Gear,EnvelopeSimple,SignOut,ArrowUpRight,Buildings,Images,ShieldCheck,ClockCounterClockwise,Key} from '@phosphor-icons/react';
import {api,setCsrf} from '../api';
import {DEMO,pageHref} from '../runtime';
import {ContentList,Editor} from './Content';
import {Languages,Settings,UserManagement,Inquiries,Audit,Password} from './Management';
import Stats from './Stats';
import './admin.css';
export const roleNames={owner:'超级管理员',admin:'内容管理员',editor:'编辑人员',analyst:'数据查看员'};
export function Field({label,children,hint}){return <label className="admin-field"><span>{label}</span>{children}{hint?<small>{hint}</small>:null}</label>;}
export function Empty({children}){return <div className="admin-empty">{children}</div>;}
export function AdminTable({head,children}){return <div className="table-scroll"><table className="admin-table"><thead><tr>{head.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;}
export default function Admin(){
  const [user,setUser]=useState(null),[loading,setLoading]=useState(true),[setup,setSetup]=useState(false),[view,setView]=useState(''),[editing,setEditing]=useState(null),[message,setMessage]=useState(null),[dirty,setDirty]=useState(false);
  const notify=(text,error=false)=>setMessage({text,error});
  useEffect(()=>{document.documentElement.lang='zh-CN';document.title='网站管理后台';api('/setup').then(d=>{setSetup(d.required);if(!d.required)return api('/me').then(d=>{setCsrf(d.csrf);setUser(d.user);});}).catch(()=>{}).finally(()=>setLoading(false));},[]);
  useEffect(()=>{if(user&&!view)setView(user.permissions.includes('stats')?'stats':'articles');},[user,view]);
  useEffect(()=>{if(!message)return;const id=setTimeout(()=>setMessage(null),message.error?12000:5000);return()=>clearTimeout(id);},[message]);
  if(loading)return <div className="fallback">正在连接管理后台…</div>;
  const navs=[['stats','访问统计',ChartBar,'stats'],['site','网站内容',Buildings,'read'],['articles','文章管理',Article,'read'],['cases','项目案例',Images,'read'],['languages','语言管理',Globe,'read'],['inquiries','客户咨询',EnvelopeSimple,'inquiries'],['users','管理员',Users,'users'],['settings','系统设置',Gear,'settings'],['audit','操作日志',ClockCounterClockwise,'settings'],...(!DEMO?[['password','修改密码',Key,null]]:[])];
  const select=(key)=>{if(dirty&& !window.confirm('返回菜单前，请确认编辑内容已保存。继续离开？'))return;setDirty(false);setEditing(null);setView(key);setMessage(null);};
  const onAuth=(d)=>{setCsrf(d.csrf);setUser(d.user);setSetup(false);};
  async function logout(){try{await api('/logout',{method:'POST'});setCsrf('');setUser(null);setView('');setEditing(null);}catch(e){notify(e.message,true);}}
  return <Theme appearance="light" accentColor="indigo" grayColor="slate" radius="medium" scaling="100%"><div className="admin-app"><a className="skip-link" href="#admin-main">跳转到正文</a>{!user?<Login setup={setup} onAuth={onAuth}/>:<>
    <aside className="admin-sidebar"><a href={pageHref('/')} className="admin-logo"><span className="admin-logo-mark">LP</span><span>网站工作台<small>LOCALIZATION STUDIO</small></span></a><div className="sidebar-label">内容与运营</div><nav>{navs.filter(n=>!n[3]||user.permissions.includes(n[3])).map(([key,label,Icon])=><button key={key} className={view===key?'active':''} onClick={()=>select(key)}><Icon size={20}/>{label}</button>)}</nav><div className="sidebar-bottom"><ShieldCheck size={20}/><div>{user.name}<small>{roleNames[user.role]}</small></div><button title="退出登录" aria-label="退出登录" onClick={logout}><SignOut size={20}/></button></div></aside>
    <div className="admin-workspace"><header className="admin-topbar"><span>{editing?'内容编辑':navs.find(n=>n[0]===view)?.[1]}</span><div><Badge color={DEMO?'orange':'green'}>{DEMO?'浏览器演示':'本地工作台'}</Badge><a href={pageHref('/')} target="_blank" rel="noreferrer">查看网站<ArrowUpRight size={16}/></a><button className="mobile-logout" aria-label="退出登录" onClick={logout}><SignOut size={18}/></button></div></header>
    <main id="admin-main" className="admin-main">{message?<div className={'admin-notice '+(message.error?'bad':'')} role={message.error?'alert':'status'}>{message.text}<button onClick={()=>setMessage(null)} aria-label="关闭提示">×</button></div>:null}
    {editing?<Editor key={editing.id} id={editing.id} user={user} notify={notify} onDirtyChange={setDirty} onBack={()=>{setEditing(null);}}/>:view==='site'?<Editor id="site" user={user} notify={notify} onDirtyChange={setDirty}/>:view==='articles'||view==='cases'?<ContentList type={view==='articles'?'article':'case'} user={user} notify={notify} onEdit={id=>setEditing({id})}/>:view==='stats'?<Stats notify={notify}/>:view==='languages'?<Languages user={user} notify={notify}/>:view==='users'?<UserManagement user={user} notify={notify}/>:view==='settings'?<Settings notify={notify}/>:view==='inquiries'?<Inquiries notify={notify}/>:view==='audit'?<Audit notify={notify}/>:view==='password'?<Password notify={notify} onDone={()=>{setUser(null);setCsrf('');setView('');}}/>:null}
    </main><footer className="admin-footer">{DEMO?'演示内容仅保存在当前浏览器 · 不代表真实账号和访问数据':'网站内容与数据保存在当前服务器 · 请定期备份 data 文件夹'}</footer></div>
  </>}</div></Theme>;
}
function Login({setup,onAuth}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e){e.preventDefault();setError('');setBusy(true);try{const data=Object.fromEntries(new FormData(e.currentTarget));onAuth(await api(setup?'/setup':'/login',{method:'POST',body:data}));}catch(e){setError(e.message);}finally{setBusy(false);}}
  if(DEMO)return <div className="fallback"><h1>后台演示</h1><p>无需账号；所有操作仅作用于此浏览器。</p><Button onClick={()=>api('/me').then(onAuth)}>进入演示后台</Button></div>;
  return <div className="login-page"><div className="login-art"><a href={pageHref('/')} className="login-wordmark">LINGUA PLAY</a><h1>让每一种语言，<br/>都有自己的世界。</h1><p>内容、语言与连接，从这里开始。</p></div><div className="login-panel"><form onSubmit={submit}><span className="login-label">网站管理后台</span><h2>{setup?'欢迎，创建你的工作台':'欢迎回来'}</h2><p>{setup?'创建首位超级管理员，开始管理网站。':'登录以管理网站内容、语言和访问数据。'}</p>{setup?<><Field label="本机初始化口令" hint="打开项目 data/setup-token.txt，将其中的口令粘贴到这里。仅首次使用需要。"><input name="token" required autoComplete="off"/></Field><Field label="管理员姓名"><input name="name" required maxLength={80} autoComplete="name"/></Field></>:null}<Field label="邮箱"><input type="email" name="email" required autoComplete="username" maxLength={200}/></Field><Field label="密码" hint={setup?'至少 12 位，建议使用长密码。':undefined}><input type="password" name="password" required minLength={setup?12:1} maxLength={128} autoComplete={setup?'new-password':'current-password'}/></Field>{error?<p role="alert" className="field-error">{error}</p>:null}<Button size="3" type="submit" disabled={busy}>{busy?'正在处理…':setup?'创建管理员并进入':'登录工作台'}</Button><a href={pageHref('/')} className="login-return">返回官网 <ArrowUpRight/></a></form></div></div>;
}

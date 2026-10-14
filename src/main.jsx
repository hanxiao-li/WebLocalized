import React,{lazy,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/outfit/400.css';
import '@fontsource/outfit/500.css';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import './style.css';
import './cases.css';
import {DEMO,pageHref,readLocation} from './runtime';
const Admin=lazy(()=>import('./admin/Admin.jsx'));
const Public=lazy(()=>import('./Public.jsx'));
class Boundary extends React.Component{
  state={error:false};static getDerivedStateFromError(){return {error:true};}
  render(){return this.state.error?<main className="fallback"><h1>页面暂时无法显示</h1><p>请刷新页面重试。请检查连接；演示版修改仅保存于当前浏览器。</p><button onClick={()=>location.reload()}>重新加载</button></main>:this.props.children;}
}
createRoot(document.getElementById('root')).render(<Boundary><Suspense fallback={<div className="fallback" role="status">正在加载…</div>}>{DEMO?<div className="demo-banner"><strong>公开演示</strong><span>修改仅保存于当前浏览器，不同步给他人。</span><a href={pageHref('/admin')}>体验后台</a><button onClick={async()=>{if(confirm('恢复初始演示内容？这会清除当前浏览器中的演示修改。'))(await import('./demo')).resetDemo();}}>恢复演示</button></div>:null}{readLocation().pathname.startsWith('/admin')?<Admin/>:<Public/>}</Suspense></Boundary>);

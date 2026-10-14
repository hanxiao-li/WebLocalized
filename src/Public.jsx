import React,{useEffect,useState} from 'react';
import {ArrowUpRight,ArrowRight,GlobeHemisphereWest,List,X,ArrowLeft} from '@phosphor-icons/react';
import Markdown from 'react-markdown';
import {api} from './api';
import {DEMO,pageHref,readLocation,asset} from './runtime';
import {CaseShowcase,CaseDetail} from './Cases';
import {useScrollReveal} from './useScrollReveal';
import {defaultLogo,setFavicon} from './branding';

const remember={get(){try{return localStorage.getItem('studio-language');}catch{return null;}},set(v){try{localStorage.setItem('studio-language',v);}catch{}}};
function useLocation(){const [url,setUrl]=useState(()=>readLocation());useEffect(()=>{const fn=()=>setUrl(readLocation());window.addEventListener('popstate',fn);return()=>window.removeEventListener('popstate',fn);},[]);return [url,(href)=>{history.pushState({},'',href);setUrl(readLocation());window.scrollTo({top:0});}];}
export default function Public(){
  const [url,navigate]=useLocation(),[data,setData]=useState(null),[error,setError]=useState(''),[menu,setMenu]=useState(false);
  const requested=url.searchParams.get('lang')||remember.get()||'';
  useScrollReveal(url.pathname,data);
  useEffect(()=>{if(data)setFavicon(data.site.logo);},[data]);
  useEffect(()=>{let active=true;setError('');api('/public?lang='+encodeURIComponent(requested)).then(d=>{if(active){setData(d);document.documentElement.lang=d.locale;document.title=d.site.brand+' | '+d.site.tagline;document.querySelector('meta[name="description"]').content=d.site.heroDescription;}}).catch(e=>active&&setError(e.message));return()=>{active=false;};},[requested]);
  useEffect(()=>{if(!data)return;api('/visit',{method:'POST',body:{path:url.pathname,locale:data.locale,browserLanguage:navigator.language||'unknown'}}).catch(()=>{});},[url.pathname,data?.locale]);
  useEffect(()=>{if(data&&url.hash){requestAnimationFrame(()=>document.getElementById(url.hash.slice(1))?.scrollIntoView());}},[data,url.hash]);
  if(error)return <main className="fallback"><h1>暂时无法连接网站</h1><p>{error}</p><button onClick={()=>location.reload()}>重新加载</button></main>;
  if(!data)return <div className="public-loading" aria-label="Loading"><div/><div/><div/></div>;
  const {site:s,locale,languages,articles,cases}=data;
  const href=(path='/')=>pageHref(path,locale);
  const go=(e,path)=>{if(e.metaKey||e.ctrlKey||e.shiftKey)return;e.preventDefault();navigate(href(path));setMenu(false);};
  const nav=(hash)=>{setMenu(false);if(url.pathname!=='/'){navigate(href('/')+'#'+hash);}else document.getElementById(hash)?.scrollIntoView({behavior:'smooth'});};
  const articlePage=url.pathname==='/articles',isPrivacy=url.pathname==='/privacy',detailMatch=url.pathname.match(/^\/(articles|cases)\/([^/]+)\/?$/);
  const detail=detailMatch?(detailMatch[1]==='articles'?articles:cases).find(a=>a.slug===detailMatch[2]):null;
  const isHome=url.pathname==='/',notFound=!isHome&&!articlePage&&!isPrivacy&&!detail;
  const languageChange=(e)=>{remember.set(e.target.value);const next=readLocation();next.searchParams.set('lang',e.target.value);navigate(pageHref(next.pathname,e.target.value)+next.hash);};
  return <div className="public-site">
    <a className="skip-link" href="#main">{locale==='zh-CN'?'跳转到正文':'Skip to content'}</a>
    <header className={'site-header '+(!isHome&&!url.pathname.startsWith('/cases/')?'solid':'')}>
      <a className="wordmark" href={href()} onClick={e=>go(e,'/')} aria-label={s.brand}><img className="brand-logo" src={s.logo||defaultLogo()} alt="" width="80" height="64"/><span>{s.brand}</span></a>
      <button className="mobile-toggle" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X size={24}/>:<List size={24}/>}</button>
      <nav className={menu?'open':''} aria-label="Main navigation">
        {[['about',s.navAbout],['services',s.navServices],['work',s.navCases]].map(([id,label])=><a key={id} href={href()+"#"+id} onClick={e=>{e.preventDefault();nav(id);}}>{label}</a>)}
        <a href={href('/articles')} onClick={e=>go(e,'/articles')}>{s.navArticles}</a><a href={href()+"#contact"} onClick={e=>{e.preventDefault();nav("contact");}}>{s.navContact}<ArrowUpRight size={14}/></a>
      </nav>
      <label className="language-select"><GlobeHemisphereWest size={18}/><span className="sr-only">Language</span><select value={locale} onChange={languageChange}>{languages.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}</select></label>
    </header>
    <main id="main">
    {isHome?<>
      <section className="hero"><img width="1920" height="1080" className="hero-image" src={s.heroImage||asset('/assets/world.webp')} alt="" fetchPriority="high"/><div className="hero-shade"/><div className="hero-inner" key={locale}><h1 aria-label={s.heroTitle}>{s.heroTitle.split("\n").map((line,i)=><span className="hero-line" key={i}><span style={{animationDelay:(i*150+80)+"ms"}}>{line}</span></span>)}</h1><p className="hero-description"><span className="hero-business">{s.tagline}</span>{s.heroDescription}</p><button className="pill light" onClick={()=>nav('contact')}>{s.cta}<ArrowUpRight size={20}/></button></div></section>
      <section className="about-section section-pad" id="about"><div className="section-tag">{s.navAbout}</div><h2>{s.aboutTitle}</h2><div className="about-bottom"><span className="about-glyph" aria-hidden="true">Aa<span>あ</span><span>译</span></span><p>{s.aboutText}</p></div></section>
      <section className="services-section section-pad" id="services"><h2>{s.servicesTitle}</h2><div className="service-grid">{s.services.map((item,i)=><article key={i}><span className="service-number" aria-hidden="true">{i+1}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
      <CaseShowcase items={cases} s={s} href={href} go={go} locale={locale}/>
      <section className="process-section section-pad"><div><h2>{s.processTitle}</h2><p>{s.processText}</p></div><div className="process-steps">{s.steps.map((step,i)=><div key={i}><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></section>
      <section className="articles-section section-pad"><div className="section-tag">{s.navArticles}</div><h2>{s.articlesTitle}</h2><ArticleList items={articles.slice(0,3)} s={s} href={href} go={go}/><a className="text-link" href={href('/articles')} onClick={e=>go(e,'/articles')}>{s.articlesLink}<ArrowRight size={19}/></a></section>
      <Contact s={s} locale={locale}/>
    </>:articlePage?<section className="inner-page section-pad"><h1>{s.navArticles}</h1><p className="section-description">{s.articlesTitle}</p><ArticleList items={articles} s={s} href={href} go={go}/></section>:isPrivacy?<section className="inner-page reading"><h1>{s.privacyLabel}</h1><p>{s.privacyText}</p></section>:detail&&detailMatch[1]==='cases'?<CaseDetail c={detail} s={s} href={href} go={go} next={cases.length>1?cases[(cases.findIndex(c=>c.id===detail.id)+1)%cases.length]:null}/>:detail?<article className="inner-page reading"><a className="text-link" href={href(detailMatch[1]==='articles'?'/articles':'/')} onClick={e=>go(e,detailMatch[1]==='articles'?'/articles':'/')}><ArrowLeft size={18}/>{s.back}</a><p className="article-category">{detail.category}</p><h1>{detail.title}</h1><p className="article-intro">{detail.excerpt}</p>{detail.image?<img width="1000" height="560" className="article-cover" src={detail.image} alt=""/>:null}<div className="markdown"><Markdown>{detail.body}</Markdown></div></article>:notFound?<section className="inner-page reading"><h1>404</h1><p>{locale==='zh-CN'?'该页面尚未发布此语言版本，或页面不存在。':locale==='ja'?'この言語のページはまだ公開されていないか、存在しません。':'This page is unavailable in this language or does not exist.'}</p><a className="pill light" href={href()} onClick={e=>go(e,'/')}>{s.back}<ArrowRight/></a></section>:null}
    </main>
    <footer className="site-footer section-pad"><div className="footer-top"><a href={href()} onClick={e=>go(e,'/')} className="footer-brand">{s.brand}</a><p>{s.footerText}</p></div><div className="footer-contact">{s.email?<a href={'mailto:'+s.email}>{s.email}</a>:null}{s.address?<span>{s.address}</span>:null}</div><div className="footer-bottom"><span>© {new Date().getFullYear()} {s.copyright}</span><a href={href('/privacy')} onClick={e=>go(e,'/privacy')}>{s.privacyLabel}</a><a href={pageHref('/admin')}>{locale==='zh-CN'?'管理后台':'Admin'}</a></div>{s.demo?<p className="demo-notice">{s.demoNotice}</p>:null}</footer>
  </div>;
}
function ArticleList({items,s,href,go}){return <div className="article-list">{items.length?items.map(a=><a href={href('/articles/'+a.slug)} onClick={e=>go(e,'/articles/'+a.slug)} key={a.id} className="article-row"><div className="article-thumb">{a.image?<img width="180" height="120" src={a.image} alt="" loading="lazy"/>:<span>Aa</span>}</div><div><span className="article-category">{a.category}</span><h3>{a.title}</h3><p>{a.excerpt}</p></div><ArrowUpRight size={30}/></a>):<p className="empty-public">{s.emptyArticles}</p>}</div>;}
function Contact({s,locale}){
  const [busy,setBusy]=useState(false),[status,setStatus]=useState(''),[error,setError]=useState(false);
  async function submit(e){e.preventDefault();const form=e.currentTarget;setBusy(true);setStatus('');try{await api('/inquiries',{method:'POST',body:{...Object.fromEntries(new FormData(form)),locale}});setStatus(s.contactSuccess);setError(false);form.reset();}catch{setStatus(s.contactError);setError(true);}finally{setBusy(false);}}
  return <section className="contact-section section-pad" id="contact"><div><h2>{s.contactTitle}</h2><p>{s.contactText}</p></div><form onSubmit={submit}>{DEMO?<p className="demo-contact-note">演示表单：不会发送给公司，请勿填写真实个人信息。</p>:null}<div className="contact-fields"><label>{s.contactName} *<input name="name" autoComplete="name" maxLength={100} required/></label><label>{s.contactEmail} *<input type="email" name="email" autoComplete="email" maxLength={200} required/></label></div><label>{s.contactCompany}<input name="company" autoComplete="organization" maxLength={200}/></label><label>{s.contactMessage} *<textarea name="message" required minLength={5} maxLength={10000} rows={3}/></label><div className="honeypot" aria-hidden="true"><input aria-label="Leave empty" name="website" tabIndex={-1} autoComplete="off"/></div><button className="pill dark" disabled={busy}>{busy?'…':s.contactSend}<ArrowUpRight size={20}/></button><p className={error?'form-message error':'form-message'} role="status">{status}</p></form></section>;
}

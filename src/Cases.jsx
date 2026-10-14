import React,{useRef,useState} from 'react';
import CaseVideo from './CaseVideo';
import Markdown from 'react-markdown';
import {asset} from './runtime';
import {ArrowUpRight,ArrowLeft,ArrowRight} from '@phosphor-icons/react';

export function CaseShowcase({items,s,href,go,locale='en'}){
  const [selected,setSelected]=useState(0),gesture=useRef(null),suppressClick=useRef(false);
  const active=Math.min(selected,Math.max(0,items.length-1)),current=items[active];
  const labels=locale==='zh-CN'?{previous:'上一个案例',next:'下一个案例',view:'查看案例',choose:'选择案例',video:'项目视频'}:locale==='ja'?{previous:'前の事例',next:'次の事例',view:'事例を見る',choose:'事例を選択',video:'プロジェクト映像'}:{previous:'Previous case',next:'Next case',view:'View case',choose:'Select case',video:'Project video'};
  const move=step=>setSelected((active+step+items.length)%items.length);
  return <section className="case-showcase case-coverflow" id="work" aria-label={s.navCases} aria-roledescription="carousel">
    <div className="coverflow-heading"><h2>{s.navCases}</h2>{items.length>1?<div className="coverflow-controls"><button onClick={()=>move(-1)} aria-label={labels.previous}><ArrowLeft size={22}/></button><button onClick={()=>move(1)} aria-label={labels.next}><ArrowRight size={22}/></button></div>:null}</div>
    {current?<>
      <div className={'coverflow-layout '+(!current.video?'no-video':'')}>
        <div className="coverflow-stage" tabIndex={0} aria-label={s.navCases} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowLeft'?-1:1);}}}
          onPointerDown={e=>{gesture.current={x:e.clientX,y:e.clientY};suppressClick.current=false;}}
          onPointerCancel={()=>{gesture.current=null;}}
          onPointerUp={e=>{const start=gesture.current;gesture.current=null;if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){suppressClick.current=true;move(dx<0?1:-1);}}}
          onClickCapture={e=>{if(suppressClick.current){e.preventDefault();e.stopPropagation();suppressClick.current=false;}}}>
          {items.map((c,index)=>{
            let offset=index-active;if(items.length>2){if(offset>items.length/2)offset-=items.length;if(offset<-items.length/2)offset+=items.length;}
            const isActive=index===active,hidden=Math.abs(offset)>1;
            return <article key={c.id} className={'coverflow-slide '+(isActive?'is-active':'')+(c.video?' has-video':'')} style={{'--offset':offset,'--depth':Math.abs(offset),zIndex:items.length-Math.abs(offset)}} aria-hidden={hidden||undefined} inert={hidden||undefined}>
              {isActive?<a className="coverflow-image" href={href('/cases/'+c.slug)} onClick={e=>go(e,'/cases/'+c.slug)} aria-label={labels.view+' · '+c.title}><img src={c.image||asset('/assets/world.webp')} alt="" width="1920" height="1080" loading="lazy" draggable="false"/><div className="coverflow-caption"><span>{c.category}</span><h3>{c.title}</h3><p>{c.excerpt}</p><span className="coverflow-open">{labels.view}<ArrowUpRight size={20}/></span></div></a>:<button className="coverflow-image" onClick={()=>setSelected(index)} aria-label={labels.choose+' · '+c.title} tabIndex={hidden?-1:0}><img src={c.image||asset('/assets/world.webp')} alt="" width="1920" height="1080" loading="lazy" draggable="false"/></button>}
              {isActive&&c.video?<div className="coverflow-video" onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}><CaseVideo key={c.id+c.video} src={c.video} poster={c.image} title={c.title+' video'}/></div>:null}
            </article>;
          })}
        </div>
      </div>
      <div className="coverflow-footer"><p aria-live="polite" aria-atomic="true">{current.title}</p>{items.length>1?<div className="coverflow-pagination" aria-label={labels.choose}>{items.map((c,i)=><button key={c.id} aria-label={labels.choose+' · '+c.title} aria-current={i===active?'true':undefined} onClick={()=>setSelected(i)}><span/></button>)}</div>:null}</div>
    </>:<p>{s.casesText}</p>}
  </section>;
}

export function CaseDetail({c,s,href,go,next,preview=false}){
  return <article className={'case-detail '+(preview?'case-detail-preview':'')}>
    <section className={'case-detail-hero '+(c.video?'has-video':'')}>{c.video?<CaseVideo key={c.video} className="case-hero-video" src={c.video} poster={c.image} title={c.title+' video'} continuous preview={preview}/>:<img src={c.image||asset('/assets/world.webp')} alt="" width="1920" height="1080"/>}<div className="case-detail-shade"/><div className="case-detail-heading">{!preview?<a href={href()+'#work'} className="case-back"><ArrowLeft size={18}/>{s.navCases}</a>:null}<h1>{c.title}</h1><p>{c.category}</p></div></section>
    <section className="case-story"><div className="case-story-heading"><h2>{c.storyTitle||c.title}</h2><p>{c.excerpt}</p></div>
      {c.facts?.length?<dl className="case-facts">{c.facts.map((f,i)=><div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>:null}
      {c.story?.length?<div className="case-story-grid">{c.story.map((block,i)=><section key={i}><h3>{block.title}</h3><p>{block.text}</p></section>)}</div>:<div className="case-legacy-body markdown"><Markdown>{c.body}</Markdown></div>}
      {c.metrics?.length?<div className="case-metrics">{c.metrics.map((m,i)=><div key={i}><strong>{m.value}</strong><p>{m.label}</p></div>)}</div>:null}
    </section>
    <div className="case-sections">{c.sections?.map((block,i)=><section key={i} className={'case-block case-block-'+block.type+(i%2?' alternate':'')}>
      {block.type==='image'?<><figure>{block.image?<img src={block.image} alt={block.title} width="1600" height="1000" loading="lazy"/>:null}{block.text?<figcaption>{block.text}</figcaption>:null}</figure>{block.title?<h2>{block.title}</h2>:null}</>:block.type==='video'?<>{block.title?<h2>{block.title}</h2>:null}{block.video?<video src={block.video} poster={block.image||undefined} preload="none" controls playsInline aria-label={block.title||c.title}/>:null}{block.text?<p>{block.text}</p>:null}</>:<>{block.type==='split'&&block.image?<img src={block.image} alt="" width="1000" height="1000" loading="lazy"/>:null}<div><h2>{block.title}</h2><div className="markdown"><Markdown>{block.text}</Markdown></div></div></>}
    </section>)}</div>
    {!preview?<div className="case-end"><a className="pill dark" href={href()+'#contact'}>{s.cta}<ArrowUpRight size={20}/></a>{next?<a className="case-next" href={href('/cases/'+next.slug)} onClick={e=>go(e,'/cases/'+next.slug)}><span>{s.navCases}</span><strong>{next.title}</strong><ArrowRight size={25}/></a>:null}</div>:null}
  </article>;
}

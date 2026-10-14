import React from 'react';
import Markdown from 'react-markdown';
import {asset} from './runtime';
import {ArrowUpRight,ArrowLeft,ArrowRight} from '@phosphor-icons/react';

export function CaseShowcase({items,s,href,go}){
  return <section className="case-showcase" id="work" aria-label={s.navCases}>
    {items.length?items.map((c,index)=><article className="case-scene" key={c.id}>
      <a className="case-scene-background" href={href('/cases/'+c.slug)} onClick={e=>go(e,'/cases/'+c.slug)} aria-label={c.title}><img src={c.image||asset('/assets/world.webp')} alt="" width="1920" height="1080" loading="lazy"/><span className="case-scene-shade"/></a>
      <div className="case-scene-top"><h2>{s.navCases}</h2><span>{c.category}</span></div>
      <div className="case-scene-bottom"><div className="case-scene-copy"><h3><a href={href('/cases/'+c.slug)} onClick={e=>go(e,'/cases/'+c.slug)}>{c.title}</a></h3><p>{c.excerpt}</p></div><div className={'case-scene-media '+(!c.video?'without-video':'')}>
        {c.video?<video src={c.video} poster={c.image||undefined} preload="none" controls playsInline aria-label={c.title+' video'}/>:null}
        <a className="case-more" href={href('/cases/'+c.slug)} onClick={e=>go(e,'/cases/'+c.slug)}>{s.readMore}<ArrowUpRight size={18}/></a>
      </div></div>
    </article>):<div className="section-pad"><h2>{s.casesTitle}</h2><p>{s.casesText}</p></div>}
  </section>;
}

export function CaseDetail({c,s,href,go,next,preview=false}){
  return <article className={'case-detail '+(preview?'case-detail-preview':'')}>
    <section className="case-detail-hero"><img src={c.image||asset('/assets/world.webp')} alt="" width="1920" height="1080"/><div className="case-detail-shade"/><div className="case-detail-heading">{!preview?<a href={href()+'#work'} className="case-back"><ArrowLeft size={18}/>{s.navCases}</a>:null}<h1>{c.title}</h1><p>{c.category}</p></div></section>
    <section className="case-story"><div className="case-story-heading"><h2>{c.storyTitle||c.title}</h2><p>{c.excerpt}</p></div>
      {c.facts?.length?<dl className="case-facts">{c.facts.map((f,i)=><div key={i}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>:null}
      {c.story?.length?<div className="case-story-grid">{c.story.map((block,i)=><section key={i}><h3>{block.title}</h3><p>{block.text}</p></section>)}</div>:<div className="case-legacy-body markdown"><Markdown>{c.body}</Markdown></div>}
      {c.metrics?.length?<div className="case-metrics">{c.metrics.map((m,i)=><div key={i}><strong>{m.value}</strong><p>{m.label}</p></div>)}</div>:null}
    </section>
    {c.video?<section className="case-feature-video"><video src={c.video} poster={c.image||undefined} preload="none" controls playsInline aria-label={c.title+' video'}/></section>:null}
    <div className="case-sections">{c.sections?.map((block,i)=><section key={i} className={'case-block case-block-'+block.type+(i%2?' alternate':'')}>
      {block.type==='image'?<><figure>{block.image?<img src={block.image} alt={block.title} width="1600" height="1000" loading="lazy"/>:null}{block.text?<figcaption>{block.text}</figcaption>:null}</figure>{block.title?<h2>{block.title}</h2>:null}</>:block.type==='video'?<>{block.title?<h2>{block.title}</h2>:null}{block.video?<video src={block.video} poster={block.image||undefined} preload="none" controls playsInline aria-label={block.title||c.title}/>:null}{block.text?<p>{block.text}</p>:null}</>:<>{block.type==='split'&&block.image?<img src={block.image} alt="" width="1000" height="1000" loading="lazy"/>:null}<div><h2>{block.title}</h2><div className="markdown"><Markdown>{block.text}</Markdown></div></div></>}
    </section>)}</div>
    {!preview?<div className="case-end"><a className="pill dark" href={href()+'#contact'}>{s.cta}<ArrowUpRight size={20}/></a>{next?<a className="case-next" href={href('/cases/'+next.slug)} onClick={e=>go(e,'/cases/'+next.slug)}><span>{s.navCases}</span><strong>{next.title}</strong><ArrowRight size={25}/></a>:null}</div>:null}
  </article>;
}

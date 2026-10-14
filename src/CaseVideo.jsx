import React,{useEffect,useRef} from 'react';

// Listing videos follow their viewport; detail videos keep playing while reading.
export default function CaseVideo({src,poster,title,continuous=false,preview=false,className=''}){
  const ref=useRef(null);
  useEffect(()=>{
    const video=ref.current;
    if(!video)return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer,disposed=false,visible=continuous;
    const sync=()=>{
      if(preview||preference.matches||!visible){video.pause();return;}
      video.play()?.then(()=>{if(disposed||!visible)video.pause();}).catch(()=>{/* Native controls remain available when autoplay is blocked. */});
    };
    if(!continuous&&'IntersectionObserver' in window){
      observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&entry.intersectionRatio>=.35;sync();},{threshold:[0,.35],rootMargin:'-90px 0px 0px 0px'});
      observer.observe(video);
    }else if(continuous)sync();
    preference.addEventListener('change',sync);
    return()=>{disposed=true;observer?.disconnect();preference.removeEventListener('change',sync);video.pause();};
  },[src,continuous,preview]);
  return <video ref={ref} className={className} src={src} poster={poster||undefined} muted loop playsInline controls preload="none" aria-label={title}/>;
}

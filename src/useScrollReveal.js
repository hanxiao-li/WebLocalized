import {useEffect} from 'react';

// Text remains visible if the observer or motion preference APIs are unavailable.
export function useScrollReveal(route,content){
  useEffect(()=>{
    if(!content||!('IntersectionObserver' in window))return;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets=[...document.querySelectorAll('.public-site main h1,.public-site main h2,.public-site main h3,.public-site main p,.public-site .case-facts>div,.public-site .case-metrics>div')].filter(el=>!el.closest('.hero,form,.coverflow-stage,.coverflow-footer')&&!el.matches('.case-metrics p'));
    let observer;
    const clear=()=>{observer?.disconnect();targets.forEach(el=>{el.classList.remove('scroll-reveal-ready','scroll-reveal-in');el.style.removeProperty('--reveal-delay');});};
    const setup=()=>{
      clear();if(preference.matches)return;
      observer=new IntersectionObserver(entries=>{
        entries.filter(entry=>entry.isIntersecting).forEach((entry,index)=>{
          entry.target.style.setProperty('--reveal-delay',Math.min(index*100,300)+'ms');
          entry.target.classList.remove('scroll-reveal-ready');entry.target.classList.add('scroll-reveal-in');observer.unobserve(entry.target);
        });
      },{threshold:0,rootMargin:'0px 0px -22% 0px'});
      targets.forEach(el=>{if(el.getBoundingClientRect().bottom>0){el.classList.add('scroll-reveal-ready');observer.observe(el);}});
    };
    setup();preference.addEventListener('change',setup);
    return()=>{clear();preference.removeEventListener('change',setup);};
  },[route,content]);
}

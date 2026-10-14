export const DEMO=import.meta.env?.VITE_DEMO==='true';
export const base=import.meta.env?.BASE_URL||'/';
export function pageHref(path='/',locale){
  if(!DEMO)return path+(locale?'?lang='+encodeURIComponent(locale):'');
  const query=new URLSearchParams();if(path!=='/')query.set('page',path);if(locale)query.set('lang',locale);
  return base+(query.size?'?'+query:'');
}
export function readLocation(){const url=new URL(location.href);if(DEMO){url.pathname=url.searchParams.get('page')||'/';url.searchParams.delete('page');}return url;}
export function asset(path){return path?.startsWith('/assets/')?base+path.slice(1):path;}

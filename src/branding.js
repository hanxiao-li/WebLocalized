import {asset} from './runtime';
export const defaultLogo=()=>asset('/assets/company-logo.png');
export function setFavicon(logo){
  let link=document.querySelector('link[rel="icon"]');
  if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link);}
  link.removeAttribute('type');link.href=logo||defaultLogo();
}

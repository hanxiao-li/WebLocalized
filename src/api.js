let csrf='';
export function setCsrf(value){csrf=value;}
export async function api(path,options={}){
  if(import.meta.env.VITE_DEMO==='true')return (await import('./demo')).demoApi(path,options);
  const {body,...rest}=options;
  const isForm=body instanceof FormData;
  const response=await fetch('/api'+path,{...rest,credentials:'same-origin',headers:{...(!isForm&&body?{'Content-Type':'application/json'}:{}),...(csrf?{'X-CSRF-Token':csrf}:{}),...rest.headers},body:body?(isForm?body:JSON.stringify(body)):undefined});
  const data=await response.json();if(!response.ok){const error=new Error(data.error||'请求失败');error.status=response.status;throw error;}return data;
}

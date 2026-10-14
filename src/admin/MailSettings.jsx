import React,{useEffect,useState} from 'react';
import {Button,Badge} from '@radix-ui/themes';
import {api} from '../api';
import {Field,Empty} from './Admin';

export default function MailSettings({notify}){
  const [config,setConfig]=useState(null),[busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[error,setError]=useState('');
  useEffect(()=>{api('/admin/mail-settings').then(setConfig).catch(e=>setError(e.message));},[]);
  async function save(e){
    e.preventDefault();setBusy(true);
    const form=e.currentTarget,values=Object.fromEntries(new FormData(form));
    try{setConfig(await api('/admin/mail-settings',{method:'PUT',body:{...values,enabled:values.enabled==='on',port:Number(values.port)}}));form.elements.password.value='';setDirty(false);notify('邮件通知设置已保存。');}catch(e){notify(e.message,true);}finally{setBusy(false);}
  }
  async function test(){setBusy(true);try{await api('/admin/mail-test',{method:'POST'});notify('测试邮件已交给邮件服务，请检查收件箱和垃圾邮件。');}catch(e){notify(e.message,true);}finally{setBusy(false);}}
  if(error)return <div className="admin-panel" role="alert">{error} 请刷新页面重试。</div>;
  if(!config)return <Empty>正在加载邮件设置…</Empty>;
  return <form className="admin-panel settings-panel" onSubmit={save} onChange={()=>setDirty(true)}><h2>客户咨询邮件通知</h2><Badge color={config.enabled?'green':'gray'}>{config.enabled?'通知已启用':'通知未启用'}</Badge><p>咨询始终保存在后台。启用后，客户的姓名、邮箱、公司和项目需求也会发送到下方接收邮箱。邮件失败不会影响咨询保存，可在客户咨询页重试。</p><fieldset disabled={busy} className="editor-fields"><label className="checkbox-label"><input type="checkbox" name="enabled" defaultChecked={config.enabled}/>启用咨询邮件通知</label><Field label="接收通知的邮箱"><input type="email" name="to" defaultValue={config.to} maxLength={200} autoComplete="email" placeholder="team@example.com"/></Field><details className="mail-server-fields" open={!config.configured}><summary>发件服务配置</summary><p>填写邮箱服务商提供的 SMTP 信息。通常需要先在邮箱设置中启用 SMTP，并生成授权码。</p><div className="form-grid"><Field label="SMTP 服务器"><input name="host" defaultValue={config.host} maxLength={253} placeholder="smtp.example.com" spellCheck={false}/></Field><Field label="加密连接"><select name="port" defaultValue={config.port}><option value="465">465 · SSL/TLS</option><option value="587">587 · STARTTLS</option></select></Field></div><Field label="发件邮箱"><input name="from" type="email" defaultValue={config.from} maxLength={200}/></Field><Field label="SMTP 登录账号"><input name="user" defaultValue={config.user} maxLength={200} autoComplete="off"/></Field><Field label="SMTP 授权码 / 应用密码" hint={config.configured?'留空保留原授权码；更换服务器或账号时需重新填写。':'加密保存在本机服务器，不会发送到网页前端。'}><input name="password" type="password" autoComplete="new-password" maxLength={1000}/></Field></details><div className="mail-actions"><Button type="submit" disabled={busy}>{busy?'正在处理…':'保存邮件设置'}</Button><Button type="button" variant="outline" disabled={busy||dirty||!config.enabled} onClick={test}>发送测试邮件</Button></div>{dirty?<p>请先保存设置，再发送测试邮件。</p>:null}</fieldset></form>;
}

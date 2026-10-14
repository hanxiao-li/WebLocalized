import nodemailer from 'nodemailer';
import {z} from 'zod';
import {seal,unseal} from './security.js';

export async function sendSmtp(config,message){
  const transport=nodemailer.createTransport({host:config.host,port:config.port,secure:config.port===465,requireTLS:true,auth:{user:config.user,pass:config.password},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});
  try{
    const result=await transport.sendMail({from:config.from,to:config.to,...message});
    if(!result.accepted?.length)throw new Error('Recipient rejected');
  }finally{transport.close();}
}

export function configureMail(app,s,allow,audit,sendMail=sendSmtp){
  s.db.exec("CREATE TABLE IF NOT EXISTS inquiry_mail(inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id),state TEXT NOT NULL,updated TEXT NOT NULL)");
  const pending=new Set();
  const publicConfig=()=>{const c=s.setting('mail',{});return {enabled:!!c.enabled,to:c.to||'',from:c.from||'',host:c.host||'',port:c.port||465,user:c.user||'',configured:!!c.password};};
  const credentials=()=>{const c=s.setting('mail',{});if(!c.enabled||!c.password)return null;return {...c,password:unseal(c.password,s.key)};};
  const status=(id,state)=>s.run('INSERT INTO inquiry_mail VALUES(?,?,?) ON CONFLICT(inquiry_id) DO UPDATE SET state=excluded.state,updated=excluded.updated',id,state,new Date().toISOString());
  const notifyInquiry=async inquiry=>{
    if(pending.has(inquiry.id))return;
    pending.add(inquiry.id);
    try{
      const config=credentials();if(!config){status(inquiry.id,'disabled');return;}
      status(inquiry.id,'pending');
      await sendMail(config,{subject:'网站收到新的客户咨询',replyTo:inquiry.email,text:`客户咨询编号：${inquiry.id}\n姓名：${inquiry.name}\n邮箱：${inquiry.email}\n公司：${inquiry.company||'未填写'}\n语言：${inquiry.locale}\n提交时间：${inquiry.created}\n\n项目需求：\n${inquiry.message}\n\n请登录网站后台查看和处理。`});
      status(inquiry.id,'sent');
    }catch{status(inquiry.id,'failed');}finally{pending.delete(inquiry.id);}
  };
  app.get('/api/admin/mail-settings',allow('settings'),(req,res)=>res.json(publicConfig()));
  app.put('/api/admin/mail-settings',allow('settings'),(req,res)=>{
    const b=z.object({enabled:z.boolean(),to:z.union([z.email().max(200),z.literal('')]),from:z.union([z.email().max(200),z.literal('')]),host:z.string().max(253).regex(/^[a-zA-Z0-9.-]*$/),port:z.union([z.literal(465),z.literal(587)]),user:z.string().max(200),password:z.string().max(1000).optional()}).parse(req.body);
    const old=s.setting('mail',{});
    if(b.enabled&&(!b.to||!b.from||!b.host||!b.user||!(b.password||old.password)))return res.status(400).json({error:'启用通知前请填写收件邮箱和完整发件服务配置。'});
    if(!b.password&&old.password&&(old.host!==b.host||old.user!==b.user))return res.status(400).json({error:'更换发件服务器或账号后，请重新输入授权码。'});
    s.set('mail',{...b,password:b.password?seal(b.password,s.key):old.password||''});audit(req,'更新咨询邮件通知','mail-settings');res.json(publicConfig());
  });
  app.post('/api/admin/mail-test',allow('settings'),async(req,res)=>{
    const config=credentials();if(!config)return res.status(400).json({error:'请先保存并启用邮件通知。'});
    try{await sendMail(config,{subject:'网站咨询邮件通知测试',text:'这是一封测试邮件。收到后说明当前收件邮箱可以接收网站咨询通知。'});res.json({ok:true});}
    catch{res.status(502).json({error:'邮件发送失败，请检查 SMTP 地址、授权码、发件邮箱与网络连接。'});}
  });
  app.post('/api/admin/inquiries/:id/mail-retry',allow('inquiries'),async(req,res)=>{
    const inquiry=s.get('SELECT * FROM inquiries WHERE id=?',req.params.id);
    if(!inquiry)return res.status(404).json({error:'咨询不存在。'});
    if(pending.has(inquiry.id))return res.status(409).json({error:'邮件正在发送，请稍后刷新。'});
    if(s.get('SELECT state FROM inquiry_mail WHERE inquiry_id=?',inquiry.id)?.state==='sent')return res.status(409).json({error:'此通知已交给邮件服务，无需重复发送。'});
    if(!credentials())return res.status(400).json({error:'请先在系统设置中启用邮件通知。'});
    await notifyInquiry(inquiry);audit(req,'重试咨询邮件通知',inquiry.id);res.json({ok:true,state:s.get('SELECT state FROM inquiry_mail WHERE inquiry_id=?',inquiry.id).state});
  });
  return notifyInquiry;
}

import {createApp} from './app.js';
import path from 'node:path';
import express from 'express';
import {readFileSync,existsSync} from 'node:fs';
const production=process.argv.includes('--production');
const {app,store}=createApp({production,dataDir:path.resolve(process.env.DATA_DIR||'data')});
if(production){
  app.use(express.static('dist',{index:false}));
  app.get('/{*path}',(req,res)=>{if(req.path.startsWith('/admin'))res.set('X-Robots-Tag','noindex, nofollow');res.sendFile(path.resolve('dist/index.html'));});
}else{
  const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'custom'});app.use(vite.middlewares);
  app.use(async(req,res,next)=>{if(req.method!=='GET')return next();try{res.type('html').send(await vite.transformIndexHtml(req.originalUrl,readFileSync('index.html','utf8')));}catch(e){vite.ssrFixStacktrace(e);next(e);}});
}
const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3000);
const server=app.listen(port,host,()=>{console.log(`Local: http://localhost:${port}\nAdmin: http://localhost:${port}/admin`);if(existsSync(store.setupPath))console.log('首次使用：打开后台，使用 data/setup-token.txt 中的口令创建管理员。');});
function stop(){server.close(()=>{store.db.close();process.exit(0);});}
process.on('SIGINT',stop);process.on('SIGTERM',stop);

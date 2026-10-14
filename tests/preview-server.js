// Isolated browser QA server. No QA accounts are created in the user's data directory.
import {createApp} from '../server/app.js';
import {hashPassword} from '../server/security.js';
import express from 'express';
import path from 'node:path';
const {app,store}=createApp({dataDir:path.resolve('test-results/browser-data'),origin:'http://localhost:3001',production:true});
if(!store.get('SELECT 1 FROM users WHERE id=?','qa'))store.run('INSERT INTO users VALUES(?,?,?,?,?,1)','qa','qa@example.test','测试管理员',await hashPassword('qa-browser-test-2026'),'owner');
app.use(express.static('dist',{index:false}));app.get('/{*path}',(req,res)=>res.sendFile(path.resolve('dist/index.html')));
app.listen(3001,'127.0.0.1',()=>console.log('QA preview: http://localhost:3001'));

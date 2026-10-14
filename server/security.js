import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash, createCipheriv, createDecipheriv } from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(scryptCallback);
export async function hashPassword(password){const salt=randomBytes(16).toString('hex');return salt+':'+Buffer.from(await scrypt(password,salt,64)).toString('hex');}
export async function checkPassword(password,stored){const [salt,hash]=stored.split(':');const candidate=Buffer.from(await scrypt(password,salt,64));return timingSafeEqual(candidate,Buffer.from(hash,'hex'));}
export const digest=value=>createHash('sha256').update(value).digest('hex');
export function seal(value,key){const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',key,iv);const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return [iv,cipher.getAuthTag(),encrypted].map(x=>x.toString('base64')).join('.');}
export function unseal(value,key){const [iv,tag,data]=value.split('.').map(x=>Buffer.from(x,'base64'));const cipher=createDecipheriv('aes-256-gcm',key,iv);cipher.setAuthTag(tag);return Buffer.concat([cipher.update(data),cipher.final()]).toString('utf8');}
export function cookieValue(req,name){const match=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));try{return match?decodeURIComponent(match.slice(name.length+1)):null;}catch{return null;}}
export const roles={owner:['read','write','publish','stats','users','settings','inquiries'],admin:['read','write','publish','stats','inquiries'],editor:['read','write'],analyst:['stats']};

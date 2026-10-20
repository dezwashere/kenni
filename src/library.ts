import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import * as Picker from 'expo-document-picker';
export type Book={id:string;title:string;uri:string;addedAt:number;position:number;duration?:number};
const KEY='kenni:books:v1';
export async function getBooks():Promise<Book[]>{try{return JSON.parse((await AsyncStorage.getItem(KEY))||'[]')}catch{return []}}
async function save(books:Book[]){await AsyncStorage.setItem(KEY,JSON.stringify(books))}
const mimeExtensions:Record<string,string>={
 'audio/aac':'aac','audio/flac':'flac','audio/m4a':'m4a','audio/mp4':'m4a','audio/mpeg':'mp3',
 'audio/mp3':'mp3','audio/ogg':'ogg','audio/opus':'opus','audio/wav':'wav','audio/wave':'wav',
 'audio/x-wav':'wav','audio/webm':'webm','audio/x-m4b':'m4b',
};
const allowed=['aac','flac','m4a','m4b','mp3','ogg','opus','wav','webm'];
const extensionOf=(name:string)=>name.split(/[?#]/)[0].split('.').pop()?.toLowerCase()||'';
const titleOf=(name:string)=>{const clean=name.replace(/\.[^.]+$/,'').replace(/[\\/:*?"<>|]/g,' ').trim();return clean||'Audiobook'};
async function store(uri:string,title:string,ext:string){const dir=FS.documentDirectory+'books/';if(!dir)throw Error('Device storage is unavailable');await FS.makeDirectoryAsync(dir,{intermediates:true});const id=Date.now()+'-'+Math.random().toString(36).slice(2);const dest=dir+id+'.'+ext;await FS.copyAsync({from:uri,to:dest});const book:Book={id,title,uri:dest,addedAt:Date.now(),position:0};await save([book,...await getBooks()]);return book}
export async function importBook(){const r=await Picker.getDocumentAsync({type:['audio/*','application/octet-stream'],copyToCacheDirectory:true});if(r.canceled||!r.assets?.[0])return null;const a=r.assets[0];const ext=extensionOf(a.name);const mime=(a.mimeType||'').toLowerCase();const resolved=mimeExtensions[mime]||ext;if(!resolved||(!allowed.includes(resolved)&&!mime.startsWith('audio/')))throw Error('Choose an audio file');return store(a.uri,titleOf(a.name),allowed.includes(resolved)?resolved:'mp3')}
export async function downloadBook(url:string){
 let u:URL;
 try { u=new URL(url); } catch { throw Error('Enter a valid HTTPS audio URL'); }
 if(u.protocol!=='https:')throw Error('HTTPS required');
 const dir=FS.documentDirectory+'books/';
 if(!dir)throw Error('Device storage is unavailable');
 await FS.makeDirectoryAsync(dir,{intermediates:true});
 const id=Date.now()+'-'+Math.random().toString(36).slice(2);
 const temp=dir+id+'.download';
 let final=temp;
 try {
  const r=await FS.downloadAsync(url,temp);
  if(r.status<200||r.status>=300)throw Error('Download failed: '+r.status);
  const fromUrl=extensionOf(u.pathname);
  const fromMime=mimeExtensions[(r.mimeType||'').toLowerCase()];
  const ext=fromMime||fromUrl;
  if(!ext||!allowed.includes(ext))throw Error('The URL did not return a supported audio file');
  final=dir+id+'.'+ext;
  await FS.moveAsync({from:temp,to:final});
 } catch(e) {
  await FS.deleteAsync(temp,{idempotent:true});
  if(final!==temp)await FS.deleteAsync(final,{idempotent:true});
  throw e;
 }
 const filename=decodeURIComponent(u.pathname.split('/').pop()||'');
 const b:Book={id,title:titleOf(filename),uri:final,addedAt:Date.now(),position:0};
 await save([b,...await getBooks()]);
 return b;
}
export async function updateProgress(id:string,position:number,duration?:number){
 const books=await getBooks();
 await save(books.map(b=>b.id===id?{...b,position:Math.max(0,position),...(duration!==undefined?{duration}: {})}:b));
}

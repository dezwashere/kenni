import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FS from 'expo-file-system/legacy';
import * as Picker from 'expo-document-picker';
export type Book={id:string;title:string;uri:string;addedAt:number;position:number;duration?:number};
const KEY='kenni:books:v1';
export async function getBooks():Promise<Book[]>{try{return JSON.parse((await AsyncStorage.getItem(KEY))||'[]')}catch{return []}}
async function save(books:Book[]){await AsyncStorage.setItem(KEY,JSON.stringify(books))}
async function store(uri:string,title:string,ext:string){const dir=FS.documentDirectory+'books/';await FS.makeDirectoryAsync(dir,{intermediates:true});const id=Date.now()+'-'+Math.random().toString(36).slice(2);const dest=dir+id+'.'+ext;await FS.copyAsync({from:uri,to:dest});const book:Book={id,title,uri:dest,addedAt:Date.now(),position:0};await save([book,...await getBooks()]);return book}
const allowed=['mp3','m4a','m4b','aac','wav','ogg','flac'];
export async function importBook(){const r=await Picker.getDocumentAsync({type:['audio/*','application/octet-stream'],copyToCacheDirectory:true});if(r.canceled||!r.assets?.[0])return null;const a=r.assets[0];const ext=(a.name.split('.').pop()||'').toLowerCase();if(!allowed.includes(ext))throw Error('Unsupported audio file');return store(a.uri,a.name.replace(/\.[^.]+$/,''),ext)}
export async function downloadBook(url:string){const u=new URL(url);if(u.protocol!=='https:')throw Error('HTTPS required');const ext=(u.pathname.split('.').pop()||'').toLowerCase();if(!allowed.includes(ext))throw Error('Direct audio file URL required');const dir=FS.documentDirectory+'books/';await FS.makeDirectoryAsync(dir,{intermediates:true});const id=Date.now()+'-'+Math.random().toString(36).slice(2);const dest=dir+id+'.'+ext;try{const r=await FS.downloadAsync(url,dest);if(r.status<200||r.status>=300)throw Error('Download failed: '+r.status)}catch(e){await FS.deleteAsync(dest,{idempotent:true});throw e}const title=decodeURIComponent(u.pathname.split('/').pop()||'Book').replace(/\.[^.]+$/,'');const b:Book={id,title,uri:dest,addedAt:Date.now(),position:0};await save([b,...await getBooks()]);return b}
export async function updateProgress(id:string,position:number,duration?:number){await save((await getBooks()).map(b=>b.id===id?{...b,position,duration}:b))}

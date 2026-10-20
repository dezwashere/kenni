import React,{useCallback,useState} from 'react';
import {View,Text,TextInput,Pressable,FlatList,Alert,StyleSheet,ScrollView} from 'react-native';
import {useFocusEffect,router} from 'expo-router';
import {Book,getBooks,importBook,downloadBook} from '../src/library';
import {PdfBook,getPdfBooks,importPdf} from '../src/pdfLibrary';
export default function Library(){
 const [books,setBooks]=useState<Book[]>([]);const [pdfs,setPdfs]=useState<PdfBook[]>([]);
 const [url,setUrl]=useState('');const [busy,setBusy]=useState(false);
 const refresh=async()=>{const [audio,pdf]=await Promise.all([getBooks(),getPdfBooks()]);setBooks(audio);setPdfs(pdf)};
 useFocusEffect(useCallback(()=>{refresh()},[]));
 async function run(f:()=>Promise<unknown>){setBusy(true);try{await f();await refresh()}catch(e){Alert.alert('kenni',String(e))}finally{setBusy(false)}}
 return <ScrollView style={s.page} contentContainerStyle={{paddingBottom:80}}>
 <Text style={s.heading}>kenni</Text><Text style={s.sub}>Your books. Your way.</Text>
 <Pressable style={s.button} disabled={busy} onPress={()=>run(importPdf)}><Text style={s.primaryText}>+ Import PDF book</Text></Pressable>
 <Pressable style={s.buttonOutline} disabled={busy} onPress={()=>run(importBook)}><Text style={s.buttonText}>+ Import audiobook</Text></Pressable>
 <TextInput style={s.input} autoCapitalize="none" keyboardType="url" placeholder="Direct HTTPS audio URL" placeholderTextColor="#555" value={url} onChangeText={setUrl}/>
 <Pressable style={s.buttonOutline} disabled={busy||!url.trim()} onPress={()=>run(async()=>{await downloadBook(url.trim());setUrl('')})}><Text style={s.buttonText}>{busy?'Working…':'Download audiobook'}</Text></Pressable>
 <Text style={s.section}>PDF books ({pdfs.length})</Text>
 {pdfs.length===0?<Text style={s.sub}>Import a PDF to read it offline.</Text>:pdfs.map(item=><Pressable key={item.id} style={s.item} onPress={()=>router.push({pathname:'/pdf',params:{id:item.id}})}><Text style={s.itemTitle}>{item.title}</Text><Text>Page {item.pageIndex+1} · PDF</Text></Pressable>)}
 <Text style={s.section}>Audiobooks ({books.length})</Text>
 {books.length===0?<Text style={s.sub}>No audiobooks yet.</Text>:books.map(item=><Pressable key={item.id} style={s.item} onPress={()=>router.push({pathname:'/player',params:{id:item.id}})}><Text style={s.itemTitle}>{item.title}</Text><Text>{item.position?Math.floor(item.position/60)+' min listened':'Not started'}</Text></Pressable>)}
 </ScrollView>
}
const s=StyleSheet.create({page:{flex:1,backgroundColor:'#FFD500',padding:24,paddingTop:55},heading:{color:'#111',fontSize:46,fontWeight:'900'},sub:{color:'#333',marginTop:6},button:{backgroundColor:'#111',padding:16,borderRadius:12,marginTop:18},buttonOutline:{borderWidth:2,borderColor:'#111',padding:14,borderRadius:12,marginTop:12},buttonText:{color:'#111',fontWeight:'800',textAlign:'center'},primaryText:{color:'#FFD500',fontWeight:'800',textAlign:'center'},input:{backgroundColor:'#FFF4A0',color:'#111',borderRadius:12,padding:14,marginTop:18},section:{color:'#111',fontSize:22,fontWeight:'900',marginTop:30,marginBottom:12},item:{backgroundColor:'#FFF4A0',padding:18,borderRadius:12,marginBottom:10},itemTitle:{color:'#111',fontSize:17,fontWeight:'800',marginBottom:4}})

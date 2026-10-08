import {useMemo,useState} from 'react';
import {Linking,TextInput,View} from 'react-native';
import {resources} from '../../lib/content';
import type {Resource} from '../../lib/types';
import {Button,Eyebrow,Icon,inputStyle,Panel,Screen,Tag,Txt,usePalette,useWide,dark} from '../../components/ui';
import {MotionPress,Morph,Reveal} from '../../components/motion';
import {Segments} from '../../components/workshop';
function ResourceCard({resource:r,onOpen}:{resource:Resource;onOpen:(url:string)=>void}) {
 const c=usePalette(),wide=useWide(),[expanded,setExpanded]=useState(false),types=['course','book','paper','video'],i=Math.max(0,types.indexOf(r.type)),tints=c===dark?['#191919','#202020','#181818','#242424']:['#E6E6E6','#EEEEEE','#E2E2E2','#F0F0F0'];
 return <Morph style={{width:wide?'48.9%':'100%'}}><Panel style={{padding:0,overflow:'hidden',gap:0}}><View style={{backgroundColor:tints[i],padding:22,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:c.line}}><View style={{gap:4}}><Txt size={11} weight="700" color={c.muted} style={{letterSpacing:2}}>{r.type.toUpperCase()} / {r.id}</Txt><Txt size={17} weight="500">{['A guided way in.','Room for deep thought.','An idea worth testing.','See it, then build it.'][i]}</Txt></View><Icon name={['school-outline','book-outline','document-text-outline','play-circle-outline'][i]} size={32}/></View><View style={{padding:22,gap:16}}><MotionPress accessibilityRole="button" accessibilityLabel={`Open ${r.title}`} onPress={()=>onOpen(r.url)} style={{gap:10,minHeight:70}}><Txt size={21} weight="600">{r.title}</Txt><Txt size={12} color={c.muted}>{[r.language,r.modules].filter(Boolean).join(' · ')}</Txt></MotionPress><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12}}><MotionPress accessibilityRole="button" accessibilityLabel={`Explore ${r.title}`} onPress={()=>onOpen(r.url)} style={{minHeight:44,flexDirection:'row',gap:8,alignItems:'center'}}><Txt size={14} color={c.accent} weight="600">Explore</Txt><Icon name="arrow-up-outline" size={17} color={c.accent}/></MotionPress>{r.notes&&<MotionPress accessibilityRole="button" accessibilityLabel={`${expanded?'Hide':'Show'} details for ${r.title}`} accessibilityState={{expanded}} onPress={()=>setExpanded(v=>!v)} style={{minHeight:44,minWidth:44,alignItems:'center',justifyContent:'center',borderRadius:22,backgroundColor:c.bg}}><Icon name={expanded?'minus':'plus'} size={18}/></MotionPress>}</View>{expanded&&<Reveal><Txt size={14} color={c.muted}>{r.notes}</Txt></Reveal>}{r.video&&<Tag text="Open video playlist" onPress={()=>onOpen(r.video!)}/>}</View></Panel></Morph>;
}
export default function Library(){
 const c=usePalette(),[query,setQuery]=useState(''),[filter,setFilter]=useState(0),[limit,setLimit]=useState(12),[error,setError]=useState(''),types=['all','course','book','paper','video'];
 const selectedType=types[filter];
 const items=useMemo(()=>resources.filter(r=>(filter===0||r.type===selectedType)&&`${r.title} ${r.notes??''} ${r.modules??''}`.toLowerCase().includes(query.toLowerCase())),[query,filter,selectedType]);
 const open=async(url:string)=>{try{await Linking.openURL(url);}catch{setError('Could not open this resource. Check your internet connection.');}};
 return <Screen title="The curiosity shelf." subtitle="Collected for the things you want to understand, build, and question.">
  <View style={{gap:16}}><View style={{position:'relative'}}><TextInput accessibilityLabel="Search resources" placeholder="Pull on a thread. Python, agents, Karpathy…" placeholderTextColor={c.muted} value={query} onChangeText={v=>{setQuery(v);setLimit(12);}} style={[inputStyle(c),{paddingLeft:52,borderRadius:20}]}/><View pointerEvents="none" style={{position:'absolute',left:18,top:16}}><Icon name="search-outline" color={c.muted}/></View></View><Segments options={['All','Courses','Books','Papers','Videos']} value={filter} onChange={v=>{setFilter(v);setLimit(12);}}/></View>
  {!!error&&<Txt color={c.danger}>{error}</Txt>}<Eyebrow>{items.length} RESOURCES / CHOOSE A THREAD</Eyebrow>
  <Reveal identity={`${filter}-${query}`}><View style={{flexDirection:'row',flexWrap:'wrap',gap:16,alignItems:'flex-start'}}>{items.slice(0,limit).map(r=><ResourceCard key={r.id} resource={r} onOpen={url=>void open(url)}/>)}</View></Reveal>
  {items.length>limit&&<Button title={`Explore more · ${items.length-limit} remaining`} secondary onPress={()=>setLimit(v=>v+12)} icon="plus"/>}
  {!items.length&&<Panel><Icon name="search-outline" size={32}/><Txt size={22} weight="600">Try another thread.</Txt><Txt color={c.muted}>Search for Python, RAG or CampusX, or switch to All.</Txt></Panel>}
  <Txt size={13} color={c.muted}>Original sources, opened in your browser. Your notes stay in your workshop.</Txt>
 </Screen>;
}

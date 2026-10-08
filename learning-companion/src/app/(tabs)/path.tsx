import {useState} from 'react';
import {View} from 'react-native';
import {router} from 'expo-router';
import {Eyebrow,Icon,Meter,Panel,Row,Screen,Txt,usePalette,useWide,dark} from '../../components/ui';
import {MotionPress,Reveal} from '../../components/motion';
import {conceptCount,modules,phases,topicId} from '../../lib/content';
import {useLearning} from '../../lib/store';
export default function Path(){
 const {state}=useLearning(),c=usePalette(),wide=useWide(),[chapter,setChapter]=useState(0),phase=phases[chapter];
 const colors=c===dark?['#191919','#202020','#181818','#242424']:['#E6E6E6','#EEEEEE','#E2E2E2','#F0F0F0'];
 return <Screen title="Follow the connections." subtitle="Every big idea has a few smaller ones underneath it. Start there.">
  <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12}}><Eyebrow>YOUR ATLAS / {modules.length} MODULES</Eyebrow><Txt size={13} color={c.muted}>{conceptCount} concepts to connect</Txt></View>
  <View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{phases.map((p,i)=><MotionPress key={p.title} accessibilityRole="button" accessibilityLabel={`Chapter ${i+1}: ${p.title}`} accessibilityState={{selected:chapter===i}} onPress={()=>setChapter(i)} style={{width:wide?'24.1%':'48%',minHeight:wide?220:172,padding:wide?24:18,backgroundColor:colors[i],borderRadius:24,borderWidth:chapter===i?2:1,borderColor:chapter===i?c.accent:c.line,justifyContent:'space-between',gap:16}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Txt size={wide?44:32} weight="500">{String(i+1).padStart(2,'0')}</Txt><Icon name={['code-slash-outline','bulb-outline','layers-outline','flask'][i]} size={25}/></View><View style={{gap:6}}><Txt size={wide?20:16} weight="600">{p.title}</Txt><Txt size={12} color={c.muted}>{p.ids.length} modules {chapter===i?'· Exploring':''}</Txt></View></MotionPress>)}</View>
  <Reveal identity={String(chapter)} style={{flexDirection:wide?'row':'column',gap:28}}><View style={{width:wide?260:undefined,gap:12,paddingTop:12}}><Eyebrow>CHAPTER {String(chapter+1).padStart(2,'0')}</Eyebrow><Txt size={30} weight="600">{phase.title}</Txt><Txt size={15} color={c.muted}>{phase.caption}</Txt><View style={{height:1,backgroundColor:c.line,marginVertical:8}}/><Txt size={13} color={c.muted}>Open any module to look around. Complete its foundations before recording progress.</Txt></View><Panel style={{flex:wide?1:undefined,paddingVertical:8}}>{modules.filter(m=>phase.ids.includes(m.id)).map(m=>{const ids=m.groups.flatMap((g,gi)=>g.topics.map((_,ti)=>topicId(m.id,gi,ti))),n=ids.filter(id=>state.topics[id]).length,ready=m.prerequisites.every(id=>state.verified[id]);return <View key={m.id}><Row title={m.title} subtitle={`${n}/${ids.length} studied · ~${m.hours} h${state.verified[m.id]?' · Assessed':!ready?' · Preview':''}`} leading={m.id.slice(1)} trailing={<Icon name={state.verified[m.id]?'checkmark-circle-outline':ready?'chevron-forward':'lock-closed-outline'} size={19} color={c.accent}/>} onPress={()=>router.push(`/module/${m.id}`)}/>{n>0&&<View style={{paddingVertical:12}}><Meter value={n/ids.length} label={`${m.title} studied`}/></View>}</View>;})}</Panel></Reveal>
  <Txt color={c.muted} size={13}>Learn the ideas, then choose the tools. Hours are estimates. Assessments check what you can explain and build.</Txt>
 </Screen>;
}

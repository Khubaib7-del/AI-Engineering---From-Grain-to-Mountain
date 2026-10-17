import {useState} from 'react';
import {Linking,View} from 'react-native';
import type {StudyGuide as Guide} from '../lib/types';
import {Button,Panel,Section,Txt,usePalette} from './ui';
export function StudyGuide({guide}:{guide:Guide}) {
 const c=usePalette(),[expanded,setExpanded]=useState(false),[error,setError]=useState('');
 const open=(url:string)=>{void Linking.openURL(url).catch(()=>setError('Could not open this resource. Check your connection.'));};
 return <Panel><Section title="Your guided route"/><Txt size={14} color={c.muted}>Three small steps, in order. Extra explanations stay optional.</Txt><Txt>{guide.assignment}</Txt><View style={{gap:10}}>{[{label:'01 / LEARN',link:guide.primary},{label:'02 / READ',link:guide.reading},{label:'03 / PRACTICE',link:guide.practice}].map(step=><View key={step.label} style={{gap:5}}><Txt size={11} weight="700" color={c.muted}>{step.label}</Txt><Button secondary title={step.link.title} icon="open-outline" onPress={()=>open(step.link.url)}/></View>)}</View><Txt size={14} weight="600">Move on when you can:</Txt><Txt size={14} color={c.muted}>{guide.finish}</Txt>{guide.optional.length>0&&<><Button secondary title={expanded?'Hide optional explanations':'Optional explanations — only if stuck'} onPress={()=>setExpanded(v=>!v)}/>{expanded&&<View style={{gap:12}}><Txt size={14} color={c.muted}>Choose one explanation only if a specific idea is still unclear.</Txt>{guide.optional.map(r=><Button key={r.url} secondary title={r.title} onPress={()=>open(r.url)}/>)}</View>}</>}<Txt size={12} color={c.muted}>{guide.access}</Txt>{!!error&&<Txt accessibilityLiveRegion="polite" color={c.danger}>{error}</Txt>}</Panel>;
}

import {useState} from 'react';
import {Linking,View} from 'react-native';
import type {StudyGuide as Guide} from '../lib/types';
import {Button,Panel,Section,Txt,usePalette} from './ui';
export function StudyGuide({guide}:{guide:Guide}) {
 const c=usePalette(),[expanded,setExpanded]=useState(false),[error,setError]=useState('');
 const open=(url:string)=>{void Linking.openURL(url).catch(()=>setError('Could not open this resource. Check your connection.'));};
 return <Panel><Section title="Your guided route"/><Txt size={14} color={c.muted}>One main resource. The other explanations are optional.</Txt><Txt weight="600">{guide.primary.title}</Txt><Txt>{guide.assignment}</Txt><Button title="Start this module" icon="open-outline" onPress={()=>open(guide.primary.url)}/><Button secondary title={`Read: ${guide.reading.title}`} onPress={()=>open(guide.reading.url)}/><Txt size={14} weight="600">Move on when you can:</Txt><Txt size={14} color={c.muted}>{guide.finish}</Txt>{guide.optional.length>0&&<><Button secondary title={expanded?'Hide optional explanations':'Optional explanations — only if stuck'} onPress={()=>setExpanded(v=>!v)}/>{expanded&&<View style={{gap:12}}><Txt size={14} color={c.muted}>Pick one explanation for the topic you need. You do not need to complete these extra playlists.</Txt>{guide.optional.map(r=><Button key={r.url} secondary title={r.title} onPress={()=>open(r.url)}/>)}</View>}</>}<Txt size={12} color={c.muted}>{guide.access}</Txt>{!!error&&<Txt accessibilityLiveRegion="polite" color={c.danger}>{error}</Txt>}</Panel>;
}

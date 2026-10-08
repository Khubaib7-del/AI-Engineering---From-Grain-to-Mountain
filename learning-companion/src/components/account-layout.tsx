import type {ReactNode} from 'react';
import {Platform,Pressable,ScrollView,View} from 'react-native';
import {router} from 'expo-router';
import {BrandMark} from './brand';
import {Screen,Txt,usePalette,useWide} from './ui';
import {useLearning} from '../lib/store';
export function AccountLayout({title,subtitle,children}:{title:string;subtitle:string;children:ReactNode}){
 const c=usePalette(),wide=useWide(),{error,notice,dismiss}=useLearning();
 if(Platform.OS!=='web')return <Screen back action={false} title={title} subtitle={subtitle}>{children}</Screen>;
 return <ScrollView keyboardShouldPersistTaps="handled" style={{flex:1,backgroundColor:c.bg}} contentContainerStyle={{width:'100%',maxWidth:1320,alignSelf:'center',paddingHorizontal:wide?56:24,paddingTop:28,paddingBottom:48,gap:wide?72:36}}>
 <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:20}}><Pressable accessibilityRole="link" accessibilityLabel="Grain to Mountain homepage" onPress={()=>router.push('/')} style={{flexDirection:'row',gap:12,alignItems:'center',minHeight:44}}><BrandMark size={30} color={c.ink}/><Txt size={14} weight="700">GRAIN / MOUNTAIN</Txt></Pressable><Pressable accessibilityRole="link" onPress={()=>router.push('/today')} style={{minHeight:44,justifyContent:'center'}}><Txt size={14} color={c.muted}>Explore the workspace ↗</Txt></Pressable></View>
 <View style={{flexDirection:wide?'row':'column',gap:wide?96:32,alignItems:'flex-start'}}>
 {wide&&<View style={{flex:1,paddingTop:48,gap:32}}><Txt size={12} color={c.muted} style={{letterSpacing:2}}>YOUR NEXT CHAPTER</Txt><Txt size={64} weight="600">A little further.{`\n`}Every day.</Txt><Txt size={19} color={c.muted} style={{maxWidth:400}}>A place for your curiosity, your experiments, and the things you can now explain.</Txt><View style={{gap:20,borderTopWidth:1,borderColor:c.line,paddingTop:28}}>{[['01','One clear next step'],['02','Your learning, at your pace'],['03','A notebook that grows with you']].map(([number,label])=><View key={number} style={{flexDirection:'row',gap:18}}><Txt size={13} color={c.muted}>{number}</Txt><Txt size={15}>{label}</Txt></View>)}</View><BrandMark size={150} color={c.line}/></View>}
 <View style={{width:'100%',maxWidth:wide?440:undefined,flexShrink:1,gap:24,paddingTop:wide?48:0}}><View style={{gap:12}}><Txt size={wide?32:30} weight="600" accessibilityRole="header">{title}</Txt><Txt size={15} color={c.muted}>{subtitle}</Txt></View>{!!(error||notice)&&<Pressable accessibilityRole="button" accessibilityLabel="Dismiss notebook message" onPress={dismiss} style={{padding:16,borderWidth:1,borderColor:error?c.danger:c.line,borderRadius:16}}><Txt size={14} color={error?c.danger:c.ink}>{error||notice}</Txt></Pressable>}{children}</View>
 </View><View style={{borderTopWidth:1,borderColor:c.line,paddingTop:24,flexDirection:'row',justifyContent:'space-between',gap:16,flexWrap:'wrap'}}><Txt size={12} color={c.muted}>Small steps. Serious depth.</Txt><Pressable accessibilityRole="link" onPress={()=>router.push('/privacy')} style={{minHeight:44}}><Txt size={12} color={c.muted}>Privacy & your data</Txt></Pressable></View>
 </ScrollView>;
}

import {Tabs} from 'expo-router';
import {View} from 'react-native';
import type {ComponentProps} from 'react';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Glass,Icon,Txt,usePalette} from '../../components/ui';
import {MotionPress,SlidingSelection} from '../../components/motion';
type BottomTabBarProps=Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];
function WorkshopDock({state,descriptors,navigation}:BottomTabBarProps) {
 const c=usePalette(),insets=useSafeAreaInsets(),icons=['sunny-outline','map-outline','book-outline','stats-chart-outline'];
 return <View pointerEvents="box-none" style={{position:'absolute',bottom:Math.max(16,insets.bottom),left:16,right:16,alignItems:'center'}}><Glass style={{width:'100%',maxWidth:520,borderRadius:28,padding:4}}><SlidingSelection index={state.index} count={state.routes.length} color={c.soft}/><View style={{flexDirection:'row'}}>{state.routes.map((route,i)=>{const selected=i===state.index,options=descriptors[route.key].options;return <MotionPress key={route.key} accessibilityRole="tab" accessibilityLabel={options.title??route.name} accessibilityState={{selected}} onPress={()=>{const event=navigation.emit({type:'tabPress',target:route.key,canPreventDefault:true});if(!selected&&!event.defaultPrevented)navigation.navigate(route.name,route.params);}} onLongPress={()=>navigation.emit({type:'tabLongPress',target:route.key})} style={{flex:1,minHeight:60,alignItems:'center',justifyContent:'center',gap:5}}><Icon name={icons[i]} color={selected?c.accent:c.muted} size={21}/><Txt size={11} weight="600" color={selected?c.accent:c.muted}>{options.title}</Txt></MotionPress>;})}</View></Glass></View>;
}
export default function TabLayout(){return <Tabs tabBar={props=><WorkshopDock {...props}/>} screenOptions={{headerShown:false}}><Tabs.Screen name="today" options={{title:'Today'}}/><Tabs.Screen name="path" options={{title:'Path'}}/><Tabs.Screen name="library" options={{title:'Library'}}/><Tabs.Screen name="progress" options={{title:'Progress'}}/></Tabs>;}


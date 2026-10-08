import React, {useEffect, useState} from 'react';
import {AccessibilityInfo, Pressable, View, type PressableProps, type StyleProp, type ViewStyle} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring, withTiming, FadeIn, FadeInDown, LinearTransition} from 'react-native-reanimated';
export const spring = {stiffness:380,damping:30,mass:.7};
export function useReduced() {
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);const sub=AccessibilityInfo.addEventListener('reduceMotionChanged',setReduced);return ()=>sub.remove();},[]);
  return reduced;
}
const AnimatedPressable=Animated.createAnimatedComponent(Pressable);
export function MotionPress({children,style,disabled,onPressIn,onPressOut,onHoverIn,onHoverOut,...props}:Omit<PressableProps,'style'|'children'> & {children:React.ReactNode;style?:StyleProp<ViewStyle>}) {
  const reduced=useReduced(),scale=useSharedValue(1),lift=useSharedValue(0);
  const animated=useAnimatedStyle(()=>({transform:[{scale:scale.get()},{translateY:lift.get()}]}));
  useEffect(()=>{if(reduced){scale.set(1);lift.set(0);}},[reduced,scale,lift]);
  return <AnimatedPressable {...props} disabled={disabled} onPressIn={e=>{if(!reduced)scale.set(withSpring(.97,spring));onPressIn?.(e);}} onPressOut={e=>{scale.set(withSpring(1,spring));onPressOut?.(e);}} onHoverIn={e=>{if(!reduced&&!disabled)lift.set(withSpring(-2,spring));onHoverIn?.(e);}} onHoverOut={e=>{lift.set(withSpring(0,spring));onHoverOut?.(e);}} style={[style,animated]}>{children}</AnimatedPressable>;
}
export function Reveal({children,identity,style}:{children:React.ReactNode;identity?:string;style?:StyleProp<ViewStyle>}) {
  const reduced=useReduced();return <Animated.View key={identity} entering={reduced?FadeIn.duration(80):FadeInDown.duration(240)} style={style}>{children}</Animated.View>;
}
export function Morph({children,style}:{children:React.ReactNode;style?:StyleProp<ViewStyle>}) { const reduced=useReduced();return <Animated.View layout={reduced?undefined:LinearTransition.duration(220)} style={style}>{children}</Animated.View>; }
export function SlidingSelection({index,count,color}:{index:number;count:number;color:string}) {
  const [width,setWidth]=useState(0),x=useSharedValue(0),reduced=useReduced();
  useEffect(()=>{x.set(reduced?index*width/count:withSpring(index*width/count,spring));},[index,width,count,reduced,x]);
  const style=useAnimatedStyle(()=>({transform:[{translateX:x.get()}]}));
  return <View pointerEvents="none" onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{position:'absolute',top:4,bottom:4,left:4,right:4}}><Animated.View testID="sliding-selection" style={[{width:width/count,height:'100%',borderRadius:22,backgroundColor:color},style]}/></View>;
}
export function MovingProgress({value,color,track}:{value:number;color:string;track:string}) { const [width,setWidth]=useState(0),progress=useSharedValue(value),reduced=useReduced();useEffect(()=>{progress.set(reduced?value:withTiming(value,{duration:350}));},[value,reduced,progress]);const style=useAnimatedStyle(()=>({width:width*Math.max(0,Math.min(1,progress.get()))}));return <View onLayout={e=>setWidth(e.nativeEvent.layout.width)} style={{height:6,borderRadius:6,backgroundColor:track,overflow:'hidden'}}><Animated.View style={[{height:6,borderRadius:6,backgroundColor:color},style]}/></View>; }

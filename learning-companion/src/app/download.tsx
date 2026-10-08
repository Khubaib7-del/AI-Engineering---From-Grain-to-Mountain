import {Linking,View} from 'react-native';
import {router} from 'expo-router';
import {useState} from 'react';
import {Button,Panel,Screen,Txt,usePalette} from '../components/ui';
const apk='https://github.com/Khubaib7-del/AI-Engineering---From-Grain-to-Mountain/releases/download/v1.0.0-preview.1/AI-Learning-1.0.0-android-arm64.apk';
export default function Download(){const c=usePalette(),[error,setError]=useState('');return <Screen back title="Take the next step with you." subtitle="One learning path. Choose where you work." action={false}>
 <Panel><Txt size={26} weight="600">Android</Txt><Txt color={c.muted}>Personal preview · Android 7.0+ · ARM64 · 48 MB</Txt><Txt>The current 1.0 preview keeps progress on your phone. Account sync will require a newer app build.</Txt><Button title="Download Android APK" icon="arrow-forward" onPress={()=>{void Linking.openURL(apk).catch(()=>setError('Could not open the download. Try again.'));}}/><Txt size={13} color={c.muted}>Open the downloaded file in Files to install. This preview is test-signed and is not a Google Play release.</Txt></Panel>
 <Panel><View style={{gap:8}}><Txt size={26} weight="600">iPhone & iPad</Txt><Txt color={c.muted}>Coming soon</Txt></View><Txt>The iOS app needs a signed build and device testing. You can use the web app on your iPhone today.</Txt><Button title="Open learning app" secondary onPress={()=>router.push('/today')}/></Panel>
 {!!error&&<Txt accessibilityRole="alert">{error}</Txt>}
 </Screen>;}

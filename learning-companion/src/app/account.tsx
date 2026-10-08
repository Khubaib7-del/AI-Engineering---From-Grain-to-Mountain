import {useState} from 'react';
import {TextInput,View,Pressable} from 'react-native';
import {router} from 'expo-router';
import {Button,Panel,Txt,inputStyle,usePalette} from '../components/ui';
import {AccountLayout} from '../components/account-layout';
import {useAuth} from '../lib/auth';
import {supabase,accountRedirect} from '../lib/supabase';
import {useLearning} from '../lib/store';
export default function Account(){
 const c=usePalette(),auth=useAuth(),learning=useLearning();
 const [mode,setMode]=useState<'signin'|'signup'|'reset'>('signin'),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[confirm,setConfirm]=useState(false);
 const [showPassword,setShowPassword]=useState(false);
 const run=async(action:()=>Promise<void>)=>{setBusy(true);setMessage('');try{await action();}catch(e){setMessage(e instanceof Error?e.message:'The request failed. Please try again.');}finally{setBusy(false);}};
 const submit=()=>run(async()=>{
  if(!supabase)throw new Error('Accounts are not connected yet. Your local notebook still works.');
  if(auth.recovery){if(password.length<8)throw new Error('Use at least 8 characters.');const {error}=await supabase.auth.updateUser({password});if(error)throw error;auth.finishRecovery();setPassword('');setMessage('Password updated.');return;}
  if(!/^\S+@\S+\.\S+$/.test(email.trim()))throw new Error('Enter a valid email address.');
  if(mode==='reset'){const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:accountRedirect});if(error)throw error;setMessage('If an account exists, a password reset link will arrive by email.');return;}
  if(password.length<8)throw new Error('Use at least 8 characters.');
  if(mode==='signup'){const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{emailRedirectTo:accountRedirect}});if(error)throw error;setPassword('');if(data.session)router.replace('/today');else setMessage('Check your email to confirm your account, then sign in.');}
  else{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;setPassword('');router.replace('/today');}
 });
 return <AccountLayout title={auth.session&&!auth.recovery?'Your account':auth.recovery?'Choose a new password':mode==='signup'?'Create your account':mode==='reset'?'Reset your password':'Welcome back'} subtitle={mode==='signup'?'Start a notebook for your learning journey.':'Pick up your learning where you left off.'}>
 {!supabase&&<Panel><Txt weight="600">Accounts are being connected</Txt><Txt>The sign-in service is not configured yet. Continue with your local notebook; existing progress is preserved.</Txt><Button title="Continue locally" onPress={()=>router.replace('/today')}/></Panel>}
 {!!auth.error&&<Txt accessibilityRole="alert">{auth.error}</Txt>}
 {!!supabase&&!auth.session&&<Txt size={13} color={c.muted}>Sign in to sync your notebook across browsers. You can also start locally; guest progress stays on this device until you choose to import it.</Txt>}
 {auth.session&&!auth.recovery?<>
 <Panel><Txt weight="600">{auth.session.user.email}</Txt><Txt>Sync: {({local:'Local notebook',syncing:'Connecting…',synced:'Up to date',pending:'Waiting to sync — local changes are saved',conflict:'Changes found on another device'})[learning.syncStatus]}</Txt><Button title="Sync now" disabled={busy||learning.syncStatus==='syncing'} onPress={()=>void learning.syncNow()}/><Txt size={13} color={c.muted}>Progress syncs after edits and checks for updates every 30 seconds. Reminder settings stay on this device.</Txt></Panel>
 {learning.syncStatus==='conflict'&&<Panel><Txt weight="600">Choose the notebook to continue with</Txt><Txt>Both devices changed since the last sync. Export a backup from Progress first. Choosing one version replaces the other; both snapshots are also preserved in local recovery storage.</Txt><Button title="Use cloud version on this device" disabled={busy} onPress={()=>void run(()=>learning.resolveConflict('cloud'))}/><Button title="Replace cloud with this device" secondary disabled={busy} onPress={()=>void run(()=>learning.resolveConflict('local'))}/></Panel>}
 <Panel><Txt weight="600">Bring your guest notebook</Txt><Txt>Guest progress is kept separate. Importing replaces this account’s current notebook, then syncs it. Export your account notebook first if you need both.</Txt>{confirm?<><Button title="Replace account notebook with guest progress" disabled={busy} onPress={()=>void run(async()=>{await learning.importGuest();setConfirm(false);})}/><Button title="Cancel" secondary onPress={()=>setConfirm(false)}/></>:<Button title="Review guest import" secondary onPress={()=>setConfirm(true)}/>}</Panel>
 <Button title="Sign out on this device" secondary disabled={busy} onPress={()=>void run(async()=>{const {error}=await supabase!.auth.signOut({scope:'local'});if(error)throw error;router.replace('/today');})}/><Txt size={13} color={c.muted}>Unsynced edits remain in this account’s local notebook. Sign back in on this device to retry.</Txt>
 </>:<Panel>
 {!auth.recovery&&<View style={{gap:8}}><Txt size={14}>Email</Txt><TextInput accessibilityLabel="Email" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} style={inputStyle(c)}/></View>}
 {(mode!=='reset'||auth.recovery)&&<View style={{gap:8}}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Txt size={14}>{auth.recovery?'New password':'Password'}</Txt><Pressable accessibilityRole="button" accessibilityLabel={showPassword?'Hide password':'Show password'} onPress={()=>setShowPassword(v=>!v)} style={{minHeight:44,justifyContent:'center'}}><Txt size={12} color={c.muted}>{showPassword?'Hide':'Show'}</Txt></Pressable></View><TextInput accessibilityLabel="Password" secureTextEntry={!showPassword} autoCapitalize="none" autoComplete={mode==='signin'?'current-password':'new-password'} value={password} onChangeText={setPassword} style={inputStyle(c)} onSubmitEditing={()=>void submit()}/></View>}
 <Button title={busy?'Please wait…':auth.recovery?'Save new password':mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Sign in'} disabled={busy||!supabase} onPress={()=>void submit()}/>
 {!auth.recovery&&<><Button title={mode==='signin'?'Create an account':'Back to sign in'} secondary disabled={busy} onPress={()=>{setMode(mode==='signin'?'signup':'signin');setMessage('');}}/>{mode==='signin'&&<Button title="Forgot password?" secondary disabled={busy} onPress={()=>{setMode('reset');setPassword('');}}/>}</>}
 </Panel>}
 {!!message&&<Txt accessibilityLiveRegion="polite">{message}</Txt>}
 <Button title="Open learning app" secondary onPress={()=>router.replace('/today')}/><Button title="Privacy & your data" secondary onPress={()=>router.push('/privacy')}/>
 </AccountLayout>;
}


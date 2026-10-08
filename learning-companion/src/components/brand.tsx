import Svg,{Path} from 'react-native-svg';
/** Ascending folded ribbon: an open page becoming a path. */
export function BrandMark({size=32,color='#FFFFFF'}:{size?:number;color?:string}) {
 return <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="AI Learning"><Path d="M12 47V25L30 14V36L12 47Z M34 36V14L52 25V47L34 36Z M16 51L32 41L48 51L32 59Z" fill={color}/></Svg>;
}

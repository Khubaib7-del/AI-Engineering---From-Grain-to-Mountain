const key=(scope:string)=>scope==='guest'?'ai-learning-v1':`ai-learning-account:${scope}`;
export async function readStored(scope='guest'): Promise<string | null> { return globalThis.localStorage.getItem(key(scope)); }
export async function writeStored(value: string, scope='guest') { globalThis.localStorage.setItem(key(scope), value); }

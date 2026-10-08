export async function readStored(): Promise<string | null> { return globalThis.localStorage.getItem('ai-learning-v1'); }
export async function writeStored(value: string) { globalThis.localStorage.setItem('ai-learning-v1', value); }

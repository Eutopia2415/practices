import {sha256} from '@noble/hashes/sha2.js';
import {bytesToHex} from '@noble/hashes/utils.js';
import type {QueryCtx} from './_generated/server';
export function digest(token:string) {
  if(!/^[a-f0-9]{64}$/.test(token))throw new Error('Invalid access link.');
  return bytesToHex(sha256(new TextEncoder().encode(token)));
}
export function owner(token:string) {
  const hash=digest(token), expected=process.env.OWNER_TOKEN_HASH;
  if(!expected || hash!==expected)throw new Error('Owner access required.');
}
export async function viewer(ctx:QueryCtx,token:string,subject?:string,identifyOnly=false) {
  const all=['AP Literature','AP Business'] as const;
  const hash=digest(token);
  if(process.env.OWNER_TOKEN_HASH && hash===process.env.OWNER_TOKEN_HASH)return {owner:true,subjects:[...all]};
  const access=await ctx.db.query('viewers').withIndex('by_hash',q=>q.eq('hash',hash)).unique();
  if(!access)throw new Error('This private link is invalid or has been revoked.');
  const subjects=access.subjects||[...all];
  if(!identifyOnly&&(subject ? !subjects.includes(subject as typeof all[number]) : subjects.length!==2))throw new Error('This link does not include that subject.');
  return {owner:false,subjects};
}

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
export async function viewer(ctx:QueryCtx,token:string) {
  const hash=digest(token);
  if(process.env.OWNER_TOKEN_HASH && hash===process.env.OWNER_TOKEN_HASH)return {owner:true};
  const access=await ctx.db.query('viewers').withIndex('by_hash',q=>q.eq('hash',hash)).unique();
  if(!access)throw new Error('This private link is invalid or has been revoked.');
  return {owner:false};
}

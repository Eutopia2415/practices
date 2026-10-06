import {query,mutation} from './_generated/server';
import {paginationOptsValidator} from 'convex/server';
import {v} from 'convex/values';
import {digest,owner,viewer} from './access';
import {attemptDocument} from './schema';
import catalog from './catalog.json';
const quizzes:Record<string,any>=catalog;
const result=v.object({id:v.id('attempts'),score:v.optional(v.number()),maximum:v.optional(v.number()),bonus:v.optional(v.number()),totalPoints:v.optional(v.number())});
const pageResult=v.object({page:v.array(attemptDocument),isDone:v.boolean(),continueCursor:v.string(),splitCursor:v.optional(v.union(v.string(),v.null())),pageStatus:v.optional(v.union(v.literal('SplitRecommended'),v.literal('SplitRequired'),v.null()))});
export const me=query({args:{token:v.string()},returns:v.object({owner:v.boolean()}),handler:(ctx,args)=>viewer(ctx,args.token)});
export const begin=mutation({args:{deviceToken:v.string(),attemptKey:v.string(),quizPath:v.string()},returns:v.id('attempts'),handler:async(ctx,args)=>{
  const actor=digest(args.deviceToken),quiz=quizzes[args.quizPath];
  if(!quiz||!/^[-a-zA-Z0-9]{16,80}$/.test(args.attemptKey))throw new Error('Invalid attempt.');
  const existing=await ctx.db.query('attempts').withIndex('by_actor_key',q=>q.eq('actor',actor).eq('attemptKey',args.attemptKey)).unique();
  if(existing){if(existing.quizPath!==args.quizPath)throw new Error('Attempt mismatch.');return existing._id;}
  const recent=await ctx.db.query('attempts').withIndex('by_actor',q=>q.eq('actor',actor)).order('desc').take(10);
  if(recent.length===10 && recent[9].startedAt>Date.now()-60000)throw new Error('Please wait before starting another attempt.');
  return ctx.db.insert('attempts',{actor,deviceLabel:'Device '+actor.slice(0,12).toUpperCase(),attemptKey:args.attemptKey,quizPath:args.quizPath,title:quiz.title,subject:quiz.subject,startedAt:Date.now()});
}});
export const submit=mutation({args:{deviceToken:v.string(),attemptKey:v.string(),answers:v.array(v.object({id:v.string(),answer:v.union(v.string(),v.null())})),activeMs:v.number(),partialTiming:v.boolean()},returns:result,handler:async(ctx,args)=>{
  const actor=digest(args.deviceToken);
  const attempt=await ctx.db.query('attempts').withIndex('by_actor_key',q=>q.eq('actor',actor).eq('attemptKey',args.attemptKey)).unique();
  if(!attempt)throw new Error('Start this attempt before submitting.');
  if(attempt.submittedAt)return {id:attempt._id,score:attempt.score,maximum:attempt.maximum,bonus:attempt.bonus,totalPoints:attempt.totalPoints};
  const quiz=quizzes[attempt.quizPath];
  const ids=new Set(args.answers.map(a=>a.id));
  if(args.answers.length>100||ids.size!==args.answers.length||!Number.isFinite(args.activeMs)||args.activeMs<0||args.activeMs>7*86400000)throw new Error('Invalid submission.');
  const core=Object.keys(quiz.questions).filter(id=>id.startsWith('core:'));
  const bonusIds=args.answers.filter(a=>a.id.startsWith('bonus:'));
  if(!core.every(id=>ids.has(id))||bonusIds.length<(quiz.minBonus||0)||bonusIds.length>(quiz.maxBonus||0))throw new Error('Incomplete question sequence.');
  const marked=args.answers.map(a=>{
    const question=quiz.questions[a.id];
    if(!question||!(a.answer===null||/^[A-E]$/.test(a.answer)))throw new Error('Invalid question or answer.');
    return {...a,correct:a.answer===question.key,topic:question.topic||''};
  });
  const raw=marked.filter(a=>a.id.startsWith('core:')&&a.correct).length;
  const bonus=marked.filter(a=>a.id.startsWith('bonus:')&&a.correct).length;
  const eliminated=quiz.bonusPenalty && bonusIds.length-bonus>=2;
  const score=eliminated?0:raw;
  const totalPoints=eliminated?0:score+bonus;
  const elapsed=Date.now()-attempt.startedAt;
  const activeMs=Math.min(Math.round(args.activeMs),Math.max(0,elapsed));
  await ctx.db.patch(attempt._id,{submittedAt:Date.now(),activeMs,partialTiming:args.partialTiming||args.activeMs>elapsed+5000,score,maximum:core.length,bonus,bonusMaximum:bonusIds.length,totalPoints,answers:marked});
  const device=await ctx.db.query('devices').withIndex('by_actor',q=>q.eq('actor',actor)).unique();
  if(!device)await ctx.db.insert('devices',{actor,submitted:true});
  const totals=await ctx.db.query('totals').withIndex('by_key',q=>q.eq('key','all')).unique();
  const add={submissions:1,devices:device?0:1,score,maximum:core.length,activeMs};
  if(totals)await ctx.db.patch(totals._id,{submissions:totals.submissions+1,devices:totals.devices+add.devices,score:totals.score+score,maximum:totals.maximum+core.length,activeMs:totals.activeMs+activeMs});
  else await ctx.db.insert('totals',{key:'all',...add});
  return {id:attempt._id,score,maximum:core.length,bonus,totalPoints};
}});

export const list=query({args:{token:v.string(),paginationOpts:paginationOptsValidator},returns:pageResult,handler:async(ctx,args)=>{
  await viewer(ctx,args.token);
  return ctx.db.query('attempts').withIndex('by_submitted',q=>q.gt('submittedAt',0)).order('desc').paginate({...args.paginationOpts,numItems:Math.max(1,Math.min(args.paginationOpts.numItems,50))});
}});
export const stats=query({args:{token:v.string()},returns:v.object({submissions:v.number(),devices:v.number(),score:v.number(),maximum:v.number(),activeMs:v.number()}),handler:async(ctx,args)=>{
  await viewer(ctx,args.token);
  const row=await ctx.db.query('totals').withIndex('by_key',q=>q.eq('key','all')).unique();
  return row?{submissions:row.submissions,devices:row.devices,score:row.score,maximum:row.maximum,activeMs:row.activeMs}:{submissions:0,devices:0,score:0,maximum:0,activeMs:0};
}});
export const detail=query({args:{token:v.string(),id:v.id('attempts')},returns:attemptDocument,handler:async(ctx,args)=>{
  await viewer(ctx,args.token);const attempt=await ctx.db.get(args.id);if(!attempt)throw new Error('Attempt not found.');return attempt;
}});
export const viewers=query({args:{token:v.string()},returns:v.array(v.object({id:v.id('viewers'),label:v.string(),grantedAt:v.number()})),handler:async(ctx,args)=>{
  owner(args.token);return (await ctx.db.query('viewers').take(100)).map(row=>({id:row._id,label:row.label,grantedAt:row.grantedAt}));
}});
export const grant=mutation({args:{token:v.string(),viewerToken:v.string(),label:v.string()},returns:v.id('viewers'),handler:async(ctx,args)=>{
  owner(args.token);const hash=digest(args.viewerToken),label=args.label.trim();
  if(!label||label.length>80||hash===process.env.OWNER_TOKEN_HASH)throw new Error('Invalid share label or token.');
  const existing=await ctx.db.query('viewers').withIndex('by_hash',q=>q.eq('hash',hash)).unique();if(existing)return existing._id;
  if((await ctx.db.query('viewers').take(100)).length>=100)throw new Error('Share limit reached.');
  return ctx.db.insert('viewers',{hash,label,grantedAt:Date.now()});
}});
export const revoke=mutation({args:{token:v.string(),id:v.id('viewers')},returns:v.null(),handler:async(ctx,args)=>{owner(args.token);await ctx.db.delete(args.id);return null;}});

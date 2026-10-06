import {internalMutation} from './_generated/server';
import {v} from 'convex/values';
import {countSubject} from './metrics';

// Admin-only cleanup for explicitly identified disposable test attempts.
// Exact device and attempt keys keep ordinary learner results outside the operation.
export const clearTestAttempts=internalMutation({
  args:{actor:v.string(),attemptKeys:v.array(v.string())},
  returns:v.object({removed:v.number()}),
  handler:async(ctx,args)=>{
    const keys=new Set(args.attemptKeys);
    if(!/^[a-f0-9]{64}$/.test(args.actor)||keys.size===0||keys.size>100||keys.size!==args.attemptKeys.length)throw new Error('Invalid cleanup scope.');
    const rows=await ctx.db.query('attempts').withIndex('by_actor',q=>q.eq('actor',args.actor)).take(101);
    if(rows.length>100)throw new Error('Device history exceeds cleanup limit.');
    const removed=rows.filter(row=>keys.has(row.attemptKey));
    if(!removed.length)return {removed:0};
    if(removed.length!==keys.size)throw new Error('Some specified attempts were not found.');
    const submitted=removed.filter(row=>row.submittedAt!==undefined);
    const device=await ctx.db.query('devices').withIndex('by_actor',q=>q.eq('actor',args.actor)).unique();
    const removeDevice=Boolean(device&&!rows.some(row=>!keys.has(row.attemptKey)&&row.submittedAt!==undefined));
    const totals=await ctx.db.query('totals').withIndex('by_key',q=>q.eq('key','all')).unique();
    if(submitted.length){
      if(!totals)throw new Error('Missing aggregate counters.');
      const next={submissions:totals.submissions-submitted.length,devices:totals.devices-Number(removeDevice),score:totals.score-submitted.reduce((n,row)=>n+(row.score||0),0),maximum:totals.maximum-submitted.reduce((n,row)=>n+(row.maximum||0),0),activeMs:totals.activeMs-submitted.reduce((n,row)=>n+(row.activeMs||0),0)};
      if(Object.values(next).some(n=>n<0))throw new Error('Counter mismatch; cleanup stopped.');
      await ctx.db.patch(totals._id,next);
    }
    for(const subject of ['AP Literature','AP Business'] as const){
      const matched=submitted.filter(row=>row.subject===subject&&row.subjectCounted);
      if(!matched.length)continue;
      const subjectDevice=await ctx.db.query('subjectDevices').withIndex('by_subject_actor',q=>q.eq('subject',subject).eq('actor',args.actor)).unique();
      const removeSubjectDevice=Boolean(subjectDevice&&!rows.some(row=>!keys.has(row.attemptKey)&&row.subject===subject&&row.subjectCounted&&row.submittedAt!==undefined));
      const summary=await ctx.db.query('totals').withIndex('by_key',q=>q.eq('key',subject)).unique();
      if(!summary)throw new Error('Missing subject counters.');
      const next={submissions:summary.submissions-matched.length,devices:summary.devices-Number(removeSubjectDevice),score:summary.score-matched.reduce((n,row)=>n+(row.score||0),0),maximum:summary.maximum-matched.reduce((n,row)=>n+(row.maximum||0),0),activeMs:summary.activeMs-matched.reduce((n,row)=>n+(row.activeMs||0),0)};
      if(Object.values(next).some(n=>n<0))throw new Error('Subject counter mismatch.');
      await ctx.db.patch(summary._id,next);
      if(removeSubjectDevice&&subjectDevice)await ctx.db.delete(subjectDevice._id);
    }
    for(const row of removed)await ctx.db.delete(row._id);
    if(removeDevice&&device)await ctx.db.delete(device._id);
    return {removed:removed.length};
  }
});

// Add subject summaries for earlier results without changing recorded grades or global counters.
export const backfillSubjects=internalMutation({
 args:{cursor:v.union(v.string(),v.null())},returns:v.object({cursor:v.string(),done:v.boolean(),updated:v.number()}),
 handler:async(ctx,args)=>{
  const page=await ctx.db.query('attempts').withIndex('by_submitted',q=>q.gt('submittedAt',0)).paginate({numItems:100,cursor:args.cursor});
  let updated=0;
  for(const row of page.page){if(row.subjectCounted)continue;await countSubject(ctx,row);await ctx.db.patch(row._id,{subjectCounted:true});updated++;}
  return {cursor:page.continueCursor,done:page.isDone,updated};
 }
});

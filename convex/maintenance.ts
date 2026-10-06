import {internalMutation} from './_generated/server';
import {v} from 'convex/values';

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
    for(const row of removed)await ctx.db.delete(row._id);
    if(removeDevice&&device)await ctx.db.delete(device._id);
    return {removed:removed.length};
  }
});

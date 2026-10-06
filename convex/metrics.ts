import type {MutationCtx} from './_generated/server';
import type {Doc} from './_generated/dataModel';
export async function countSubject(ctx:MutationCtx,attempt:Pick<Doc<'attempts'>,'actor'|'subject'|'score'|'maximum'|'activeMs'>){
 const subject=attempt.subject;
 if(subject!=='AP Literature'&&subject!=='AP Business')throw new Error('Unknown subject.');
 const device=await ctx.db.query('subjectDevices').withIndex('by_subject_actor',q=>q.eq('subject',subject).eq('actor',attempt.actor)).unique();
 if(!device)await ctx.db.insert('subjectDevices',{subject,actor:attempt.actor});
 const row=await ctx.db.query('totals').withIndex('by_key',q=>q.eq('key',subject)).unique();
 const delta={submissions:1,devices:device?0:1,score:attempt.score||0,maximum:attempt.maximum||0,activeMs:attempt.activeMs||0};
 if(row)await ctx.db.patch(row._id,{submissions:row.submissions+1,devices:row.devices+delta.devices,score:row.score+delta.score,maximum:row.maximum+delta.maximum,activeMs:row.activeMs+delta.activeMs});
 else await ctx.db.insert('totals',{key:subject,...delta});
}

import {convexTest} from 'convex-test';
import {it,expect} from 'vitest';
import {api,internal} from '../convex/_generated/api';
import {digest} from '../convex/access';
import schema from '../convex/schema';
import catalog from '../convex/catalog.json';
const modules=import.meta.glob('../convex/**/*.{ts,js}');
const token='a'.repeat(64),device='b'.repeat(64),second='c'.repeat(64);
const lit='English/To Autumn - Custom Practice.html',business='Business/AP Business Unit 1 Worksheet 2026-09-24.html';
const keys=['11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333'];
it('keeps subject summaries and pagination separate, including devices used for both',async()=>{
 const t=convexTest(schema,modules);process.env.OWNER_TOKEN_HASH=digest(token);
 for(const [i,quizPath] of [lit,business,lit].entries()){
  const deviceToken=i===2?second:device;
  const quiz=(catalog as Record<string,{questions:Record<string,{key:string}>,minBonus?:number}>)[quizPath];
  const core=Object.entries(quiz.questions).filter(([id])=>id.startsWith('core:'));const bonus=Object.entries(quiz.questions).filter(([id])=>id.startsWith('bonus:')).slice(0,quiz.minBonus||0);
  await t.mutation(api.grades.begin,{deviceToken,attemptKey:keys[i],quizPath});
  await t.mutation(api.grades.submit,{deviceToken,attemptKey:keys[i],answers:[...core,...bonus].map(([id,q])=>({id,answer:q.key})),activeMs:0,partialTiming:false});
 }
 expect(await t.query(api.grades.stats,{token,subject:'AP Literature'})).toMatchObject({submissions:2,devices:2,maximum:30,score:30});
 expect(await t.query(api.grades.stats,{token,subject:'AP Business'})).toMatchObject({submissions:1,devices:1,maximum:18,score:18});
 expect(await t.query(api.grades.stats,{token})).toMatchObject({submissions:3,devices:2});
 const first=await t.query(api.grades.list,{token,subject:'AP Literature',paginationOpts:{numItems:1,cursor:null}});
 const next=await t.query(api.grades.list,{token,subject:'AP Literature',paginationOpts:{numItems:1,cursor:first.continueCursor}});
 expect(first.page[0].subject).toBe('AP Literature');expect(next.page[0].subject).toBe('AP Literature');expect(first.page[0]._id).not.toBe(next.page[0]._id);
 await t.mutation(internal.maintenance.clearTestAttempts,{actor:digest(device),attemptKeys:[keys[0]]});
 expect(await t.query(api.grades.stats,{token,subject:'AP Literature'})).toMatchObject({submissions:1,devices:1});
 expect(await t.query(api.grades.stats,{token,subject:'AP Business'})).toMatchObject({submissions:1,devices:1});
 await expect(t.query(api.grades.stats,{token:device,subject:'AP Literature'})).rejects.toThrow();
});
it('counts earlier submissions once without changing their grades',async()=>{
 const t=convexTest(schema,modules);process.env.OWNER_TOKEN_HASH=digest(token);
 await t.run(async ctx=>{await ctx.db.insert('attempts',{actor:digest(device),deviceLabel:'Earlier device',attemptKey:keys[0],quizPath:lit,title:'Earlier practice',subject:'AP Literature',startedAt:1,submittedAt:2,score:8,maximum:15,activeMs:1});});
 expect((await t.mutation(internal.maintenance.backfillSubjects,{cursor:null})).updated).toBe(1);
 expect((await t.mutation(internal.maintenance.backfillSubjects,{cursor:null})).updated).toBe(0);
 expect(await t.query(api.grades.stats,{token,subject:'AP Literature'})).toMatchObject({submissions:1,devices:1,score:8,maximum:15});
});

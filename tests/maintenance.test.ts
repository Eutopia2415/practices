import {convexTest} from 'convex-test';
import {it,expect} from 'vitest';
import {api,internal} from '../convex/_generated/api';
import {digest} from '../convex/access';
import schema from '../convex/schema';
import catalog from '../convex/catalog.json';
const modules=import.meta.glob('../convex/**/*.{ts,js}');
it('removes only specified tests, corrects counters, and preserves other devices',async()=>{
 const t=convexTest(schema,modules),token='a'.repeat(64),deviceToken='b'.repeat(64),other='c'.repeat(64);
 process.env.OWNER_TOKEN_HASH=digest(token);
 const quizPath='Business/AP Business Unit 1 Worksheet 2026-09-24.html';
 const answers=Object.entries(catalog[quizPath].questions).map(([id,q])=>({id,answer:q.key}));
 const keys=['11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222'];
 for(const [i,device] of [deviceToken,other].entries()){
  await t.mutation(api.grades.begin,{deviceToken:device,attemptKey:keys[i],quizPath});
  await t.mutation(api.grades.submit,{deviceToken:device,attemptKey:keys[i],answers,activeMs:0,partialTiming:false});
 }
 expect(await t.mutation(internal.maintenance.clearTestAttempts,{actor:digest(deviceToken),attemptKeys:[keys[0]]})).toEqual({removed:1});
 expect(await t.query(api.grades.stats,{token})).toMatchObject({submissions:1,devices:1,score:18,maximum:18});
 const remaining=await t.query(api.grades.list,{token,paginationOpts:{numItems:50,cursor:null}});expect(remaining.page[0].actor).toBe(digest(other));
 expect(await t.mutation(internal.maintenance.clearTestAttempts,{actor:digest(deviceToken),attemptKeys:[keys[0]]})).toEqual({removed:0});
});

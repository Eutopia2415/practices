import {convexTest} from 'convex-test';
import {it,expect} from 'vitest';
import {api} from '../convex/_generated/api';
import {digest} from '../convex/access';
import schema from '../convex/schema';
import catalog from '../convex/catalog.json';
const modules=import.meta.glob('../convex/**/*.{ts,js}');
const owner='a'.repeat(64),businessToken='b'.repeat(64),litToken='c'.repeat(64),bothToken='d'.repeat(64),deviceToken='e'.repeat(64);
const paging={paginationOpts:{numItems:50,cursor:null}};
it('enforces subject scope on every result, detail, summary, and permission operation',async()=>{
 const t=convexTest(schema,modules);process.env.OWNER_TOKEN_HASH=digest(owner);
 const ids=[];
 for(const [i,quizPath] of ['English/To Autumn - Custom Practice.html','Business/AP Business Unit 1 Worksheet 2026-09-24.html'].entries()){
  const quiz=(catalog as Record<string,{questions:Record<string,{key:string}>,minBonus?:number}>)[quizPath];
  const entries=Object.entries(quiz.questions);const answers=[...entries.filter(([id])=>id.startsWith('core:')),...entries.filter(([id])=>id.startsWith('bonus:')).slice(0,quiz.minBonus||0)].map(([id,q])=>({id,answer:q.key}));
  const attemptKey=String(i+1).repeat(36);ids.push(await t.mutation(api.grades.begin,{deviceToken,attemptKey,quizPath}));
  await t.mutation(api.grades.submit,{deviceToken,attemptKey,answers,activeMs:0,partialTiming:false});
 }
 const businessId=await t.mutation(api.grades.grant,{token:owner,viewerToken:businessToken,label:'Business teacher',subjects:['AP Business']});
 await t.mutation(api.grades.grant,{token:owner,viewerToken:litToken,label:'English teacher',subjects:['AP Literature']});
 await t.mutation(api.grades.grant,{token:owner,viewerToken:bothToken,label:'Both',subjects:['AP Literature','AP Business']});
 for(const [token,subject,other,id,otherId] of [[businessToken,'AP Business','AP Literature',ids[1],ids[0]],[litToken,'AP Literature','AP Business',ids[0],ids[1]]] as const){
  expect((await t.query(api.grades.me,{token})).subjects).toEqual([subject]);
  expect((await t.query(api.grades.list,{token,subject,...paging})).page).toHaveLength(1);
  expect((await t.query(api.grades.detail,{token,id})).subject).toBe(subject);
  expect((await t.query(api.grades.stats,{token,subject})).submissions).toBe(1);
  await expect(t.query(api.grades.list,{token,subject:other,...paging})).rejects.toThrow();
  await expect(t.query(api.grades.stats,{token,subject:other})).rejects.toThrow();
  await expect(t.query(api.grades.detail,{token,id:otherId})).rejects.toThrow();
  await expect(t.query(api.grades.list,{token,...paging})).rejects.toThrow();
  await expect(t.query(api.grades.stats,{token})).rejects.toThrow();
  await expect(t.query(api.grades.viewers,{token})).rejects.toThrow();
  await expect(t.mutation(api.grades.grant,{token,viewerToken:'f'.repeat(64),label:'Extra',subjects:[other]})).rejects.toThrow();
 }
 expect((await t.query(api.grades.list,{token:bothToken,...paging})).page).toHaveLength(2);
 await expect(t.mutation(api.grades.grant,{token:owner,viewerToken:businessToken,label:'Expand existing',subjects:['AP Literature','AP Business']})).rejects.toThrow();
 await t.mutation(api.grades.revoke,{token:owner,id:businessId});await expect(t.query(api.grades.me,{token:businessToken})).rejects.toThrow();
});
it('preserves earlier all-subject links and rejects empty or repeated scopes',async()=>{
 const t=convexTest(schema,modules);process.env.OWNER_TOKEN_HASH=digest(owner);
 await t.run(async ctx=>{await ctx.db.insert('viewers',{hash:digest(bothToken),label:'Earlier link',grantedAt:1});});
 expect((await t.query(api.grades.me,{token:bothToken})).subjects).toEqual(['AP Literature','AP Business']);
 expect((await t.query(api.grades.stats,{token:bothToken})).submissions).toBe(0);
 for(const subjects of [[],['AP Business','AP Business']] as ('AP Business')[][])await expect(t.mutation(api.grades.grant,{token:owner,viewerToken:businessToken,label:'Invalid',subjects})).rejects.toThrow();
});

import {convexTest} from 'convex-test';
import {describe,it,expect,beforeEach} from 'vitest';
import {api} from '../convex/_generated/api';
import {digest} from '../convex/access';
import schema from '../convex/schema';
import catalog from '../convex/catalog.json';
const modules=import.meta.glob('../convex/**/*.{ts,js}');
const owner='a'.repeat(64),reader='b'.repeat(64),device='c'.repeat(64),other='d'.repeat(64);
const page='Business/AP Business Unit 1 Worksheet 2026-09-24.html';
const paging={paginationOpts:{numItems:20,cursor:null}};
const attemptKey='12345678-1234-1234-1234-123456789abc';
beforeEach(()=>{process.env.OWNER_TOKEN_HASH=digest(owner);});
describe('private device statistics',()=>{
 it('denies public and device-token reads',async()=>{const t=convexTest(schema,modules);for(const token of ['',device,reader])await expect(t.query(api.grades.list,{...paging,token})).rejects.toThrow();});
 it('allows only the owner to create/revoke links and enforces revocation',async()=>{
  const t=convexTest(schema,modules);
  await expect(t.mutation(api.grades.grant,{token:device,viewerToken:reader,label:'Teacher'})).rejects.toThrow();
  const id=await t.mutation(api.grades.grant,{token:owner,viewerToken:reader,label:'Teacher'});
  expect((await t.query(api.grades.list,{...paging,token:reader})).page).toEqual([]);
  await expect(t.mutation(api.grades.revoke,{token:reader,id})).rejects.toThrow();
  await expect(t.query(api.grades.viewers,{token:reader})).rejects.toThrow();
  await t.mutation(api.grades.revoke,{token:owner,id});
  await expect(t.query(api.grades.stats,{token:reader})).rejects.toThrow();
 });
 it('calculates grades, prevents duplicate statistics, and isolates device submissions',async()=>{
  const t=convexTest(schema,modules);
  const id=await t.mutation(api.grades.begin,{deviceToken:device,attemptKey,quizPath:page});
  const answers=Object.entries(catalog[page].questions).map(([id,q])=>({id,answer:q.key}));
  await expect(t.mutation(api.grades.submit,{deviceToken:other,attemptKey,answers,activeMs:0,partialTiming:false})).rejects.toThrow();
  expect((await t.mutation(api.grades.submit,{deviceToken:device,attemptKey,answers,activeMs:1000,partialTiming:false})).score).toBe(18);
  expect((await t.mutation(api.grades.submit,{deviceToken:device,attemptKey,answers:[],activeMs:0,partialTiming:false})).score).toBe(18);
  expect(await t.query(api.grades.stats,{token:owner})).toMatchObject({submissions:1,devices:1,score:18,maximum:18});
  await expect(t.query(api.grades.detail,{token:device,id})).rejects.toThrow();
  const record=await t.query(api.grades.detail,{token:owner,id});expect(record.activeMs).toBeLessThanOrEqual(record.submittedAt!-record.startedAt);
 });
 it('rejects duplicate IDs and negative time',async()=>{
  const t=convexTest(schema,modules);await t.mutation(api.grades.begin,{deviceToken:device,attemptKey,quizPath:page});
  for(const values of [{answers:[{id:'core:1',answer:'A'},{id:'core:1',answer:'A'}],activeMs:1},{answers:[],activeMs:-1}])await expect(t.mutation(api.grades.submit,{deviceToken:device,attemptKey,...values,partialTiming:false})).rejects.toThrow();
 });
 for(const [quizPath,quiz] of Object.entries(catalog))it('grades '+quizPath,async()=>{
  const t=convexTest(schema,modules);await t.mutation(api.grades.begin,{deviceToken:device,attemptKey,quizPath});
  const q=quiz as {questions:Record<string,{key:string}>,minBonus?:number};
  const answers=Object.entries(q.questions).filter(([id])=>id.startsWith('core:')).map(([id,v])=>({id,answer:v.key}));const core=answers.length;
  answers.push(...Object.entries(q.questions).filter(([id])=>id.startsWith('bonus:')).slice(0,q.minBonus||0).map(([id,v])=>({id,answer:v.key})));
  const result=await t.mutation(api.grades.submit,{deviceToken:device,attemptKey,answers,activeMs:0,partialTiming:false});expect(result.score).toBe(core);
 });
});

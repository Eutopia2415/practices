import {defineSchema,defineTable} from 'convex/server';
import {v} from 'convex/values';
export const subjectValue=v.union(v.literal('AP Literature'),v.literal('AP Business'));
export const totalKey=v.union(v.literal('all'),subjectValue);
export const markedAnswer=v.object({id:v.string(),answer:v.union(v.string(),v.null()),correct:v.boolean(),topic:v.string()});
export const attemptFields={
  actor:v.string(),deviceLabel:v.string(),attemptKey:v.string(),quizPath:v.string(),title:v.string(),subject:v.string(),startedAt:v.number(),
  subjectCounted:v.optional(v.boolean()),submittedAt:v.optional(v.number()),activeMs:v.optional(v.number()),partialTiming:v.optional(v.boolean()),score:v.optional(v.number()),maximum:v.optional(v.number()),
  bonus:v.optional(v.number()),bonusMaximum:v.optional(v.number()),totalPoints:v.optional(v.number()),answers:v.optional(v.array(markedAnswer))
};
export const attemptDocument=v.object({_id:v.id('attempts'),_creationTime:v.number(),...attemptFields});
export default defineSchema({
  viewers:defineTable({hash:v.string(),label:v.string(),grantedAt:v.number(),subjects:v.optional(v.array(subjectValue))}).index('by_hash',['hash']),
  devices:defineTable({actor:v.string(),submitted:v.boolean()}).index('by_actor',['actor']),
  subjectDevices:defineTable({subject:subjectValue,actor:v.string()}).index('by_subject_actor',['subject','actor']),
  totals:defineTable({key:totalKey,submissions:v.number(),devices:v.number(),score:v.number(),maximum:v.number(),activeMs:v.number()}).index('by_key',['key']),
  attempts:defineTable(attemptFields).index('by_actor_key',['actor','attemptKey']).index('by_actor',['actor']).index('by_submitted',['submittedAt']).index('by_subject_submitted',['subject','submittedAt'])
});

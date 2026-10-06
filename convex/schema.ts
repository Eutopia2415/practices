import {defineSchema,defineTable} from 'convex/server';
import {v} from 'convex/values';
export const markedAnswer=v.object({id:v.string(),answer:v.union(v.string(),v.null()),correct:v.boolean(),topic:v.string()});
export const attemptFields={
  actor:v.string(),deviceLabel:v.string(),attemptKey:v.string(),quizPath:v.string(),title:v.string(),subject:v.string(),startedAt:v.number(),
  submittedAt:v.optional(v.number()),activeMs:v.optional(v.number()),partialTiming:v.optional(v.boolean()),score:v.optional(v.number()),maximum:v.optional(v.number()),
  bonus:v.optional(v.number()),bonusMaximum:v.optional(v.number()),totalPoints:v.optional(v.number()),answers:v.optional(v.array(markedAnswer))
};
export const attemptDocument=v.object({_id:v.id('attempts'),_creationTime:v.number(),...attemptFields});
export default defineSchema({
  viewers:defineTable({hash:v.string(),label:v.string(),grantedAt:v.number()}).index('by_hash',['hash']),
  devices:defineTable({actor:v.string(),submitted:v.boolean()}).index('by_actor',['actor']),
  totals:defineTable({key:v.literal('all'),submissions:v.number(),devices:v.number(),score:v.number(),maximum:v.number(),activeMs:v.number()}).index('by_key',['key']),
  attempts:defineTable(attemptFields).index('by_actor_key',['actor','attemptKey']).index('by_actor',['actor']).index('by_submitted',['submittedAt'])
});

export const adminQueries = {
  USAGE_BY_USER: `
      select "firebaseId","mindTaskId", "mind-tasks".title as task, minds.title as mind, count("mindTaskId") as usage from executions
      join "mind-tasks" on "mindTaskId" = "mind-tasks".id
      join "minds" on "mind-tasks"."mindId" = minds.id
      where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2'
      group by "firebaseId", "mindTaskId", "mind-tasks".title, minds.title
      order by usage desc;
      `,
  USAGE_BY_TASK: `
      select "mindTaskId", "mind-tasks".title as task, minds.title as mind, count("mindTaskId") as usage from executions
      join "mind-tasks" on "mindTaskId" = "mind-tasks".id
      join "minds" on "mind-tasks"."mindId" = minds.id
      where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2'
      group by "mindTaskId", "mind-tasks".title, minds.title
      order by usage desc;
      `,
  USAGE_TODAY: `
      select "firebaseId", "mindTaskId", "mind-tasks".title as task, minds.title as mind, count("mindTaskId") as usage from executions
      join "mind-tasks" on "mindTaskId" = "mind-tasks".id
      join "minds" on "mind-tasks"."mindId" = minds.id
      where date(executions."createdAt") = CURRENT_DATE
      group by "firebaseId", "mindTaskId", "mind-tasks".title, minds.title
      order by usage desc;
      `,
  FREQUENT_USER: `
      select "firebaseId", count("firebaseId") as usage from executions
      join "mind-tasks" on "mindTaskId" = "mind-tasks".id
      where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2'
      group by "firebaseId"
      order by usage desc;
      `,
  TODAY_STATS: `
      select
      (
        select count(DISTINCT "firebaseId") from executions
        where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2' AND date(executions."createdAt") = CURRENT_DATE
      ) as "numUsers",
      (
        select count("id") from executions
        where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2' AND 
        date(executions."createdAt") = CURRENT_DATE
      ) as "numExec"
      `,
  TODAY_RETENTION: `
    WITH all_users as (
    select "firebaseId", count("firebaseId") as usage
    from executions
    where "firebaseId" != 'KVd97MeSAbPdaDmHHBX7HnQWKjK2' 
    AND date(executions."createdAt") = CURRENT_DATE
    AND "firebaseId" IN (
        select "firebaseId"
        from executions
        where date(executions."createdAt") >= CURRENT_DATE - interval '30 days'
        and date(executions."createdAt") < CURRENT_DATE
        group by "firebaseId"
    )
    group by "firebaseId"
    order by usage desc
    )
    select count(*) as "userCount" from all_users
      `
};

export const getHistoryQuery = (mindId?: string, isV2 = false) => {
  return `
    select e.id as id, e.example as example, e.result as result, e."tokenUsed" as "tokenUsed", e."createdAt" as "createdAt", e."isStarred" as "isStarred",
    mt.title as "mindTask",
    m.title as mind
    from executions e
    join "mind-tasks" mt on e."mindTaskId" = mt.id
    join "minds" m on mt."mindId" = m.id
    where e."firebaseId"=? and e."isDeleted"=? and e."isStarred" IN (?) ${
      mindId ? 'and mt."mindId"=?' : ''
    } ${isV2 ? "and e.result is not null and e.result <> ''" : ''}
    order by e."createdAt" desc
    limit ? offset ?
  `;
};

export const getUsageQuery = (mindId?: string) => `
  select u.id as id, u."tokenUsed" as "tokenUsed", u."createdAt" as "createdAt",
  mt.title as "mindTask",
  m.title as mind
  from usage u
  join "mind-tasks" mt on u."mindTaskId" = mt.id
  join "minds" m on mt."mindId" = m.id
  where u."firebaseId"=? ${mindId ? 'and mt."mindId"=?' : ''}
  order by u."createdAt" desc
  limit ? offset ?
`;

export const getMindExecutionsForUser = (limit = 10) => {
  return `
    select e.example as example, e.result as result, e."createdAt" as "createdAt", mt.prompt as prompt
    from executions e
    join "mind-tasks" mt on e."mindTaskId" = mt.id
    where e."firebaseId"=? and mt."mindId"=? and e."isDeleted"=? and e.result is not null
    order by e."createdAt" desc
    limit ${limit}
  `;
};

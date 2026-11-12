-- Folio F-09: search over published portfolios (D-088 to D-092).
--
-- Run this file once, top to bottom, in the Supabase SQL editor, after 0002.
-- It is written to be safe to re-run: both indexes are `if not exists` and both
-- functions are `create or replace`.
--
-- What is NOT here: any table. Search reads `published_portfolios`, which
-- already holds a frozen copy of the owner's skills, so there is no join table
-- to keep in step with publish, unpublish and reset (D-089).
--
-- Both functions are `security invoker`, so the RLS policy on
-- `published_portfolios` stays the boundary: even if a body were wrong, the
-- caller can only see what that policy allows (D-091, S-15).

-- ---------------------------------------------------------------------------
-- Index 1: the name (D-090)
--
-- `simple` is language-neutral: it lowercases and splits words, and it has no
-- stemmer for a language it does not know, so Arabic names are indexed as they
-- are written. The expression must be written exactly as the function's WHERE
-- clause writes it, or the planner will not use the index.
-- ---------------------------------------------------------------------------

create index if not exists published_portfolios_name_fts_idx
  on public.published_portfolios
  using gin (
    (
      pg_catalog.to_tsvector(
        'simple',
        coalesce(display_name, '') || ' ' ||
        coalesce(username, '') || ' ' ||
        coalesce(headline, '')
      )
    )
  );

comment on index public.published_portfolios_name_fts_idx is
  'Full-text index over display name, username and headline for search (D-090).';

-- ---------------------------------------------------------------------------
-- Index 2: the skills (D-089)
--
-- The slugs live inside the content document at `skills.skillIds`. A GIN index
-- with `jsonb_path_ops` answers `@>` (containment) on that array without a
-- second table. Rows with no skills, or with a shape the schema would refuse,
-- are simply not indexed.
-- ---------------------------------------------------------------------------

create index if not exists published_portfolios_skills_idx
  on public.published_portfolios
  using gin ((content -> 'skills' -> 'skillIds') jsonb_path_ops);

comment on index public.published_portfolios_skills_idx is
  'Containment index over the skill slugs in the published content document (D-089).';

-- ---------------------------------------------------------------------------
-- search_portfolios (D-091)
--
-- Name matching: every term must appear as a prefix in the name, the username
-- or the headline. Skill matching: the content must contain every slug given.
-- Both are optional; neither means "everything published".
--
-- The caller's text never reaches the parser as syntax. Every term is stripped
-- of quotes and backslashes and then wrapped in single quotes, so what arrives
-- at `to_tsquery` is a quoted lexeme followed by `:*` and joined with `&`. A
-- quoted lexeme with no quote or backslash inside it cannot contain an
-- operator, whatever the caller sent (S-14).
-- ---------------------------------------------------------------------------

create or replace function public.search_portfolios(
  p_terms text[] default null,
  p_skill_slugs text[] default null,
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  username text,
  display_name text,
  headline text,
  skill_slugs text[],
  world text,
  accent text,
  published_at timestamptz,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      least(greatest(coalesce(p_limit, 12), 1), 24) as lim,
      greatest(coalesce(p_offset, 0), 0) as off,
      coalesce(
        (
          select pg_catalog.array_agg(cleaned.term)
          from (
            select pg_catalog.regexp_replace(word, '[''\\]', '', 'g') as term
            from pg_catalog.unnest(p_terms) as word
          ) as cleaned
          where cleaned.term <> ''
        ),
        '{}'::text[]
      ) as terms,
      coalesce(
        (
          select pg_catalog.array_agg(cleaned.slug)
          from (
            select pg_catalog.btrim(word) as slug
            from pg_catalog.unnest(p_skill_slugs) as word
          ) as cleaned
          where cleaned.slug <> ''
        ),
        '{}'::text[]
      ) as slugs
  ),
  patterns as (
    select
      params.terms,
      params.slugs,
      (
        select pg_catalog.array_agg(term || '%')
        from pg_catalog.unnest(params.terms) as term
      ) as prefixes
    from params
  ),
  ts_query as (
    select pg_catalog.array_to_string(
      pg_catalog.array_agg(
        '''' || pg_catalog.regexp_replace(term, '[''\\]', '', 'g') || ''':*'
        order by ord
      ),
      ' & '
    ) as tsq
    from pg_catalog.unnest((select terms from patterns)) with ordinality as t(term, ord)
  ),
  matched as (
    select
      pp.username,
      pp.display_name,
      pp.headline,
      pp.content,
      pp.design,
      pp.published_at,
      case
        when pg_catalog.lower(pp.display_name) = any (patterns.terms) then 0
        when pg_catalog.lower(pp.username) = any (patterns.terms) then 0
        when pg_catalog.lower(pp.display_name) like any (patterns.prefixes) then 1
        when pg_catalog.lower(pp.username) like any (patterns.prefixes) then 1
        else 2
      end as match_rank
    from public.published_portfolios as pp
    cross join patterns
    where
      (
        pg_catalog.cardinality(patterns.terms) = 0
        or pg_catalog.to_tsvector(
             'simple',
             coalesce(pp.display_name, '') || ' ' ||
             coalesce(pp.username, '') || ' ' ||
             coalesce(pp.headline, '')
           ) @@ pg_catalog.to_tsquery('simple', (select tsq from ts_query))
      )
      and (
        pg_catalog.cardinality(patterns.slugs) = 0
        or (pp.content -> 'skills' -> 'skillIds') @> pg_catalog.to_jsonb(patterns.slugs)
      )
  ),
  ranked as (
    select matched.*, pg_catalog.count(*) over () as total_count
    from matched
  )
  select
    ranked.username,
    ranked.display_name,
    ranked.headline,
    (
      select pg_catalog.array_agg(first_six.value order by first_six.ordinality)
      from (
        select listed.value, listed.ordinality
        from pg_catalog.jsonb_array_elements_text(
          case
            when pg_catalog.jsonb_typeof(ranked.content -> 'skills' -> 'skillIds') = 'array'
              then ranked.content -> 'skills' -> 'skillIds'
            else '[]'::jsonb
          end
        ) with ordinality as listed(value, ordinality)
        limit 6
      ) as first_six
    ) as skill_slugs,
    ranked.design ->> 'world' as world,
    ranked.design -> 'theme' -> 'colors' ->> 'accent' as accent,
    ranked.published_at,
    ranked.total_count
  from ranked
  order by ranked.match_rank, ranked.published_at desc, ranked.username asc
  limit (select lim from params)
  offset (select off from params);
$$;

comment on function public.search_portfolios(text[], text[], integer, integer) is
  'Published portfolios matching every term as a name prefix and every skill slug (D-089, D-090). Security invoker: RLS on published_portfolios is the boundary.';

revoke all on function public.search_portfolios(text[], text[], integer, integer) from public;
grant execute on function public.search_portfolios(text[], text[], integer, integer)
  to anon, authenticated;

-- ---------------------------------------------------------------------------
-- popular_skills (D-088)
--
-- The chips the empty search shows: what the published portfolios actually
-- list, most common first. A slug the skill table no longer knows is still
-- counted here; the page names what it can and leaves the rest out.
-- ---------------------------------------------------------------------------

create or replace function public.popular_skills(p_limit integer default 8)
returns table (
  slug text,
  portfolio_count integer
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    listed.slug,
    pg_catalog.count(distinct published.user_id)::integer as portfolio_count
  from public.published_portfolios as published
  cross join lateral pg_catalog.jsonb_array_elements_text(
    case
      when pg_catalog.jsonb_typeof(published.content -> 'skills' -> 'skillIds') = 'array'
        then published.content -> 'skills' -> 'skillIds'
      else '[]'::jsonb
    end
  ) as listed(slug)
  where listed.slug <> ''
  group by listed.slug
  order by portfolio_count desc, listed.slug asc
  limit least(greatest(coalesce(p_limit, 8), 1), 24);
$$;

comment on function public.popular_skills(integer) is
  'Skill slugs ranked by how many published portfolios list them (D-088). Security invoker: RLS on published_portfolios is the boundary.';

revoke all on function public.popular_skills(integer) from public;
grant execute on function public.popular_skills(integer) to anon, authenticated;

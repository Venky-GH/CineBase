create database "CineBase";

create table actor
(
  actor_id serial  not null
    constraint actor_actor_id
      primary key,
  name     text    not null,
  sex      text    not null,
  dob      date    not null,
  bio      varchar not null
);

create table movie
(
  movie_id serial  not null
    constraint movie_movie_id
      primary key,
  name     text    not null,
  image    varchar not null,
  plot     varchar not null,
  yor      integer not null
);

create table "actor-movie"
(
  actor_id integer not null
    constraint "actor-movie_actor_id_fkey"
      references actor,
  movie_id integer not null
    constraint "actor-movie_movie_id_fkey"
      references movie
);

create table producer
(
  producer_id serial  not null
    constraint producer_producer_id
      primary key,
  name        text    not null,
  sex         text    not null,
  dob         date    not null,
  bio         varchar not null
);

create table "movie-producer"
(
  movie_id    integer not null
    constraint "movie-producer_movie_id_fkey"
      references movie,
  producer_id integer not null
    constraint "movie-producer_producer_id_fkey"
      references producer
);

create view "master-view" as
SELECT m.movie_id,
       m.name,
       m.image,
       m.plot,
       m.yor,
       string_agg(DISTINCT ((a.name || '+'::text) || a.actor_id), ', '::text)   AS actors,
       string_agg(DISTINCT ((p.name || '+'::text) || p.producer_id), ','::text) AS producer
FROM ((((movie m
  JOIN "actor-movie" am ON ((m.movie_id = am.movie_id)))
  JOIN actor a ON ((am.actor_id = a.actor_id)))
  JOIN "movie-producer" mp ON ((mp.movie_id = m.movie_id)))
       JOIN producer p ON ((p.producer_id = mp.producer_id)))
GROUP BY p.producer_id, m.movie_id;
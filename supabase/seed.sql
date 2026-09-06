insert into public.teams (name, short_name, display_order) values
  ('Blue House', 'BLUE', 1), ('Amber House', 'AMBER', 2), ('Rose House', 'ROSE', 3), ('Green House', 'GREEN', 4)
on conflict (name) do nothing;

insert into public.events (event_name, event_code, category, event_type) values
  ('Photography', 'PHOTO', 'Visual arts', 'TEAM'),
  ('Short Film', 'FILM', 'Media', 'TEAM'),
  ('Essay Writing', 'ESSAY', 'Literary', 'INDIVIDUAL'),
  ('Poetry', 'POETRY', 'Literary', 'INDIVIDUAL'),
  ('Painting', 'PAINT', 'Visual arts', 'INDIVIDUAL'),
  ('Quiz', 'QUIZ', 'Literary', 'TEAM'),
  ('Speech', 'SPEECH', 'Performance', 'INDIVIDUAL'),
  ('Mappilappattu', 'MAPPILA', 'Performance', 'TEAM')
on conflict (event_code) do nothing;

insert into public.participants (register_number, full_name, team_id, department)
select 'AF-2048', 'Amina Fathima', id, 'English' from public.teams where short_name = 'BLUE'
on conflict (register_number) do nothing;

insert into public.participants (register_number, full_name, team_id, department)
select 'AF-1932', 'Nihal K.', id, 'Fine Arts' from public.teams where short_name = 'AMBER'
on conflict (register_number) do nothing;

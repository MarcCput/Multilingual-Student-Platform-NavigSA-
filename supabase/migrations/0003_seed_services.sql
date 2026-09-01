-- NavigSA — seed the marketplace catalogue with the providers the
-- prototype used to hardcode. Safe to re-run: it clears and re-inserts.

delete from public.services;

insert into public.services
  (name, provider, category, rating, reviews, price, location, verified, featured, description, delivery_time)
values
  ('Document Translation & Certification', 'TranslateRight SA',        'translation',   4.8, 127, 'R 450',    'Cape Town',    true,  true,
   'Professional translation of academic documents with official certification for university applications.', '2-3 days'),
  ('Student Visa Application Support',     'SA Immigration Experts',   'visa',          4.9,  89, 'R 1,200',  'Johannesburg', true,  true,
   'Complete assistance with student visa applications including document preparation and submission.',        '5-7 days'),
  ('Student Accommodation Finder',         'StudentHomes Cape Town',   'accommodation', 4.7, 203, 'R 800',    'Cape Town',    true,  false,
   'Help finding safe, affordable student accommodation near your university campus.',                         '1-2 weeks'),
  ('Academic Writing Support',             'EduPro Tutors',            'tutoring',      4.6, 156, 'R 600/hr', 'Online',       true,  false,
   'Expert tutoring for application essays and academic writing improvement.',                                 'Flexible'),
  ('Legal Document Review',                'Student Legal Aid',        'legal',         4.9,  67, 'R 950',    'Pretoria',     true,  false,
   'Professional review of contracts, lease agreements, and legal documents.',                                 '3-5 days');

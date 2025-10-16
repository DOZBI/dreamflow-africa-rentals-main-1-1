-- Update categories with new rental categories
DELETE FROM public.categories;

INSERT INTO public.categories (name, icon) VALUES
('Maisons & Appartements', 'home'),
('Chambres', 'bed'),
('Hôtels & Résidences', 'building'),
('Hébergements alternatifs', 'tent'),
('Locations de vacances / Court séjour', 'calendar'),
('Hébergement professionnel', 'briefcase'),
('Prestige', 'crown');
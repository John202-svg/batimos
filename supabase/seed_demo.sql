-- Données démo pour tester parcours utilisateur 1-14
-- À exécuter après schema.sql avec un user connecté

-- Exemple tâches
insert into tasks (family_id, title, status, priority, due_at) 
select family_id, 'Payer facture électricité - en retard', 'late', 'high', now() - interval '2 days' from families limit 1;

insert into events (family_id, title, start_at, category)
select family_id, 'Anniversaire Léa', now() + interval '3 days', 'Famille' from families limit 1;

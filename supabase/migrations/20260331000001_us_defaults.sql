-- Switch defaults from CAD/Canada to USD/United States
alter table locations alter column country set default 'United States';
alter table catalog_items alter column currency set default 'USD';
alter table projects alter column currency set default 'USD';
alter table bid_responses alter column currency set default 'USD';

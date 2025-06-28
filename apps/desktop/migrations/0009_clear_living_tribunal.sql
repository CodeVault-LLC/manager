CREATE TABLE `widgets` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`layout` text NOT NULL,
	`static` integer,
	`settings` text DEFAULT '{}',
	`active` integer DEFAULT true NOT NULL
);

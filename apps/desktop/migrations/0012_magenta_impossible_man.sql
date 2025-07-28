ALTER TABLE `widgets` RENAME TO `widget_instances`;--> statement-breakpoint
DROP TABLE `widget_definitions`;--> statement-breakpoint
ALTER TABLE `widget_instances` DROP COLUMN `active`;
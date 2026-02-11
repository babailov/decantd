-- Add OAuth columns to users table
ALTER TABLE `users` ADD COLUMN `oauth_provider` text;
ALTER TABLE `users` ADD COLUMN `oauth_id` text;
CREATE UNIQUE INDEX IF NOT EXISTS `idx_users_oauth` ON `users` (`oauth_provider`, `oauth_id`);

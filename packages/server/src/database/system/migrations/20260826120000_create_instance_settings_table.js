/**
 * Settings that belong to the installation rather than to an organization:
 * whether signup is open, where mail goes out through.
 *
 * They were environment variables only, which meant a restart to change one
 * and root shell access to change it at all. A key/value table lets the admin
 * page edit them live, with the environment still read as the default for
 * anything never set here.
 */
exports.up = function (knex) {
  return knex.schema.createTable('instance_settings', (table) => {
    table.increments();
    table.string('key').notNullable().unique();
    // JSON rather than a string: a value is a boolean, a number or a list as
    // often as it is text.
    table.text('value', 'longtext').nullable();
    table.timestamps();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('instance_settings');
};

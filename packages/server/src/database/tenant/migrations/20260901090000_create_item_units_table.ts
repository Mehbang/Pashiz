/**
 * Units of measure an organization defines for itself — kilogram, gram,
 * centimetre — and the two an item can be counted in.
 *
 * An item keeps one primary unit, which is what every stored quantity means,
 * and optionally a secondary one for reading the same quantity another way.
 * The factor says how many secondary units make one primary: a kilogram with
 * gram beside it carries 1000, a box with pallet beside it carries 0.2.
 *
 * Nothing here changes what is stored on an invoice line or in inventory. A
 * quantity is still a quantity in the item's primary unit; the secondary unit
 * is a second way of reading it.
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('item_units', (table) => {
      table.increments();
      table.string('name').notNullable().index();
      /** The short form written beside a quantity — `kg`, `g`, `cm`. */
      table.string('symbol', 16).nullable();
      table.boolean('active').defaultTo(true).index();
      table.integer('user_id').unsigned().index();
      table.timestamps();
    })
    .then(() =>
      knex.schema.table('items', (table) => {
        table
          .integer('unit_id')
          .unsigned()
          .nullable()
          .index()
          .references('id')
          .inTable('item_units');
        table
          .integer('secondary_unit_id')
          .unsigned()
          .nullable()
          .index()
          .references('id')
          .inTable('item_units');
        // Six decimal places so a small fraction of a primary unit — a gram
        // against a kilogram read the other way round — survives.
        table.decimal('secondary_unit_factor', 16, 6).nullable();
      }),
    );
};

exports.down = function (knex) {
  return knex.schema
    .table('items', (table) => {
      table.dropForeign(['unit_id']);
      table.dropForeign(['secondary_unit_id']);
      table.dropColumn('unit_id');
      table.dropColumn('secondary_unit_id');
      table.dropColumn('secondary_unit_factor');
    })
    .then(() => knex.schema.dropTableIfExists('item_units'));
};

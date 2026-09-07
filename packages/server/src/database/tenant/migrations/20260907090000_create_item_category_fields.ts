/**
 * Fields an organization defines for itself on a category, and the values its
 * items carry for them.
 *
 * A category of books wants an author and a translator; a category of clothes
 * wants a size and a colour. Rather than widening the items table for every
 * such need, a category owns a list of fields and each item keeps one value per
 * field.
 *
 * The values live in their own table rather than as a JSON column on the item
 * so they can be searched and filtered on: finding a book by its author is a
 * join, not a scan through serialized text.
 *
 * A value is kept when the item leaves the category that defines its field. It
 * simply stops being shown — putting the item back where it was restores what
 * was typed, and nothing is lost to a mis-click.
 */
exports.up = function (knex) {
  return knex.schema
    .createTable('item_category_fields', (table) => {
      table.increments();
      table
        .integer('category_id')
        .unsigned()
        .notNullable()
        .index()
        .references('id')
        .inTable('items_categories')
        .onDelete('CASCADE');
      /** What the field is called on the form — "نویسنده", "سایز". */
      table.string('name').notNullable();
      /** The order the fields are shown in, as the category arranged them. */
      table.integer('index').unsigned().defaultTo(0);
      table.timestamps();

      // One name per category: two fields both called "نویسنده" would be
      // indistinguishable on the item form and in the filter.
      table.unique(['category_id', 'name']);
    })
    .then(() =>
      knex.schema.createTable('item_field_values', (table) => {
        table.increments();
        table
          .integer('item_id')
          .unsigned()
          .notNullable()
          .index()
          .references('id')
          .inTable('items')
          .onDelete('CASCADE');
        table
          .integer('category_field_id')
          .unsigned()
          .notNullable()
          .index()
          .references('id')
          .inTable('item_category_fields')
          .onDelete('CASCADE');
        /** Free text for now; every field is a string. */
        table.text('value').nullable();
        table.timestamps();

        // An item holds at most one value per field, so a write is an upsert
        // rather than an append.
        table.unique(['item_id', 'category_field_id']);
      }),
    );
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('item_field_values')
    .then(() => knex.schema.dropTableIfExists('item_category_fields'));
};

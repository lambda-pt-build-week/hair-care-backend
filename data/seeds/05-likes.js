exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex('likes')
    .truncate()
    .then(function() {
      // Inserts seed entries
      return knex('likes').insert([
        { user_id: 1, post_id: 1 },
        { user_id: 2, post_id: 1 },
        { user_id: 3, post_id: 1 },
        { user_id: 4, post_id: 1 }
      ])
    })
}

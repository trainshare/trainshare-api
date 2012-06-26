var add_loginrequests_table = new Migration({
  up: function(){
    this.create_table("loginrequests", function(t){
      t.integer("id", {auto_increment: true});
      t.string("network");
      t.string("access_token", {limit: 50});
      t.string("access_token_secret", {limit: 50});
      t.boolean("user_in_database"); // in MySQL & Neo4j
      t.boolean("user_friends_in_database"); // in MySQL & Neo4j
      t.primary_key("id");
    });
  },
  down: function(){
    this.drop_table("loginrequests");
  }
});

var initial_setup = new Migration({
  up: function(){
    this.create_table("routes", function(t){
      t.integer("id", {auto_increment: true});
      t.string("linename");
      t.string("dep_station");
      t.string("dep_time");
      t.string("arr_station");
      t.string("arr_time");
      t.primary_key("id");
    });

    this.create_table("users", function(t){
      t.integer("id", {auto_increment: true});
      t.integer("node_id");
      t.string("facebook_uid");
      t.string("twitter_uid");
      t.string("trainshare_id");
      t.string("trainshare_token");
      t.primary_key("id");
    });

    this.create_table("routes_users", function(t){
      t.integer("id", {auto_increment: true});
      t.integer("routes_id");
      t.integer("users_id");
      t.primary_key("id");
    });

  },
  down: function(){
    this.drop_table("routes");
    this.drop_table("users");
    this.drop_table("routes_users");
  }
});
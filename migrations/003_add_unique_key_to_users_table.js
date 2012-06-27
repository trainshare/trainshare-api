var add_unique_key_to_users_table = new Migration({
  up: function(){
  	this.add_unique('users', 'twitter_uid');
  	this.add_unique('users', 'facebook_uid');
  },
  down: function(){
    this.remove_unique('users', 'twitter_uid');
    this.remove_unique('users', 'facebook_uid');
  }
});
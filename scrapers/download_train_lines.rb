require 'net/http'
require 'sequel'

# initialize DB
DB = Sequel.connect('mysql://root:@127.0.0.1:3306/trainsharing')

# items = DB["select count(name) from trainsharing.lines;"]
# lines = DB["select * from "]

# DB.create_table :lines do
#   primary_key :id
#   String :name
#   String :link
# end

lines = DB[:lines] # Create a dataset

# current_id = 1
current_id = 1
done = false

while !done
  current_line = lines[:id => current_id]
  if current_line != nil
    
    puts "fetching element #{current_id}: #{current_line[:name]} at #{current_line[:link]}"
    
    url = URI.parse(current_line[:link])
    req = Net::HTTP::Get.new(url.path)
    res = Net::HTTP.start(url.host, url.port){ |http|
      http.request(req)
    }
    
    File.open("lines/#{current_line[:name]}.html", "w") do |f|
      f.write(res.body)
    end
    
    # sleep(2) # wait 2 seconds to play nice with SBB.
    sleep(0.5)
    current_id += 1
  else
    done = true
    puts "=> done with fetching."
  end
  
end

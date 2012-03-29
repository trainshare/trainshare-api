require 'nokogiri'
require 'json'
require 'sequel'

# DB = Sequel.sqlite # memory database
DB = Sequel.connect('mysql://root:@127.0.0.1:3306/trainsharing')

DB.create_table :routes do
  primary_key :id
  String :linename
  String :dep_station
  String :dep_time
  String :arr_station
  String :arr_time
end

routes = DB[:routes] # Create a dataset

files = Dir.new("lines").entries
counter = 1

for file in files
  if /\.html/.match(file) and not /error/.match(file)
    
    puts "working on [#{counter}/#{files.length}] - #{file}"
    counter += 1
    
    f = File.open("lines/#{file}")
    doc = Nokogiri::HTML(f)
    f.close
    
    train_number = nil
    
    # Get train line number.    
    for div in doc.search("div.hafas div.hac_greybox div b")
      train_number = div.children.text
    end
    
    last_dep_station = nil
    last_dep_time = nil
    
    # puts file
    
    for tr in doc.search("table.hfs_traininfo tr")      
      if tr.attributes["class"] != nil and tr.search("td.location a")[0] != nil
        if last_dep_station != nil and last_dep_time != nil # has already a starting station
          
          current_station = tr.search("td.location a")[0].children.text

          routes.insert(
            :linename => train_number,
            :dep_station => last_dep_station,
            :dep_time => last_dep_time,
            :arr_station => current_station,
            :arr_time => tr.search("td.arr.time")[0].children.text.gsub(/\n/, "")
          )

          last_dep_station = current_station
          last_dep_time = tr.search("td.dep.time")[0].children.text.gsub(/\n/, "")

        else
          last_dep_station = tr.search("td.location a")[0].children.text
          last_dep_time = tr.search("td.dep.time")[0].children.text.gsub(/\n/, "")
        end
      end
    end
    
  end
end
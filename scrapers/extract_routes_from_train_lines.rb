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
    
    puts "working on [#{counter}/#{files.length}]"
    counter += 1
    
    f = File.open("lines/#{file}")
    doc = Nokogiri::HTML(f)
    f.close
    
    train_number = nil
    
    # Get train line number.    
    for div in doc.search("div.hafas div.hac_greybox div b")
      train_number = div.children.to_s
      puts "-> #{train_number}"
    end
    
    last_dep_station = nil
    last_dep_time = nil
    
    for tr in doc.search("table.hfs_traininfo tr")      
      if tr.attributes["class"] != nil
        if last_dep_station != nil and last_dep_time != nil # has already a starting station

          current_station = tr.search("td.location a")[0].children.to_s

          puts "-> inserting route from #{last_dep_station} to #{current_station}"

          routes.insert(
            :linename => train_number,
            :dep_station => last_dep_station,
            :dep_time => last_dep_time,
            :arr_station => current_station,
            :arr_time => tr.search("td.arr.time")[0].children.to_s.gsub(/\n/, "")
          )

          last_dep_station = current_station
          last_dep_time = tr.search("td.dep.time")[0].children.to_s.gsub(/\n/, "")

        else
          last_dep_station = tr.search("td.location a")[0].children.to_s
          last_dep_time = tr.search("td.dep.time")[0].children.to_s.gsub(/\n/, "")
          puts last_dep_station
          puts last_dep_time

        end
      end
    end
    
  end
end

# files = Dir.new("data").entries
# 
# # result_hash = {}
# counter = 1
# 
# for file in files
#   if /\.html/.match(file) and not /error/.match(file)
#     
#     puts "working on [#{counter}/#{files.length}]"
#     counter += 1
# 
#     f = File.open("data/#{file}")
#     doc = Nokogiri::HTML(f)
#     f.close
# 
#     for tr in doc.search("table.hfs_stboard tr")
#       a_time = tr.search("td.journey a")
# 
#       if a_time != nil and a_time.first != nil
#         span_time = a_time.search("span")
# 
#         if span_time != nil and span_time.first != nil and span_time.first.children[0] != nil
#           
#           # Check if line is already in DB and insert of not in there.
#           query = lines.filter(:name => span_time.first.children[0].to_s)
#           if query.count == 0
#             lines.insert(:name => span_time.first.children[0].to_s, :link => a_time.first.attributes['href'].value.to_s)
#           end
#           
#         end
#       end
#     end
#   end
# end
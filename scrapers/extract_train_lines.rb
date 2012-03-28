require 'nokogiri'
require 'json'
require 'sequel'

# DB = Sequel.sqlite # memory database
DB = Sequel.connect('mysql://root:@127.0.0.1:3306/trainsharing')

DB.create_table :lines do
  primary_key :id
  String :name
  String :link
end

lines = DB[:lines] # Create a dataset

files = Dir.new("data").entries

# result_hash = {}
counter = 1

for file in files
  if /\.html/.match(file) and not /error/.match(file)
    
    puts "working on [#{counter}/#{files.length}]"
    counter += 1

    f = File.open("data/#{file}")
    doc = Nokogiri::HTML(f)
    f.close

    for tr in doc.search("table.hfs_stboard tr")
      a_time = tr.search("td.journey a")

      if a_time != nil and a_time.first != nil
        span_time = a_time.search("span")

        if span_time != nil and span_time.first != nil and span_time.first.children[0] != nil
          
          # Check if line is already in DB and insert of not in there.
          query = lines.filter(:name => span_time.first.children[0].to_s)
          if query.count == 0
            lines.insert(:name => span_time.first.children[0].to_s, :link => a_time.first.attributes['href'].value.to_s)
          end
          
        end
      end
    end
  end
end
require 'nokogiri'
require 'json'

files = Dir.new("data").entries

result_hash = {}
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

				if span_time != nil and span_time.first != nil
					result_hash[span_time.first.children[0]] = a_time.first.attributes['href'].value
				end
			end
		end

		File.open("json_data/#{counter}.json", "w") do |t|
			t.write(result_hash.to_json)
			result_hash = {}
		end

	end
end

# File.open("data/train_lines.json", "w") do |t|
# 	t.write(result_hash.to_json)
# end


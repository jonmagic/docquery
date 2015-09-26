def page_word_counter(paragraphs)
  paragraphs.join(" ").split(" ").size
end

dir = "#{Dir.pwd}/test/benchmark/corpus"
lines = nil
pages = []
paragraphs = []
paragraph = []
File.open("#{dir}.txt", "r") { |f| lines = f.readlines }
lines = lines.map(&:chomp)

lines.each do |line|
  if line != ""
    paragraph << line
  else
    paragraph_string = paragraph.join(" ")
    paragraphs << paragraph_string unless paragraph_string == ""
    paragraph = []
  end

  if page_word_counter(paragraphs) > 500
    pages << paragraphs.join("\n\n")
    paragraphs = []
  end
end

page_number = 0

pages.each_with_index do |page, index|
  page_number = index + 1
  title = page.split(" ")[0..8].join(" ")
  File.open("#{dir}/p#{page_number.to_s.rjust(3, "0")} - #{title.gsub(/[^\w\s]/, "")}.txt", "w+") do |file|
    file.write(page)
  end
end

puts page_number

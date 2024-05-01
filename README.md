Use headless browser to make a search on the site. For instance, puppeteer for node js, or Nimbles page interactions API.

After the search load this page. This page uses lazy loading so we need to handle it. I used Nimbles “infinite_scroll” in my project.

The page contains script tag with id “__NEXT_DATA__”, there’s an object that contains some data of the apartments on this page. Data objects doesn’t include all needed properties, so if something missing we can get it from html of the apartment.

The results page using pagination. Using headless browser need to go through all pages and repeat last two steps.

Some sites are using anti-bot systems. Out there solutions for this, some of them AI based, to represent a human behavior. Or Nimbles “Unlocker Proxy” that was designed to solve this problem.

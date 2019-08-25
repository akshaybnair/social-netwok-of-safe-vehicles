import requests 
  
URL = "http://localhost:3000/api"
  

  
# sending all data in json format in post request

#reading csv file

import csv  
import json  
  
# Open the CSV  
f = open( 'final.csv', 'r' )  
reader = csv.DictReader( f, fieldnames = ( "locid","lng","lat","rpm","disp","roadtype"))  
# Parse the CSV into JSON  
out = json.dumps( [ row for row in reader ] , separators=(',', ':'))  

r = requests.post(url = URL, json = out)

pastebin_url = r.text 
print("The pastebin URL is:%s"%pastebin_url) 

f = open( 'parsed.json', 'w')  
f.write(out)  

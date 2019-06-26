import pandas as pd
import os
import requests

charts = pd.read_csv("vis10cat.txt", sep="\t", names=["type", "html"])

for chart_type in charts['type'].unique():
    os.mkdir("./"+chart_type)

name = charts.iloc[0:1,:]['html'][0].split("/")[-1]
address = charts.iloc[0:1,:]['html'][0]

address

charts.iloc[0:1,:]['type'][0]

r = requests.get(address, allow_redirects=True)
open(charts.iloc[0:1,:]['type'][0]  + "/" + name, 'wb').write(r.content)

for _, row in charts.iterrows():
    try: 
        name = row['html'].split("/")[-1]
        address = row['html']
        r = requests.get(address, allow_redirects=True)
        open(row['type'] + "/" + name, 'wb').write(r.content)
        print(name)
    except BaseException:
        pass
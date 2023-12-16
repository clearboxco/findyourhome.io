# IMPORTS
import os
import sys
import json

import pandas as pd
import numpy as np

from sqlalchemy import URL,create_engine,text

from config import USER,PASS,ENDPOINT,PORT,DBNAME,BUCKET,KEY,SECRET

if __name__=="__main__":
    # STEP 1: IMPORT S3 PARQUET DATA

    ts= pd.to_datetime('now').replace(microsecond=0)
    
    date=sys.argv[1] if len(sys.argv)>1 else str(ts).split()[0]
    
    try:
        df = pd.read_parquet(path=BUCKET+f"/all/{date}.parquet",storage_options={"key":KEY,"secret":SECRET})
    except:
        raise Exception(f"Could not locate {BUCKET}/all/{date}.parquet")
        
    #1B: Applying conceptual adjustments
    
    df=df.map(lambda x: np.nan if (x=='nan') or (x=="") else x)

    prop_types=['Single Family Residential', 'Mobile/Manufactured Home','Townhouse', 'Multi-Family (2-4 Unit)', 'Condo/Co-op','Multi-Family (5+ Unit)']

    df=df[df['PROPERTY TYPE'].isin(prop_types)]

    df=df.dropna(subset=['ADDRESS','CITY','STATE OR PROVINCE','ZIP OR POSTAL CODE','PROPERTY TYPE','PRICE','BEDS','BATHS','SQUARE FEET','YEAR BUILT','URL (SEE https://www.redfin.com/buy-a-home/comparative-market-analysis FOR INFO ON PRICING)'],axis=0)
    
    def extract_zip(zip:str):
        
        # Hm... bit error prone you'd think
        
        zip=zip.strip()
        return zip[0:5]
        
    df['ZIP OR POSTAL CODE']=df['ZIP OR POSTAL CODE'].map(lambda x: extract_zip(x))
    
    
    
    with open('conversion.json','r') as f:
        zip_city_mapping=json.load(f)
        
    def assign_city(row):
        try:
            return zip_city_mapping[row['ZIP OR POSTAL CODE']]
        except:
            return row['CITY']
        
    df['CITY']=df[['CITY','ZIP OR POSTAL CODE']].apply(lambda row: assign_city(row),axis=1)
    
    
    
    #1C: Apply logical adjustments
    
    with open('./scripts/columns.txt','r') as f: # CHANGE TO INSTANCE PATHS
        lines=f.readlines()
    
    sql_columns=[str(line.strip()) for line in lines]
    
    df.columns=sql_columns
    
    df=df.astype({
        sql_columns[0]:'object', 
        sql_columns[1]:'object', 
        sql_columns[2]:'object', 
        sql_columns[3]:'object', 
        sql_columns[4]:'object', 
        sql_columns[5]:'object', 
        sql_columns[6]:'object', 
        sql_columns[7]:'object', 
        sql_columns[8]:'float64', 
        sql_columns[9]:'float64', 
        sql_columns[10]:'float64', 
        sql_columns[11]:'object', 
        sql_columns[12]:'float64', 
        sql_columns[13]:'float64', 
        sql_columns[14]:'float64', 
        sql_columns[15]:'float64', 
        sql_columns[16]:'float64', 
        sql_columns[17]:'float64', 
        sql_columns[18]:'object', 
        sql_columns[19]:'object', 
        sql_columns[20]:'object', 
        sql_columns[21]:'object', 
        sql_columns[22]:'object', 
        sql_columns[23]:'object', 
        sql_columns[24]:"bool", 
        sql_columns[25]:"bool", 
        sql_columns[26]:"float64", 
        sql_columns[27]:"float64"
        },
        errors='ignore'
    )
    
    df[sql_columns[1]]=pd.to_datetime(df[sql_columns[1]],errors='raise',format="ISO8601")
    df[sql_columns[2]]=pd.to_datetime(df[sql_columns[2]],errors='coerce',format="mixed")
    df[sql_columns[20]]=pd.to_datetime(df[sql_columns[20]],errors='coerce',format="mixed")
    df[sql_columns[19]]=pd.to_datetime(df[sql_columns[19]],errors='coerce',format="mixed")
    
    df=df.drop_duplicates(subset=[sql_columns[7],sql_columns[4]]).reset_index(drop=True)
    
    # STEP 2: CONNECT TO POSTGRESQL DB
    
    with open('./scripts/tables.txt','r') as f:
        lines=f.readlines()
    
    sql_tables=[str(line.strip()) for line in lines]
    
    url=URL.create(
        drivername="postgresql+psycopg2",
        host=ENDPOINT,
        database=DBNAME,
        username=USER,
        password=PASS,
        port=PORT
    )
    
    engine = create_engine(url)
    
    with engine.connect() as conn:
        trans = conn.begin()
        
        try:
        
            with open('./scripts/backup_main.sql', 'r') as file:
                backup_main_script = file.read()
            
            conn.execute(text(backup_main_script))

            df.to_sql(sql_tables[2],conn,if_exists='append',index=False,method='multi',chunksize=1000)
            
            with open('./scripts/merge.sql', 'r') as file:
                merge_script = file.read()
                
            conn.execute(text(merge_script))
                
            trans.commit()
        
        except:
            trans.rollback()
            raise Exception('Part 1 failed. Changes rolled back.')
        
        trans = conn.begin()
        
        try:
            
            with open('./scripts/pool.sql', 'r') as file:
                pool_script = file.read()
                
            conn.execute(text(pool_script))
                        
            with open('./scripts/clear_main.sql', 'r') as file:
                clear_script = file.read()
                
            conn.execute(text(clear_script))
            
            trans.commit()
            
        except:
            trans.rollback()
            raise Exception('Part 2 failed. Changes rolled back.')
    
    

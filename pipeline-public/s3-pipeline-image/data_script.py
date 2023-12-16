if __name__ == "__main__":

    import pandas as pd
    import time
    from config import BUCKET,SECRET,KEY
    import boto3
    import numpy as np
    import concurrent.futures
    import requests
    import io
    import csv
    import itertools
    import json
    import sys
    
    # FUNCTION DECLARATIONS
    
    def threaded_request(func,links):
        responses=[]

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_to_url = {executor.submit(func,link):link for link in links}
            for future in concurrent.futures.as_completed(future_to_url):
                link = future_to_url[future]
                try:
                    responses.append((link,future.result()))
                except:
                    pass
                    
        return responses

    def randomized_UA():
        num_var=np.random.randint(100,1000)
        num_var3=np.random.randint(10,100)
        num_var2=num_var3%10
        num_var4=np.random.randint(1000,10000)
        num_var5=np.random.randint(100,1000)

        user_agent={"User-Agent": f"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/{num_var5}.36 (KHTML, like Gecko) "+
                f"Chrome/51.{num_var2}.2704.{num_var} Safari/537.{num_var3} OPR/38.0.{num_var4}.41"}
        
        return user_agent
    
    def get_API_response(link):
        header=randomized_UA()

        req=requests.get(link['api_link'],headers=header)

        return req

    def set_dataframe(api_responses:list[tuple[dict,requests.Response]]):
        df_list=[]

        for link,response in api_responses:
            try:
                csv_stream = io.StringIO(response.content.decode('utf-8'))
                reader = csv.DictReader(csv_stream)
                df=pd.DataFrame(reader)
                df_list.append(df)
            except:
                continue

        return df_list
    
    def core(links:list[dict]) -> list[tuple[dict,requests.Response]]:
        responses=threaded_request(get_API_response,links)
        return responses
    
    
    def split_chunks_of_size_n(lst,n):
        return [lst[i * n:(i + 1) * n] for i in range((len(lst) + n - 1) // n )]
    
    
    
    # SYS ARGS
    if len(sys.argv)>1:
        size_of_chunks=int(sys.argv[1])
    else:
        size_of_chunks=2600
    
        
    # CONNECT TO S3
    s3=boto3.client('s3',
                    aws_access_key_id=KEY,
                    aws_secret_access_key=SECRET)
    
    inputs=[]
    
    # GET LINKS
    for d in range(0,5):
        s3_res=s3.get_object(Bucket=BUCKET,Key=f'api_links/links{d+1}.json')
        inputs.append(json.load(s3_res['Body'])['data'])
        
        
    #PREPARING JSON DATA 
    master_file=(list(itertools.chain.from_iterable(inputs))) # Concat list of lists

    split_master_file=split_chunks_of_size_n(master_file,size_of_chunks)
    
    # TIME STAMP
    time_stamp = pd.to_datetime('now').replace(microsecond=0)
    ts_string=str(time_stamp).split()[0]
    
    
    # MAIN FUNCTION
    df_main_list=[]
    
    for idx,sub_file in enumerate(split_master_file):
        responses=core(sub_file) # Get responses
        
        toc=time.perf_counter()
        
        for link,res in responses:
            if res.status_code==429:
                raise Exception(f"ERROR: {res.status_code} for {link['url']}")
            elif res.status_code!=200:
                print(f"WARNING: {res.status_code} for {link['url']}")
                
        df_list=set_dataframe(responses)
        try:
            df=pd.concat(df_list,axis=0,ignore_index=True)
            df_main_list.append(df)
        except:
            continue
        
        tic=time.perf_counter()
        
        if (tic-toc)>300:
            tictoc=300
        else:
            tictoc=int((tic-toc)//1)
            
        if idx!=(len(split_master_file)-1):
            time.sleep(300-tictoc)
    
    try:
        concat_df=pd.concat(df_main_list,axis=0,ignore_index=True)
    except:
        raise Exception("Failed to concat main list. This means no meaningful data was received.")
            
    converted_df=concat_df.drop('ZIP OR POSTAL CODE',axis=1).apply(lambda row:pd.to_numeric(row,errors='ignore'))
    converted_df.insert(6,'ZIP OR POSTAL CODE',concat_df['ZIP OR POSTAL CODE'].astype(str))
    converted_df.insert(1, 'TimeStamp', time_stamp)
    converted_df.reset_index(inplace=True,drop=True)
    converted_df.astype(str).to_parquet(f"s3://{BUCKET}/all/{ts_string}.parquet",index=False,storage_options={"key":KEY,
                                                                                                 "secret":SECRET})
        


    


    

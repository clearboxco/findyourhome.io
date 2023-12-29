import json
import os
import time
from datetime import datetime,timedelta
from copy import deepcopy

import pandas as pd
import numpy as np

from flask import Blueprint, request, current_app, g, jsonify
from . import db
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from flask_login import current_user

from celery import shared_task

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.neighbors import NearestNeighbors

from scipy.spatial.distance import euclidean




bp = Blueprint('model',__name__,url_prefix='/model')

@shared_task(name='record-user-search')
def record_user_search(user,data,date:time.time):
    
    i_data=data['input']
    o_data=data['output']
     
    try:
        sess=db.session
        
        with open(os.path.join(current_app.instance_path,'scripts','post_search.sql'),'r') as f:
            post_searches_sql=f.read()   
            
        s_id=sess.execute(text(post_searches_sql),{'value1':date,
                                                'value2':i_data['submission_type'],
                                                'value3':i_data['location']['city'],
                                                'value4':i_data['location']['state'],
                                                'value5':i_data['location']['zip'],
                                                'value6':i_data['price']['max'],
                                                'value7':i_data['price']['min'],
                                                'value8':i_data['dimensions']['bedrooms'],
                                                'value9':i_data['dimensions']['bathrooms'],
                                                'value10':i_data['dimensions']['sqft'],
                                                'value11':i_data['property_type'],
                                                'value12':i_data['year_built']['max'],
                                                'value13':i_data['year_built']['min'],
                                                'value14':user
                                                }).fetchone()[0]
        
        with open(os.path.join(current_app.instance_path,'scripts','post_s_h_join.sql'),'r') as f:
            post_s_h_join_sql=f.read()

        for idx,h in enumerate(o_data['data']):
            sess.execute(text(post_s_h_join_sql),{'value1':s_id,'value2':h['id'],'value3':idx})
        sess.commit()
        
        
    except IntegrityError as e:
        sess.rollback()
        raise e
    except Exception as e:
        sess.rollback()
        raise e

            
            

@bp.route('/post', methods=['POST'])
def execute_model():
    
    output={
        "error":None,
        "model":"FYH"
    }
    
    ts=time.time()
    
    
    # PART 1: READ IN JSON DATA

    input_data = request.get_json(force=True)
    
    o_input_data=input_data # Modify for output
    
    submission_type=(input_data['submission_type'])
    
    price_max=(input_data['price']['max'])
    price_min=(input_data['price']['min'])
    property_type=(input_data["property_type"])
    state=(input_data['location']['state'])
    city=(input_data['location']['city'])
    zip=(input_data['location']['zip'])
    year_built_max=(input_data['year_built']['max'])
    year_built_min=(input_data['year_built']['min'])

    bedrooms=(input_data['dimensions']['bedrooms'])
    bathrooms=(input_data['dimensions']['bathrooms'])
    sqft=(input_data['dimensions']['sqft'])
    
    
    
    if ((state=="" or state is None) and (city=="" or city is None) and (zip=="" or zip is None)):
        output['error']="No location parameters found."
        
        return jsonify(output)
    
    
    
    # PART 2: STREAM DATA

    with open(os.path.join(current_app.instance_path,'scripts','tables.txt'),'r') as f:
        lines=f.readlines()
    
    sql_tables=[str(line.strip()) for line in lines]
    
    with open(os.path.join(current_app.instance_path,'scripts','columns.txt'),'r') as f:
        lines=f.readlines()
    
    sql_columns=[str(line.strip()) for line in lines]
    


    execution_vars=[]
    execution_string=f'SELECT * FROM {sql_tables[3]} WHERE(' ## Changed from Table 2 => Table 3 (larger pool!)
    
    execution_string+=f'"{sql_columns[25]}" < {price_max} AND "{sql_columns[25]}" > {price_min}'
    execution_string+=" AND "
    execution_vars.append(price_max)
    execution_vars.append(price_min)
    
    property_type_logic={
        1:"'Single Family Residential'",
        2:"'Multi-Family (2-4 Unit)'",
        3:"'Multi-Family (5+ Unit)'",
        4:"'Townhouse'",
        5:"'Condo/Co-op'",
        6:"'Mobile/Manufactured Home'",
    }
    
    execution_string+=f'{sql_columns[13]} = {property_type_logic[property_type]}'
    execution_string+=" AND "
    execution_vars.append(property_type_logic[property_type])
    
    execution_string+=f'"{sql_columns[26]}" <= {year_built_max} AND "{sql_columns[26]}" >= {year_built_min}'
    execution_vars.append(year_built_max)
    execution_vars.append(year_built_min)
    
    if (state!="" and state is not None):
        execution_string+=' AND '
        execution_string+=f'"{sql_columns[16]}" = \'{state.upper()}\''
        execution_vars.append(state.upper())
        
    if (city!="" and city is not None):
        execution_string+=' AND '
        execution_string+=f'"{sql_columns[15]}" = \'{city.title()}\''
        execution_vars.append(city.title())
        
    if (zip!="" and zip is not None):
        execution_string+=' AND '
        execution_string+=f'"{sql_columns[24]}" = \'{zip}\''
        execution_vars.append(zip)

    execution_string+=');'
    
    sess=db.session
    
    #convert to df
    
    df=pd.read_sql_query(text(execution_string),sess.connection())
    
    
    if df is None or df.empty:
        output['error']="No homes found. Please adjust your search parameters."
        
        return jsonify(output)
    
    #empty
    execution_string=''
    
# PART 3: CONFIGURE MODEL SETTINGS

    def configure_model_weights(submission_type,bds,bas,sqft):
        timestamp_weight=1
        
        bd_weight=1
        ba_weight=1
        sqft_weight=1
        
        #Proper Submit w/ no value
        if submission_type==2:
            if bds==0:
                bd_weight=0
            if bas==0:
                ba_weight=0
            if sqft==0:
                sqft_weight=0
                
        return np.array([bd_weight,ba_weight,sqft_weight,timestamp_weight])

    model_weights=configure_model_weights(submission_type,bedrooms,bathrooms,sqft)
    
    
    random_state=np.random.randint(0,999) # Global Random State
    
    #I'm Feeling Lucky    
    if submission_type==1:
        np.random.seed(random_state)
        if bedrooms==0 or bedrooms is None:
            bedrooms_probabilities=df[sql_columns[0]].value_counts(normalize=True)
            bedrooms=np.random.choice(bedrooms_probabilities.index,p=bedrooms_probabilities.values)
            o_input_data['dimensions']['bedrooms']=bedrooms
        if bathrooms==0 or bathrooms is None:
            bathrooms_probabilities=df[sql_columns[1]].value_counts(normalize=True)
            bathrooms=np.random.choice(bathrooms_probabilities.index,p=bathrooms_probabilities.values)
            o_input_data['dimensions']['bathrooms']=bathrooms
        if sqft==0 or sqft is None:
            sqft_probabilities=df[sql_columns[3]].value_counts(normalize=True)
            sqft=np.random.choice(sqft_probabilities.index,p=sqft_probabilities.values)
            o_input_data['dimensions']['sqft']=sqft
            
            
    #Shuffle data    
    sampled_df=df.sample(frac=1, replace=False, random_state=random_state)
    
    del df # Free up memory for large dataset


# PART 4: PREPROCESS STREAMED DATA
    
    NN_df=sampled_df[[f'{sql_columns[0]}',f'{sql_columns[1]}',f'{sql_columns[3]}',f'{sql_columns[30]}']].copy()
    
    NN_df[f'{sql_columns[30]}']=NN_df[f'{sql_columns[30]}'].apply(lambda elem: elem.timestamp())
    
    input_df=pd.DataFrame({f'{sql_columns[0]}':[bedrooms],f'{sql_columns[1]}':[bathrooms],f'{sql_columns[3]}':[sqft],f'{sql_columns[30]}':[ts]})
        
    # Define the transformations for each column
    preprocessor = ColumnTransformer(
    transformers=[
        ('minmax_scaler',MinMaxScaler(),[f'{sql_columns[0]}',f'{sql_columns[1]}',f'{sql_columns[3]}',f'{sql_columns[30]}'])
    ])

    # Apply the transformations in a pipeline
    pipeline = Pipeline(steps=[('preprocessor', preprocessor)])

    NN_np=pipeline.fit_transform(NN_df)
    
    del NN_df # Free up memory for large dataset
    
    input_np=pipeline.transform(input_df)


# PART 5: RUN MODEL

    def weighted_euclidian(x,y,weights=model_weights):
        
        return euclidean(x,y,weights)


    knn=NearestNeighbors(n_neighbors=NN_np.shape[0],metric=weighted_euclidian)
    knn.fit(NN_np)
    
    del NN_np # Free up memory for large dataset
    
    distances, indices = knn.kneighbors(input_np)


    def get_top_z(z,df,indices) -> pd.DataFrame:
    
        
        if indices[0].shape[0]<z:
            z=indices[0].shape[0]
            
        return df.iloc[indices[0][0:z]]
            
    
    
    result_df=get_top_z(current_app.config['NUM_HOUSES_RETURNED'],sampled_df,indices)
    
    del sampled_df # Free up memory for large dataset

# PART 6: POST MODEL DATA

    def prepare_model_json(df:pd.DataFrame) ->list[dict]:
        lst=[]
        
        jsn=df.to_json(orient='records')
        parsed=json.loads(jsn)
        
        for li in parsed:
            h={
                "id":li[sql_columns[28]],
                "time_stamp":li[sql_columns[11]],
                "url":li[sql_columns[22]],
                "price":li[sql_columns[25]],
                "bedrooms":li[f"{sql_columns[0]}"],
                "bathrooms":li[f"{sql_columns[1]}"],
                "sqft":li[f"{sql_columns[3]}"],
                "year_built":li[sql_columns[26]],
                "address":li[sql_columns[14]],
                "state":li[sql_columns[16]],
                "city":li[sql_columns[15]],
                "zip":li[sql_columns[24]],
                "openHouse_st":li[sql_columns[20]],
                "openHouse_et":li[sql_columns[21]],
                "HOA/month":li[sql_columns[18]],
                "days_on_market":li[sql_columns[27]],
                "price_per_sqft":li[sql_columns[17]]     
            }
        
            lst.append(h)
            h={}
            
        return lst

    model_json=prepare_model_json(result_df)

    output["data"]=model_json
    
    output_no_id = deepcopy(output)
    for h in output_no_id['data']:
        h['id']=None
    output_json=jsonify(output_no_id)
    
    search_data={'input':o_input_data,'output':output}
    try:
        user=current_user.user_id
    except:
        user=None
    
    record_user_search.delay(user,search_data,ts)
  
    return output_json # Valid Return
  
  
  


        
    
    
    
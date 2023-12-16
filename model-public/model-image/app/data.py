import os
import json

from flask import Blueprint, request, current_app, g, url_for,jsonify
from . import db
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from flask_login import login_required,current_user

from celery import shared_task

from .user import User


bp=Blueprint("data",__name__,url_prefix="/data")


@bp.route("/claps",methods=['GET','POST'])
def access_claps():

    error=None
    output={"error":error}

    sess=db.session
    
    if request.method=='POST':
        post=request.get_json(force=True)
        check=post['claps']
        
        if(check):
            claps=1
        else:
            claps=0
            
        
        try:
            user_id=current_user.user_id
            record_user_claps.delay(user_id,claps)
        except:
            pass
            
        
        try:
            with open(os.path.join(current_app.instance_path,'scripts','post_claps.sql')) as f:
                post_claps_sql=f.read()
                
            sess.execute(text(post_claps_sql),{'value1':int(claps)})
            sess.commit()
        except:
            sess.rollback()
            error='Failed to insert claps.'
        
    
    else:
        try:
            with open(os.path.join(current_app.instance_path,'scripts','get_claps.sql')) as f:
                get_claps_sql=f.read()
            claps=sess.execute(text(get_claps_sql)).fetchone()
        except:
            error='Could not fetch claps.'
        
        output['claps']=claps[0]
    
    output['error']=error
    
    return jsonify(output)
           
           
@shared_task(name="record-user-claps")
def record_user_claps(user_id,claps):
    user = User.query.filter_by(user_id=user_id).first()
    
    if isinstance(user.claps,int):
        user.claps+=claps
    else:
        user.claps=1
    
    db.session.commit()
                    
        
@bp.route('/searches',methods=['GET','POST'])
@login_required
def get_searches_input():
    
    error=None
    output={'error':error}

    sess=db.session

    if request.method=='POST':
        input_data=request.get_json(force=True)
        
        with open(os.path.join(current_app.instance_path,'scripts','get_searches_output.sql')) as f:
            get_searches_output_sql=f.read()
        
        try:
            value_dict={'value1':int(input_data['s_id'])}
            
            rows=sess.execute(text(get_searches_output_sql),value_dict).fetchall()
            
            records=[]
            
            for row in rows:
                records.append({
                    "s_id":(row[0]),
                    "h_id":(row[1]),
                    "time_stamp":(row[3]),
                    "url":(row[23]),
                    "price":(row[10]),
                    "bedrooms":(row[11]),
                    "bathrooms":(row[12]),
                    "sqft":(row[14]),
                    "year_built":(row[16]),
                    "address":(row[6]),
                    "state":(row[8]),
                    "city":(row[7]),
                    "zip":(row[9]),
                    "openHouse_st":(row[21]),
                    "openHouse_et":(row[22]),
                    "HOA/month":(row[19]),
                    "days_on_market":(row[17]),
                    "price_per_sqft":(row[18]),
                    "rank":(row[30])   
                })
                
            output['data']=records
        
        except Exception as e:
            error=str(e)
        

    else:
        with open(os.path.join(current_app.instance_path,'scripts','get_searches_input.sql')) as f:
            get_searches_input_sql=f.read()
            
        sess=db.session
        
        try:
            value_dict={'value1':int(current_user.user_id),"value2":current_app.config['NUM_SEARCHES_RETURNED']}
            
            rows=sess.execute(text(get_searches_input_sql),value_dict).fetchall()
            
            records=[]
            
            for row in rows:
                records.append({
                    "s_id":(row[0]),
                    "time_stamp":(row[1]),
                    "submission_type":(row[2]),
                    "city":(row[3]),
                    "state":(row[4]),
                    "zip":(row[5]),
                    "price_max":(row[6]),
                    "price_min":(row[7]),
                    "bedrooms":(row[8]),
                    "bathrooms":(row[9]),
                    "sqft":(row[10]),
                    "property_type":(row[11]),
                    "year_built_max":(row[12]),
                    "year_built_min":(row[13]),
                    "u_id":(row[14]),
                    "rank":(row[15])
                })
                
            output['data']=records
            
        except Exception as e:
            error=str(e)
        
    output['error']=error
    
    return jsonify(output)

    
    
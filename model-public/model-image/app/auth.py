import functools
import os
import json
from urllib.parse import urlparse

from flask import (
    Blueprint, request, current_app, jsonify, make_response, Flask, abort
)

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from flask_login import logout_user,login_user,login_required,current_user,fresh_login_required
from .user import User,db
from . import login_manager



bp = Blueprint('auth',__name__,url_prefix='/auth')

@bp.route('/register',methods=['GET','POST'])
def register():
    post=request.get_json(force=True)
    
    error=None
    
    username=post['username']
    password=post['password']
    
    if not username:
        error = 'Username is required.'
    elif not username:
        error = 'Password is required.'
    
    if error is None:
        existing_user = User.query.filter_by(email=username).first()
        if existing_user is None:
            user = User(email=username,
                        login_count=1,
                        
                        )
            user.set_password(password)
            db.session.add(user)
            db.session.commit()
            login_user(user)
        else:
            error="User already exists."
            
    
    return jsonify({"error":error})
        
        
        
@bp.route('/login',methods=['POST'])
def login():
    
    post=request.get_json(force=True)
    
    username=post['username']
    password=post['password']
    
    error = None
    
    user = User.query.filter_by(email=username).first()
    
    if user is None or user=="":
        error = 'Incorrect username.'
    elif not user.check_password(password=password):
        error = 'Incorrect password.'

    if error is None:
        login_user(user)
        user.login_count+=1
        db.session.commit()

    return jsonify({"error":error})


@bp.route('/logout',methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({"error":None})


@bp.route('/status',methods=['GET'])
@login_required
def check_login_status():
    return jsonify({"error":None})

        

@login_manager.user_loader
def load_user(unique_id):
    if unique_id is not None:
        return User.query.filter_by(fs_uniquifier=unique_id).first()
    return None



@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"error":"User must be logged in."})

@login_manager.needs_refresh_handler
def refresh():
    return jsonify({"error":"User must be logged in."})
    
    
@bp.route('/reset',methods=['POST'])
def reset_password():
    pass
    
    




@bp.route('/update',methods=['POST'])
@fresh_login_required
def change_password():
    error=None
        
    post=request.get_json(force=True)
    username=post['username']
    password=post['password']
    
    user = User.query.filter_by(fs_uniquifier=current_user.fs_uniquifier).first()
    
    if username is not None and username!="":
        user.email=username
    
    if password is not None and username!="":
        user.set_password(password)
        
    if password is None and username is None:
        error="Nothing was updated."
    
    if error is None:
        with open(os.path.join(current_app.instance_path,'scripts','invalidate_old_sessions.sql')) as f:
            invalidate_old_sessions_sql=f.read()
            
        db.session.execute(text(invalidate_old_sessions_sql),{"value1":user.user_id})
        
        db.session.commit()
    
    return jsonify({"error":error})
    
    
    
        
    

def auth_required(view): # MAYBE IMPLEMENT WAY TO VIEW HEADERS TO CHECK FOR REPEAT USER-AGENTS, ETC. USING request.headers.get()
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        
        host_url=urlparse(request.host_url).hostname
        
        if host_url not in current_app.config['HOST_URLS']:
            abort(403)
            
        return view(**kwargs)
    
    return wrapped_view

def handle_cors_preflight(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if request.method=='OPTIONS':
            response=make_response()
            response.headers.add('Access-Control-Allow-Headers', "Content-Type")
            response.headers.add('Access-Control-Allow-Methods', "*")
            return response
        
        return view(**kwargs)
    return wrapped_view
            

@bp.before_app_request
@handle_cors_preflight
@auth_required
def before_request():
    """Protect all endpoints from unauthorized users. Allows all CORS pre-flight requests."""
    pass


@bp.after_app_request
def apply_cors_headers(response:Flask.response_class):
    if response.status_code==200:
        response.headers.add("Access-Control-Allow-Credentials","true")
        response.headers.add("Access-Control-Allow-Origin",current_app.config['ACCESS_CONTROL_URL'])
        response.set_cookie('cross-site-cookie',samesite='Lax',secure=True)
    return response
    
            
            
        
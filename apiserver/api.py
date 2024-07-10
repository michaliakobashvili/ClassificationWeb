import inspect
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from asyncio.locks import Lock

import db_access
from credentials import JWT_SECRET_KEY
from db_access import DBAccess
from helper_functions.load_params import load_params

app = FastAPI()
auth = HTTPBearer()

params = load_params()
lock = Lock()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, OPTIONS, PUT, DELETE
    allow_headers=["*"],  # Accept, Accept-Encoding, Authorization, Content-Length, Content-Type, Origin, X-CSRF-Token
)


# replace the secret key with an environment variable, 32 bytes long!
def generate_token(key: str):
    # Set the token expiration time
    expire = datetime.utcnow() + timedelta(hours=3)
    # Create the payload containing the key
    payload = {"key": key, "exp": expire}
    # Generate the JWT token
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
    return token


def login_required(func):
    async def wrapper(credentials: HTTPAuthorizationCredentials = Depends(auth), *args, **kwargs):
        try:
            # Verify and decode the token
            payload = jwt.decode(credentials.credentials, JWT_SECRET_KEY, algorithms=["HS256"])
            key = payload.get("key")
            if key:
                # Process the request with the authenticated key
                return await func(passcode=key, *args, **kwargs)
            else:
                raise HTTPException(status_code=401, detail="Invalid token")
        except JWTError:
            raise HTTPException(status_code=401, detail="Invalid token")

    wrapper.__name__ = func.__name__
    wrapper.__doc__ = func.__doc__

    params = list(inspect.signature(func).parameters.values()) + list(inspect.signature(wrapper).parameters.values())
    wrapper.__signature__ = inspect.signature(func).replace(
        parameters=[
            # Use all parameters from handler
            *filter(lambda p: p.name != 'passcode', inspect.signature(func).parameters.values()),

            # Skip *args and **kwargs from wrapper parameters:
            *filter(
                lambda p: p.kind not in (inspect.Parameter.VAR_POSITIONAL, inspect.Parameter.VAR_KEYWORD),
                inspect.signature(wrapper).parameters.values()
            )
        ]
    )

    return wrapper


class Passcode(BaseModel):
    passcode: str


@app.post("/auth/signin")
async def signin(passcode: Passcode):
    db = DBAccess()
    passcode = passcode.passcode
    passcode = db.get_passcode(passcode)
    if passcode is None:
        raise HTTPException(status_code=401, detail="Unauthorized")
    if not passcode.is_valid(db.get_num_classifications(passcode.key)):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = generate_token(passcode.key)
    return {'token': token}


@app.get("/get_tweet")
@login_required
async def get_tweet(passcode):
    async with lock:
        db = DBAccess()
        tweet = db.get_unclassified_tweet(passcode)

    if tweet is not None:
        return {'id': tweet.id, 'tweeter': tweet.tweeter, 'content': tweet.content}
    else:
        return {'error': 'No unclassified tweets'}


class Classification(BaseModel):
    classification: str
    tweet_id: str
    features: str


@app.post("/classify_tweet")
@login_required
async def classify_tweet(passcode, classification: Classification):
    db = DBAccess()
    if not db.get_passcode(passcode).is_valid(db.get_num_classifications(passcode)):
        raise HTTPException(status_code=401, detail="Unauthorized")
    tweet = db.get_tweet(classification.tweet_id)
    if tweet is not None:
        if classification.classification not in ['Positive', 'Negative', 'Irrelevant', 'Unknown']:
            return {'error': 'Invalid classification'}
        async with lock:
            result = db.classify_tweet(classification.tweet_id, passcode, classification.classification,
                                       classification.features)
        return {'classified': result}
    else:
        return {'error': 'No such tweet'}


@app.get("/count_classifications")
@login_required
async def count_classifications(passcode):
    db = DBAccess()
    result = db.get_num_classifications(passcode)
    return {"count": result}


@app.get("/params_list")
async def params_list():
    # We will make the list of parameters dynamic, so that we can add/remove parameters without changing the web client.
    # Each is boolean.
    print(f"parameters:  {params}")
    return params

#import datetime
if __name__ == '__main__':
    # Assuming you have created an instance of the DBAccess class called db_access

    import uvicorn
    uvicorn.run(app, host="ec2-34-252-152-193.eu-west-1.compute.amazonaws.com", port=5432)
    # Your email address
    email = "user@example.com"
    obj = db_access.DBAccess()
    passcode = obj.create_passcode(email,timedelta(days=7))
    obj.activate_passcode_by_email(email);
    if passcode:
       print("Passcode:", passcode)
    else:
       print("Passcode not found for the provided email.")


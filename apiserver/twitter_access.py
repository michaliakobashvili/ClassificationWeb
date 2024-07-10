import tweepy

from credentials import TWITTER_BEARER


auth = tweepy.OAuth2BearerHandler(TWITTER_BEARER)

api = tweepy.API(auth)


def get_tweets():
    return api.user_timeline(screen_name='@elonmusk', count=10, include_rts=True, tweet_mode='extended')


if __name__ == '__main__':
    print(get_tweets())

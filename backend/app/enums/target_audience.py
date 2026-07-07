from enum import Enum

class TargetAudience(str, Enum):
    Men = 'men'
    Women = 'women'
    Teenagers = 'teenagers'
    Adults = 'adults'
    Parents = 'parents'

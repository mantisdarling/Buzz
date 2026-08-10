"""
Shared slowapi rate limiter instance.
Defined here to avoid circular imports between main.py and endpoint routers.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

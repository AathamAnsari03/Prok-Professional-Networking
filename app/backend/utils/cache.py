import time
from typing import Any, Optional
from threading import Lock

class SimpleCache:
    """Simple in-memory cache with TTL support"""
    
    def __init__(self):
        self._cache = {}
        self._lock = Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache if not expired"""
        with self._lock:
            if key in self._cache:
                value, expiry = self._cache[key]
                if expiry is None or time.time() < expiry:
                    return value
                else:
                    # Remove expired entry
                    del self._cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with optional TTL in seconds"""
        with self._lock:
            expiry = time.time() + ttl if ttl else None
            self._cache[key] = (value, expiry)
    
    def delete(self, key: str) -> None:
        """Delete key from cache"""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
    
    def clear(self) -> None:
        """Clear all cache entries"""
        with self._lock:
            self._cache.clear()
    
    def cleanup(self) -> None:
        """Remove expired entries"""
        current_time = time.time()
        with self._lock:
            expired_keys = [
                key for key, (_, expiry) in self._cache.items()
                if expiry and current_time >= expiry
            ]
            for key in expired_keys:
                del self._cache[key]
    
    def size(self) -> int:
        """Get number of cache entries"""
        with self._lock:
            return len(self._cache)

# Global cache instance
cache = SimpleCache() 
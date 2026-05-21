import functools,time

def timer(func):
    @functools.wraps(func)      # ← 加上这一行
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.time() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_add(a, b):
    """两数相加（带模拟延迟）"""
    time.sleep(1)
    return a + b

slow_add(1, 2)
print(slow_add.__name__)  # "slow_add" ✓
print(slow_add.__doc__)   # "两数相加（带模拟延迟）" ✓
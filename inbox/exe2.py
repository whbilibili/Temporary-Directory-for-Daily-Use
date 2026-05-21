import time

def timer(func):                # ① 接收被装饰的函数
    def wrapper(*args, **kwargs): # ② 定义包装函数
        start = time.time()
        result = func(*args, **kwargs)  # ③ 调用原函数
        end = time.time()
        print(f"{func.__name__} 耗时 {end - start:.4f}s")
        return result               # ④ 返回原函数的结果
    return wrapper                  # ⑤ 返回包装函数

@timer
def slow_add(a, b):
    time.sleep(1)
    return a + b

result = slow_add(3, 5)
# 输出: slow_add 耗时 1.0012s
print(result)  # 8


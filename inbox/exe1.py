def decorator_function(original_function):
    def wrapper(*args, **kwargs):
        # 调用前
        print("执行前")

        result = original_function(*args, **kwargs)

        # 调用后
        print("执行后")

        return result
    return wrapper

@decorator_function
def target_function():
    print("原函数执行")

target_function()
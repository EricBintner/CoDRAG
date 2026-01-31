from pkg.math_ops import add
from utils import greet


def main() -> str:
    greet("world")
    return f"2+3={add(2, 3)}"


if __name__ == "__main__":
    print(main())

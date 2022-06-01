from cryptography.fernet import Fernet


def generate():
    key = Fernet.generate_key()

    with open("keys/fernet_key", "wb") as f:
        f.write(key)


if __name__ == "__main__":
    generate()

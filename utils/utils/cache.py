import os
import shutil
import contextlib
from pathlib import Path


def save_to_cache(cache_uuid, storage_type, file_name, cache_data, path=""):
    if storage_type != 0:
        return

    directory = f"/home/cache/{cache_uuid}{path}"
    file_path = f"{directory}/{file_name}"

    if not Path(directory).is_dir():
        Path(directory).mkdir(parents=True)

    append_write = "a+" if Path(file_path).is_file() else "w+"

    if file_name == "latest":
        append_write = "w+"

    with open(file_path, append_write, encoding="utf8") as f:
        if append_write == "a+":
            f.write("\n\n")
        f.write(cache_data)


def get_cache_data(cache_obj):
    cache_uuid = cache_obj["uuid"]

    if cache_obj["storage"] == 0:
        directory = f"/home/cache/{cache_uuid}"

        with contextlib.suppress(FileNotFoundError):
            with open(f"{directory}/latest", "r", encoding="utf8") as f:
                return f.read()
    return None


def arrange_results(results):
    with contextlib.suppress(KeyError):
        raw = {"raw": results.pop("raw")}
        results = raw | results

    with contextlib.suppress(KeyError):
        latest = {"latest": results.pop("latest")}
        results = latest | results

    return results


def get_cached_results(root, path, results):
    try:
        for file in os.scandir(path):
            file_path = f"{path}/{file.name}"
            if file.is_dir():
                get_cached_results(root, file_path, results)

            if file.is_file():
                with open(file_path, "+r") as f:
                    results[file_path.replace(f"{root}/", "")] = f.read()
        return results
    except FileNotFoundError as e:
        return results


def clear_cache(cache_uuid, storage):
    if storage == 0:
        directory = f"/home/cache/{cache_uuid}"
        with contextlib.suppress(OSError):
            shutil.rmtree(directory)


def clear_cache_file(cache_uuid, file, storage):
    if storage == 0:
        file = f"/home/cache/{cache_uuid}/{file}"

        if os.path.isdir(file):
            with contextlib.suppress(OSError):
                shutil.rmtree(file)

        if os.path.isfile(file):
            os.remove(file)

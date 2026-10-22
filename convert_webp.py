import os
import time
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

def convert_one(args):
    src, dst, q = args
    if not os.path.exists(dst):
        im = Image.open(src)
        im.save(dst, 'WEBP', quality=q, method=2)
    return dst

def main():
    tasks = []
    # FHD WebP
    for i in range(1, 241):
        src = f'frames-fhd/frame-{i:03d}.jpg'
        dst = f'frames-fhd/frame-{i:03d}.webp'
        tasks.append((src, dst, 88))

    # 4K WebP
    for i in range(1, 241):
        src = f'frames-4k/frame-{i:03d}.jpg'
        dst = f'frames-4k/frame-{i:03d}.webp'
        tasks.append((src, dst, 90))

    print(f"Starting conversion of {len(tasks)} frames using ThreadPoolExecutor...")
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(convert_one, tasks))
    t1 = time.time()
    print(f"Successfully converted {len(results)} frames to WebP in {t1-t0:.2f}s!")

if __name__ == "__main__":
    main()

import os
import sys
import time
import cv2
import numpy as np
from PIL import Image
from concurrent.futures import ProcessPoolExecutor

SOURCE_VIDEO = r"C:\Users\Admin\Downloads\Woman_smiling_with_digital_graphics_20261013171232.mp4"
BASE_DIR = r"d:\portfolio\girl frame"
FHD_DIR = os.path.join(BASE_DIR, "frames-fhd")
K4_DIR = os.path.join(BASE_DIR, "frames-4k")

os.makedirs(FHD_DIR, exist_ok=True)
os.makedirs(K4_DIR, exist_ok=True)

def process_single_frame(task):
    idx, frame_rgb = task
    # frame_rgb is numpy array RGB (1080, 1920, 3)
    frame_pil = Image.fromarray(frame_rgb)
    frame_num_str = f"{idx + 1:03d}"
    
    # 1. Full HD Web Version (1920 x 1080)
    fhd_webp_path = os.path.join(FHD_DIR, f"frame-{frame_num_str}.webp")
    fhd_jpg_path = os.path.join(FHD_DIR, f"frame-{frame_num_str}.jpg")
    frame_pil.save(fhd_webp_path, "WEBP", quality=88, method=2)
    frame_pil.save(fhd_jpg_path, "JPEG", quality=92, optimize=True)
    
    # 2. 4K Master Version (3840 x 2160)
    # High-precision Lanczos-4 upscaling to 3840x2160
    bgr = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    up_4k_bgr = cv2.resize(bgr, (3840, 2160), interpolation=cv2.INTER_LANCZOS4)
    
    # Gentle Contrast-Preserving Edge Enhancement:
    # Enhances marketing graphics and facial features without artificial halos or noisy skin
    gaussian = cv2.GaussianBlur(up_4k_bgr, (0, 0), 1.2)
    enhanced_4k_bgr = cv2.addWeighted(up_4k_bgr, 1.22, gaussian, -0.22, 0)
    
    enhanced_4k_rgb = cv2.cvtColor(enhanced_4k_bgr, cv2.COLOR_BGR2RGB)
    pil_4k = Image.fromarray(enhanced_4k_rgb)
    
    k4_webp_path = os.path.join(K4_DIR, f"frame-{frame_num_str}.webp")
    k4_jpg_path = os.path.join(K4_DIR, f"frame-{frame_num_str}.jpg")
    pil_4k.save(k4_webp_path, "WEBP", quality=90, method=2)
    pil_4k.save(k4_jpg_path, "JPEG", quality=92, optimize=True)
    
    return idx

def main():
    print(f"Reading frames from: {SOURCE_VIDEO}")
    cap = cv2.VideoCapture(SOURCE_VIDEO)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    print(f"Total video frames: {total_frames}")
    
    frames_data = []
    idx = 0
    while True:
        ret, frame_bgr = cap.read()
        if not ret:
            break
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        frames_data.append((idx, frame_rgb))
        idx += 1
    cap.release()
    print(f"Loaded {len(frames_data)} frames into memory. Processing with 8 CPU workers...")
    
    start_time = time.time()
    with ProcessPoolExecutor(max_workers=8) as executor:
        results = list(executor.map(process_single_frame, frames_data, chunksize=4))
    
    elapsed = time.time() - start_time
    print(f"Successfully generated {len(results)} FHD and 4K frames in {elapsed:.2f} seconds!")

if __name__ == "__main__":
    main()

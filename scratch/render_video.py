import subprocess
import os

scenes = [
    {"img": "scratch/video_assets/scene1.png", "audio": "scratch/video_assets/scene1.mp3", "out": "scratch/video_assets/clip1.mp4", "dur": 10.5},
    {"img": "scratch/video_assets/scene2.png", "audio": "scratch/video_assets/scene2.mp3", "out": "scratch/video_assets/clip2.mp4", "dur": 13.5},
    {"img": "scratch/video_assets/scene3.png", "audio": "scratch/video_assets/scene3.mp3", "out": "scratch/video_assets/clip3.mp4", "dur": 10.5},
    {"img": "scratch/video_assets/scene4.png", "audio": "scratch/video_assets/scene4.mp3", "out": "scratch/video_assets/clip4.mp4", "dur": 12.5},
    {"img": "scratch/video_assets/scene5.png", "audio": "scratch/video_assets/scene5.mp3", "out": "scratch/video_assets/clip5.mp4", "dur": 13.5},
]

for idx, s in enumerate(scenes, 1):
    print(f"Rendering Clip {idx} with Ken Burns motion effect...")
    # Slight slow zoom for cinematic motion (zoom from 1.0 to 1.06)
    vf = "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,zoompan=z='min(zoom+0.0003,1.06)':d=125:s=1920x1080"
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-i", s["img"],
        "-i", s["audio"],
        "-vf", vf,
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        s["out"]
    ]
    subprocess.run(cmd, check=True)

# Generate concat list
with open("scratch/video_assets/concat.txt", "w") as f:
    for s in scenes:
        f.write(f"file '{os.path.basename(s['out'])}'\n")

print("Concatenating all clips into final HD video...")
concat_cmd = [
    "ffmpeg", "-y",
    "-f", "concat", "-safe", "0",
    "-i", "scratch/video_assets/concat.txt",
    "-c", "copy",
    "public/rc-power-bench-demo.mp4"
]
subprocess.run(concat_cmd, check=True)
print("Demo video created at public/rc-power-bench-demo.mp4!")

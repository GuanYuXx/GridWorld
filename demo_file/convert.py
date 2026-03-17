import sys
import subprocess

try:
    from moviepy.editor import VideoFileClip
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "moviepy", "imageio"])
    from moviepy.editor import VideoFileClip

try:
    print("Loading video...")
    clip = VideoFileClip("demo_file/demo_main.mp4")
    print("Resizing video...")
    clip = clip.resize(width=800)
    print("Writing GIF...")
    clip.write_gif("demo_file/demo_main.gif", fps=10)
    print("Done!")
except Exception as e:
    print("Error:", e)

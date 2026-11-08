import os
import asyncio
import edge_tts
import subprocess

SCRIPT_SCENES = [
    {
        "id": "scene1",
        "text": "Welcome to RC Power Bench Pro, the ultimate brushless propulsion dyno bench and avionics configurator for radio control aircraft enthusiasts.",
        "duration": 9.0
    },
    {
        "id": "scene2",
        "text": "Select from over forty scale warbirds, sport flyers, and twin-engine bombers. Switch instantly between Safe Scale, Factory Stock, and Aggressive Aerobatic flight presets.",
        "duration": 11.5
    },
    {
        "id": "scene3",
        "text": "Explore our comprehensive archives of brushless outrunners, precision ESCs, high-discharge LiPo batteries, and multi-blade scale propellers.",
        "duration": 10.0
    },
    {
        "id": "scene4",
        "text": "The Airplane Calculator computes live wing loading, 3D cubic wing loading, stall speed, and sizes optimal power setups for single, twin, and quad-engine bombers.",
        "duration": 11.5
    },
    {
        "id": "scene5",
        "text": "The Flight Pre-Check and Safety Validator runs diagnostic checks across motor voltage, ESC capacity, and thermal limits to keep your airframe safe. Available now on Google Play.",
        "duration": 12.0
    }
]

os.makedirs("scratch/video_assets", exist_ok=True)

async def generate_narration():
    voice = "en-US-ChristopherNeural"  # Professional, natural human broadcast voice
    for scene in SCRIPT_SCENES:
        out_path = f"scratch/video_assets/{scene['id']}.mp3"
        print(f"Generating audio for {scene['id']}...")
        comm = edge_tts.Communicate(scene["text"], voice, rate="-4%", pitch="-1Hz")
        await comm.save(out_path)
    print("All narration tracks generated successfully!")

asyncio.run(generate_narration())

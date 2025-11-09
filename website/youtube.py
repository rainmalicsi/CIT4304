from pytube import YouTube

def download_youtube_video(video_url, save_path="."):
    try:
        # Create YouTube object
        yt = YouTube(video_url)
        
        # Get the highest resolution stream
        video_stream = yt.streams.get_highest_resolution()
        
        # Download the video
        print(f"Downloading '{yt.title}'...")
        video_stream.download(output_path=save_path)
        print("Download completed!")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Input YouTube video URL
    url = input("Enter the YouTube video URL: ")
    download_youtube_video(url)
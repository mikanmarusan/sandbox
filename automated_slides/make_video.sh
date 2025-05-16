#!/usr/bin/env zsh

set -e

# ===== 1. 音声合成 =====
say -v Kyoko -r 180 \
  -o slide01.aiff "みなさん、こんにちは。これは1枚目のスライドです。"
say -v Kyoko -r 180 \
  -o slide02.aiff "みなさん、こんにちは。これは2枚目のスライドです。"
say -v Kyoko -r 180 \
  -o slide03.aiff "みなさん、こんにちは。これは3枚目のスライドです。"

# ===== 2. AIFF → WAV 変換 =====
ffmpeg -y -i slide01.aiff slide01.wav
ffmpeg -y -i slide02.aiff slide02.wav
ffmpeg -y -i slide03.aiff slide03.wav

# ===== 3. 画像＋音声を結合（ffmpeg concat）=====
# スライド 1
ffmpeg -y -loop 1 -i slide01.png -i slide01.wav \
  -c:v libx264 -tune stillimage -c:a aac -b:a 128k -pix_fmt yuv420p \
  -shortest slide01.mp4
ffmpeg -y -loop 1 -i slide02.png -i slide02.wav \
  -c:v libx264 -tune stillimage -c:a aac -b:a 128k -pix_fmt yuv420p \
  -shortest slide02.mp4
ffmpeg -y -loop 1 -i slide03.png -i slide03.wav \
  -c:v libx264 -tune stillimage -c:a aac -b:a 128k -pix_fmt yuv420p \
  -shortest slide03.mp4

# ===== 4. 結合 =====
printf "file 'slide01.mp4'\nfile 'slide02.mp4'\nfile 'slide03.mp4'\n" > list.txt
#ffmpeg -y -f concat -i list.txt -c copy sample_with_voice.mp4
ffmpeg -y -f concat -safe 0 -i list.txt \
  -c:v libx264 -pix_fmt yuv420p \
  -c:a aac -b:a 128k \
  sample_with_voice.mp4

echo "finished: sample_with_voice.mp4"

